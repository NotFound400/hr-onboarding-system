package org.example.apigateway.Controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("FallbackController Unit Tests")
class FallbackControllerTest {

    private FallbackController fallbackController;

    @BeforeEach
    void setUp() {
        fallbackController = new FallbackController();
    }

    @Nested
    @DisplayName("Auth Service Fallback Tests")
    class AuthServiceFallbackTests {

        @Test
        @DisplayName("Should return SERVICE_UNAVAILABLE status for auth fallback")
        void shouldReturnServiceUnavailableForAuthFallback() {
            Mono<ResponseEntity<Map<String, Object>>> result = fallbackController.authFallback();

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
                        assertThat(response.getBody()).containsEntry("service", "Authentication Service");
                        assertThat(response.getBody()).containsEntry("success", false);
                        assertThat(response.getBody()).containsKey("timestamp");
                    })
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Employee Service Fallback Tests")
    class EmployeeServiceFallbackTests {

        @Test
        @DisplayName("Should return SERVICE_UNAVAILABLE status for employee fallback")
        void shouldReturnServiceUnavailableForEmployeeFallback() {
            Mono<ResponseEntity<Map<String, Object>>> result = fallbackController.employeeFallback();

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
                        assertThat(response.getBody()).containsEntry("service", "Employee Service");
                        assertThat(response.getBody()).containsEntry("success", false);
                        assertThat(response.getBody()).containsEntry("status", 503);
                    })
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Application Service Fallback Tests")
    class ApplicationServiceFallbackTests {

        @Test
        @DisplayName("Should return SERVICE_UNAVAILABLE status for application fallback")
        void shouldReturnServiceUnavailableForApplicationFallback() {
            Mono<ResponseEntity<Map<String, Object>>> result = fallbackController.applicationFallback();

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
                        assertThat(response.getBody()).containsEntry("service", "Application Service");
                        assertThat(response.getBody()).containsEntry("error", "Service Unavailable");
                    })
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Housing Service Fallback Tests")
    class HousingServiceFallbackTests {

        @Test
        @DisplayName("Should return SERVICE_UNAVAILABLE status for housing fallback")
        void shouldReturnServiceUnavailableForHousingFallback() {
            Mono<ResponseEntity<Map<String, Object>>> result = fallbackController.housingFallback();

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
                        assertThat(response.getBody()).containsEntry("service", "Housing Service");
                        assertThat(response.getBody()).containsEntry("success", false);
                    })
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Email Service Fallback Tests")
    class EmailServiceFallbackTests {

        @Test
        @DisplayName("Should return SERVICE_UNAVAILABLE status for email fallback")
        void shouldReturnServiceUnavailableForEmailFallback() {
            Mono<ResponseEntity<Map<String, Object>>> result = fallbackController.emailFallback();

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
                        assertThat(response.getBody()).containsEntry("service", "Email Service");
                    })
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Default Fallback Tests")
    class DefaultFallbackTests {

        @Test
        @DisplayName("Should return SERVICE_UNAVAILABLE status for default fallback")
        void shouldReturnServiceUnavailableForDefaultFallback() {
            Mono<ResponseEntity<Map<String, Object>>> result = fallbackController.defaultFallback();

            StepVerifier.create(result)
                    .assertNext(response -> {
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
                        assertThat(response.getBody()).containsEntry("service", "Service");
                        assertThat(response.getBody()).containsEntry("success", false);
                        assertThat(response.getBody()).containsEntry("status", 503);
                        assertThat(response.getBody()).containsEntry("error", "Service Unavailable");
                    })
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Response Structure Tests")
    class ResponseStructureTests {

        @Test
        @DisplayName("Fallback response should contain all required fields")
        void fallbackResponseShouldContainAllRequiredFields() {
            Mono<ResponseEntity<Map<String, Object>>> result = fallbackController.defaultFallback();

            StepVerifier.create(result)
                    .assertNext(response -> {
                        Map<String, Object> body = response.getBody();
                        assertThat(body).isNotNull();
                        assertThat(body).containsKeys("success", "service", "message", "timestamp", "status", "error");
                    })
                    .verifyComplete();
        }

        @Test
        @DisplayName("Fallback response timestamp should be present")
        void fallbackResponseShouldHaveTimestamp() {
            Mono<ResponseEntity<Map<String, Object>>> result = fallbackController.authFallback();

            StepVerifier.create(result)
                    .assertNext(response -> {
                        Map<String, Object> body = response.getBody();
                        assertThat(body).containsKey("timestamp");
                        assertThat(body.get("timestamp")).isNotNull();
                    })
                    .verifyComplete();
        }
    }
}
