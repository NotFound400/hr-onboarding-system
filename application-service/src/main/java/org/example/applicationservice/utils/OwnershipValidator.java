package org.example.applicationservice.utils;

import org.example.applicationservice.client.EmployeeServiceClient;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

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
        Long ownerUserId = employeeServiceClient.getUserIdByEmployeeId(employeeId);

        if (!ownerUserId.equals(currentUserId)) {
            throw new AccessDeniedException("Forbidden");
        }
    }
}

