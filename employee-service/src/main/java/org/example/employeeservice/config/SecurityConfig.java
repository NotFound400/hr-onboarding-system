package org.example.employeeservice.config;


import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final HeaderAuthenticationFilter headerAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Internal service-to-service calls (no auth required)
                        .requestMatchers("/employees/user/**").permitAll()
                        .requestMatchers("/employees/house/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/employees/*").permitAll()
                        .requestMatchers(HttpMethod.POST, "/employees").permitAll()
                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(headerAuthFilter,
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
