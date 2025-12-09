package org.example.apigateway.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("LoggingFilter Unit Tests")
class LoggingFilterTest {

    @Mock
    private GatewayFilterChain filterChain;

    private LoggingFilter loggingFilter;

    @BeforeEach
    void setUp() {
        loggingFilter = new LoggingFilter();
    }

    @Nested
    @DisplayName("Request ID Generation Tests")
    class RequestIdGenerationTests {

        @Test
        @DisplayName("Should add X-Request-Id header to response")
        void shouldAddRequestIdHeaderToResponse() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/employees/1")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(filterChain.filter(any())).thenReturn(Mono.empty());

            Mono<Void> result = loggingFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            String requestId = exchange.getResponse().getHeaders().getFirst("X-Request-Id");
            assertThat(requestId).isNotNull();
            assertThat(requestId).hasSize(8); // UUID substring of 8 characters
        }

        @Test
        @DisplayName("Should generate unique request IDs")
        void shouldGenerateUniqueRequestIds() {
            MockServerHttpRequest request1 = MockServerHttpRequest.get("/api/test1").build();
            MockServerHttpRequest request2 = MockServerHttpRequest.get("/api/test2").build();
            MockServerWebExchange exchange1 = MockServerWebExchange.from(request1);
            MockServerWebExchange exchange2 = MockServerWebExchange.from(request2);

            when(filterChain.filter(any())).thenReturn(Mono.empty());

            loggingFilter.filter(exchange1, filterChain).block();
            loggingFilter.filter(exchange2, filterChain).block();

            String requestId1 = exchange1.getResponse().getHeaders().getFirst("X-Request-Id");
            String requestId2 = exchange2.getResponse().getHeaders().getFirst("X-Request-Id");

            assertThat(requestId1).isNotEqualTo(requestId2);
        }
    }

    @Nested
    @DisplayName("Filter Chain Execution Tests")
    class FilterChainExecutionTests {

        @Test
        @DisplayName("Should call filter chain")
        void shouldCallFilterChain() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/employees/1")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(filterChain.filter(any())).thenReturn(Mono.empty());

            Mono<Void> result = loggingFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            verify(filterChain).filter(exchange);
        }

        @Test
        @DisplayName("Should pass exchange to filter chain")
        void shouldPassExchangeToFilterChain() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/housing/houses")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(filterChain.filter(exchange)).thenReturn(Mono.empty());

            loggingFilter.filter(exchange, filterChain).block();

            verify(filterChain).filter(exchange);
        }
    }

    @Nested
    @DisplayName("HTTP Method Logging Tests")
    class HttpMethodLoggingTests {

        @Test
        @DisplayName("Should handle GET requests")
        void shouldHandleGetRequests() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/employees")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(filterChain.filter(any())).thenReturn(Mono.empty());

            Mono<Void> result = loggingFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            verify(filterChain).filter(any());
        }

        @Test
        @DisplayName("Should handle POST requests")
        void shouldHandlePostRequests() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .post("/api/auth/login")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(filterChain.filter(any())).thenReturn(Mono.empty());

            Mono<Void> result = loggingFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            verify(filterChain).filter(any());
        }

        @Test
        @DisplayName("Should handle PUT requests")
        void shouldHandlePutRequests() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .put("/api/employees/1")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(filterChain.filter(any())).thenReturn(Mono.empty());

            Mono<Void> result = loggingFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            verify(filterChain).filter(any());
        }

        @Test
        @DisplayName("Should handle DELETE requests")
        void shouldHandleDeleteRequests() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .delete("/api/housing/houses/1")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(filterChain.filter(any())).thenReturn(Mono.empty());

            Mono<Void> result = loggingFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            verify(filterChain).filter(any());
        }
    }

    @Nested
    @DisplayName("Filter Order Tests")
    class FilterOrderTests {

        @Test
        @DisplayName("Should have highest priority order")
        void shouldHaveHighestPriorityOrder() {
            int order = loggingFilter.getOrder();

            // -200 is higher priority than JwtAuthenticationFilter's -100
            assertThat(order).isEqualTo(-200);
            assertThat(order).isLessThan(-100);
        }
    }

    @Nested
    @DisplayName("Path Logging Tests")
    class PathLoggingTests {

        @Test
        @DisplayName("Should handle paths with query parameters")
        void shouldHandlePathsWithQueryParameters() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/employees?page=1&size=10")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(filterChain.filter(any())).thenReturn(Mono.empty());

            Mono<Void> result = loggingFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            assertThat(exchange.getResponse().getHeaders().getFirst("X-Request-Id")).isNotNull();
        }

        @Test
        @DisplayName("Should handle nested paths")
        void shouldHandleNestedPaths() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/housing/houses/1/facilities/2/reports")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            when(filterChain.filter(any())).thenReturn(Mono.empty());

            Mono<Void> result = loggingFilter.filter(exchange, filterChain);

            StepVerifier.create(result)
                    .verifyComplete();

            verify(filterChain).filter(any());
        }
    }
}
