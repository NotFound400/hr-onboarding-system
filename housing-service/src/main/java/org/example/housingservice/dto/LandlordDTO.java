package org.example.housingservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Landlord DTO Collection
 */
public class LandlordDTO {

    /**
     * Landlord Response DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String firstName;
        private String lastName;
        private String fullName;  // Combined full name
        private String email;
        private String cellPhone;
    }

    /**
     * Create Landlord Request DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        
        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name cannot exceed 100 characters")
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name cannot exceed 100 characters")
        private String lastName;

        @Email(message = "Please provide a valid email")
        @Size(max = 100, message = "Email cannot exceed 100 characters")
        private String email;

        @Size(max = 20, message = "Cell phone cannot exceed 20 characters")
        private String cellPhone;
    }

    /**
     * Update Landlord Request DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        
        @Size(max = 100, message = "First name cannot exceed 100 characters")
        private String firstName;

        @Size(max = 100, message = "Last name cannot exceed 100 characters")
        private String lastName;

        @Email(message = "Please provide a valid email")
        @Size(max = 100, message = "Email cannot exceed 100 characters")
        private String email;

        @Size(max = 20, message = "Cell phone cannot exceed 20 characters")
        private String cellPhone;
    }
}
