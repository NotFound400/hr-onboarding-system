package org.example.apigateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> OPEN_API_ENDPOINTS = List.of(
            // Auth - Public endpoints
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/auth/forgot-password",
            "/api/auth/validate-token",       // Token validation before registration
            "/api/auth/registration-token/",  // GET registration token info (the "/" ensures it's the path prefix for GET)
            
            // Health
            "/actuator/health",
            "/actuator/info",
            
            // Swagger/OpenAPI
            "/swagger-ui",
            "/swagger-ui.html",
            "/v3/api-docs",
            "/swagger-resources",
            "/webjars",
            
            // Eureka
            "/eureka"
    );

    public Predicate<ServerHttpRequest> isSecured = request -> 
            OPEN_API_ENDPOINTS.stream()
                    .noneMatch(uri -> request.getURI().getPath().contains(uri));

    public boolean isOpenEndpoint(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        return OPEN_API_ENDPOINTS.stream()
                .anyMatch(path::contains);
    }
}
