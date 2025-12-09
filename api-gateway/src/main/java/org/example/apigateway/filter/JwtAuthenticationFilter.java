package org.example.apigateway.filter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.apigateway.config.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * JWT 认证全局过滤器
 * 验证请求中的 JWT Token
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;
    private final RouteValidator routeValidator;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        
        log.debug("Processing request: {} {}", request.getMethod(), path);

        // 检查是否是开放端点（不需要认证）
        if (routeValidator.isOpenEndpoint(request)) {
            log.debug("Open endpoint, skipping authentication: {}", path);
            return chain.filter(exchange);
        }

        // 检查 Authorization header
        if (!request.getHeaders().containsHeader(HttpHeaders.AUTHORIZATION)) {
            log.warn("Missing Authorization header for: {}", path);
            return onError(exchange, "Missing Authorization header", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Invalid Authorization header format for: {}", path);
            return onError(exchange, "Invalid Authorization header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        // 验证 token
        if (!jwtUtil.validateToken(token)) {
            log.warn("Invalid or expired token for: {}", path);
            return onError(exchange, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
        }

        // 提取用户信息并添加到请求头
        try {
            String username = jwtUtil.extractUsername(token);
            Long userId = jwtUtil.extractUserId(token);
            List<String> roles = jwtUtil.extractRoles(token);

            // 将用户信息传递给下游服务
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Id", userId != null ? userId.toString() : "")
                    .header("X-Username", username)
                    .header("X-User-Roles", String.join(",", roles))
                    .build();

            log.debug("Authenticated user: {} with roles: {}", username, roles);
            
            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        } catch (Exception e) {
            log.error("Error processing JWT token: {}", e.getMessage());
            return onError(exchange, "Error processing token", HttpStatus.UNAUTHORIZED);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");
        
        String body = String.format("{\"error\": \"%s\", \"status\": %d}", message, status.value());
        
        return response.writeWith(
            Mono.just(response.bufferFactory().wrap(body.getBytes()))
        );
    }

    @Override
    public int getOrder() {
        // 高优先级，在其他过滤器之前执行
        return -100;
    }
}
