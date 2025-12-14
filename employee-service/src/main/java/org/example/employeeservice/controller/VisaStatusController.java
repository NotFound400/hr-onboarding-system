package org.example.employeeservice.controller;

import org.example.employeeservice.dto.VisaStatusDTO;
import org.example.employeeservice.dto.VisaStatusUpdateRequest;
import org.example.employeeservice.model.VisaStatus;
import org.example.employeeservice.service.VisaStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping()
public class VisaStatusController {

    private final VisaStatusService visaStatusService;

    public VisaStatusController(VisaStatusService visaStatusService) {
        this.visaStatusService = visaStatusService;
    }

    /**
     * Get all visa statuses for an employee
     */
    @GetMapping("/employees/{employeeId}/visa-status")
    public ResponseEntity<List<VisaStatus>> getVisaStatuses(@PathVariable String employeeId) {
        return ResponseEntity.ok(visaStatusService.getVisaStatuses(employeeId));
    }

    /**
     * Get active visa status for an employee
     */
    @GetMapping("/employees/{employeeId}/visa-status/active")
    public ResponseEntity<VisaStatus> getActiveVisaStatus(@PathVariable String employeeId) {
        return visaStatusService.getActiveVisaStatus(employeeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Add a new visa status to an employee
     */
    @PostMapping("/employees/{employeeId}/visa-status")
    public ResponseEntity<VisaStatus> addVisaStatus(
            @PathVariable String employeeId,
            @RequestBody VisaStatusUpdateRequest request) {
        return ResponseEntity.ok(visaStatusService.addVisaStatus(employeeId, request));
    }

    /**
     * Update an existing visa status
     */
    @PutMapping("/employees/{employeeId}/visa-status/{visaStatusId}")
    public ResponseEntity<VisaStatus> updateVisaStatus(
            @PathVariable String employeeId,
            @PathVariable String visaStatusId,
            @RequestBody VisaStatusUpdateRequest request) {
        return ResponseEntity.ok(visaStatusService.updateVisaStatus(employeeId, visaStatusId, request));
    }

    /**
     * HR: Get all employees with visa status (for HR visa management page)
     */
    @PreAuthorize("hasRole('HR')")
    @GetMapping("/employees/visa-status/all")
    public ResponseEntity<List<VisaStatusDTO>> getAllEmployeesWithVisaStatus() {
        return ResponseEntity.ok(visaStatusService.getAllEmployeesWithVisaStatus());
    }

    /**
     * HR: Get employees with expiring visas (within N days)
     */
    @PreAuthorize("hasRole('HR')")
    @GetMapping("/employees/visa-status/expiring")
    public ResponseEntity<List<VisaStatusDTO>> getEmployeesWithExpiringVisas(
            @RequestParam(defaultValue = "90") int days) {
        return ResponseEntity.ok(visaStatusService.getEmployeesWithExpiringVisas(days));
    }

    /**
     * HR: Get employees by visa type (OPT, H1B, etc.)
     */
    @PreAuthorize("hasRole('HR')")
    @GetMapping("/employees/visa-status/type/{visaType}")
    public ResponseEntity<List<VisaStatusDTO>> getEmployeesByVisaType(@PathVariable String visaType) {
        return ResponseEntity.ok(visaStatusService.getEmployeesByVisaType(visaType));
    }

    /**
     * Check if employee needs visa (not citizen or green card holder)
     */
    @GetMapping("/employees/{employeeId}/needs-visa-management")
    public ResponseEntity<Boolean> needsVisaManagement(@PathVariable String employeeId) {
        return ResponseEntity.ok(visaStatusService.needsVisaManagement(employeeId));
    }
}
