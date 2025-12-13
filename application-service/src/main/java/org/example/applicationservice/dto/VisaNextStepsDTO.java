package org.example.applicationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for visa application next steps guidance
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VisaNextStepsDTO {
    private Long applicationId;
    private String currentStage;     // INITIAL, I20_UPLOADED, RECEIPT_UPLOADED, EAD_UPLOADED
    private String status;           // Open, Pending, Approved, Rejected
    private String nextAction;       // DOWNLOAD_I983, UPLOAD_I20, UPLOAD_RECEIPT, UPLOAD_EAD, WAIT_APPROVAL, COMPLETE
    private String message;          // Human-readable instruction
    private String downloadUrl;      // URL for I-983 template (when applicable)
}
