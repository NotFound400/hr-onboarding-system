package org.example.emailservice.dto;

import lombok.Data;

@Data
public class FacilityReportEmailRequest {
    private String to;
    private String employeeName;
    private String reportTitle;
    private String status;  // "Open", "In Progress", "Closed"
}