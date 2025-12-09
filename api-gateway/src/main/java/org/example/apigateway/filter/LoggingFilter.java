package org.example.apigateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;

/**
 * 请求日志过滤器
 * 记录所有经过网关的请求和响应信息
 */
@Slf4j
@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        Instant startTime = Instant.now();
        
        String requestId = java.util.UUID.randomUUID().toString().substring(0, 8);
        
        // 记录请求信息
        log.info("[{}] >>> Request: {} {} from {}",
                requestId,
                request.getMethod(),
                request.getURI().getPath(),
                request.getRemoteAddress() != null ? request.getRemoteAddress().getAddress() : "unknown"
        );
        
        // 将请求 ID 添加到响应头
        exchange.getResponse().getHeaders().add("X-Request-Id", requestId);

        return chain.filter(exchange)
                .then(Mono.fromRunnable(() -> {
                    ServerHttpResponse response = exchange.getResponse();
                    Duration duration = Duration.between(startTime, Instant.now());
                    
                    // 记录响应信息
                    log.info("[{}] <<< Response: {} {} - Status: {} - Duration: {}ms",
                            requestId,
                            request.getMethod(),
                            request.getURI().getPath(),
                            response.getStatusCode(),
                            duration.toMillis()
                    );
                }));
    }

    @Override
    public int getOrder() {
        // 最高优先级，最先执行
        return -200;
    }
}
