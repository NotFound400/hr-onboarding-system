
package org.example.applicationservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
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

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api-docs/**",
                                "/api-docs.yaml",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()
                        // everything else requires a valid token; fine if you rely on @PreAuthorize
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> {
                            jwt.decoder(jwtDecoder());
                            jwt.jwtAuthenticationConverter(jwtAuthenticationConverter());
                        })
                        .authenticationEntryPoint((req, res, ex) -> res.sendError(401, "Unauthorized"))
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

        // Timestamp validation only; issuer/audience intentionally not validated
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
    JwtAuthenticationConverter jwtAuthenticationConverter() { //JWT as array "roles": ["HR", "ADMIN"]
        // Convert `roles` claim (e.g., ["USER","ADMIN"]) to ROLE_* authorities
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

//    converter.setJwtGrantedAuthoritiesConverter(jwt -> { //JWT (or header) has roles as a string "HR,ADMIN":
//        Collection<GrantedAuthority> authorities = new ArrayList<>();
//
//        String rolesString = jwt.getClaimAsString("roles");
//        if (rolesString != null && !rolesString.isEmpty()) {
//            Arrays.stream(rolesString.split(","))
//                    .map(String::trim)
//                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
//                    .forEach(authorities::add);
//        }
//
//        return authorities;
//    });


}
