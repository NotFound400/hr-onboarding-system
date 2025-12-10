package org.example.authenticationservice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class LoginRequest {

    /**
     * Username or email for login.
     * Supports both "usernameOrEmail" (backend convention) and "username" (frontend convention)
     */
    @JsonAlias({"username", "usernameOrEmail"})
    private String usernameOrEmail;

    private String password;
}