package org.example.applicationservice.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Utility class for security-related operations
 * Supports both JWT authentication and gateway header authentication
 */
@Component
public class SecurityUtils {

    /**
     * Get current user ID from authentication context
     * Works with both JWT and header-based authentication
     */
    public Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null) {
            throw new IllegalStateException("No authentication available");
        }

        // Check if authenticated via gateway headers
        if (auth.getDetails() instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> details = (Map<String, Object>) auth.getDetails();
            if (details.containsKey("userId")) {
                Object userId = details.get("userId");
                if (userId instanceof Long) {
                    return (Long) userId;
                } else if (userId instanceof String) {
                    return Long.parseLong((String) userId);
                }
            }
        }

        // Check if principal is a string (from header auth)
        if (auth.getPrincipal() instanceof String) {
            try {
                return Long.parseLong((String) auth.getPrincipal());
            } catch (NumberFormatException e) {
                throw new IllegalStateException("Invalid user ID format");
            }
        }

        // Fall back to JWT
        if (auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaim("userId");
        }

        throw new IllegalStateException("Cannot determine user ID from authentication");
    }

    /**
     * Get current username from authentication context
     */
    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null) {
            throw new IllegalStateException("No authentication available");
        }

        // Check if authenticated via gateway headers
        if (auth.getDetails() instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> details = (Map<String, Object>) auth.getDetails();
            if (details.containsKey("username")) {
                return (String) details.get("username");
            }
        }

        // Fall back to JWT
        if (auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }

        // Use principal as username
        return auth.getPrincipal().toString();
    }

    /**
     * Get current user's roles from authentication context
     */
    public List<String> getCurrentUserRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null) {
            return Collections.emptyList();
        }

        // Extract roles from authorities
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    }

    /**
     * Check if current user has a specific role
     */
    public boolean hasRole(String role) {
        String roleToCheck = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return getCurrentUserRoles().contains(roleToCheck);
    }

    /**
     * Check if current user is HR
     */
    public boolean isHR() {
        return hasRole("HR");
    }

    /**
     * Check if current user is Employee
     */
    public boolean isEmployee() {
        return hasRole("Employee");
    }

    /**
     * Get house ID from authentication context (if set by gateway)
     */
    public Long getHouseId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || !(auth.getDetails() instanceof Map)) {
            return null;
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> details = (Map<String, Object>) auth.getDetails();
        Object houseId = details.get("houseId");
        
        if (houseId == null) {
            return null;
        }
        
        if (houseId instanceof Long) {
            return (Long) houseId;
        } else if (houseId instanceof String && !((String) houseId).isBlank()) {
            try {
                return Long.parseLong((String) houseId);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        
        return null;
    }

    /**
     * Check if request came through API gateway
     */
    public boolean isGatewayRequest() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || !(auth.getDetails() instanceof Map)) {
            return false;
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> details = (Map<String, Object>) auth.getDetails();
        return Boolean.TRUE.equals(details.get("gatewayRequest"));
    }

    /**
     * Parse roles from comma-separated header string
     */
    public List<String> parseRolesHeader(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(rolesHeader.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
