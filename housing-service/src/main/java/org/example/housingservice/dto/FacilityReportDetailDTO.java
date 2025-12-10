package org.example.housingservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Facility Report Detail (Comment) DTO Collection
 */
public class FacilityReportDetailDTO {

    /**
     * Comment Response DTO
     * 
     * PDF Requirements:
     * - Description (Comment)
     * - Created By
     * - Comment Date (shows modification date if exists, otherwise creation date)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long facilityReportId;
        private Long employeeId;       // Commenter ID
        private String createdBy;      // Commenter name (from EmployeeService)
        private String comment;
        private LocalDateTime createDate;
        private LocalDateTime lastModificationDate;
        private LocalDateTime displayDate;  // Display date (uses modification date if exists, otherwise creation date)
        private boolean canEdit;       // Whether current user can edit this comment
    }

    /**
     * Create Comment Request DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        
        @NotNull(message = "Facility Report ID is required")
        private Long facilityReportId;

        @NotBlank(message = "Comment is required")
        @Size(max = 2000, message = "Comment cannot exceed 2000 characters")
        private String comment;
        
        // employeeId is obtained from X-User-Id request header
    }

    /**
     * Update Comment Request DTO
     * 
     * Rules: Employees can only edit their own comments, HR can only edit HR-created comments
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        
        @NotBlank(message = "Comment is required")
        @Size(max = 2000, message = "Comment cannot exceed 2000 characters")
        private String comment;
    }
}
