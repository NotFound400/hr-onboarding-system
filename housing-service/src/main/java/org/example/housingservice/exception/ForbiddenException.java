package org.example.housingservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a user attempts to access a resource they don't have permission for
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException(String resource, String reason) {
        super(String.format("Access to %s denied: %s", resource, reason));
    }

    /**
     * Create exception for role-based access denial
     */
    public static ForbiddenException roleRequired(String requiredRole) {
        return new ForbiddenException("Access denied", "Role '" + requiredRole + "' is required");
    }

    /**
     * Create exception for ownership-based access denial
     */
    public static ForbiddenException notOwner(String resource) {
        return new ForbiddenException(resource, "You can only access your own " + resource);
    }
}
