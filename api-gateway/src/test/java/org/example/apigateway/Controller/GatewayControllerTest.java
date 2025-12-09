package org.example.apigateway.Controller;

import org.example.apigateway.config.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("GatewayController Unit Tests")
class GatewayControllerTest {

    @Mock
    private JwtUtil jwtUtil;

    private GatewayController gatewayController;

    @BeforeEach
    void setUp() {
        gatewayController = new GatewayController(jwtUtil);
    }

    @Nested
    @DisplayName("Health Check Endpoint Tests")
    class HealthCheckTests {

        @Test
        @DisplayName("Should return UP status for health check")
        void shouldReturnUpStatusForHealthCheck() {
            Mono<ResponseEntity<Map<String, Object>>> result = gatewayController.health();

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                        assertThat(response.getBody()).containsEntry("status", "UP");
                        assertThat(response.getBody()).containsEntry("service", "API Gateway");
                        assertThat(response.getBody()).containsKey("timestamp");
                    })
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Info Endpoint Tests")
    class InfoEndpointTests {

        @Test
        @DisplayName("Should return gateway info with all features")
        void shouldReturnGatewayInfoWithAllFeatures() {
            Mono<ResponseEntity<Map<String, Object>>> result = gatewayController.info();

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                        assertThat(response.getBody()).containsEntry("name", "HR Onboarding API Gateway");
                        assertThat(response.getBody()).containsEntry("version", "1.0.0");
                        assertThat(response.getBody()).containsKey("features");
                        
                        @SuppressWarnings("unchecked")
                        List<String> features = (List<String>) response.getBody().get("features");
                        assertThat(features).contains("JWT Authentication", "Circuit Breaker");
                    })
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Generate Token Endpoint Tests")
    class GenerateTokenTests {

        @Test
        @DisplayName("Should generate token with default parameters")
        void shouldGenerateTokenWithDefaultParameters() {
            String mockToken = "mock.jwt.token";
            when(jwtUtil.generateToken("testuser", 1L, List.of("EMPLOYEE")))
                    .thenReturn(mockToken);

            Mono<ResponseEntity<Map<String, Object>>> result = 
                    gatewayController.generateTestToken("testuser", 1L, "EMPLOYEE");

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                        assertThat(response.getBody()).containsEntry("token", mockToken);
                        assertThat(response.getBody()).containsEntry("tokenType", "Bearer");
                        assertThat(response.getBody()).containsEntry("username", "testuser");
                        assertThat(response.getBody()).containsEntry("userId", 1L);
                    })
                    .verifyComplete();
        }

        @Test
        @DisplayName("Should generate token with custom parameters")
        void shouldGenerateTokenWithCustomParameters() {
            String mockToken = "custom.jwt.token";
            when(jwtUtil.generateToken("customuser", 100L, List.of("HR")))
                    .thenReturn(mockToken);

            Mono<ResponseEntity<Map<String, Object>>> result = 
                    gatewayController.generateTestToken("customuser", 100L, "HR");

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                        assertThat(response.getBody()).containsEntry("username", "customuser");
                        assertThat(response.getBody()).containsEntry("userId", 100L);
                        assertThat(response.getBody().get("roles")).isEqualTo(List.of("HR"));
                    })
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Validate Token Endpoint Tests")
    class ValidateTokenTests {

        @Test
        @DisplayName("Should validate token successfully")
        void shouldValidateTokenSuccessfully() {
            String token = "valid.jwt.token";
            String authHeader = "Bearer " + token;
            
            when(jwtUtil.validateToken(token)).thenReturn(true);
            when(jwtUtil.extractUsername(token)).thenReturn("testuser");
            when(jwtUtil.extractUserId(token)).thenReturn(1L);
            when(jwtUtil.extractRoles(token)).thenReturn(List.of("EMPLOYEE"));
            when(jwtUtil.extractExpiration(token)).thenReturn(new Date());

            Mono<ResponseEntity<Map<String, Object>>> result = 
                    gatewayController.validateToken(authHeader);

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                        assertThat(response.getBody()).containsEntry("valid", true);
                        assertThat(response.getBody()).containsEntry("username", "testuser");
                        assertThat(response.getBody()).containsEntry("userId", 1L);
                    })
                    .verifyComplete();
        }

        @Test
        @DisplayName("Should return invalid for bad token")
        void shouldReturnInvalidForBadToken() {
            String token = "invalid.jwt.token";
            String authHeader = "Bearer " + token;
            
            when(jwtUtil.validateToken(token)).thenReturn(false);

            Mono<ResponseEntity<Map<String, Object>>> result = 
                    gatewayController.validateToken(authHeader);

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                        assertThat(response.getBody()).containsEntry("valid", false);
                        assertThat(response.getBody()).containsEntry("message", "Token is invalid or expired");
                    })
                    .verifyComplete();
        }

        @Test
        @DisplayName("Should return bad request for missing Bearer prefix")
        void shouldReturnBadRequestForMissingBearerPrefix() {
            String authHeader = "InvalidHeader token";

            Mono<ResponseEntity<Map<String, Object>>> result = 
                    gatewayController.validateToken(authHeader);

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(response.getBody()).containsEntry("valid", false);
                        assertThat(response.getBody()).containsEntry("message", "Invalid Authorization header");
                    })
                    .verifyComplete();
        }

        @Test
        @DisplayName("Should return bad request for null authorization header")
        void shouldReturnBadRequestForNullAuthorizationHeader() {
            Mono<ResponseEntity<Map<String, Object>>> result = 
                    gatewayController.validateToken(null);

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(response.getBody()).containsEntry("valid", false);
                    })
                    .verifyComplete();
        }
    }
}
