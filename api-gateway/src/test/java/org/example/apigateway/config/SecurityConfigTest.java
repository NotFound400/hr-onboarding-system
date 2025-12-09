package org.example.apigateway.config;

import org.example.apigateway.filter.RouteValidator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("SecurityConfig Unit Tests")
class SecurityConfigTest {

    @Nested
    @DisplayName("Security Configuration Validation Tests")
    class SecurityConfigurationValidationTests {

        @Test
        @DisplayName("SecurityConfig class should exist")
        void securityConfigClassShouldExist() {
            org.assertj.core.api.Assertions.assertThat(SecurityConfig.class).isNotNull();
        }
    }

    @Nested
    @DisplayName("Open Endpoints Configuration Tests")
    class OpenEndpointsConfigurationTests {

        @Test
        @DisplayName("Login endpoint should be configured as open")
        void loginEndpointShouldBeConfiguredAsOpen() {
            // Verify the security configuration includes login as an open endpoint
            // This is a configuration validation test
            org.assertj.core.api.Assertions.assertThat(RouteValidator.OPEN_API_ENDPOINTS)
                    .contains("/api/auth/login");
        }

        @Test
        @DisplayName("Register endpoint should be configured as open")
        void registerEndpointShouldBeConfiguredAsOpen() {
            org.assertj.core.api.Assertions.assertThat(RouteValidator.OPEN_API_ENDPOINTS)
                    .contains("/api/auth/register");
        }

        @Test
        @DisplayName("Health endpoint should be configured as open")
        void healthEndpointShouldBeConfiguredAsOpen() {
            org.assertj.core.api.Assertions.assertThat(RouteValidator.OPEN_API_ENDPOINTS)
                    .contains("/actuator/health");
        }

        @Test
        @DisplayName("Swagger endpoint should be configured as open")
        void swaggerEndpointShouldBeConfiguredAsOpen() {
            org.assertj.core.api.Assertions.assertThat(RouteValidator.OPEN_API_ENDPOINTS)
                    .contains("/swagger-ui");
        }
    }

    @Nested
    @DisplayName("Protected Endpoints Configuration Tests")
    class ProtectedEndpointsConfigurationTests {

        @Test
        @DisplayName("Employee endpoints should not be in open list")
        void employeeEndpointsShouldNotBeInOpenList() {
            boolean hasEmployeeEndpoint = RouteValidator.OPEN_API_ENDPOINTS.stream()
                    .anyMatch(path -> path.contains("/api/employees"));
            
            org.assertj.core.api.Assertions.assertThat(hasEmployeeEndpoint).isFalse();
        }

        @Test
        @DisplayName("Housing endpoints should not be in open list")
        void housingEndpointsShouldNotBeInOpenList() {
            boolean hasHousingEndpoint = RouteValidator.OPEN_API_ENDPOINTS.stream()
                    .anyMatch(path -> path.contains("/api/housing"));
            
            org.assertj.core.api.Assertions.assertThat(hasHousingEndpoint).isFalse();
        }

        @Test
        @DisplayName("Application endpoints should not be in open list")
        void applicationEndpointsShouldNotBeInOpenList() {
            boolean hasApplicationEndpoint = RouteValidator.OPEN_API_ENDPOINTS.stream()
                    .anyMatch(path -> path.contains("/api/applications"));
            
            org.assertj.core.api.Assertions.assertThat(hasApplicationEndpoint).isFalse();
        }
    }
}
