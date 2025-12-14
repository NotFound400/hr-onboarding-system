package org.example.employeeservice.controller;

import org.example.employeeservice.dto.EmployeeSummaryDTO;
import org.example.employeeservice.dto.ProfileUpdateRequest;
import org.example.employeeservice.model.Employee;
import org.example.employeeservice.service.ProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for employee profile operations
 * Supports both employee self-service and HR management views
 */
@RestController
@RequestMapping("/employees")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * HR: Get paginated list of employee summaries
     */
    @PreAuthorize("hasRole('HR')")
    @GetMapping("/profiles/summary")
    public ResponseEntity<Page<EmployeeSummaryDTO>> getEmployeeSummaries(
            @PageableDefault(size = 10, sort = "userId", direction = Sort.Direction.ASC)
            Pageable pageable) {
        return ResponseEntity.ok(profileService.getEmployeeSummaries(pageable));
    }

    /**
     * HR: Search employees by name
     */
    @PreAuthorize("hasRole('HR')")
    @GetMapping("/profiles/search")
    public ResponseEntity<List<EmployeeSummaryDTO>> searchProfiles(@RequestParam String query) {
        return ResponseEntity.ok(profileService.searchProfiles(query));
    }

    /**
     * Get profile by employee ID
     * Employees can only view their own profile; HR can view any
     */
    @GetMapping("/profiles/{employeeId}")
    public ResponseEntity<Employee> getProfile(@PathVariable String employeeId) {
        return profileService.getProfile(employeeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update profile section (name, address, contact, etc.)
     * Employees can only update their own profile; HR can update any
     */
    @PutMapping("/profiles/{employeeId}/section/{section}")
    public ResponseEntity<Employee> updateProfileSection(
            @PathVariable String employeeId,
            @PathVariable String section,
            @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateProfileSection(employeeId, section, request));
    }

    /**
     * Get profile summary (for home page name section)
     */
    @GetMapping("/profiles/{employeeId}/summary")
    public ResponseEntity<EmployeeSummaryDTO> getProfileSummary(@PathVariable String employeeId) {
        return ResponseEntity.ok(profileService.getProfileSummary(employeeId));
    }

    /**
     * Get SSN (last 4 digits only for display)
     */
    @GetMapping("/profiles/{employeeId}/ssn-masked")
    public ResponseEntity<String> getMaskedSSN(@PathVariable String employeeId) {
        return ResponseEntity.ok(profileService.getMaskedSSN(employeeId));
    }
}
