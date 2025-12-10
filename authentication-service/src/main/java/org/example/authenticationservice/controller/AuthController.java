package org.example.authenticationservice.controller;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.example.authenticationservice.dto.*;
import org.example.authenticationservice.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    /**
     * POST /api/auth/login
     * Authenticate user and return JWT token.
     *
     * Frontend sends: { "username": "...", "password": "..." }
     * Backend also accepts: { "usernameOrEmail": "...", "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<@NonNull ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse loginResponse = authService.login(request);
            return ResponseEntity.ok(ApiResponse.ok("Login successful", loginResponse));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error"));
        }
    }

    /**
     * POST /api/auth/register
     * Register a new user using a registration token.
     *
     * Frontend sends: { "token": "...", "username": "...", "email": "...", "password": "..." }
     * Backend also accepts: { "registrationToken": "...", ... }
     */
    @PostMapping("/register")
    public ResponseEntity<@NonNull ApiResponse<UserDto>> register(@RequestBody RegisterRequest request) {
        try {
            UserDto userDto = authService.register(request);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.ok("User registered successfully", userDto));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error"));
        }
    }

    /**
     * GET /api/auth/profile
     * Get current user's profile information.
     * Supports both API Gateway (X-User-Id header) and direct JWT token.
     */
    @GetMapping("/profile")
    public ResponseEntity<@NonNull ApiResponse<UserDto>> getUserProfile(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // If X-User-Id header is provided (from API Gateway), use it
            if (userId != null) {
                UserDto userDto = authService.getUserProfile(userId);
                return ResponseEntity.ok(ApiResponse.ok("Success", userDto));
            }

            // Otherwise, extract from JWT token
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                UserDto userDto = authService.getUserProfileFromToken(token);
                return ResponseEntity.ok(ApiResponse.ok("Success", userDto));
            }

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authorization required"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error"));
        }
    }

    /**
     * POST /api/auth/registration-token
     * HR generates a registration token for a new employee.
     * Requires HR role.
     */
    @PostMapping("/registration-token")
    public ResponseEntity<@NonNull ApiResponse<RegistrationTokenDto>> generateRegistrationToken(
            @RequestBody GenerateRegistrationTokenRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long creatorUserId = userId;

            // If X-User-Id not provided, extract from JWT token
            if (creatorUserId == null && authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                creatorUserId = authService.getUserIdFromToken(token);

                // Check if user has HR role
                if (!authService.userHasRole(creatorUserId, "HR")) {
                    return ResponseEntity
                            .status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Access denied. HR role required."));
                }
            }

            if (creatorUserId == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authorization required"));
            }

            RegistrationTokenDto dto = authService.generateRegistrationToken(request, creatorUserId);
            return ResponseEntity.ok(ApiResponse.ok("Registration token generated", dto));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error"));
        }
    }

    /**
     * GET /api/auth/validate-token/{token}
     * Validate a registration token before showing registration form.
     *
     * Backend primary endpoint.
     */
    @GetMapping("/validate-token/{token}")
    public ResponseEntity<@NonNull ApiResponse<RegistrationTokenDto>> validateRegistrationToken(
            @PathVariable String token) {
        try {
            RegistrationTokenDto dto = authService.validateRegistrationToken(token);
            return ResponseEntity.ok(ApiResponse.ok("Token is valid", dto));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error"));
        }
    }

    /**
     * GET /api/auth/registration-token/{token}
     * Alias endpoint for frontend compatibility.
     * Same as /validate-token/{token}
     */
    @GetMapping("/registration-token/{token}")
    public ResponseEntity<@NonNull ApiResponse<RegistrationTokenDto>> validateRegistrationTokenAlias(
            @PathVariable String token) {
        return validateRegistrationToken(token);
    }

    /**
     * POST /api/auth/logout
     * Logout endpoint (for audit/logging purposes since JWT is stateless).
     */
    @PostMapping("/logout")
    public ResponseEntity<@NonNull ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        // For stateless JWT, logout is handled client-side by removing the token
        // This endpoint can be used for audit logging or token blacklisting if needed
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }
}