package org.example.apigateway.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.ConnectException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Slf4j
@Order(-1)
@Component
@RequiredArgsConstructor
public class GlobalExceptionHandler implements ErrorWebExceptionHandler {

    private final ObjectMapper objectMapper;

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        ServerHttpResponse response = exchange.getResponse();

        if (response.isCommitted()) {
            return Mono.error(ex);
        }

        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        HttpStatus status;
        String message;

        if (ex instanceof ResponseStatusException rse) {
            status = HttpStatus.valueOf(rse.getStatusCode().value());
            message = rse.getReason() != null ? rse.getReason() : "Request processing failed";
        } else if (ex instanceof ConnectException) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            message = "Service connection failed, please try again later.";
            log.error("Service connection error: {}", ex.getMessage());
        } else if (ex instanceof TimeoutException) {
            status = HttpStatus.GATEWAY_TIMEOUT;
            message = "Request timed out. Please try again later.";
            log.error("Request timeout: {}", ex.getMessage());
        } else if (ex instanceof io.github.resilience4j.circuitbreaker.CallNotPermittedException) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            message = "The service is temporarily unavailable (due to circuit breaker protection). Please try again later.";
            log.warn("Circuit breaker is open: {}", ex.getMessage());
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = "Internal server error";
            log.error("Unexpected error: ", ex);
        }

        response.setStatusCode(status);

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("status", status.value());
        errorResponse.put("error", status.getReasonPhrase());
        errorResponse.put("message", message);
        errorResponse.put("path", exchange.getRequest().getPath().value());
        errorResponse.put("timestamp", LocalDateTime.now().toString());

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            log.error("Error writing response", e);
            return Mono.error(e);
        }
    }
}
