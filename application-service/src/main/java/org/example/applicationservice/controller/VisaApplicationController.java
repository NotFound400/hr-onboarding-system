package org.example.applicationservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.applicationservice.dto.*;
import org.example.applicationservice.service.VisaApplicationService;
import org.example.applicationservice.utils.Result;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for OPT/OPT STEM application workflow
 * Handles the visa document submission and approval process
 */
@Tag(name = "Visa Application API", description = "APIs for OPT/OPT STEM application workflow")
@RestController
@RequestMapping("/visa-applications")
public class VisaApplicationController {

    private final VisaApplicationService visaApplicationService;

    public VisaApplicationController(VisaApplicationService visaApplicationService) {
        this.visaApplicationService = visaApplicationService;
    }

    /**
     * Create a new OPT STEM application
     */
    @Operation(summary = "Start OPT STEM application", description = "Employee starts a new OPT STEM application")
    @PostMapping("/opt-stem")
    @PreAuthorize("hasRole('Employee')")
    public ResponseEntity<Result<VisaApplicationDTO>> createOptStemApplication(
            @RequestBody CreateVisaApplicationRequest request) {
        Result<VisaApplicationDTO> result = visaApplicationService.createOptStemApplication(request);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    /**
     * Get current visa application status for an employee
     */
    @Operation(summary = "Get visa application status", description = "Get current OPT STEM application status")
    @GetMapping("/employee/{employeeId}/current")
    @PreAuthorize("hasRole('Employee')")
    public ResponseEntity<Result<VisaApplicationDTO>> getCurrentVisaApplication(
            @PathVariable String employeeId) {
        Result<VisaApplicationDTO> result = visaApplicationService.getCurrentVisaApplication(employeeId);
        return ResponseEntity.ok(result);
    }

    /**
     * Get visa application by ID
     */
    @Operation(summary = "Get visa application by ID")
    @GetMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('Employee', 'HR')")
    public ResponseEntity<Result<VisaApplicationDTO>> getVisaApplicationById(
            @PathVariable Long applicationId) {
        Result<VisaApplicationDTO> result = visaApplicationService.getVisaApplicationById(applicationId);
        return ResponseEntity.ok(result);
    }

    /**
     * Submit I-983 form (download template, fill it, then upload I-20)
     */
    @Operation(summary = "Get I-983 download URL", description = "Get the I-983 template download URL")
    @GetMapping("/i983-template")
    @PreAuthorize("hasRole('Employee')")
    public ResponseEntity<Result<String>> getI983Template() {
        Result<String> result = visaApplicationService.getI983TemplateUrl();
        return ResponseEntity.ok(result);
    }

    /**
     * Upload I-20 document (after submitting I-983 to school)
     */
    @Operation(summary = "Submit I-20", description = "Upload I-20 received from school after I-983 submission")
    @PostMapping("/{applicationId}/upload-i20")
    @PreAuthorize("hasRole('Employee')")
    public ResponseEntity<Result<VisaApplicationDTO>> uploadI20(
            @PathVariable Long applicationId,
            @RequestBody UploadVisaDocumentRequest request) {
        Result<VisaApplicationDTO> result = visaApplicationService.uploadI20(applicationId, request);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    /**
     * Upload OPT STEM Receipt
     */
    @Operation(summary = "Submit OPT STEM Receipt", description = "Upload OPT STEM receipt after application")
    @PostMapping("/{applicationId}/upload-receipt")
    @PreAuthorize("hasRole('Employee')")
    public ResponseEntity<Result<VisaApplicationDTO>> uploadOptStemReceipt(
            @PathVariable Long applicationId,
            @RequestBody UploadVisaDocumentRequest request) {
        Result<VisaApplicationDTO> result = visaApplicationService.uploadOptStemReceipt(applicationId, request);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    /**
     * Upload OPT STEM EAD card
     */
    @Operation(summary = "Submit OPT STEM EAD", description = "Upload OPT STEM EAD card after receiving it")
    @PostMapping("/{applicationId}/upload-ead")
    @PreAuthorize("hasRole('Employee')")
    public ResponseEntity<Result<VisaApplicationDTO>> uploadOptStemEad(
            @PathVariable Long applicationId,
            @RequestBody UploadVisaDocumentRequest request) {
        Result<VisaApplicationDTO> result = visaApplicationService.uploadOptStemEad(applicationId, request);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    /**
     * HR: Get all pending visa applications
     */
    @Operation(summary = "Get all pending visa applications", description = "HR gets all applications pending review")
    @GetMapping("/pending")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Result<List<VisaApplicationDTO>>> getPendingVisaApplications() {
        Result<List<VisaApplicationDTO>> result = visaApplicationService.getPendingVisaApplications();
        return ResponseEntity.ok(result);
    }

    /**
     * HR: Get all visa applications
     */
    @Operation(summary = "Get all visa applications", description = "HR gets all visa applications")
    @GetMapping("/all")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Result<List<VisaApplicationDTO>>> getAllVisaApplications() {
        Result<List<VisaApplicationDTO>> result = visaApplicationService.getAllVisaApplications();
        return ResponseEntity.ok(result);
    }

    /**
     * HR: Approve visa application step
     */
    @Operation(summary = "Approve visa application", description = "HR approves a visa application step")
    @PostMapping("/{applicationId}/approve")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Result<VisaApplicationDTO>> approveVisaApplication(
            @PathVariable Long applicationId,
            @RequestBody HRRequestDTO request) {
        Result<VisaApplicationDTO> result = visaApplicationService.approveVisaApplication(applicationId, request);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    /**
     * HR: Reject visa application step
     */
    @Operation(summary = "Reject visa application", description = "HR rejects a visa application step")
    @PostMapping("/{applicationId}/reject")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Result<VisaApplicationDTO>> rejectVisaApplication(
            @PathVariable Long applicationId,
            @RequestBody HRRequestDTO request) {
        Result<VisaApplicationDTO> result = visaApplicationService.rejectVisaApplication(applicationId, request);
        return result.isSuccess() ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    /**
     * Get next steps for visa application
     */
    @Operation(summary = "Get next steps", description = "Get guidance on next steps for visa application")
    @GetMapping("/{applicationId}/next-steps")
    @PreAuthorize("hasRole('Employee')")
    public ResponseEntity<Result<VisaNextStepsDTO>> getNextSteps(@PathVariable Long applicationId) {
        Result<VisaNextStepsDTO> result = visaApplicationService.getNextSteps(applicationId);
        return ResponseEntity.ok(result);
    }
}
