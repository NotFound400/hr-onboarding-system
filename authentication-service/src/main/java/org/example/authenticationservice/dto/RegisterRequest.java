package org.example.authenticationservice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class RegisterRequest {

    /**
     * Registration token.
     * Supports both "registrationToken" (backend convention) and "token" (frontend convention)
     */
    @JsonAlias({"token", "registrationToken"})
    private String registrationToken;

    private String username;

    private String email;

    private String password;

    /**
     * Confirm password (optional - frontend may not send this).
     * If not provided, validation will be skipped.
     */
    private String confirmPassword;
}