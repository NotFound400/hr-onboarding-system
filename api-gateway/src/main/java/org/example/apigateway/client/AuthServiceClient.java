package org.example.apigateway.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.apigateway.dto.AuthDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuthServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${auth-service.url:lb://auth-service}")
    private String authServiceUrl;

    @Value("${auth-service.timeout:5000}")
    private long timeoutMs;

    public Mono<AuthDTO.LoginResponse> login(AuthDTO.LoginRequest request) {
        log.info("Sending login request to Auth Service for user: {}", request.getUsername());
        
        return webClientBuilder.build()
                .post()
                .uri(authServiceUrl + "/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AuthDTO.LoginResponse.class)
                .timeout(Duration.ofMillis(timeoutMs))
                .doOnSuccess(response -> log.info("Login successful for user: {}", request.getUsername()))
                .doOnError(error -> log.error("Login failed for user: {}, error: {}", 
                        request.getUsername(), error.getMessage()));
    }

    public Mono<AuthDTO.RegisterResponse> register(AuthDTO.RegisterRequest request) {
        log.info("Sending register request to Auth Service for user: {}", request.getUsername());
        
        return webClientBuilder.build()
                .post()
                .uri(authServiceUrl + "/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AuthDTO.RegisterResponse.class)
                .timeout(Duration.ofMillis(timeoutMs))
                .doOnSuccess(response -> log.info("Registration successful for user: {}", request.getUsername()))
                .doOnError(error -> log.error("Registration failed for user: {}, error: {}", 
                        request.getUsername(), error.getMessage()));
    }

    public Mono<AuthDTO.TokenResponse> refreshToken(AuthDTO.RefreshTokenRequest request) {
        log.info("Sending refresh token request to Auth Service");
        
        return webClientBuilder.build()
                .post()
                .uri(authServiceUrl + "/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AuthDTO.TokenResponse.class)
                .timeout(Duration.ofMillis(timeoutMs))
                .doOnSuccess(response -> log.info("Token refresh successful"))
                .doOnError(error -> log.error("Token refresh failed: {}", error.getMessage()));
    }

    public Mono<Boolean> validateToken(String token) {
        log.debug("Validating token with Auth Service");
        
        return webClientBuilder.build()
                .get()
                .uri(authServiceUrl + "/api/auth/validate")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(Boolean.class)
                .timeout(Duration.ofMillis(timeoutMs))
                .onErrorReturn(false)
                .doOnSuccess(valid -> log.debug("Token validation result: {}", valid))
                .doOnError(error -> log.warn("Token validation failed: {}", error.getMessage()));
    }

    public Mono<AuthDTO.UserInfo> getUserInfo(String token) {
        log.debug("Getting user info from Auth Service");
        
        return webClientBuilder.build()
                .get()
                .uri(authServiceUrl + "/api/auth/me")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(AuthDTO.UserInfo.class)
                .timeout(Duration.ofMillis(timeoutMs))
                .doOnError(error -> log.warn("Failed to get user info: {}", error.getMessage()));
    }

    public Mono<Boolean> isServiceAvailable() {
        return webClientBuilder.build()
                .get()
                .uri(authServiceUrl + "/actuator/health")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(2000))
                .map(response -> true)
                .onErrorReturn(false)
                .doOnSuccess(available -> log.debug("Auth Service availability: {}", available));
    }
}
