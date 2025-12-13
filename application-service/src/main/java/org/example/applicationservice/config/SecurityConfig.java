package org.example.applicationservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${security.jwt.secret}")
    private String secretBase64;

    @Value("${security.jwt.algorithm:HS256}")
    private String hmacAlgorithmName;

    @Autowired
    private HeaderAuthenticationFilter headerAuthFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Health check
                        .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()
                        
                        // Swagger/OpenAPI
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api-docs/**",
                                "/api-docs.yaml",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()
                        
                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                // Add header authentication filter BEFORE JWT authentication
                .addFilterBefore(headerAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // Configure JWT as fallback authentication
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> {
                            jwt.decoder(jwtDecoder());
                            jwt.jwtAuthenticationConverter(jwtAuthenticationConverter());
                        })
                        .authenticationEntryPoint((req, res, ex) -> {
                            // Check if already authenticated by header filter
                            if (org.springframework.security.core.context.SecurityContextHolder
                                    .getContext().getAuthentication() != null &&
                                org.springframework.security.core.context.SecurityContextHolder
                                    .getContext().getAuthentication().isAuthenticated()) {
                                return;
                            }
                            res.sendError(401, "Unauthorized");
                        })
                        .accessDeniedHandler((req, res, ex) -> res.sendError(403, "Forbidden"))
                );

        return http.build();
    }

    @Bean
    JwtDecoder jwtDecoder() {
        byte[] keyBytes = decodeKey(secretBase64);
        MacAlgorithm macAlg = toMacAlgorithm(hmacAlgorithmName);

        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, macAlg.getName());
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withSecretKey(secretKey)
                .macAlgorithm(macAlg)
                .build();

        // Timestamp validation only
        OAuth2TokenValidator<Jwt> timestamps = new JwtTimestampValidator(Duration.ofSeconds(60));
        decoder.setJwtValidator(timestamps);
        return decoder;
    }

    private MacAlgorithm toMacAlgorithm(String alg) {
        return switch (alg.toUpperCase()) {
            case "HS256" -> MacAlgorithm.HS256;
            case "HS384" -> MacAlgorithm.HS384;
            case "HS512" -> MacAlgorithm.HS512;
            default -> throw new IllegalArgumentException("Unsupported HMAC algorithm: " + alg);
        };
    }

    private byte[] decodeKey(String maybeBase64Secret) {
        try {
            return java.util.Base64.getDecoder().decode(maybeBase64Secret);
        } catch (IllegalArgumentException ignored) {
            return maybeBase64Secret.getBytes(StandardCharsets.UTF_8);
        }
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Collection<GrantedAuthority> authorities = new ArrayList<>();
            List<String> roles = Optional.ofNullable(jwt.getClaimAsStringList("roles")).orElse(List.of());
            for (String role : roles) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
            }
            return authorities;
        });
        return converter;
    }
}
