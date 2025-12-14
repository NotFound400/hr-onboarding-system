package org.example.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for onboarding application data
 * Maps to the onboarding form fields from the requirements
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OnboardingDataDTO {
    
    // Name Section
    private String firstName;           // Required
    private String lastName;            // Required
    private String middleName;
    private String preferredName;
    
    // Profile
    private String avatarPath;          // S3 URL for profile picture
    
    // Contact Info
    private String email;               // Pre-filled, not editable
    private String cellPhone;           // Required
    private String alternatePhone;
    
    // Personal Info
    private String SSN;                 // Required
    private LocalDateTime DOB;          // Required
    private String gender;              // Male, Female, Other, I Prefer Not to Say
    
    // Work Authorization
    private String workAuthorizationType;   // CITIZEN, GREEN_CARD, H1B, L2, F1_CPT, F1_OPT, H4, OTHER
    private String workAuthorizationOther;  // If type is OTHER, specify here
    private LocalDate workAuthStartDate;
    private LocalDate workAuthEndDate;
    
    // Driver's License
    private boolean hasDriverLicense;
    private String driverLicenseNumber;
    private LocalDateTime driverLicenseExpiration;
    private String driverLicenseDocPath;    // S3 URL
    
    // Address
    private AddressDTO currentAddress;
    
    // Reference (who recommends you)
    private ContactDTO reference;
    
    // Emergency Contacts (at least one required)
    private List<ContactDTO> emergencyContacts;
    
    // House Assignment
    private Long houseId;
    
    // Employment dates
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AddressDTO {
        private String addressLine1;    // Required
        private String addressLine2;
        private String city;            // Required
        private String state;           // Required
        private String zipCode;         // Required
        private String type;            // PRIMARY, SECONDARY
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ContactDTO {
        private String id;
        private String firstName;       // Required
        private String lastName;        // Required
        private String middleName;
        private String phone;           // Required
        private String email;
        private String relationship;    // Required for emergency contact
        private String address;
        private String type;            // EMERGENCY, REFERENCE
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OnboardingStatusResponse {
        private String employeeId;
        private boolean isComplete;
        private boolean hasBasicInfo;
        private boolean hasAddress;
        private boolean hasEmergencyContact;
        private boolean hasWorkAuthorization;
        private String currentStep;
        private String message;
    }
}
