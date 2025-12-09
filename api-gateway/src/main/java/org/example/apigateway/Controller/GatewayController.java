package org.example.apigateway.Controller;

import lombok.RequiredArgsConstructor;
import org.example.apigateway.config.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Gateway Test Controller
 */
@RestController
@RequestMapping("/gateway")
@RequiredArgsConstructor
public class GatewayController {

    private final JwtUtil jwtUtil;

    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "API Gateway");
        response.put("timestamp", LocalDateTime.now().toString());
        return Mono.just(ResponseEntity.ok(response));
    }

    @GetMapping("/info")
    public Mono<ResponseEntity<Map<String, Object>>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("name", "HR Onboarding API Gateway");
        response.put("version", "1.0.0");
        response.put("description", "Unified entry point for HR Onboarding System");
        response.put("features", List.of(
                "JWT Authentication",
                "Rate Limiting",
                "Circuit Breaker",
                "Request Logging",
                "CORS Support"
        ));
        return Mono.just(ResponseEntity.ok(response));
    }

    @PostMapping("/test/generate-token")
    public Mono<ResponseEntity<Map<String, Object>>> generateTestToken(
            @RequestParam(defaultValue = "testuser") String username,
            @RequestParam(defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "EMPLOYEE") String role
    ) {
        String token = jwtUtil.generateToken(username, userId, List.of(role));
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("tokenType", "Bearer");
        response.put("username", username);
        response.put("userId", userId);
        response.put("roles", List.of(role));
        response.put("message", "This API just use for test, Don't use this in production env");
        
        return Mono.just(ResponseEntity.ok(response));
    }

    @PostMapping("/test/validate-token")
    public Mono<ResponseEntity<Map<String, Object>>> validateToken(
            @RequestHeader("Authorization") String authHeader
    ) {
        Map<String, Object> response = new HashMap<>();
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("valid", false);
            response.put("message", "Invalid Authorization header");
            return Mono.just(ResponseEntity.badRequest().body(response));
        }
        
        String token = authHeader.substring(7);
        boolean isValid = jwtUtil.validateToken(token);
        
        response.put("valid", isValid);
        
        if (isValid) {
            response.put("username", jwtUtil.extractUsername(token));
            response.put("userId", jwtUtil.extractUserId(token));
            response.put("roles", jwtUtil.extractRoles(token));
            response.put("expiration", jwtUtil.extractExpiration(token));
        } else {
            response.put("message", "Token is invalid or expired");
        }
        
        return Mono.just(ResponseEntity.ok(response));
    }
}
