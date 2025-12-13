package org.example.applicationservice.utils;

import org.example.applicationservice.client.EmployeeServiceClient;
import org.example.applicationservice.dto.EmployeeDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

/**
 * Validates that the current user owns the resource they're trying to access
 * HR users bypass ownership checks
 */
@Component
public class OwnershipValidator {

    private static final Logger log = LoggerFactory.getLogger(OwnershipValidator.class);

    private final SecurityUtils securityUtils;
    private final EmployeeServiceClient employeeServiceClient;

    public OwnershipValidator(SecurityUtils securityUtils,
                              EmployeeServiceClient employeeServiceClient) {
        this.securityUtils = securityUtils;
        this.employeeServiceClient = employeeServiceClient;
    }

    /**
     * Check if current user owns the employee record or is HR
     * @param employeeId The employee ID to check ownership for
     * @throws AccessDeniedException if user doesn't own the record and isn't HR
     */
    public void checkOwnership(String employeeId) {
        // HR can access any employee's data
        if (securityUtils.isHR()) {
            log.debug("HR user accessing employee {} data", employeeId);
            return;
        }

        Long currentUserId = securityUtils.getCurrentUserId();
        
        if (currentUserId == null) {
            log.warn("Cannot verify ownership: current user ID is null");
            throw new AccessDeniedException("Authentication required");
        }

        try {
            // Get employee data to check if current user owns it
            EmployeeDTO employee = employeeServiceClient.getEmployeeById(employeeId);

            if (employee == null) {
                log.warn("Employee not found: {}", employeeId);
                throw new AccessDeniedException("Employee not found");
            }

            Long ownerUserId = employee.getUserId();

            if (ownerUserId == null) {
                log.warn("Employee {} has no associated user ID", employeeId);
                throw new AccessDeniedException("Cannot verify ownership");
            }

            if (!ownerUserId.equals(currentUserId)) {
                log.warn("User {} attempted to access employee {} owned by user {}", 
                        currentUserId, employeeId, ownerUserId);
                throw new AccessDeniedException("You can only access your own data");
            }

            log.debug("Ownership verified: user {} owns employee {}", currentUserId, employeeId);
            
        } catch (AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error checking ownership for employee {}: {}", employeeId, e.getMessage());
            throw new AccessDeniedException("Error verifying ownership");
        }
    }

    /**
     * Check if current user owns the employee record by user ID
     * @param ownerUserId The user ID of the resource owner
     * @throws AccessDeniedException if user doesn't own the record and isn't HR
     */
    public void checkOwnershipByUserId(Long ownerUserId) {
        // HR can access any employee's data
        if (securityUtils.isHR()) {
            return;
        }

        Long currentUserId = securityUtils.getCurrentUserId();
        
        if (currentUserId == null) {
            throw new AccessDeniedException("Authentication required");
        }

        if (!ownerUserId.equals(currentUserId)) {
            throw new AccessDeniedException("You can only access your own data");
        }
    }

    /**
     * Check if current user is the owner (without throwing exception)
     * @param employeeId The employee ID to check ownership for
     * @return true if current user owns the record or is HR
     */
    public boolean isOwner(String employeeId) {
        try {
            checkOwnership(employeeId);
            return true;
        } catch (AccessDeniedException e) {
            return false;
        }
    }

    /**
     * Check if current user can access the resource (owner or HR)
     */
    public boolean canAccess(String employeeId) {
        if (securityUtils.isHR()) {
            return true;
        }
        return isOwner(employeeId);
    }
}
