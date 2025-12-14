package org.example.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VisaStatusUpdateRequest {
    private String visaType;        // OPT, H1B, L2, F1, H4, CITIZEN, GREEN_CARD, etc.
    private LocalDate startDate;
    private LocalDate endDate;
    private String activeFlag;      // Y or N
}
