package org.example.authenticationservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GenerateRegistrationTokenRequest {

    /**
     * Email of the person to invite
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    /**
     * Role of invited user "EMPLOYEE" or "HR"
     */
    private String roleName;

    /**
     * House ID to assign to the new employee.
     * Required - employee must be assigned to a house during token generation.
     */
    @NotNull(message = "House ID is required")
    private Long houseId;
}