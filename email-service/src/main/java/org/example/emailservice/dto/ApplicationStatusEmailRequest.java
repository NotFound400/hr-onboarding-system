package org.example.emailservice.dto;

import lombok.Data;

@Data
public class ApplicationStatusEmailRequest {
    private String to;
    private String employeeName;
    private String status;  // "Approved" or "Rejected"
    private String comment;
}