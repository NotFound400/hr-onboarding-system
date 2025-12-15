package org.example.emailservice.dto;

import lombok.Data;

@Data
public class OptUpdateEmailRequest {
    private String to;
    private String employeeName;
    private String documentType;  // "I-983", "I-20", "OPT Receipt", "OPT EAD"
    private String status;        // "Received", "Approved", "Rejected"
    private String nextStep;
}