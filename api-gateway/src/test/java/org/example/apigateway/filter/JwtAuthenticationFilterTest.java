package org.example.apigateway.filter;

import org.example.apigateway.config.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtAuthenticationFilter Unit Tests")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RouteValidator routeValidator;

    @Mock
    private GatewayFilterChain filterChain;

    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtUtil, routeValidator);
    }

    @Nested
    @DisplayName("Missing Authorization Header Tests")
    class MissingAuthorizationHeaderTests {

        @Test
        @DisplayName("Should return 401 when Authorization header is missing")
        void shouldReturn401WhenAuthorizationHeaderIsMissing() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/employees/1")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(routeValidator.isOpenEndpoint(any())).thenReturn(false);

            Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Nested
    @DisplayName("Invalid Authorization Header Format Tests")
    class InvalidAuthorizationHeaderFormatTests {

        @Test
        @DisplayName("Should return 401 when Authorization header has wrong format")
        void shouldReturn401WhenAuthorizationHeaderHasWrongFormat() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/employees/1")
                    .header(HttpHeaders.AUTHORIZATION, "Basic dXNlcjpwYXNz")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(routeValidator.isOpenEndpoint(any())).thenReturn(false);

            Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("Should return 401 when Bearer prefix is missing")
        void shouldReturn401WhenBearerPrefixIsMissing() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/employees/1")
                    .header(HttpHeaders.AUTHORIZATION, "token123")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(routeValidator.isOpenEndpoint(any())).thenReturn(false);

            Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Nested
    @DisplayName("Token Validation Tests")
    class TokenValidationTests {

        @Test
        @DisplayName("Should return 401 when token is invalid")
        void shouldReturn401WhenTokenIsInvalid() {
            String invalidToken = "invalid.token.here";
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/employees/1")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + invalidToken)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(routeValidator.isOpenEndpoint(any())).thenReturn(false);
            when(jwtUtil.validateToken(invalidToken)).thenReturn(false);

            Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("Should proceed when token is valid")
        void shouldProceedWhenTokenIsValid() {
            String validToken = "valid.jwt.token";
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/employees/1")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(routeValidator.isOpenEndpoint(any())).thenReturn(false);
            when(jwtUtil.validateToken(validToken)).thenReturn(true);
            when(jwtUtil.extractUsername(validToken)).thenReturn("testuser");
            when(jwtUtil.extractUserId(validToken)).thenReturn(1L);
            when(jwtUtil.extractRoles(validToken)).thenReturn(List.of("EMPLOYEE"));
            when(filterChain.filter(any())).thenReturn(Mono.empty());

            Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            verify(filterChain).filter(any());
        }
    }


    @Nested
    @DisplayName("Filter Order Tests")
    class FilterOrderTests {

        @Test
        @DisplayName("Should have high priority order")
        void shouldHaveHighPriorityOrder() {
            int order = jwtAuthenticationFilter.getOrder();

            // Negative order means high priority
            assertThat(order).isLessThan(0);
            assertThat(order).isEqualTo(-100);
        }
    }

    @Nested
    @DisplayName("Exception Handling Tests")
    class ExceptionHandlingTests {

        @Test
        @DisplayName("Should return 401 when exception occurs during token processing")
        void shouldReturn401WhenExceptionOccursDuringTokenProcessing() {
            String validToken = "valid.jwt.token";
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/employees/1")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(routeValidator.isOpenEndpoint(any())).thenReturn(false);
            when(jwtUtil.validateToken(validToken)).thenReturn(true);
            when(jwtUtil.extractUsername(validToken)).thenThrow(new RuntimeException("Parse error"));

            Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }
}
