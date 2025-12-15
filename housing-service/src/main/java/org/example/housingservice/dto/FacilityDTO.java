package org.example.housingservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Facility DTO Collection
 */
public class FacilityDTO {

    /**
     * Facility Response DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long houseId;
        private String type;        // Bed, Mattress, Table, Chair, etc.
        private String description;
        private Integer quantity;
    }

    /**
     * Create Facility Request DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "House ID is required")
        private Long houseId;

        @NotBlank(message = "Facility type is required")
        @Size(max = 50, message = "Type cannot exceed 50 characters")
        private String type;

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        private String description;

        @Min(value = 0, message = "Quantity cannot be negative")
        private Integer quantity;
    }

    /**
     * Update Facility Request DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @Size(max = 50, message = "Type cannot exceed 50 characters")
        private String type;

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        private String description;

        @Min(value = 0, message = "Quantity cannot be negative")
        private Integer quantity;
    }

    /**
     * Facility Summary DTO
     * Used to return facility type and quantity aggregation
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private String type;
        private Integer totalQuantity;
    }
}
