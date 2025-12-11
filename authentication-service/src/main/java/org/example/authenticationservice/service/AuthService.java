package org.example.authenticationservice.service;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.authenticationservice.client.*;
import org.example.authenticationservice.dto.*;
import org.example.authenticationservice.entity.RegistrationToken;
import org.example.authenticationservice.entity.Role;
import org.example.authenticationservice.entity.User;
import org.example.authenticationservice.entity.UserRole;
import org.example.authenticationservice.repository.RegistrationTokenRepository;
import org.example.authenticationservice.repository.RoleRepository;
import org.example.authenticationservice.repository.UserRepository;
import org.example.authenticationservice.repository.UserRoleRepository;
import org.example.authenticationservice.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final RegistrationTokenRepository registrationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailServiceClient emailServiceClient;
    private final HousingServiceClient housingServiceClient;
    private final EmployeeServiceClient employeeServiceClient;

    @Value("${registration.token.expiration-hours:3}")
    private int tokenExpirationHours;

    @Value("${email.frontend.registration-url:http://localhost:3000/register}")
    private String frontendRegistrationUrl;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    /**
     * HR generates a registration token for a new user.
     * Validates house availability before creating token.
     */
    public RegistrationTokenDto generateRegistrationToken(GenerateRegistrationTokenRequest request, Long creatorUserId) {
        // Validate email
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required to generate registration token");
        }

        // Validate house ID
        if (request.getHouseId() == null) {
            throw new IllegalArgumentException("House ID is required - employee must be assigned to a house");
        }

        // Validate house availability via Housing Service
        HouseAvailabilityResponse houseInfo = validateHouseAssignment(request.getHouseId());

        // Get creator user
        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Creator user not found"));

        // Create registration token with house assignment
        RegistrationToken token = new RegistrationToken();
        token.setToken(UUID.randomUUID().toString());
        token.setEmail(request.getEmail());
        token.setExpirationDate(LocalDateTime.now().plusHours(tokenExpirationHours));
        token.setCreatedBy(creator);
        token.setHouseId(request.getHouseId());  // Assign house

        token = registrationTokenRepository.save(token);

        // Send registration email with house info
        sendRegistrationEmail(request.getEmail(), token.getToken(), houseInfo.getAddress());

        return mapToRegistrationTokenDto(token, houseInfo.getAddress());
    }

    /**
     * Validate house exists and has availability.
     * Calls Housing Service to check house capacity.
     */
    private HouseAvailabilityResponse validateHouseAssignment(Long houseId) {
        try {
            var response = housingServiceClient.checkHouseAvailability(houseId);

            if (response == null || !response.isSuccess() || response.getData() == null) {
                throw new IllegalArgumentException("House not found with ID: " + houseId);
            }

            HouseAvailabilityResponse houseInfo = response.getData();

            // Use 'available' field (matches Housing Service response)
            if (houseInfo.getAvailable() == null || !houseInfo.getAvailable()) {
                throw new IllegalArgumentException(
                        String.format("House at '%s' is at full capacity (%d/%d occupants). Please select a different house.",
                                houseInfo.getAddress(),
                                houseInfo.getCurrentOccupants(),
                                houseInfo.getMaxOccupant())
                );
            }

            log.info("House {} validated - {} available spots", houseId, houseInfo.getAvailableSpots());
            return houseInfo;

        } catch (FeignException e) {
            log.error("Failed to validate house {}: {}", houseId, e.getMessage());
            throw new IllegalArgumentException("Unable to validate house assignment. Housing service unavailable.");
        }
    }

    /**
     * Send registration email via Email Service (with house address)
     */
    private void sendRegistrationEmail(String email, String token, String houseAddress) {
        try {
            String registrationLink = frontendRegistrationUrl + "?token=" + token;

            RegistrationEmailRequest emailRequest = RegistrationEmailRequest.builder()
                    .to(email)
                    .token(token)
                    .registrationLink(registrationLink)
                    .build();

            emailServiceClient.sendRegistrationEmailAsync(emailRequest);
            log.info("Registration email queued for: {} (assigned to house: {})", email, houseAddress);

        } catch (Exception e) {
            log.error("Failed to send registration email to {}: {}", email, e.getMessage());
        }
    }

    /**
     * Register a new user using a registration token.
     * Creates User in MySQL and Employee in MongoDB with house assignment.
     */
    public UserDto register(RegisterRequest request) {
        validateRegistrationRequest(request);

        // Validate token
        RegistrationToken token = registrationTokenRepository
                .findByTokenAndEmail(request.getRegistrationToken(), request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid registration token or email"));

        if (token.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Registration token has expired");
        }

        // Create User in MySQL
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActiveFlag(true);

        user = userRepository.save(user);
        log.info("User created in MySQL with ID: {}", user.getId());

        // Assign default role: Employee
        Role employeeRole = roleRepository.findByRoleName("Employee")
                .orElseGet(() -> roleRepository.findByRoleName("EMPLOYEE")
                        .orElseThrow(() -> new IllegalStateException("Employee role not found in database")));

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(employeeRole);
        userRole.setActiveFlag(true);

        userRoleRepository.save(userRole);

        // ============ CREATE EMPLOYEE IN MONGODB ============
        createEmployeeRecord(user.getId(), request.getEmail(), token.getHouseId());
        // ====================================================

        // Consume token
        registrationTokenRepository.delete(token);

        return mapToUserDto(user, List.of(employeeRole.getRoleName()));
    }

    /**
     * Create Employee record in Employee Service (MongoDB)
     * This links the Auth User to an Employee profile with house assignment
     */
    private void createEmployeeRecord(Long userId, String email, Long houseId) {
        try {
            CreateEmployeeRequest employeeRequest = CreateEmployeeRequest.builder()
                    .userID(userId)
                    .email(email)
                    .houseID(houseId)
                    .build();

            log.info("Creating employee record for userId: {}, email: {}, houseId: {}",
                    userId, email, houseId);

            ResponseEntity<EmployeeResponse> response = employeeServiceClient.createEmployee(employeeRequest);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Employee record created successfully. MongoDB ID: {}, houseId: {}",
                        response.getBody().getId(), houseId);
            } else {
                log.warn("Employee creation returned non-success status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            // Log error but don't fail registration
            // Employee record can be created later during onboarding if needed
            log.error("Failed to create employee record for userId {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Login with username or email and password.
     */
    public LoginResponse login(LoginRequest request) {
        validateLoginRequest(request);

        User user = userRepository
                .findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username/email or password"));

        if (!user.isActiveFlag()) {
            throw new IllegalArgumentException("User account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username/email or password");
        }

        // Load roles
        List<String> roleNames = getUserRoleNames(user);

        // Generate JWT with userId
        String jwtToken = jwtTokenProvider.createToken(user.getUsername(), user.getId(), roleNames);

        Instant expiresAt = Instant.now().plusMillis(jwtTokenProvider.getValidityInMs());

        // Build response
        LoginResponse response = new LoginResponse();
        response.setToken(jwtToken);
        response.setTokenType("Bearer");
        response.setExpiresAt(expiresAt);
        response.setUser(mapToUserDto(user, roleNames));
        response.setRole(roleNames.isEmpty() ? null : roleNames.get(0));
        response.setRoles(roleNames);

        return response;
    }

    /**
     * Get user profile by ID.
     */
    public UserDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<String> roleNames = getUserRoleNamesById(userId);

        return mapToUserDto(user, roleNames);
    }

    /**
     * Get user profile by extracting username from JWT token.
     */
    public UserDto getUserProfileFromToken(String token) {
        String username = jwtTokenProvider.getUsernameFromToken(token);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<String> roleNames = getUserRoleNames(user);

        return mapToUserDto(user, roleNames);
    }

    /**
     * Validate a registration token.
     */
    public RegistrationTokenDto validateRegistrationToken(String token) {
        RegistrationToken regToken = registrationTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid registration token"));

        if (regToken.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Registration token has expired");
        }

        return mapToRegistrationTokenDto(regToken);
    }

    /**
     * Get user ID by extracting username from JWT token.
     */
    public Long getUserIdFromToken(String token) {
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    /**
     * Check if user has a specific role.
     */
    public boolean userHasRole(Long userId, String roleName) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(userId);
        return userRoles.stream()
                .filter(UserRole::isActiveFlag)
                .anyMatch(ur -> ur.getRole().getRoleName().equalsIgnoreCase(roleName));
    }

    // ==================== Private Helper Methods ====================

    private void validateRegistrationRequest(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()) {
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                throw new IllegalArgumentException("Password and confirm password do not match");
            }
        }
        if (request.getRegistrationToken() == null || request.getRegistrationToken().isBlank()) {
            throw new IllegalArgumentException("Registration token is required");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
    }

    private void validateLoginRequest(LoginRequest request) {
        if (request.getUsernameOrEmail() == null || request.getUsernameOrEmail().isBlank()) {
            throw new IllegalArgumentException("Username or email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
    }

    private List<String> getUserRoleNames(User user) {
        List<UserRole> userRoles = userRoleRepository.findByUser(user);
        return userRoles.stream()
                .filter(UserRole::isActiveFlag)
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());
    }

    private List<String> getUserRoleNamesById(Long userId) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(userId);
        return userRoles.stream()
                .filter(UserRole::isActiveFlag)
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());
    }

    private UserDto mapToUserDto(User user, List<String> roleNames) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPassword("");
        dto.setActive(user.isActiveFlag());
        dto.setRoles(roleNames);

        if (user.getCreateDate() != null) {
            dto.setCreateDate(user.getCreateDate().format(ISO_FORMATTER));
        }
        if (user.getLastModificationDate() != null) {
            dto.setLastModificationDate(user.getLastModificationDate().format(ISO_FORMATTER));
        }

        return dto;
    }

    /**
     * Map RegistrationToken entity to DTO with house address.
     */
    private RegistrationTokenDto mapToRegistrationTokenDto(RegistrationToken token, String houseAddress) {
        RegistrationTokenDto dto = new RegistrationTokenDto();
        dto.setId(token.getId());
        dto.setToken(token.getToken());
        dto.setEmail(token.getEmail());
        dto.setExpirationDate(token.getExpirationDate());

        String creatorId = String.valueOf(token.getCreatedBy().getId());
        dto.setCreatedByUserId(creatorId);
        dto.setCreateBy(creatorId);
        dto.setCreateDate(LocalDateTime.now().format(ISO_FORMATTER));

        dto.setHouseId(token.getHouseId());
        dto.setHouseAddress(houseAddress);

        return dto;
    }

    /**
     * Map RegistrationToken entity to DTO with IDs.
     */
    private RegistrationTokenDto mapToRegistrationTokenDto(RegistrationToken token) {
        RegistrationTokenDto dto = new RegistrationTokenDto();
        dto.setId(token.getId());
        dto.setToken(token.getToken());
        dto.setEmail(token.getEmail());
        dto.setExpirationDate(token.getExpirationDate());

        String creatorId = String.valueOf(token.getCreatedBy().getId());
        dto.setCreatedByUserId(creatorId);
        dto.setCreateBy(creatorId);
        dto.setCreateDate(LocalDateTime.now().format(ISO_FORMATTER));

        dto.setHouseId(token.getHouseId());

        return dto;
    }
}