package org.example.applicationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for visa application (OPT/OPT STEM)
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VisaApplicationDTO {
    private Long id;
    private String employeeId;
    private String employeeName;
    private String employeeEmail;
    private String applicationType;  // OPT
    private String status;           // Open, Pending, Approved, Rejected
    private String comment;
    private String currentStage;     // INITIAL, I20_UPLOADED, RECEIPT_UPLOADED, EAD_UPLOADED
    private LocalDateTime createDate;
    private LocalDateTime lastModificationDate;
    private List<VisaDocumentDTO> documents;
}
