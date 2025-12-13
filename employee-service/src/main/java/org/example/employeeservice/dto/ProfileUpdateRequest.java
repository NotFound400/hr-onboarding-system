package org.example.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Request DTO for profile section updates
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileUpdateRequest {
    
    // Name section fields
    private String firstName;
    private String lastName;
    private String middleName;
    private String preferredName;
    private String avatarPath;
    
    // Personal info
    private LocalDateTime dob;
    private String gender;
    private String ssn;
    
    // Contact info
    private String cellPhone;
    private String alternatePhone;
    private String personalEmail;
    private String workEmail;
    
    // Address info
    private AddressUpdateDTO primaryAddress;
    private AddressUpdateDTO secondaryAddress;
    
    // Employment info
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String title;
    
    // Work authorization
    private String workAuthType;
    private LocalDateTime workAuthStartDate;
    private LocalDateTime workAuthEndDate;
    
    // Driver's license
    private String driverLicenseNumber;
    private LocalDateTime driverLicenseExpiration;
    
    // Emergency contacts
    private List<ContactUpdateDTO> emergencyContacts;
    
    // Generic fields map for flexible updates
    private Map<String, Object> additionalFields;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AddressUpdateDTO {
        private String id;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String zipCode;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ContactUpdateDTO {
        private String id;
        private String firstName;
        private String lastName;
        private String phone;
        private String email;
        private String relationship;
        private String address;
    }
}
