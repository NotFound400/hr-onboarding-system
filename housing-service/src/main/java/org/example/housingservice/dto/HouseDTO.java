package org.example.housingservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * House DTO Collection
 * 
 * Contains different response structures for HR and Employee views
 */
public class HouseDTO {

    // ==================== Role-based Unified Response ====================

    /**
     * Unified House Detail Response - Returns different data based on user role
     * 
     * HR View: Full information including landlord, facilities, employee count
     * Employee View: Only address and roommate list (Name, Phone)
     * 
     * Uses @JsonInclude to exclude null fields from JSON response
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UnifiedDetailResponse {
        private Long id;
        private String address;
        
        // HR only fields
        private Integer maxOccupant;
        private Integer numberOfEmployees;
        private LandlordDTO.Response landlord;
        private Map<String, Integer> facilitySummary;
        private List<FacilityDTO.Response> facilities;
        
        // Employee only fields
        private List<ResidentInfo> roommates;
        
        // Indicates which view this response represents
        private String viewType;  // "HR_VIEW" or "EMPLOYEE_VIEW"
    }

    /**
     * Unified House List Response - Returns different data based on user role
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UnifiedListResponse {
        private Long id;
        private String address;
        
        // HR only fields
        private Integer maxOccupant;
        private Integer numberOfEmployees;
        private Long landlordId;
        private String landlordFullName;
        private String landlordPhone;
        private String landlordEmail;
        
        // Employee only fields - just basic info
        private List<ResidentInfo> roommates;
        
        private String viewType;
    }

    // ==================== Original Response DTOs (kept for backward compatibility) ====================

    /**
     * House List Response DTO (HR View)
     * 
     * Contains: Address, Number of Employees, Landlord Info
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListResponse {
        private Long id;
        private String address;
        private Integer maxOccupant;
        private Integer numberOfEmployees;
        
        // Landlord Info
        private Long landlordId;
        private String landlordFullName;
        private String landlordPhone;
        private String landlordEmail;
    }

    /**
     * House Detail Response DTO (HR View)
     * 
     * Contains: Basic Info, Facility Info, Facility Reports
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailResponse {
        private Long id;
        private String address;
        private Integer maxOccupant;
        private Integer numberOfEmployees;
        
        // Landlord Info
        private LandlordDTO.Response landlord;
        
        // Facility Summary (Number of Beds, Mattress, Tables, Chairs)
        private Map<String, Integer> facilitySummary;
        
        // Facility List
        private List<FacilityDTO.Response> facilities;

        // Current Residents List (for HR to view who lives in this house)
        private List<ResidentInfo> residents;
    }

    /**
     * Employee View House Response DTO
     * 
     * PDF: Employees can only view house details including address and roommate list
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeViewResponse {
        private Long id;
        private String address;

        // Landlord Contact Info (for employees to contact when needed)
        private LandlordContactInfo landlordContact;

        // Facility Summary (Number of Beds, Mattress, Tables, Chairs)
        private Map<String, Integer> facilitySummary;

        // Roommate List (Name, Phone)
        private List<ResidentInfo> residents;
    }

    /**
     * Landlord Contact Info (simplified for Employee view)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LandlordContactInfo {
        private String fullName;
        private String phone;
        private String email;
    }

    /**
     * Resident Info (for Employee View)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResidentInfo {
        private Long employeeId;
        private String name;  // Preferred Name, if empty then use First Name
        private String phone;
    }

    /**
     * Create House Request DTO
     *
     * Supports two ways to specify landlord:
     * 1. Provide landlordId to use existing landlord
     * 2. Provide nested landlord object to create new landlord inline
     *
     * At least one of landlordId or landlord must be provided.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        // Option 1: Use existing landlord by ID
        private Long landlordId;

        // Option 2: Create new landlord inline (nested creation)
        @Valid
        private LandlordDTO.CreateRequest landlord;

        @NotBlank(message = "Address is required")
        @Size(max = 500, message = "Address cannot exceed 500 characters")
        private String address;

        @Min(value = 1, message = "Max occupant must be at least 1")
        private Integer maxOccupant;

        // Optional: Add facilities when creating house
        private List<FacilityDTO.CreateRequest> facilities;

        /**
         * Check if landlord info is provided (either by ID or nested object)
         */
        public boolean hasLandlordInfo() {
            return landlordId != null || landlord != null;
        }
    }

    /**
     * Update House Request DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        private Long landlordId;

        @Size(max = 500, message = "Address cannot exceed 500 characters")
        private String address;

        @Min(value = 1, message = "Max occupant must be at least 1")
        private Integer maxOccupant;
    }

    /**
     * House Summary DTO (for dropdown selections)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String address;
        private Integer maxOccupant;
        private Integer currentOccupant;
    }
}
