package org.example.employeeservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VisaStatus {
    private String id = UUID.randomUUID().toString();
    private String visaType;
    private String activeFlag;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime lastModificationDate;
}
