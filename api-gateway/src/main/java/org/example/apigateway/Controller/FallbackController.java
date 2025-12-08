package org.example.apigateway.Controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/auth")
    public Mono<ResponseEntity<Map<String, Object>>> authFallback() {
        log.warn("Authentication service is unavailable - triggering fallback");
        return Mono.just(createFallbackResponse(
                "Authentication Service",
                "The authentication service is temporarily unavailable. Please try again later."
        ));
    }

    @GetMapping("/employee")
    public Mono<ResponseEntity<Map<String, Object>>> employeeFallback() {
        log.warn("Employee service is unavailable - triggering fallback");
        return Mono.just(createFallbackResponse(
                "Employee Service",
                "The employee service is temporarily unavailable. Please try again later."
        ));
    }

    @GetMapping("/application")
    public Mono<ResponseEntity<Map<String, Object>>> applicationFallback() {
        log.warn("Application service is unavailable - triggering fallback");
        return Mono.just(createFallbackResponse(
                "Application Service",
                "The application service is temporarily unavailable. Please try again later."
        ));
    }

    @GetMapping("/housing")
    public Mono<ResponseEntity<Map<String, Object>>> housingFallback() {
        log.warn("Housing service is unavailable - triggering fallback");
        return Mono.just(createFallbackResponse(
                "Housing Service",
                "The housing service is temporarily unavailable. Please try again later."
        ));
    }

    @GetMapping("/email")
    public Mono<ResponseEntity<Map<String, Object>>> emailFallback() {
        log.warn("Email service is unavailable - triggering fallback");
        return Mono.just(createFallbackResponse(
                "Email Service",
                "The email service is temporarily unavailable. Please try again later."
        ));
    }

    @GetMapping("/default")
    public Mono<ResponseEntity<Map<String, Object>>> defaultFallback() {
        log.warn("Service is unavailable - triggering default fallback");
        return Mono.just(createFallbackResponse(
                "Service",
                "The service is temporarily unavailable. Please try again later."
        ));
    }

    private ResponseEntity<Map<String, Object>> createFallbackResponse(String service, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("service", service);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Service Unavailable");

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(response);
    }
}
