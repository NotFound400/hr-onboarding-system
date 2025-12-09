package org.example.apigateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

/**
 * 路由验证器
 * 定义哪些端点不需要认证
 */
@Component
public class RouteValidator {

    /**
     * 开放端点列表（不需要认证）
     */
    public static final List<String> OPEN_API_ENDPOINTS = List.of(
            // 认证相关
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/auth/forgot-password",
            
            // 健康检查
            "/actuator/health",
            "/actuator/info",
            
            // Swagger/OpenAPI 文档
            "/swagger-ui",
            "/swagger-ui.html",
            "/v3/api-docs",
            "/swagger-resources",
            "/webjars",
            
            // Eureka
            "/eureka"
    );

    /**
     * 检查请求是否是开放端点
     */
    public Predicate<ServerHttpRequest> isSecured = request -> 
            OPEN_API_ENDPOINTS.stream()
                    .noneMatch(uri -> request.getURI().getPath().contains(uri));

    /**
     * 检查是否是开放端点
     */
    public boolean isOpenEndpoint(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        return OPEN_API_ENDPOINTS.stream()
                .anyMatch(path::contains);
    }
}
