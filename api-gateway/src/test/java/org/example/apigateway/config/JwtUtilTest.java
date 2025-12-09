package org.example.apigateway.config;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@DisplayName("JwtUtil Unit Test")
class JwtUtilTest {

    private JwtUtil jwtUtil;

    private static final String TEST_SECRET = "dGhpc2lzYXRlc3RzZWNyZXRrZXlmb3JqdW5pdHRlc3RpbmdwdXJwb3Nlc29ubHk=";

    private static final Long TEST_EXPIRATION = 86400000L;

    @BeforeEach
    void setUp() {

        jwtUtil = new JwtUtil();

        ReflectionTestUtils.setField(jwtUtil, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", TEST_EXPIRATION);
    }

    /**
     * Token 生成测试
     */
    @Nested
    @DisplayName("Token Generate Test")
    class TokenGenerationTests {

        @Test
        @DisplayName("Token Generate Success Test")
        void shouldGenerateToken() {
            // Given
            String username = "testuser";
            Long userId = 123L;
            List<String> roles = Arrays.asList("ROLE_USER", "ROLE_ADMIN");

            // When
            String token = jwtUtil.generateToken(username, userId, roles);

            // Then
            assertThat(token).isNotNull();
            assertThat(token).isNotEmpty();

            String[] parts = token.split("\\.");
            assertThat(parts).hasSize(3);
        }

        @Test
        @DisplayName("Generate Token Should Have Correct User Name Test")
        void tokenShouldContainUsername() {
            String username = "admin";
            String token = jwtUtil.generateToken(username, 1L, Collections.singletonList("ADMIN"));

            String extractedUsername = jwtUtil.extractUsername(token);
            assertThat(extractedUsername).isEqualTo(username);
        }

        @Test
        @DisplayName("The generated token should contain the correct user ID.")
        void tokenShouldContainUserId() {
            Long userId = 999L;
            String token = jwtUtil.generateToken("user", userId, Collections.singletonList("USER"));

            Long extractedUserId = jwtUtil.extractUserId(token);
            assertThat(extractedUserId).isEqualTo(userId);
        }

        @Test
        @DisplayName("The generated token should contain the correct list of roles.")
        void tokenShouldContainRoles() {
            List<String> roles = Arrays.asList("HR", "MANAGER", "ADMIN");
            String token = jwtUtil.generateToken("user", 1L, roles);

            List<String> extractedRoles = jwtUtil.extractRoles(token);
            assertThat(extractedRoles).containsExactlyElementsOf(roles);
        }

        @Test
        @DisplayName("Tokens generated with different parameters should be different.")
        void differentParamsShouldGenerateDifferentTokens() {
            String token1 = jwtUtil.generateToken("user1", 1L, Collections.singletonList("USER"));
            String token2 = jwtUtil.generateToken("user2", 2L, Collections.singletonList("ADMIN"));

            assertThat(token1).isNotEqualTo(token2);
        }

        @Test
        @DisplayName("An empty role list should also be able to generate a token.")
        void shouldGenerateTokenWithEmptyRoles() {
            String token = jwtUtil.generateToken("user", 1L, Collections.emptyList());

            assertThat(token).isNotNull();
            assertThat(jwtUtil.extractRoles(token)).isEmpty();
        }
    }

    /**
     * Token Validation Test
     */
    @Nested
    @DisplayName("Token Verification Test")
    class TokenValidationTests {

        @Test
        @DisplayName("Valid tokens should pass validation.")
        void validTokenShouldPassValidation() {
            String token = jwtUtil.generateToken("user", 1L, Collections.singletonList("USER"));

            Boolean isValid = jwtUtil.validateToken(token);
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Expired tokens should fail validation.")
        void expiredTokenShouldFailValidation() {
            // Set a very short expiration time (1 millisecond).
            ReflectionTestUtils.setField(jwtUtil, "expiration", 1L);

            String token = jwtUtil.generateToken("user", 1L, Collections.singletonList("USER"));

            // Waiting for the token to expire.
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            Boolean isValid = jwtUtil.validateToken(token);
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Tokens with incorrect formatting should fail validation.")
        void malformedTokenShouldFailValidation() {
            String malformedToken = "this.is.not.a.valid.token";

            Boolean isValid = jwtUtil.validateToken(malformedToken);
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("The null token should fail validation.")
        void nullTokenShouldFailValidation() {
            Boolean isValid = jwtUtil.validateToken(null);
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("An empty string token should fail validation.")
        void emptyTokenShouldFailValidation() {
            Boolean isValid = jwtUtil.validateToken("");
            assertThat(isValid).isFalse();
        }
    }

    /**
     * Token Parsing Test
     */
    @Nested
    @DisplayName("Token Parsing Test")
    class TokenExtractionTests {

        @Test
        @DisplayName("The username should be extracted correctly.")
        void shouldExtractUsername() {
            String expectedUsername = "john_doe";
            String token = jwtUtil.generateToken(expectedUsername, 1L, Collections.singletonList("USER"));

            String actualUsername = jwtUtil.extractUsername(token);
            assertThat(actualUsername).isEqualTo(expectedUsername);
        }

        @Test
        @DisplayName("The user ID should be extracted correctly.")
        void shouldExtractUserId() {
            Long expectedUserId = 12345L;
            String token = jwtUtil.generateToken("user", expectedUserId, Collections.singletonList("USER"));

            Long actualUserId = jwtUtil.extractUserId(token);
            assertThat(actualUserId).isEqualTo(expectedUserId);
        }

        @Test
        @DisplayName("The list of roles should be extracted correctly.")
        void shouldExtractRoles() {
            List<String> expectedRoles = Arrays.asList("ADMIN", "HR", "MANAGER");
            String token = jwtUtil.generateToken("user", 1L, expectedRoles);

            List<String> actualRoles = jwtUtil.extractRoles(token);
            assertThat(actualRoles).containsExactlyElementsOf(expectedRoles);
        }

        @Test
        @DisplayName("The expiration date should be extracted correctly.")
        void shouldExtractExpiration() {
            String token = jwtUtil.generateToken("user", 1L, Collections.singletonList("USER"));

            Date expiration = jwtUtil.extractExpiration(token);

            assertThat(expiration).isNotNull();
            // 过期时间应该在未来
            assertThat(expiration).isAfter(new Date());
            // 过期时间应该在 24 小时左右
            long expectedExpTime = System.currentTimeMillis() + TEST_EXPIRATION;
            assertThat(expiration.getTime()).isCloseTo(expectedExpTime, org.assertj.core.data.Offset.offset(5000L));
        }

        @Test
        @DisplayName("Parsing an expired token should throw an ExpiredJwtException.")
        void shouldThrowExpiredJwtExceptionForExpiredToken() {
            ReflectionTestUtils.setField(jwtUtil, "expiration", 1L);
            String token = jwtUtil.generateToken("user", 1L, Collections.singletonList("USER"));

            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            assertThatThrownBy(() -> jwtUtil.extractUsername(token))
                    .isInstanceOf(ExpiredJwtException.class);
        }

        @Test
        @DisplayName("Parsing format error: The token should throw a MalformedJwtException.")
        void shouldThrowMalformedJwtExceptionForInvalidToken() {
            String invalidToken = "not-a-valid-jwt-token";

            assertThatThrownBy(() -> jwtUtil.extractUsername(invalidToken))
                    .isInstanceOf(MalformedJwtException.class);
        }
    }

    /**
     * Token expiration check test
     */
    @Nested
    @DisplayName("Token expiration check test")
    class TokenExpirationTests {

        @Test
        @DisplayName("The newly generated token should not expire.")
        void freshTokenShouldNotBeExpired() {
            String token = jwtUtil.generateToken("user", 1L, Collections.singletonList("USER"));

            Boolean isExpired = jwtUtil.isTokenExpired(token);
            assertThat(isExpired).isFalse();
        }
    }

    /**
     * Boundary condition testing
     */
    @Nested
    @DisplayName("Boundary condition testing")
    class EdgeCaseTests {

        @Test
        @DisplayName("Usernames containing special characters should work correctly.")
        void shouldHandleUsernameWithSpecialChars() {
            String username = "user@example.com";
            String token = jwtUtil.generateToken(username, 1L, Collections.singletonList("USER"));

            assertThat(jwtUtil.extractUsername(token)).isEqualTo(username);
        }

        @Test
        @DisplayName("Usernames containing Chinese characters should work correctly.")
        void shouldHandleUsernameWithChinese() {
            String username = "张三";
            String token = jwtUtil.generateToken(username, 1L, Collections.singletonList("USER"));

            assertThat(jwtUtil.extractUsername(token)).isEqualTo(username);
        }

        @Test
        @DisplayName("Very long usernames should work correctly.")
        void shouldHandleLongUsername() {
            String username = "a".repeat(100);
            String token = jwtUtil.generateToken(username, 1L, Collections.singletonList("USER"));

            assertThat(jwtUtil.extractUsername(token)).isEqualTo(username);
        }

        @Test
        @DisplayName("Very large user IDs should work correctly.")
        void shouldHandleLargeUserId() {
            Long userId = Long.MAX_VALUE;
            String token = jwtUtil.generateToken("user", userId, Collections.singletonList("USER"));

            assertThat(jwtUtil.extractUserId(token)).isEqualTo(userId);
        }

        @Test
        @DisplayName("Multiple roles should function correctly.")
        void shouldHandleMultipleRoles() {
            List<String> roles = Arrays.asList("ROLE_1", "ROLE_2", "ROLE_3", "ROLE_4", "ROLE_5");
            String token = jwtUtil.generateToken("user", 1L, roles);

            assertThat(jwtUtil.extractRoles(token)).hasSize(5);
        }
    }
}