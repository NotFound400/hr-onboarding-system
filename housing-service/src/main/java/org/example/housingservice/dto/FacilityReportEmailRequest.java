package org.example.housingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityReportEmailRequest {
    private String to;
    private String employeeName;
    private String reportTitle;
    private String status;  // "Open", "In Progress", "Closed"
}