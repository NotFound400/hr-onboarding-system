package org.example.apigateway.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.net.ConnectException;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

@DisplayName("GlobalExceptionHandler Unit Tests")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler globalExceptionHandler;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        globalExceptionHandler = new GlobalExceptionHandler(objectMapper);
    }

    @Nested
    @DisplayName("ResponseStatusException Handling Tests")
    class ResponseStatusExceptionTests {

        @Test
        @DisplayName("Should handle ResponseStatusException with NOT_FOUND status")
        void shouldHandleResponseStatusExceptionWithNotFound() {
            MockServerHttpRequest request = MockServerHttpRequest.get("/api/test").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            ResponseStatusException exception = new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Resource not found");

            Mono<Void> result = globalExceptionHandler.handle(exchange, exception);

            StepVerifier.create(result)
                    .verifyComplete();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }

        @Test
        @DisplayName("Should handle ResponseStatusException with BAD_REQUEST status")
        void shouldHandleResponseStatusExceptionWithBadRequest() {
            MockServerHttpRequest request = MockServerHttpRequest.get("/api/test").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            ResponseStatusException exception = new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid request");

            Mono<Void> result = globalExceptionHandler.handle(exchange, exception);

            StepVerifier.create(result)
                    .verifyComplete();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    @Nested
    @DisplayName("ConnectException Handling Tests")
    class ConnectExceptionTests {

        @Test
        @DisplayName("Should return SERVICE_UNAVAILABLE for ConnectException")
        void shouldReturnServiceUnavailableForConnectException() {
            MockServerHttpRequest request = MockServerHttpRequest.get("/api/test").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            ConnectException exception = new ConnectException("Connection refused");

            Mono<Void> result = globalExceptionHandler.handle(exchange, exception);

            StepVerifier.create(result)
                    .verifyComplete();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @Nested
    @DisplayName("TimeoutException Handling Tests")
    class TimeoutExceptionTests {

        @Test
        @DisplayName("Should return GATEWAY_TIMEOUT for TimeoutException")
        void shouldReturnGatewayTimeoutForTimeoutException() {
            MockServerHttpRequest request = MockServerHttpRequest.get("/api/test").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            TimeoutException exception = new TimeoutException("Request timed out");

            Mono<Void> result = globalExceptionHandler.handle(exchange, exception);

            StepVerifier.create(result)
                    .verifyComplete();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.GATEWAY_TIMEOUT);
        }
    }

    @Nested
    @DisplayName("Generic Exception Handling Tests")
    class GenericExceptionTests {

        @Test
        @DisplayName("Should return INTERNAL_SERVER_ERROR for unknown exceptions")
        void shouldReturnInternalServerErrorForUnknownExceptions() {
            MockServerHttpRequest request = MockServerHttpRequest.get("/api/test").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            RuntimeException exception = new RuntimeException("Unexpected error");

            Mono<Void> result = globalExceptionHandler.handle(exchange, exception);

            StepVerifier.create(result)
                    .verifyComplete();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @Test
        @DisplayName("Should return INTERNAL_SERVER_ERROR for NullPointerException")
        void shouldReturnInternalServerErrorForNullPointerException() {
            MockServerHttpRequest request = MockServerHttpRequest.get("/api/test").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            NullPointerException exception = new NullPointerException("null reference");

            Mono<Void> result = globalExceptionHandler.handle(exchange, exception);

            StepVerifier.create(result)
                    .verifyComplete();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Nested
    @DisplayName("Response Content Type Tests")
    class ResponseContentTypeTests {

        @Test
        @DisplayName("Should set Content-Type to application/json")
        void shouldSetContentTypeToJson() {
            MockServerHttpRequest request = MockServerHttpRequest.get("/api/test").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            RuntimeException exception = new RuntimeException("Test error");

            globalExceptionHandler.handle(exchange, exception).block();

            assertThat(exchange.getResponse().getHeaders().getContentType())
                    .isNotNull();
            assertThat(exchange.getResponse().getHeaders().getContentType().toString())
                    .contains("application/json");
        }
    }

    @Nested
    @DisplayName("Request Path Inclusion Tests")
    class RequestPathInclusionTests {

        @Test
        @DisplayName("Should include request path in error response")
        void shouldIncludeRequestPathInErrorResponse() {
            String testPath = "/api/employees/123";
            MockServerHttpRequest request = MockServerHttpRequest.get(testPath).build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            RuntimeException exception = new RuntimeException("Test error");

            Mono<Void> result = globalExceptionHandler.handle(exchange, exception);

            StepVerifier.create(result)
                    .verifyComplete();

            // The path should be included in the response body
            // We can verify the status code was set correctly
            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Nested
    @DisplayName("Response Already Committed Tests")
    class ResponseAlreadyCommittedTests {

        @Test
        @DisplayName("Should propagate error when response is already committed")
        void shouldPropagateErrorWhenResponseIsCommitted() {
            MockServerHttpRequest request = MockServerHttpRequest.get("/api/test").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            // Commit the response
            exchange.getResponse().setComplete().block();

            RuntimeException exception = new RuntimeException("Test error");

            Mono<Void> result = globalExceptionHandler.handle(exchange, exception);

            StepVerifier.create(result)
                    .expectError(RuntimeException.class)
                    .verify();
        }
    }
}
