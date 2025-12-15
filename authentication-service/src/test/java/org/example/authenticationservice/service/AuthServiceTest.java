package org.example.authenticationservice.service;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @Mock
    private RegistrationTokenRepository registrationTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private Role employeeRole;
    private Role hrRole;
    private UserRole testUserRole;
    private RegistrationToken testToken;

    @BeforeEach
    void setUp() {
        // Set up test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setActiveFlag(true);
        testUser.setCreateDate(LocalDateTime.now());
        testUser.setLastModificationDate(LocalDateTime.now());

        // Set up roles
        employeeRole = new Role();
        employeeRole.setId(1L);
        employeeRole.setRoleName("Employee");

        hrRole = new Role();
        hrRole.setId(2L);
        hrRole.setRoleName("HR");

        // Set up user role
        testUserRole = new UserRole();
        testUserRole.setId(1L);
        testUserRole.setUser(testUser);
        testUserRole.setRole(employeeRole);
        testUserRole.setActiveFlag(true);

        // Set up registration token
        testToken = new RegistrationToken();
        testToken.setId(1L);
        testToken.setToken("test-token-uuid");
        testToken.setEmail("newuser@example.com");
        testToken.setExpirationDate(LocalDateTime.now().plusHours(3));
        testToken.setCreatedBy(testUser);

        // Set configuration values
        ReflectionTestUtils.setField(authService, "tokenExpirationHours", 3);
    }

    // ==================== Login Tests ====================
    @Nested
    @DisplayName("Login Tests")
    class LoginTests {

        @Test
        @DisplayName("Should login successfully with valid credentials")
        void login_WithValidCredentials_ShouldReturnLoginResponse() {
            // Arrange
            LoginRequest request = new LoginRequest();
            request.setUsernameOrEmail("testuser");
            request.setPassword("password123");

            when(userRepository.findByUsernameOrEmail("testuser", "testuser"))
                    .thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("password123", "encodedPassword"))
                    .thenReturn(true);
            when(userRoleRepository.findByUser(testUser))
                    .thenReturn(List.of(testUserRole));
            when(jwtTokenProvider.createToken(eq("testuser"), eq(1L), anyList()))
                    .thenReturn("jwt-token");
            when(jwtTokenProvider.getValidityInMs())
                    .thenReturn(86400000L);

            // Act
            LoginResponse response = authService.login(request);

            // Assert
            assertNotNull(response);
            assertEquals("jwt-token", response.getToken());
            assertEquals("Bearer", response.getTokenType());
            assertEquals("testuser", response.getUser().getUsername());
            assertEquals("Employee", response.getRole());
            assertTrue(response.getRoles().contains("Employee"));

            verify(userRepository).findByUsernameOrEmail("testuser", "testuser");
            verify(passwordEncoder).matches("password123", "encodedPassword");
            verify(jwtTokenProvider).createToken(eq("testuser"), eq(1L), anyList());
        }

        @Test
        @DisplayName("Should throw exception for invalid username")
        void login_WithInvalidUsername_ShouldThrowException() {
            // Arrange
            LoginRequest request = new LoginRequest();
            request.setUsernameOrEmail("nonexistent");
            request.setPassword("password123");

            when(userRepository.findByUsernameOrEmail("nonexistent", "nonexistent"))
                    .thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.login(request)
            );

            assertEquals("Invalid username/email or password", exception.getMessage());
            verify(userRepository).findByUsernameOrEmail("nonexistent", "nonexistent");
            verify(passwordEncoder, never()).matches(anyString(), anyString());
        }

        @Test
        @DisplayName("Should throw exception for invalid password")
        void login_WithInvalidPassword_ShouldThrowException() {
            // Arrange
            LoginRequest request = new LoginRequest();
            request.setUsernameOrEmail("testuser");
            request.setPassword("wrongpassword");

            when(userRepository.findByUsernameOrEmail("testuser", "testuser"))
                    .thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("wrongpassword", "encodedPassword"))
                    .thenReturn(false);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.login(request)
            );

            assertEquals("Invalid username/email or password", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for disabled user")
        void login_WithDisabledUser_ShouldThrowException() {
            // Arrange
            testUser.setActiveFlag(false);
            LoginRequest request = new LoginRequest();
            request.setUsernameOrEmail("testuser");
            request.setPassword("password123");

            when(userRepository.findByUsernameOrEmail("testuser", "testuser"))
                    .thenReturn(Optional.of(testUser));

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.login(request)
            );

            assertEquals("User account is disabled", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for empty username")
        void login_WithEmptyUsername_ShouldThrowException() {
            // Arrange
            LoginRequest request = new LoginRequest();
            request.setUsernameOrEmail("");
            request.setPassword("password123");

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.login(request)
            );

            assertEquals("Username or email is required", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for empty password")
        void login_WithEmptyPassword_ShouldThrowException() {
            // Arrange
            LoginRequest request = new LoginRequest();
            request.setUsernameOrEmail("testuser");
            request.setPassword("");

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.login(request)
            );

            assertEquals("Password is required", exception.getMessage());
        }
    }

    // ==================== Registration Tests ====================
    @Nested
    @DisplayName("Registration Tests")
    class RegistrationTests {

        @Test
        @DisplayName("Should register user successfully with valid token")
        void register_WithValidToken_ShouldReturnUserDto() {
            // Arrange
            RegisterRequest request = new RegisterRequest();
            request.setRegistrationToken("test-token-uuid");
            request.setUsername("newuser");
            request.setEmail("newuser@example.com");
            request.setPassword("password123");

            User newUser = new User();
            newUser.setId(2L);
            newUser.setUsername("newuser");
            newUser.setEmail("newuser@example.com");
            newUser.setActiveFlag(true);
            newUser.setCreateDate(LocalDateTime.now());
            newUser.setLastModificationDate(LocalDateTime.now());

            when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
            when(userRepository.existsByUsername("newuser")).thenReturn(false);
            when(registrationTokenRepository.findByTokenAndEmail("test-token-uuid", "newuser@example.com"))
                    .thenReturn(Optional.of(testToken));
            when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
            when(userRepository.save(any(User.class))).thenReturn(newUser);
            when(roleRepository.findByRoleName("Employee")).thenReturn(Optional.of(employeeRole));
            when(userRoleRepository.save(any(UserRole.class))).thenReturn(testUserRole);

            // Act
            UserDto result = authService.register(request);

            // Assert
            assertNotNull(result);
            assertEquals("newuser", result.getUsername());
            assertEquals("newuser@example.com", result.getEmail());
            assertTrue(result.getRoles().contains("Employee"));

            verify(registrationTokenRepository).delete(testToken);
            verify(userRepository).save(any(User.class));
            verify(userRoleRepository).save(any(UserRole.class));
        }

        @Test
        @DisplayName("Should throw exception for invalid token")
        void register_WithInvalidToken_ShouldThrowException() {
            // Arrange
            RegisterRequest request = new RegisterRequest();
            request.setRegistrationToken("invalid-token");
            request.setUsername("newuser");
            request.setEmail("newuser@example.com");
            request.setPassword("password123");

            when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
            when(userRepository.existsByUsername("newuser")).thenReturn(false);
            when(registrationTokenRepository.findByTokenAndEmail("invalid-token", "newuser@example.com"))
                    .thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.register(request)
            );

            assertEquals("Invalid registration token or email", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for expired token")
        void register_WithExpiredToken_ShouldThrowException() {
            // Arrange
            testToken.setExpirationDate(LocalDateTime.now().minusHours(1));

            RegisterRequest request = new RegisterRequest();
            request.setRegistrationToken("test-token-uuid");
            request.setUsername("newuser");
            request.setEmail("newuser@example.com");
            request.setPassword("password123");

            when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
            when(userRepository.existsByUsername("newuser")).thenReturn(false);
            when(registrationTokenRepository.findByTokenAndEmail("test-token-uuid", "newuser@example.com"))
                    .thenReturn(Optional.of(testToken));

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.register(request)
            );

            assertEquals("Registration token has expired", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for existing email")
        void register_WithExistingEmail_ShouldThrowException() {
            // Arrange
            RegisterRequest request = new RegisterRequest();
            request.setRegistrationToken("test-token-uuid");
            request.setUsername("newuser");
            request.setEmail("existing@example.com");
            request.setPassword("password123");

            when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.register(request)
            );

            assertEquals("Email is already registered", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for existing username")
        void register_WithExistingUsername_ShouldThrowException() {
            // Arrange
            RegisterRequest request = new RegisterRequest();
            request.setRegistrationToken("test-token-uuid");
            request.setUsername("existinguser");
            request.setEmail("newuser@example.com");
            request.setPassword("password123");

            when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
            when(userRepository.existsByUsername("existinguser")).thenReturn(true);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.register(request)
            );

            assertEquals("Username is already taken", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when passwords do not match")
        void register_WithMismatchedPasswords_ShouldThrowException() {
            // Arrange
            RegisterRequest request = new RegisterRequest();
            request.setRegistrationToken("test-token-uuid");
            request.setUsername("newuser");
            request.setEmail("newuser@example.com");
            request.setPassword("password123");
            request.setConfirmPassword("differentpassword");

            // Note: No stubs needed - validation happens before repository calls

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.register(request)
            );

            assertEquals("Password and confirm password do not match", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for empty email")
        void register_WithEmptyEmail_ShouldThrowException() {
            // Arrange
            RegisterRequest request = new RegisterRequest();
            request.setRegistrationToken("test-token-uuid");
            request.setUsername("newuser");
            request.setEmail("");
            request.setPassword("password123");

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.register(request)
            );

            assertEquals("Email is required", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for empty username")
        void register_WithEmptyUsername_ShouldThrowException() {
            // Arrange
            RegisterRequest request = new RegisterRequest();
            request.setRegistrationToken("test-token-uuid");
            request.setUsername("");
            request.setEmail("newuser@example.com");
            request.setPassword("password123");

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.register(request)
            );

            assertEquals("Username is required", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for empty password")
        void register_WithEmptyPassword_ShouldThrowException() {
            // Arrange
            RegisterRequest request = new RegisterRequest();
            request.setRegistrationToken("test-token-uuid");
            request.setUsername("newuser");
            request.setEmail("newuser@example.com");
            request.setPassword("");

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.register(request)
            );

            assertEquals("Password is required", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for empty token")
        void register_WithEmptyToken_ShouldThrowException() {
            // Arrange
            RegisterRequest request = new RegisterRequest();
            request.setRegistrationToken("");
            request.setUsername("newuser");
            request.setEmail("newuser@example.com");
            request.setPassword("password123");

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.register(request)
            );

            assertEquals("Registration token is required", exception.getMessage());
        }
    }

    // ==================== Generate Registration Token Tests ====================
    @Nested
    @DisplayName("Generate Registration Token Tests")
    class GenerateRegistrationTokenTests {

        @Test
        @DisplayName("Should generate registration token successfully")
        void generateRegistrationToken_WithValidRequest_ShouldReturnToken() {
            // Arrange
            GenerateRegistrationTokenRequest request = new GenerateRegistrationTokenRequest();
            request.setEmail("newemployee@example.com");

            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(registrationTokenRepository.save(any(RegistrationToken.class)))
                    .thenAnswer(invocation -> {
                        RegistrationToken token = invocation.getArgument(0);
                        token.setId(1L);
                        return token;
                    });

            // Act
            RegistrationTokenDto result = authService.generateRegistrationToken(request, 1L);

            // Assert
            assertNotNull(result);
            assertNotNull(result.getToken());
            assertEquals("newemployee@example.com", result.getEmail());
            assertNotNull(result.getExpirationDate());

            verify(registrationTokenRepository).save(any(RegistrationToken.class));
        }

        @Test
        @DisplayName("Should throw exception for empty email")
        void generateRegistrationToken_WithEmptyEmail_ShouldThrowException() {
            // Arrange
            GenerateRegistrationTokenRequest request = new GenerateRegistrationTokenRequest();
            request.setEmail("");

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.generateRegistrationToken(request, 1L)
            );

            assertEquals("Email is required to generate registration token", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for null email")
        void generateRegistrationToken_WithNullEmail_ShouldThrowException() {
            // Arrange
            GenerateRegistrationTokenRequest request = new GenerateRegistrationTokenRequest();
            request.setEmail(null);

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.generateRegistrationToken(request, 1L)
            );

            assertEquals("Email is required to generate registration token", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for non-existent creator")
        void generateRegistrationToken_WithInvalidCreator_ShouldThrowException() {
            // Arrange
            GenerateRegistrationTokenRequest request = new GenerateRegistrationTokenRequest();
            request.setEmail("newemployee@example.com");

            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.generateRegistrationToken(request, 999L)
            );

            assertEquals("Creator user not found", exception.getMessage());
        }
    }

    // ==================== Validate Registration Token Tests ====================
    @Nested
    @DisplayName("Validate Registration Token Tests")
    class ValidateRegistrationTokenTests {

        @Test
        @DisplayName("Should validate token successfully")
        void validateRegistrationToken_WithValidToken_ShouldReturnTokenDto() {
            // Arrange
            when(registrationTokenRepository.findByToken("test-token-uuid"))
                    .thenReturn(Optional.of(testToken));

            // Act
            RegistrationTokenDto result = authService.validateRegistrationToken("test-token-uuid");

            // Assert
            assertNotNull(result);
            assertEquals("test-token-uuid", result.getToken());
            assertEquals("newuser@example.com", result.getEmail());
        }

        @Test
        @DisplayName("Should throw exception for invalid token")
        void validateRegistrationToken_WithInvalidToken_ShouldThrowException() {
            // Arrange
            when(registrationTokenRepository.findByToken("invalid-token"))
                    .thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.validateRegistrationToken("invalid-token")
            );

            assertEquals("Invalid registration token", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for expired token")
        void validateRegistrationToken_WithExpiredToken_ShouldThrowException() {
            // Arrange
            testToken.setExpirationDate(LocalDateTime.now().minusHours(1));
            when(registrationTokenRepository.findByToken("test-token-uuid"))
                    .thenReturn(Optional.of(testToken));

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.validateRegistrationToken("test-token-uuid")
            );

            assertEquals("Registration token has expired", exception.getMessage());
        }
    }

    // ==================== Get User Profile Tests ====================
    @Nested
    @DisplayName("Get User Profile Tests")
    class GetUserProfileTests {

        @Test
        @DisplayName("Should get user profile by ID successfully")
        void getUserProfile_WithValidId_ShouldReturnUserDto() {
            // Arrange
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRoleRepository.findByUserId(1L)).thenReturn(List.of(testUserRole));

            // Act
            UserDto result = authService.getUserProfile(1L);

            // Assert
            assertNotNull(result);
            assertEquals("testuser", result.getUsername());
            assertEquals("test@example.com", result.getEmail());
            assertTrue(result.getRoles().contains("Employee"));
        }

        @Test
        @DisplayName("Should throw exception for non-existent user")
        void getUserProfile_WithInvalidId_ShouldThrowException() {
            // Arrange
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.getUserProfile(999L)
            );

            assertEquals("User not found", exception.getMessage());
        }
    }

    // ==================== User Has Role Tests ====================
    @Nested
    @DisplayName("User Has Role Tests")
    class UserHasRoleTests {

        @Test
        @DisplayName("Should return true when user has role")
        void userHasRole_WithValidRole_ShouldReturnTrue() {
            // Arrange
            when(userRoleRepository.findByUserId(1L)).thenReturn(List.of(testUserRole));

            // Act
            boolean result = authService.userHasRole(1L, "Employee");

            // Assert
            assertTrue(result);
        }

        @Test
        @DisplayName("Should return false when user does not have role")
        void userHasRole_WithInvalidRole_ShouldReturnFalse() {
            // Arrange
            when(userRoleRepository.findByUserId(1L)).thenReturn(List.of(testUserRole));

            // Act
            boolean result = authService.userHasRole(1L, "HR");

            // Assert
            assertFalse(result);
        }

        @Test
        @DisplayName("Should return false when user has no roles")
        void userHasRole_WithNoRoles_ShouldReturnFalse() {
            // Arrange
            when(userRoleRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

            // Act
            boolean result = authService.userHasRole(1L, "Employee");

            // Assert
            assertFalse(result);
        }

        @Test
        @DisplayName("Should be case insensitive when checking role")
        void userHasRole_CaseInsensitive_ShouldReturnTrue() {
            // Arrange
            when(userRoleRepository.findByUserId(1L)).thenReturn(List.of(testUserRole));

            // Act
            boolean result = authService.userHasRole(1L, "employee");

            // Assert
            assertTrue(result);
        }
    }

    // ==================== Get User Profile From Token Tests ====================
    @Nested
    @DisplayName("Get User Profile From Token Tests")
    class GetUserProfileFromTokenTests {

        @Test
        @DisplayName("Should get user profile from token successfully")
        void getUserProfileFromToken_WithValidToken_ShouldReturnUserDto() {
            // Arrange
            when(jwtTokenProvider.getUsernameFromToken("valid-token")).thenReturn("testuser");
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(userRoleRepository.findByUser(testUser)).thenReturn(List.of(testUserRole));

            // Act
            UserDto result = authService.getUserProfileFromToken("valid-token");

            // Assert
            assertNotNull(result);
            assertEquals("testuser", result.getUsername());
            assertEquals("test@example.com", result.getEmail());
        }

        @Test
        @DisplayName("Should throw exception when user not found from token")
        void getUserProfileFromToken_WithInvalidUser_ShouldThrowException() {
            // Arrange
            when(jwtTokenProvider.getUsernameFromToken("valid-token")).thenReturn("nonexistent");
            when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

            // Act & Assert
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> authService.getUserProfileFromToken("valid-token")
            );

            assertEquals("User not found", exception.getMessage());
        }
    }
}