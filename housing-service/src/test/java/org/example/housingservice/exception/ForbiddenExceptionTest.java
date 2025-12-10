package org.example.housingservice.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Unit tests for ForbiddenException
 */
@DisplayName("ForbiddenException Tests")
class ForbiddenExceptionTest {

    @Test
    @DisplayName("Should create exception with message")
    void constructor_withMessage_createsException() {
        ForbiddenException exception = new ForbiddenException("Access denied");
        
        assertEquals("Access denied", exception.getMessage());
    }

    @Test
    @DisplayName("roleRequired should create exception with role message")
    void roleRequired_createsExceptionWithRoleMessage() {
        ForbiddenException exception = ForbiddenException.roleRequired("ADMIN");
        
        assertTrue(exception.getMessage().contains("ADMIN"));
        assertTrue(exception.getMessage().contains("Role"));
    }

    @Test
    @DisplayName("notOwner should create exception with ownership message")
    void notOwner_createsExceptionWithOwnershipMessage() {
        ForbiddenException exception = ForbiddenException.notOwner("house");
        
        assertTrue(exception.getMessage().contains("house"));
    }
}
