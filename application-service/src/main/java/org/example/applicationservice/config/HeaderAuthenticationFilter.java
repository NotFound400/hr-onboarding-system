package org.example.applicationservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Filter to authenticate requests based on headers set by API Gateway
 * This runs BEFORE JWT authentication and takes precedence if gateway headers are present
 * 
 * Headers expected:
 * - X-User-Id: The authenticated user's ID
 * - X-Username: The authenticated user's username
 * - X-User-Roles: Comma-separated list of roles (e.g., "HR,Employee")
 * - X-Gateway-Request: Indicates request came through gateway
 * - X-House-Id: The user's assigned house ID (if applicable)
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    public static final String HEADER_USER_ID = "X-User-Id";
    public static final String HEADER_USERNAME = "X-Username";
    public static final String HEADER_USER_ROLES = "X-User-Roles";
    public static final String HEADER_GATEWAY_REQUEST = "X-Gateway-Request";
    public static final String HEADER_HOUSE_ID = "X-House-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String gatewayRequest = request.getHeader(HEADER_GATEWAY_REQUEST);
        String userId = request.getHeader(HEADER_USER_ID);
        String username = request.getHeader(HEADER_USERNAME);
        String rolesHeader = request.getHeader(HEADER_USER_ROLES);
        String houseId = request.getHeader(HEADER_HOUSE_ID);

        // Only authenticate via headers if this is a gateway request
        if (gatewayRequest != null && userId != null) {
            
            // Parse roles
            List<SimpleGrantedAuthority> authorities = parseRoles(rolesHeader);

            // Create authentication details map
            Map<String, Object> details = new HashMap<>();
            details.put("userId", Long.parseLong(userId));
            details.put("username", username);
            details.put("houseId", houseId);
            details.put("gatewayRequest", true);

            // Create authentication token
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userId,      // principal
                    null,        // credentials
                    authorities  // authorities/roles
            );
            auth.setDetails(details);

            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Parse roles header into list of authorities
     * Expected format: "HR,Employee,ADMIN" or "HR, Employee, ADMIN"
     */
    private List<SimpleGrantedAuthority> parseRoles(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(rolesHeader.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(role -> {
                    // Normalize role name and add ROLE_ prefix if needed
                    String normalizedRole = role;
                    if (!normalizedRole.startsWith("ROLE_")) {
                        normalizedRole = "ROLE_" + normalizedRole;
                    }
                    return new SimpleGrantedAuthority(normalizedRole);
                })
                .collect(Collectors.toList());
    }
}
