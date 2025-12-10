package org.example.apigateway.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.apigateway.client.AuthServiceClient;
import org.example.apigateway.config.JwtUtil;
import org.example.apigateway.dto.AuthDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/gateway")
@RequiredArgsConstructor
public class GatewayController {

    private final JwtUtil jwtUtil;
    private final AuthServiceClient authServiceClient;

    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "API Gateway");
        response.put("timestamp", LocalDateTime.now().toString());
        return Mono.just(ResponseEntity.ok(response));
    }

    /**
     * Gateway information
     */
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
                "CORS Support",
                "Service Discovery"
        ));
        return Mono.just(ResponseEntity.ok(response));
    }

    // ==================== Auth Service Proxy Endpoints ====================

    /**
     * Login endpoint - forwards to Auth Service
     *
     * This endpoint receives login requests and forwards them to Auth Service.
     * The Auth Service validates credentials and returns a JWT token.
     */
    @PostMapping("/auth/login")
    public Mono<ResponseEntity<AuthDTO.ApiResponse<AuthDTO.LoginResponse>>> login(
            @RequestBody AuthDTO.LoginRequest request) {

        log.info("Processing login request for user: {}", request.getUsername());

        return authServiceClient.login(request)
                .map(loginResponse -> {
                    log.info("Login successful for user: {}", request.getUsername());
                    return ResponseEntity.ok(AuthDTO.ApiResponse.success("Login successful", loginResponse));
                })
                .onErrorResume(error -> {
                    log.error("Login failed for user: {}, error: {}", request.getUsername(), error.getMessage());
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.UNAUTHORIZED)
                            .body(AuthDTO.ApiResponse.error("Invalid username or password")));
                });
    }

    /**
     * Register endpoint - forwards to Auth Service
     */
    @PostMapping("/auth/register")
    public Mono<ResponseEntity<AuthDTO.ApiResponse<AuthDTO.RegisterResponse>>> register(
            @RequestBody AuthDTO.RegisterRequest request) {

        log.info("Processing registration request for user: {}", request.getUsername());

        return authServiceClient.register(request)
                .map(registerResponse -> {
                    log.info("Registration successful for user: {}", request.getUsername());
                    return ResponseEntity
                            .status(HttpStatus.CREATED)
                            .body(AuthDTO.ApiResponse.success("Registration successful", registerResponse));
                })
                .onErrorResume(error -> {
                    log.error("Registration failed for user: {}, error: {}", request.getUsername(), error.getMessage());
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .body(AuthDTO.ApiResponse.error("Registration failed: " + error.getMessage())));
                });
    }

    /**
     * Refresh token endpoint - forwards to Auth Service
     */
    @PostMapping("/auth/refresh")
    public Mono<ResponseEntity<AuthDTO.ApiResponse<AuthDTO.TokenResponse>>> refreshToken(
            @RequestBody AuthDTO.RefreshTokenRequest request) {

        log.info("Processing token refresh request");

        return authServiceClient.refreshToken(request)
                .map(tokenResponse -> {
                    log.info("Token refresh successful");
                    return ResponseEntity.ok(AuthDTO.ApiResponse.success("Token refreshed", tokenResponse));
                })
                .onErrorResume(error -> {
                    log.error("Token refresh failed: {}", error.getMessage());
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.UNAUTHORIZED)
                            .body(AuthDTO.ApiResponse.error("Token refresh failed")));
                });
    }

    // ==================== Development/Testing Endpoints ====================

    /**
     * Generate test token (DEVELOPMENT ONLY)
     *
     * WARNING: This endpoint should be disabled in production.
     * It generates JWT tokens without Auth Service validation.
     */
    @PostMapping("/test/generate-token")
    public Mono<ResponseEntity<Map<String, Object>>> generateTestToken(
            @RequestParam(defaultValue = "testuser@test.com") String username,
            @RequestParam(defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "EMPLOYEE") String role
    ) {
        log.warn("Generating test token - this endpoint should be disabled in production");

        String token = jwtUtil.generateToken(username, userId, List.of(role));

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("tokenType", "Bearer");
        response.put("username", username);
        response.put("userId", userId);
        response.put("roles", List.of(role));
        response.put("warning", "This endpoint is for testing only. Disable in production.");

        return Mono.just(ResponseEntity.ok(response));
    }

    /**
     * Validate token (DEVELOPMENT ONLY)
     */
    @PostMapping("/test/validate-token")
    public Mono<ResponseEntity<Map<String, Object>>> validateToken(
            @RequestHeader("Authorization") String authHeader
    ) {
        Map<String, Object> response = new HashMap<>();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("valid", false);
            response.put("message", "Invalid Authorization header format");
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
