package org.example.applicationservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.applicationservice.utils.*;
import org.example.applicationservice.dto.*;
import org.example.applicationservice.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Application Work Flow API",
        description = "APIs for creating, updating, submitting, and retrieving onboarding applications")
@RestController
@RequestMapping()
public class ApplicationFlowController {
    private final ApplicationService applicationService;

    public ApplicationFlowController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @Operation(summary = "Create a new application",
            description = "Employee starts a new onboarding application")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Application created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload")
    })
    @PostMapping
    @PreAuthorize("hasRole('Employee')")
    public ResponseEntity<Result<ApplicationFlowDTO>> createApplication(
            @RequestBody CreateApplicationDTO request) {

        Result<ApplicationFlowDTO> result = applicationService.createApplication(request);
        if (!result.isSuccess()) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get latest active application",
            description = "Retrieve the most recent active application for an employee")
    @PreAuthorize("hasRole('Employee')")
    @GetMapping("/employee/latest/{employeeId}")
    public ResponseEntity<Result<ApplicationFlowDTO>> getLatestActiveApplication(
            @PathVariable String employeeId) {
        Result<ApplicationFlowDTO> result = applicationService.getLatestActiveApplication(employeeId);
        if (!result.isSuccess()) {
            return ResponseEntity.ok(result); // still return 200, frontend can handle empty case
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get all active applications for employee",
            description = "Return a list of active applications the employee is working on")
    @PreAuthorize("hasRole('Employee')")
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Result<List<ApplicationListResponseDTO>>> getActiveApplication(
            @PathVariable String employeeId) {
        Result<List<ApplicationListResponseDTO>> result = applicationService.getActiveApplications(employeeId);
        if (!result.isSuccess()) {
            return ResponseEntity.ok(result); // still return 200, frontend can handle empty case
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get application details",
            description = "Retrieve full onboarding application data by its ID")
    @PreAuthorize("hasRole('Employee')")
    @GetMapping("/{applicationId}")
    public ResponseEntity<Result<ApplicationFlowDTO>> getApplicationById(
            @PathVariable Long applicationId) {
        Result<ApplicationFlowDTO> result = applicationService.getApplicationById(applicationId);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Update application",
            description = "Employee updates their existing application before submission")
    @PreAuthorize("hasRole('Employee')")
    @PutMapping("/{applicationId}")
    public ResponseEntity<Result<ApplicationFlowDTO>> updateApplication(
            @PathVariable Long applicationId,
            @RequestBody UpdateApplicationDTO request) {

        Result<ApplicationFlowDTO> result = applicationService.updateApplication(applicationId, request);

        if (!result.isSuccess()) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Submit application",
            description = "Employee submits completed application for HR review")
    @PreAuthorize("hasRole('Employee')")
    @PostMapping("/{applicationId}/submit")
    public ResponseEntity<Result<UpdateApplicationStatusDTO>> submitApplication(@PathVariable Long applicationId) {
        Result<UpdateApplicationStatusDTO> result = applicationService.submitApplication(applicationId);
        if (!result.isSuccess()) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Approve application", description = "HR approves an onboarding application")
    @PostMapping("/{applicationId}/approve")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Result<UpdateApplicationStatusDTO>> approveApplication(
            @PathVariable Long applicationId,
            @RequestBody HRRequestDTO request) {

        Result<UpdateApplicationStatusDTO> result = applicationService.approveApplication(applicationId, request);

        if (!result.isSuccess()) {
            return ResponseEntity.badRequest().body(result);
        }

        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Reject application", description = "HR rejects an onboarding application")
    @PreAuthorize("hasRole('HR')")
    @PostMapping("/{applicationId}/reject")
    public ResponseEntity<Result<UpdateApplicationStatusDTO>> rejectApplication(
            @PathVariable Long applicationId,
            @RequestBody HRRequestDTO request) {

        Result<UpdateApplicationStatusDTO> result = applicationService.rejectApplication(applicationId, request);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    @Operation(summary = "List ongoing applications", description = "HR retrieves all applications that are currently in progress")
    @PreAuthorize("hasRole('HR')")
    @GetMapping("/ongoing")
    public ResponseEntity<Result<List<ApplicationFlowDTO>>> listOngoingApplications() {
        Result<List<ApplicationFlowDTO>> result = applicationService.listOngoingApplications();
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get all applications by employee",
            description = "HR can view all applications belonging to an employee")
    @PreAuthorize("hasRole('HR')")
    @GetMapping("/employee/{employeeId}/all")
    public ResponseEntity<Result<List<ApplicationFlowDTO>>> getApplicationsByEmployee(
            @PathVariable String employeeId) {

        Result<List<ApplicationFlowDTO>> result = applicationService.getApplicationsByEmployeeId(employeeId);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get applications by status",
            description = "HR filters all applications by their status")
    @PreAuthorize("hasRole('HR')")
    @GetMapping("/status/{status}")
    public ResponseEntity<Result<List<ApplicationFlowDTO>>> getApplicationsByStatus(
            @PathVariable ApplicationStatus status) {

        Result<List<ApplicationFlowDTO>> result = applicationService.getApplicationsByStatus(status);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Delete application",
            description = "Employee deletes their draft application")
    @PreAuthorize("hasRole('Employee')")
    @DeleteMapping("/{applicationId}")
    public ResponseEntity<Result<Void>> deleteApplication(@PathVariable Long applicationId) {
        Result<Void> result = applicationService.deleteApplication(applicationId);
        return ResponseEntity.ok(result);
    }


}
