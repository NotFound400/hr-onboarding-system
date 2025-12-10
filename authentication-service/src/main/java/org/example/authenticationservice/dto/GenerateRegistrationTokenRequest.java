package org.example.authenticationservice.dto;

import lombok.Data;

@Data
public class GenerateRegistrationTokenRequest {
    // email of the person to invite
    private String email;

    // role of invited user "EMPLOYEE" or "HR"
    private String roleName;
}
