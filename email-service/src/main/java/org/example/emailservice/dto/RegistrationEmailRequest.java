package org.example.emailservice.dto;

import lombok.Data;

@Data
public class RegistrationEmailRequest {
    private String to;
    private String token;
    private String registrationLink;
}