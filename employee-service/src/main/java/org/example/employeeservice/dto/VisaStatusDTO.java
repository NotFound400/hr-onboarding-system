package org.example.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for HR Visa Status Management page
 * Contains employee info + visa status details
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VisaStatusDTO {
    private String employeeId;
    private Long userId;
    private String firstName;
    private String lastName;
    private String preferredName;
    private String fullName;
    private String email;
    
    // Visa information
    private String visaType;
    private LocalDateTime visaStartDate;
    private LocalDateTime visaEndDate;
    private Long daysLeft;
    
    // OPT STEM application status (if applicable)
    private String optStemStatus;
    private String optStemNextStep;

    /**
     * Get display name (preferred name or first name)
     */
    public String getDisplayName() {
        if (preferredName != null && !preferredName.isBlank()) {
            return preferredName;
        }
        return firstName != null ? firstName : "Employee";
    }
}
