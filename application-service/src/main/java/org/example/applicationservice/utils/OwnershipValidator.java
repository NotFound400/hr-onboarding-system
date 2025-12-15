package org.example.applicationservice.utils;

import org.example.applicationservice.client.EmployeeServiceClient;
import org.example.applicationservice.dto.EmployeeDTO;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OwnershipValidator {

    private final SecurityUtils securityUtils;
    private final EmployeeServiceClient employeeServiceClient;

    public OwnershipValidator(SecurityUtils securityUtils,
                              EmployeeServiceClient employeeServiceClient) {
        this.securityUtils = securityUtils;
        this.employeeServiceClient = employeeServiceClient;
    }

    public void checkOwnership(String employeeId) {
        Long currentUserId = securityUtils.getCurrentUserId();
        List<String> roles = securityUtils.getCurrentUserRoles();

        // Allow access if user has HR role
        if (roles.contains("ROLE_HR")) {
            return;
        }

        // Get full employee data and extract userId
        EmployeeDTO employee = employeeServiceClient.getEmployeeById(employeeId);

        if (employee == null) {
            throw new AccessDeniedException("Employee not found");
        }

        Long ownerUserId = employee.getUserId();

        if (ownerUserId == null || !ownerUserId.equals(currentUserId)) {
            throw new AccessDeniedException("Forbidden");
        }
    }
}