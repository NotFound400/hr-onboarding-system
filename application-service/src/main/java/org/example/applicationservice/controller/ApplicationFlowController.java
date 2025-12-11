package org.example.applicationservice.controller;

import org.example.applicationservice.utils.*;
import org.example.applicationservice.dto.*;
import org.example.applicationservice.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/applications")
public class ApplicationFlowController {
    private final ApplicationService applicationService;

    public ApplicationFlowController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_EMPLOYEE')")
    public ResponseEntity<Result<ApplicationFlowDTO>> createApplication(
            @RequestBody CreateApplicationDTO request) {

        Result<ApplicationFlowDTO> result = applicationService.createApplication(request);
        if (!result.isSuccess()) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/employee/latest/{employeeId}")
    public ResponseEntity<Result<ApplicationFlowDTO>> getLatestActiveApplication(
            @PathVariable String employeeId) {
        Result<ApplicationFlowDTO> result = applicationService.getLatestActiveApplication(employeeId);
        if (!result.isSuccess()) {
            return ResponseEntity.ok(result); // still return 200, frontend can handle empty case
        }
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Result<List<ApplicationListResponseDTO>>> getActiveApplication(
            @PathVariable String employeeId) {
        Result<List<ApplicationListResponseDTO>> result = applicationService.getActiveApplications(employeeId);
        if (!result.isSuccess()) {
            return ResponseEntity.ok(result); // still return 200, frontend can handle empty case
        }
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/{applicationId}")
    public ResponseEntity<Result<ApplicationFlowDTO>> getApplicationById(
            @PathVariable Long applicationId) {
        Result<ApplicationFlowDTO> result = applicationService.getApplicationById(applicationId);
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
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

    @PreAuthorize("hasRole('EMPLOYEE')")
    @PostMapping("/{applicationId}/submit")
    public ResponseEntity<Result<Void>> submitApplication(@PathVariable Long applicationId) {
        Result<Void> result = applicationService.submitApplication(applicationId);

        if (!result.isSuccess()) {
            return ResponseEntity.badRequest().body(result);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/{applicationId}/approve")
    @PreAuthorize("hasRole('HR')")
//    @PreAuthorize("hasAuthority('ROLE_HR')")
    public ResponseEntity<Result<UpdateApplicationStatusDTO>> approveApplication(
            @PathVariable Long applicationId,
            @RequestBody HRRequestDTO request) {

        Result<UpdateApplicationStatusDTO> result = applicationService.approveApplication(applicationId, request);

        if (!result.isSuccess()) {
            return ResponseEntity.badRequest().body(result);
        }

        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('HR')")
    @PostMapping("/{applicationId}/reject")
    public ResponseEntity<Result<UpdateApplicationStatusDTO>> rejectApplication(
            @PathVariable Long applicationId,
            @RequestBody HRRequestDTO request) {

        Result<UpdateApplicationStatusDTO> result = applicationService.rejectApplication(applicationId, request);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    @PreAuthorize("hasRole('ROLE_HR')")
    @GetMapping("/ongoing")
    public ResponseEntity<Result<List<ApplicationFlowDTO>>> listOngoingApplications() {
        Result<List<ApplicationFlowDTO>> result = applicationService.listOngoingApplications();
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('HR')")
    @GetMapping("/employee/{employeeId}/all")
    public ResponseEntity<Result<List<ApplicationFlowDTO>>> getApplicationsByEmployee(
            @PathVariable String employeeId) {

        Result<List<ApplicationFlowDTO>> result = applicationService.getApplicationsByEmployeeId(employeeId);
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('HR')")
    @GetMapping("/status/{status}")
    public ResponseEntity<Result<List<ApplicationFlowDTO>>> getApplicationsByStatus(
            @PathVariable ApplicationStatus status) {

        Result<List<ApplicationFlowDTO>> result = applicationService.getApplicationsByStatus(status);
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @DeleteMapping("/{applicationId}")
    public ResponseEntity<Result<Void>> deleteApplication(@PathVariable Long applicationId) {
        Result<Void> result = applicationService.deleteApplication(applicationId);
        return ResponseEntity.ok(result);
    }


}
