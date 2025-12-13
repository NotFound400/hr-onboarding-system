package org.example.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Summary DTO for HR employee profile list
 * Contains the fields shown in the profile summary view
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeSummaryDTO {
    private String employeeId;
    private Long userId;
    
    // Name info
    private String firstName;
    private String lastName;
    private String middleName;
    private String preferredName;
    private String fullName;
    
    // SSN (only last 4 digits should be shown)
    private String ssnLastFour;
    
    // Employment info
    private LocalDateTime startDate;
    
    // Visa status
    private String visaType;
    private LocalDateTime visaEndDate;
    private Long daysLeftOnVisa;
    
    // Contact
    private String email;
    private String cellPhone;
    
    // Index for pagination display
    private Integer index;
    private Integer total;

    /**
     * Get display name (preferred name if set, otherwise first name)
     */
    public String getDisplayName() {
        if (preferredName != null && !preferredName.isBlank()) {
            return preferredName;
        }
        return firstName != null ? firstName : "Employee";
    }
}
