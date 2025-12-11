package org.example.authenticationservice.dto;

import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
public class LoginResponse {

    /**
     * JWT token
     */
    private String token;

    /**
     * Token type (always "Bearer")
     */
    private String tokenType = "Bearer";

    /**
     * Token expiration time
     */
    private Instant expiresAt;

    /**
     * User information (nested object matching frontend User interface)
     */
    private UserDto user;

    /**
     * Primary role (first role)
     */
    private String role;

    /**
     * All roles (for backend flexibility, frontend may not use this)
     */
    private List<String> roles;

    /**
     * Employee's assigned house ID.
     * Null for HR users or users without employee records.
     */
    private Long houseId;

    /**
     * Employee's MongoDB ObjectId.
     * Null for users without employee records.
     */
    private String employeeId;
}