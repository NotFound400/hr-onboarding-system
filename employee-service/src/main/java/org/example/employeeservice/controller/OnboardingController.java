package org.example.employeeservice.controller;

import org.example.employeeservice.dto.OnboardingDataDTO;
import org.example.employeeservice.model.Employee;
import org.example.employeeservice.service.OnboardingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping()
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    /**
     * Update employee with onboarding data
     * Called after onboarding application is approved
     */
    @PutMapping("/employees/{employeeId}/onboarding")
    public ResponseEntity<Employee> updateOnboardingData(
            @PathVariable String employeeId,
            @RequestBody OnboardingDataDTO onboardingData) {
        Employee updated = onboardingService.updateOnboardingData(employeeId, onboardingData);
        return ResponseEntity.ok(updated);
    }

    /**
     * Update employee's address information
     */
    @PutMapping("/employees/{employeeId}/address")
    public ResponseEntity<Employee> updateAddress(
            @PathVariable String employeeId,
            @RequestBody OnboardingDataDTO.AddressDTO addressData) {
        Employee updated = onboardingService.updateAddress(employeeId, addressData);
        return ResponseEntity.ok(updated);
    }

    /**
     * Update employee's contact information
     */
    @PutMapping("/employees/{employeeId}/contacts")
    public ResponseEntity<Employee> updateContacts(
            @PathVariable String employeeId,
            @RequestBody OnboardingDataDTO onboardingData) {
        Employee updated = onboardingService.updateContacts(employeeId, onboardingData);
        return ResponseEntity.ok(updated);
    }

    /**
     * Add emergency contact
     */
    @PostMapping("/employees/{employeeId}/emergency-contact")
    public ResponseEntity<Employee> addEmergencyContact(
            @PathVariable String employeeId,
            @RequestBody OnboardingDataDTO.ContactDTO contact) {
        Employee updated = onboardingService.addEmergencyContact(employeeId, contact);
        return ResponseEntity.ok(updated);
    }

    /**
     * Update emergency contact
     */
    @PutMapping("/employees/{employeeId}/emergency-contact/{contactId}")
    public ResponseEntity<Employee> updateEmergencyContact(
            @PathVariable String employeeId,
            @PathVariable String contactId,
            @RequestBody OnboardingDataDTO.ContactDTO contact) {
        Employee updated = onboardingService.updateEmergencyContact(employeeId, contactId, contact);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete emergency contact
     */
    @DeleteMapping("/employees/{employeeId}/emergency-contact/{contactId}")
    public ResponseEntity<Void> deleteEmergencyContact(
            @PathVariable String employeeId,
            @PathVariable String contactId) {
        onboardingService.deleteEmergencyContact(employeeId, contactId);
        return ResponseEntity.ok().build();
    }

    /**
     * Check if employee has completed onboarding
     */
    @GetMapping("/employees/{employeeId}/onboarding/status")
    public ResponseEntity<OnboardingDataDTO.OnboardingStatusResponse> getOnboardingStatus(
            @PathVariable String employeeId) {
        return ResponseEntity.ok(onboardingService.getOnboardingStatus(employeeId));
    }
}
