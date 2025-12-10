package org.example.authenticationservice.service;

import lombok.RequiredArgsConstructor;
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
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final RegistrationTokenRepository registrationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${registration.token.expiration-hours:3}")
    private int tokenExpirationHours;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    /**
     * HR generates a registration token for a new user.
     */
    public RegistrationTokenDto generateRegistrationToken(GenerateRegistrationTokenRequest request, Long creatorUserId) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required to generate registration token");
        }

        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Creator user not found"));

        RegistrationToken token = new RegistrationToken();
        token.setToken(UUID.randomUUID().toString());
        token.setEmail(request.getEmail());
        token.setExpirationDate(LocalDateTime.now().plusHours(tokenExpirationHours));
        token.setCreatedBy(creator);

        token = registrationTokenRepository.save(token);

        return mapToRegistrationTokenDto(token);
    }

    /**
     * Register a new user using a registration token.
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

        // Create User
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActiveFlag(true);

        user = userRepository.save(user);

        // Assign default role: Employee
        Role employeeRole = roleRepository.findByRoleName("Employee")
                .orElseGet(() -> roleRepository.findByRoleName("EMPLOYEE")
                        .orElseThrow(() -> new IllegalStateException("Employee role not found in database")));

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(employeeRole);
        userRole.setActiveFlag(true);

        userRoleRepository.save(userRole);

        // Consume token
        registrationTokenRepository.delete(token);

        return mapToUserDto(user, List.of(employeeRole.getRoleName()));
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

        // Generate JWT with userId (NEW: added userId parameter)
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
        // NEW: can directly extract userId from token now
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
        // Only validate confirmPassword if it's provided
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

    /**
     * Map User entity to UserDto with ID and date fields.
     */
    private UserDto mapToUserDto(User user, List<String> roleNames) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPassword(""); // Never expose password
        dto.setActive(user.isActiveFlag());
        dto.setRoles(roleNames);

        // Format dates as ISO strings
        if (user.getCreateDate() != null) {
            dto.setCreateDate(user.getCreateDate().format(ISO_FORMATTER));
        }
        if (user.getLastModificationDate() != null) {
            dto.setLastModificationDate(user.getLastModificationDate().format(ISO_FORMATTER));
        }

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
        dto.setCreateBy(creatorId); // Alias for frontend compatibility

        // Set createDate if available
        dto.setCreateDate(LocalDateTime.now().format(ISO_FORMATTER));

        return dto;
    }
}