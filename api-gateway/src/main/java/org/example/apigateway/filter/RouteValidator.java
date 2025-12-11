package org.example.apigateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RouteValidator {

    /**
     * List of endpoints that do NOT require JWT authentication.
     */
    public static final List<String> OPEN_API_ENDPOINTS = List.of(
            // Auth - Public endpoints
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/auth/forgot-password",
            "/api/auth/validate-token",
            "/api/auth/registration-token/",

            // Health & Actuator
            "/actuator/health",
            "/actuator/info",

            // Swagger/OpenAPI
            "/swagger-ui",
            "/swagger-ui.html",
            "/v3/api-docs",
            "/api-docs",
            "/swagger-resources",
            "/webjars",

            // Eureka
            "/eureka",

            // Fallback endpoints
            "/fallback"
    );

    /**
     * Check if an endpoint is open (does not require authentication).
     */
    public boolean isOpenEndpoint(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        return OPEN_API_ENDPOINTS.stream()
                .anyMatch(path::contains);
    }
}
