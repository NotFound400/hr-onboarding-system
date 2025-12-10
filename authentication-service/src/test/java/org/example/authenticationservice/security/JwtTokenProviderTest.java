package org.example.authenticationservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtTokenProvider Unit Tests")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    private static final String TEST_SECRET = "dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yaHJvbmJvYXJkaW5nc3lzdGVtand0dG9rZW4=";
    private static final long TEST_VALIDITY = 86400000L; // 24 hours

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtTokenProvider, "validityInMs", TEST_VALIDITY);
        jwtTokenProvider.init();
    }

    @Nested
    @DisplayName("Token Creation Tests")
    class TokenCreationTests {

        @Test
        @DisplayName("Should create token with all claims")
        void createToken_WithValidInput_ShouldReturnToken() {
            // Arrange
            String username = "testuser";
            Long userId = 1L;
            List<String> roles = List.of("Employee", "HR");

            // Act
            String token = jwtTokenProvider.createToken(username, userId, roles);

            // Assert
            assertNotNull(token);
            assertFalse(token.isEmpty());
            assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
        }

        @Test
        @DisplayName("Should create token with correct subject")
        void createToken_ShouldContainCorrectSubject() {
            // Arrange
            String username = "testuser";
            Long userId = 1L;
            List<String> roles = List.of("Employee");

            // Act
            String token = jwtTokenProvider.createToken(username, userId, roles);
            String extractedUsername = jwtTokenProvider.getUsernameFromToken(token);

            // Assert
            assertEquals(username, extractedUsername);
        }

        @Test
        @DisplayName("Should create token with userId claim")
        void createToken_ShouldContainUserId() {
            // Arrange
            String username = "testuser";
            Long userId = 123L;
            List<String> roles = List.of("Employee");

            // Act
            String token = jwtTokenProvider.createToken(username, userId, roles);
            Long extractedUserId = jwtTokenProvider.getUserIdFromToken(token);

            // Assert
            assertEquals(userId, extractedUserId);
        }

        @Test
        @DisplayName("Should create token with roles claim")
        void createToken_ShouldContainRoles() {
            // Arrange
            String username = "testuser";
            Long userId = 1L;
            List<String> roles = List.of("Employee", "HR");

            // Act
            String token = jwtTokenProvider.createToken(username, userId, roles);
            List<String> extractedRoles = jwtTokenProvider.getRolesFromToken(token);

            // Assert
            assertNotNull(extractedRoles);
            assertEquals(2, extractedRoles.size());
            assertTrue(extractedRoles.contains("Employee"));
            assertTrue(extractedRoles.contains("HR"));
        }

        @Test
        @DisplayName("Should create token with correct expiration")
        void createToken_ShouldHaveCorrectExpiration() {
            // Arrange
            String username = "testuser";
            Long userId = 1L;
            List<String> roles = List.of("Employee");
            long beforeCreation = System.currentTimeMillis();

            // Act
            String token = jwtTokenProvider.createToken(username, userId, roles);
            Date expiration = jwtTokenProvider.getExpirationFromToken(token);
            long afterCreation = System.currentTimeMillis();

            // Assert
            assertNotNull(expiration);
            long expectedMinExpiration = beforeCreation + TEST_VALIDITY;
            long expectedMaxExpiration = afterCreation + TEST_VALIDITY;
            assertTrue(expiration.getTime() >= expectedMinExpiration - 1000);
            assertTrue(expiration.getTime() <= expectedMaxExpiration + 1000);
        }
    }

    @Nested
    @DisplayName("Token Extraction Tests")
    class TokenExtractionTests {

        @Test
        @DisplayName("Should extract username from token")
        void getUsernameFromToken_ShouldReturnCorrectUsername() {
            // Arrange
            String token = jwtTokenProvider.createToken("admin", 1L, List.of("HR"));

            // Act
            String username = jwtTokenProvider.getUsernameFromToken(token);

            // Assert
            assertEquals("admin", username);
        }

        @Test
        @DisplayName("Should extract userId from token")
        void getUserIdFromToken_ShouldReturnCorrectUserId() {
            // Arrange
            String token = jwtTokenProvider.createToken("admin", 42L, List.of("HR"));

            // Act
            Long userId = jwtTokenProvider.getUserIdFromToken(token);

            // Assert
            assertEquals(42L, userId);
        }

        @Test
        @DisplayName("Should extract roles from token")
        void getRolesFromToken_ShouldReturnCorrectRoles() {
            // Arrange
            List<String> roles = List.of("Employee", "HR", "Admin");
            String token = jwtTokenProvider.createToken("admin", 1L, roles);

            // Act
            List<String> extractedRoles = jwtTokenProvider.getRolesFromToken(token);

            // Assert
            assertEquals(3, extractedRoles.size());
            assertTrue(extractedRoles.containsAll(roles));
        }

        @Test
        @DisplayName("Should extract expiration from token")
        void getExpirationFromToken_ShouldReturnFutureDate() {
            // Arrange
            String token = jwtTokenProvider.createToken("admin", 1L, List.of("HR"));

            // Act
            Date expiration = jwtTokenProvider.getExpirationFromToken(token);

            // Assert
            assertNotNull(expiration);
            assertTrue(expiration.after(new Date()));
        }
    }

    @Nested
    @DisplayName("Token Validity Tests")
    class TokenValidityTests {

        @Test
        @DisplayName("Should return validity in milliseconds")
        void getValidityInMs_ShouldReturnConfiguredValue() {
            // Act
            long validity = jwtTokenProvider.getValidityInMs();

            // Assert
            assertEquals(TEST_VALIDITY, validity);
        }
    }

    @Nested
    @DisplayName("Edge Case Tests")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle empty roles list")
        void createToken_WithEmptyRoles_ShouldWork() {
            // Arrange
            String username = "testuser";
            Long userId = 1L;
            List<String> roles = List.of();

            // Act
            String token = jwtTokenProvider.createToken(username, userId, roles);
            List<String> extractedRoles = jwtTokenProvider.getRolesFromToken(token);

            // Assert
            assertNotNull(token);
            assertNotNull(extractedRoles);
            assertTrue(extractedRoles.isEmpty());
        }

        @Test
        @DisplayName("Should handle single role")
        void createToken_WithSingleRole_ShouldWork() {
            // Arrange
            String username = "testuser";
            Long userId = 1L;
            List<String> roles = List.of("Employee");

            // Act
            String token = jwtTokenProvider.createToken(username, userId, roles);
            List<String> extractedRoles = jwtTokenProvider.getRolesFromToken(token);

            // Assert
            assertEquals(1, extractedRoles.size());
            assertEquals("Employee", extractedRoles.get(0));
        }
    }
}