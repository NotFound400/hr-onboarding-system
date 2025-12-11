package org.example.apigateway.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RouteValidator Unit Tests")
class RouteValidatorTest {

    private RouteValidator routeValidator;

    @BeforeEach
    void setUp() {
        routeValidator = new RouteValidator();
    }

    @Nested
    @DisplayName("Open Endpoint Detection Tests")
    class OpenEndpointTests {

        @ParameterizedTest
        @DisplayName("Should identify open endpoints correctly")
        @ValueSource(strings = {
                "/api/auth/login",
                "/api/auth/register",
                "/api/auth/refresh",
                "/api/auth/forgot-password",
                "/actuator/health",
                "/actuator/info",
                "/swagger-ui",
                "/swagger-ui.html",
                "/v3/api-docs",
                "/swagger-resources",
                "/webjars/something",
                "/eureka/apps"
        })
        void shouldIdentifyOpenEndpoints(String path) {
            ServerHttpRequest request = MockServerHttpRequest
                    .get(path)
                    .build();

            boolean isOpen = routeValidator.isOpenEndpoint(request);

            assertThat(isOpen).isTrue();
        }

        @ParameterizedTest
        @DisplayName("Should identify secured endpoints correctly")
        @ValueSource(strings = {
                "/api/employees/1",
                "/api/housing/houses",
                "/api/applications/status",
                "/api/email/send",
                "/some/protected/path"
        })
        void shouldIdentifySecuredEndpoints(String path) {
            ServerHttpRequest request = MockServerHttpRequest
                    .get(path)
                    .build();

            boolean isOpen = routeValidator.isOpenEndpoint(request);

            assertThat(isOpen).isFalse();
        }
    }

    @Nested
    @DisplayName("Path Matching Tests")
    class PathMatchingTests {

        @Test
        @DisplayName("Should match partial paths correctly")
        void shouldMatchPartialPathsCorrectly() {
            ServerHttpRequest request = MockServerHttpRequest
                    .get("/swagger-ui/index.html")
                    .build();

            boolean isOpen = routeValidator.isOpenEndpoint(request);

            assertThat(isOpen).isTrue();
        }

        @Test
        @DisplayName("Should match paths with query parameters")
        void shouldMatchPathsWithQueryParameters() {
            ServerHttpRequest request = MockServerHttpRequest
                    .get("/api/auth/login?redirect=/home")
                    .build();

            boolean isOpen = routeValidator.isOpenEndpoint(request);

            assertThat(isOpen).isTrue();
        }

        @Test
        @DisplayName("Should be case sensitive for paths")
        void shouldBeCaseSensitiveForPaths() {
            ServerHttpRequest request = MockServerHttpRequest
                    .get("/API/AUTH/LOGIN")
                    .build();

            boolean isOpen = routeValidator.isOpenEndpoint(request);

            // Path matching should be case sensitive
            assertThat(isOpen).isFalse();
        }
    }

    @Nested
    @DisplayName("Open API Endpoints List Tests")
    class OpenApiEndpointsListTests {

        @Test
        @DisplayName("Should contain all expected open endpoints")
        void shouldContainAllExpectedOpenEndpoints() {
            assertThat(RouteValidator.OPEN_API_ENDPOINTS)
                    .contains(
                            "/api/auth/login",
                            "/api/auth/register",
                            "/actuator/health",
                            "/swagger-ui"
                    );
        }

        @Test
        @DisplayName("Should not be modifiable")
        void openEndpointsListShouldNotBeModifiable() {
            // List.of() creates an immutable list
            assertThat(RouteValidator.OPEN_API_ENDPOINTS).isUnmodifiable();
        }
    }

    @Nested
    @DisplayName("HTTP Method Tests")
    class HttpMethodTests {

        @Test
        @DisplayName("Should work with POST requests")
        void shouldWorkWithPostRequests() {
            ServerHttpRequest request = MockServerHttpRequest
                    .post("/api/auth/login")
                    .build();

            boolean isOpen = routeValidator.isOpenEndpoint(request);

            assertThat(isOpen).isTrue();
        }

        @Test
        @DisplayName("Should work with PUT requests")
        void shouldWorkWithPutRequests() {
            ServerHttpRequest request = MockServerHttpRequest
                    .put("/api/employees/1")
                    .build();

            boolean isOpen = routeValidator.isOpenEndpoint(request);

            assertThat(isOpen).isFalse();
        }

        @Test
        @DisplayName("Should work with DELETE requests")
        void shouldWorkWithDeleteRequests() {
            ServerHttpRequest request = MockServerHttpRequest
                    .delete("/api/housing/houses/1")
                    .build();

            boolean isOpen = routeValidator.isOpenEndpoint(request);

            assertThat(isOpen).isFalse();
        }
    }
}
