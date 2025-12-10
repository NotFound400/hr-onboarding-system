package org.example.housingservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.housingservice.dto.ApiResponse;
import org.example.housingservice.dto.FacilityReportDTO;
import org.example.housingservice.dto.FacilityReportDetailDTO;
import org.example.housingservice.service.FacilityReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Facility Report Controller
 * 
 * PDF Requirements:
 * - Employees should be able to report a facility issue in the house
 * - See all comments by employees or HR
 * - Employees can add comments or update comments which are created by the employee
 * - HR can add comments or update comments which are created by HR
 */
@RestController
@RequestMapping("/api/housing/facility-reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Facility Report Management", description = "Facility report management APIs")
public class FacilityReportController {

    private final FacilityReportService reportService;

    // ==================== Report Management ====================

    /**
     * Create facility report
     * 
     * PDF: Employees should be able to report a facility issue in the house
     */
    @PostMapping
    @Operation(summary = "Create facility report", description = "Employee creates facility issue report")
    public ResponseEntity<ApiResponse<FacilityReportDTO.DetailResponse>> createReport(
            @Valid @RequestBody FacilityReportDTO.CreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        // If user ID not found in header, use default value or throw exception
        Long employeeId = userId != null ? userId : 1L;
        
        log.info("Creating facility report by employee: {}", employeeId);
        FacilityReportDTO.DetailResponse report = reportService.createReport(request, employeeId);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Report created successfully", report));
    }

    /**
     * Get report details
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get report details", description = "Get facility report details (including comments)")
    public ResponseEntity<ApiResponse<FacilityReportDTO.DetailResponse>> getReportById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        FacilityReportDTO.DetailResponse report = reportService.getReportById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    /**
     * Get reports for a house (paginated)
     * 
     * PDF: Each page should only display 3-5 reports, sorted by created date
     */
    @GetMapping("/house/{houseId}")
    @Operation(summary = "Get house reports", description = "Get all facility reports for a house (paginated)")
    public ResponseEntity<ApiResponse<Page<FacilityReportDTO.ListItem>>> getReportsByHouseId(
            @PathVariable Long houseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {  // Default 5 per page
        
        Pageable pageable = PageRequest.of(page, size);
        Page<FacilityReportDTO.ListItem> reports = reportService.getReportsByHouseId(houseId, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    /**
     * Get all reports for a house (not paginated)
     */
    @GetMapping("/house/{houseId}/all")
    @Operation(summary = "Get all house reports", description = "Get all facility reports for a house")
    public ResponseEntity<ApiResponse<List<FacilityReportDTO.ListItem>>> getAllReportsByHouseId(
            @PathVariable Long houseId) {
        
        List<FacilityReportDTO.ListItem> reports = reportService.getAllReportsByHouseId(houseId);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    /**
     * Update report status (HR only)
     * 
     * PDF: Status (Open, In Progress, Closed)
     */
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update report status", description = "HR updates report status")
    public ResponseEntity<ApiResponse<FacilityReportDTO.DetailResponse>> updateReportStatus(
            @PathVariable Long id,
            @Valid @RequestBody FacilityReportDTO.UpdateStatusRequest request) {
        
        log.info("Updating report status: {}, newStatus: {}", id, request.getStatus());
        FacilityReportDTO.DetailResponse report = reportService.updateReportStatus(id, request);
        
        return ResponseEntity.ok(ApiResponse.success("Report status updated successfully", report));
    }

    /**
     * Update report content
     * 
     * Only report creator can update
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update report", description = "Update report content (creator only)")
    public ResponseEntity<ApiResponse<FacilityReportDTO.DetailResponse>> updateReport(
            @PathVariable Long id,
            @Valid @RequestBody FacilityReportDTO.UpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        Long employeeId = userId != null ? userId : 1L;
        
        log.info("Updating report: {}, by employee: {}", id, employeeId);
        FacilityReportDTO.DetailResponse report = reportService.updateReport(id, request, employeeId);
        
        return ResponseEntity.ok(ApiResponse.success("Report updated successfully", report));
    }

    // ==================== Comment Management ====================

    /**
     * Add comment
     * 
     * PDF: For each report, employees can add comments
     */
    @PostMapping("/comments")
    @Operation(summary = "Add comment", description = "Add comment to a report")
    public ResponseEntity<ApiResponse<FacilityReportDetailDTO.Response>> addComment(
            @Valid @RequestBody FacilityReportDetailDTO.CreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        Long employeeId = userId != null ? userId : 1L;
        
        log.info("Adding comment to report: {}, by employee: {}", request.getFacilityReportId(), employeeId);
        FacilityReportDetailDTO.Response comment = reportService.addComment(request, employeeId);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added successfully", comment));
    }

    /**
     * Update comment
     * 
     * PDF: Employees can update comments which are created by the employee
     */
    @PutMapping("/comments/{commentId}")
    @Operation(summary = "Update comment", description = "Update comment (creator only)")
    public ResponseEntity<ApiResponse<FacilityReportDetailDTO.Response>> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody FacilityReportDetailDTO.UpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        Long employeeId = userId != null ? userId : 1L;
        
        log.info("Updating comment: {}, by employee: {}", commentId, employeeId);
        FacilityReportDetailDTO.Response comment = reportService.updateComment(commentId, request, employeeId);
        
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", comment));
    }

    /**
     * Get all comments for a report
     */
    @GetMapping("/{reportId}/comments")
    @Operation(summary = "Get report comments", description = "Get all comments for a report")
    public ResponseEntity<ApiResponse<List<FacilityReportDetailDTO.Response>>> getCommentsByReportId(
            @PathVariable Long reportId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        List<FacilityReportDetailDTO.Response> comments = reportService.getCommentsByReportId(reportId, userId);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    // ==================== Employee View ====================

    /**
     * Get employee's own reports
     */
    @GetMapping("/my-reports")
    @Operation(summary = "Get my reports", description = "Get all reports submitted by current employee")
    public ResponseEntity<ApiResponse<List<FacilityReportDTO.ListItem>>> getMyReports(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        Long employeeId = userId != null ? userId : 1L;
        
        List<FacilityReportDTO.ListItem> reports = reportService.getReportsByEmployeeId(employeeId);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    /**
     * Employee view of report details
     */
    @GetMapping("/{id}/employee-view")
    @Operation(summary = "Employee view report", description = "Employee view of report details")
    public ResponseEntity<ApiResponse<FacilityReportDTO.EmployeeViewResponse>> getReportForEmployee(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        Long employeeId = userId != null ? userId : 1L;
        
        FacilityReportDTO.EmployeeViewResponse report = reportService.getReportForEmployee(id, employeeId);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
