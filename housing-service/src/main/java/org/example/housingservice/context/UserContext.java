package org.example.housingservice.context;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * User Context - Encapsulates user information from API Gateway headers
 * 
 * API Gateway extracts JWT claims and passes them via headers:
 * - X-User-Id: User's ID
 * - X-Username: User's username/email
 * - X-User-Roles: Comma-separated list of roles (e.g., "EMPLOYEE,HR")
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserContext {

    private Long userId;
    private String username;
    private List<String> roles;
    private Long houseId;

    /**
     * Check if user has HR role
     */
    public boolean isHR() {
        return roles != null && roles.stream()
                .anyMatch(role -> role.equalsIgnoreCase("HR") || 
                                  role.equalsIgnoreCase("ROLE_HR"));
    }

    /**
     * Check if user has Employee role
     */
    public boolean isEmployee() {
        return roles != null && roles.stream()
                .anyMatch(role -> role.equalsIgnoreCase("EMPLOYEE") || 
                                  role.equalsIgnoreCase("ROLE_EMPLOYEE"));
    }

    /**
     * Check if user has Admin role
     */
    public boolean isAdmin() {
        return roles != null && roles.stream()
                .anyMatch(role -> role.equalsIgnoreCase("ADMIN") || 
                                  role.equalsIgnoreCase("ROLE_ADMIN"));
    }

    /**
     * Check if user has a specific role
     */
    public boolean hasRole(String role) {
        return roles != null && roles.stream()
                .anyMatch(r -> r.equalsIgnoreCase(role) || 
                               r.equalsIgnoreCase("ROLE_" + role));
    }

    /**
     * Create UserContext from request headers
     * 
     * @param userId User ID from X-User-Id header
     * @param username Username from X-Username header
     * @param rolesHeader Comma-separated roles from X-User-Roles header
     */
    // NEW: Updated method with houseId
    public static UserContext fromHeaders(Long userId, String username, String rolesHeader, Long houseId) {
        List<String> roles = Collections.emptyList();
        if (rolesHeader != null && !rolesHeader.isEmpty()) {
            roles = Arrays.stream(rolesHeader.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }

        return UserContext.builder()
                .userId(userId)
                .username(username)
                .roles(roles)
                .houseId(houseId)
                .build();
    }

    /**
     * Create a default user context for testing/development
     * Default role is EMPLOYEE
     */
    public static UserContext defaultUser() {
        return UserContext.builder()
                .userId(1L)
                .username("default@test.com")
                .roles(List.of("EMPLOYEE"))
                .build();
    }

    /**
     * Create an HR user context for testing/development
     */
    public static UserContext hrUser(Long userId) {
        return UserContext.builder()
                .userId(userId)
                .username("hr@test.com")
                .roles(List.of("HR"))
                .build();
    }

    /**
     * Create an Employee user context for testing/development
     */
    public static UserContext employeeUser(Long userId) {
        return UserContext.builder()
                .userId(userId)
                .username("employee@test.com")
                .roles(List.of("EMPLOYEE"))
                .build();
    }
}
