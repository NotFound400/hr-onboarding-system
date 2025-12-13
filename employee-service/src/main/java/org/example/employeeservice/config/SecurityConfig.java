package org.example.employeeservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final HeaderAuthenticationFilter headerAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Health check - allow all
                        .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()
                        
                        // Swagger/OpenAPI - allow all
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api-docs/**"
                        ).permitAll()
                        
                        // Internal service-to-service calls (no auth required)
                        // These are called by other microservices, not through the gateway
                        .requestMatchers("/employees/user/**").permitAll()
                        .requestMatchers("/employees/house/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/employees/*").permitAll()
                        .requestMatchers(HttpMethod.POST, "/employees").permitAll()
                        
                        // HR-only endpoints (protected by @PreAuthorize)
                        .requestMatchers("/employees/visa-status/all").hasRole("HR")
                        .requestMatchers("/employees/visa-status/expiring").hasRole("HR")
                        .requestMatchers("/employees/visa-status/type/**").hasRole("HR")
                        .requestMatchers("/employees/search").hasRole("HR")
                        .requestMatchers(HttpMethod.GET, "/employees").hasRole("HR")
                        .requestMatchers(HttpMethod.GET, "/employees/page").hasRole("HR")
                        
                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                // Add our custom header authentication filter
                .addFilterBefore(headerAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
