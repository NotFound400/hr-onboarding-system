package org.example.housingservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.housingservice.enums.FacilityReportStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Facility Report DTO Collection
 */
public class FacilityReportDTO {

    /**
     * Report List Item DTO
     *
     * For list display: Title + Date + Status
     * PDF: Each page should only display 3-5 reports, sorted by created date
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListItem {
        private Long id;
        private String title;
        private LocalDateTime createDate;
        private FacilityReportStatus status;
        private String statusDisplayName;
    }

    /**
     * Report Detail Response DTO
     *
     * PDF Requirements:
     * - Title
     * - Description
     * - Created By (Who reported this issue)
     * - Report Date
     * - Status
     * - List of comments
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailResponse {
        private Long id;
        private Long facilityId;
        private String facilityType;
        private Long houseId;
        private String houseAddress;

        private String title;
        private String description;

        private Long employeeId;       // Reporter ID
        private String createdBy;      // Reporter name (from EmployeeService)

        private LocalDateTime createDate;
        private FacilityReportStatus status;
        private String statusDisplayName;

        // Comment list
        private List<FacilityReportDetailDTO.Response> comments;
    }

    /**
     * Create Report Request DTO
     *
     * Employee creates facility issue report
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "Facility ID is required")
        private Long facilityId;

        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title cannot exceed 200 characters")
        private String title;

        @Size(max = 2000, message = "Description cannot exceed 2000 characters")
        private String description;

        // employeeId is obtained from X-User-Id request header
    }

    /**
     * Update Report Request DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @Size(max = 200, message = "Title cannot exceed 200 characters")
        private String title;

        @Size(max = 2000, message = "Description cannot exceed 2000 characters")
        private String description;
    }

    /**
     * Update Report Status Request DTO
     *
     * HR can update report status
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {

        @NotNull(message = "Status is required")
        private FacilityReportStatus status;
    }

    /**
     * Employee View Report Response
     *
     * PDF: Employees should be able to report a facility issue in the house,
     * and see all comments by employees or HR
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeViewResponse {
        private Long id;
        private String title;
        private String description;
        private String createdBy;
        private LocalDateTime createDate;
        private FacilityReportStatus status;
        private String statusDisplayName;

        // All comments (both employee and HR comments)
        private List<FacilityReportDetailDTO.Response> comments;
    }
}
