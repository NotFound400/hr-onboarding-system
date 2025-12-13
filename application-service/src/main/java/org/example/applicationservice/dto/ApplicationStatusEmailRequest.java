package org.example.applicationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusEmailRequest {
    private String to;
    private String employeeName;
    private String status;  // "Approved" or "Rejected"
    private String comment;
}