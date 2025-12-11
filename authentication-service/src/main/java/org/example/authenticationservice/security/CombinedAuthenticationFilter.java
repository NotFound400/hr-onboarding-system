package org.example.authenticationservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Combined authentication filter that supports:
 * 1. Gateway headers (X-User-Id, X-Username, X-User-Roles) - Priority 1
 * 2. Direct JWT token (for standalone access) - Priority 2
 */
@Slf4j
@Component
public class CombinedAuthenticationFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(@Nonnull HttpServletRequest request,
                                    @Nonnull HttpServletResponse response,
                                    @Nonnull FilterChain filterChain) throws ServletException, IOException {

        // Priority 1: Check Gateway headers (request came through API Gateway)
        String userId = request.getHeader("X-User-Id");
        String username = request.getHeader("X-Username");
        String rolesHeader = request.getHeader("X-User-Roles");

        if (StringUtils.hasText(userId) && StringUtils.hasText(username)) {
            log.debug("Request from Gateway - User: {}, Roles: {}", username, rolesHeader);
            setAuthenticationFromHeaders(userId, username, rolesHeader);
            filterChain.doFilter(request, response);
            return;
        }

        // Priority 2: Check JWT token (direct access to Auth Service)
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                log.debug("Direct access - validating JWT token");
                setAuthenticationFromJwt(token);
            } catch (Exception e) {
                log.warn("JWT validation failed: {}", e.getMessage());
                // Continue without authentication - let Security config handle 401
            }
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthenticationFromHeaders(String userId, String username, String rolesHeader) {
        List<SimpleGrantedAuthority> authorities = parseRoles(rolesHeader);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(username, null, authorities);

        // Store userId in details for controller access
        authentication.setDetails(new UserAuthDetails(Long.parseLong(userId), username, rolesHeader));

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private void setAuthenticationFromJwt(String token) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));

        // Compatible with JJWT 0.11.x
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        String username = claims.getSubject();
        Long userId = claims.get("userId", Long.class);

        @SuppressWarnings("unchecked")
        List<String> roles = claims.get("roles", List.class);

        List<SimpleGrantedAuthority> authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                .collect(Collectors.toList());

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(username, null, authorities);

        authentication.setDetails(new UserAuthDetails(userId, username, String.join(",", roles)));

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private List<SimpleGrantedAuthority> parseRoles(String rolesHeader) {
        if (!StringUtils.hasText(rolesHeader)) {
            return List.of();
        }
        return Arrays.stream(rolesHeader.split(","))
                .map(String::trim)
                .filter(role -> !role.isEmpty())
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                .collect(Collectors.toList());
    }

    /**
     * Record class to hold user authentication details.
     * Records automatically generate constructor, getters, equals, hashCode, and toString.
     */
    public record UserAuthDetails(Long userId, String username, String roles) {
    }
}