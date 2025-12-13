package org.example.employeeservice.service;

import org.example.employeeservice.dto.OnboardingDataDTO;
import org.example.employeeservice.exception.UpdateUserException;
import org.example.employeeservice.model.Address;
import org.example.employeeservice.model.Contact;
import org.example.employeeservice.model.Employee;
import org.example.employeeservice.model.VisaStatus;
import org.example.employeeservice.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OnboardingService {

    private static final Logger logger = LoggerFactory.getLogger(OnboardingService.class);
    private final EmployeeRepository employeeRepository;

    public OnboardingService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    /**
     * Update employee with full onboarding data
     */
    public Employee updateOnboardingData(String employeeId, OnboardingDataDTO data) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));

        // Update basic info
        if (data.getFirstName() != null) employee.setFirstName(data.getFirstName());
        if (data.getLastName() != null) employee.setLastName(data.getLastName());
        if (data.getMiddleName() != null) employee.setMiddleName(data.getMiddleName());
        if (data.getPreferredName() != null) employee.setPreferredName(data.getPreferredName());
        
        // Update contact info
        if (data.getCellPhone() != null) employee.setCellPhone(data.getCellPhone());
        if (data.getAlternatePhone() != null) employee.setAlternatePhone(data.getAlternatePhone());
        
        // Update personal info
        if (data.getSSN() != null) employee.setSSN(data.getSSN());
        if (data.getDOB() != null) employee.setDOB(data.getDOB());
        if (data.getGender() != null) employee.setGender(data.getGender());
        
        // Update driver's license
        if (data.isHasDriverLicense()) {
            employee.setDriverLicense(data.getDriverLicenseNumber());
            employee.setDriverLicenseExpiration(data.getDriverLicenseExpiration());
        }
        
        // Update employment dates
        if (data.getStartDate() != null) employee.setStartDate(data.getStartDate());
        if (data.getEndDate() != null) employee.setEndDate(data.getEndDate());
        
        // Update house assignment
        if (data.getHouseId() != null) employee.setHouseID(data.getHouseId());
        
        // Update address
        if (data.getCurrentAddress() != null) {
            updateAddressFromDTO(employee, data.getCurrentAddress());
        }
        
        // Update work authorization / visa status
        if (data.getWorkAuthorizationType() != null) {
            updateVisaStatus(employee, data);
        }
        
        // Update emergency contacts
        if (data.getEmergencyContacts() != null && !data.getEmergencyContacts().isEmpty()) {
            updateEmergencyContacts(employee, data.getEmergencyContacts());
        }
        
        // Update reference
        if (data.getReference() != null) {
            updateReference(employee, data.getReference());
        }

        Employee saved = employeeRepository.save(employee);
        logger.info("Updated onboarding data for employee: {}", employeeId);
        return saved;
    }

    /**
     * Update employee address
     */
    public Employee updateAddress(String employeeId, OnboardingDataDTO.AddressDTO addressData) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));
        
        updateAddressFromDTO(employee, addressData);
        
        return employeeRepository.save(employee);
    }

    /**
     * Update employee contacts (emergency contacts and reference)
     */
    public Employee updateContacts(String employeeId, OnboardingDataDTO data) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));
        
        if (data.getEmergencyContacts() != null) {
            updateEmergencyContacts(employee, data.getEmergencyContacts());
        }
        if (data.getReference() != null) {
            updateReference(employee, data.getReference());
        }
        
        return employeeRepository.save(employee);
    }

    /**
     * Add an emergency contact
     */
    public Employee addEmergencyContact(String employeeId, OnboardingDataDTO.ContactDTO contactDTO) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));
        
        if (employee.getContact() == null) {
            employee.setContact(new ArrayList<>());
        }
        
        Contact contact = mapContactFromDTO(contactDTO);
        contact.setType("EMERGENCY");
        employee.getContact().add(contact);
        
        return employeeRepository.save(employee);
    }

    /**
     * Update an emergency contact
     */
    public Employee updateEmergencyContact(String employeeId, String contactId, OnboardingDataDTO.ContactDTO contactDTO) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));
        
        if (employee.getContact() == null || employee.getContact().isEmpty()) {
            throw new UpdateUserException("No contacts found for employee: " + employeeId);
        }
        
        Contact target = employee.getContact().stream()
                .filter(c -> c.getId().equals(contactId))
                .findFirst()
                .orElseThrow(() -> new UpdateUserException("Contact not found: " + contactId));
        
        // Update fields
        if (contactDTO.getFirstName() != null) target.setFirstName(contactDTO.getFirstName());
        if (contactDTO.getLastName() != null) target.setLastName(contactDTO.getLastName());
        if (contactDTO.getPhone() != null) target.setCellPhone(contactDTO.getPhone());
        if (contactDTO.getEmail() != null) target.setEmail(contactDTO.getEmail());
        if (contactDTO.getRelationship() != null) target.setRelationship(contactDTO.getRelationship());
        
        return employeeRepository.save(employee);
    }

    /**
     * Delete an emergency contact
     */
    public void deleteEmergencyContact(String employeeId, String contactId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));
        
        if (employee.getContact() == null || employee.getContact().isEmpty()) {
            throw new UpdateUserException("No contacts found for employee: " + employeeId);
        }
        
        // Count emergency contacts
        long emergencyCount = employee.getContact().stream()
                .filter(c -> "EMERGENCY".equals(c.getType()))
                .count();
        
        Contact target = employee.getContact().stream()
                .filter(c -> c.getId().equals(contactId))
                .findFirst()
                .orElseThrow(() -> new UpdateUserException("Contact not found: " + contactId));
        
        // Ensure at least one emergency contact remains
        if ("EMERGENCY".equals(target.getType()) && emergencyCount <= 1) {
            throw new UpdateUserException("Cannot delete the last emergency contact");
        }
        
        employee.getContact().remove(target);
        employeeRepository.save(employee);
    }

    /**
     * Get onboarding status for an employee
     */
    public OnboardingDataDTO.OnboardingStatusResponse getOnboardingStatus(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));
        
        OnboardingDataDTO.OnboardingStatusResponse response = new OnboardingDataDTO.OnboardingStatusResponse();
        response.setEmployeeId(employeeId);
        
        // Check basic info
        boolean hasBasicInfo = employee.getFirstName() != null && 
                              employee.getLastName() != null &&
                              employee.getSSN() != null &&
                              employee.getDOB() != null;
        response.setHasBasicInfo(hasBasicInfo);
        
        // Check address
        boolean hasAddress = employee.getAddress() != null && !employee.getAddress().isEmpty();
        response.setHasAddress(hasAddress);
        
        // Check emergency contact
        boolean hasEmergencyContact = employee.getContact() != null && 
                                      employee.getContact().stream()
                                              .anyMatch(c -> "EMERGENCY".equals(c.getType()));
        response.setHasEmergencyContact(hasEmergencyContact);
        
        // Check work authorization
        boolean hasWorkAuth = employee.getVisaStatus() != null && !employee.getVisaStatus().isEmpty();
        response.setHasWorkAuthorization(hasWorkAuth);
        
        // Determine overall completeness
        boolean isComplete = hasBasicInfo && hasAddress && hasEmergencyContact && hasWorkAuth;
        response.setComplete(isComplete);
        
        // Set current step
        if (!hasBasicInfo) {
            response.setCurrentStep("BASIC_INFO");
            response.setMessage("Please complete your basic information");
        } else if (!hasAddress) {
            response.setCurrentStep("ADDRESS");
            response.setMessage("Please add your address");
        } else if (!hasWorkAuth) {
            response.setCurrentStep("WORK_AUTHORIZATION");
            response.setMessage("Please provide your work authorization details");
        } else if (!hasEmergencyContact) {
            response.setCurrentStep("EMERGENCY_CONTACT");
            response.setMessage("Please add at least one emergency contact");
        } else {
            response.setCurrentStep("COMPLETE");
            response.setMessage("Onboarding information is complete");
        }
        
        return response;
    }

    // Helper methods

    private void updateAddressFromDTO(Employee employee, OnboardingDataDTO.AddressDTO addressDTO) {
        if (employee.getAddress() == null) {
            employee.setAddress(new ArrayList<>());
        }
        
        Address address = new Address();
        address.setId(UUID.randomUUID().toString());
        address.setAddressLine1(addressDTO.getAddressLine1());
        address.setAddressLine2(addressDTO.getAddressLine2());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setZipCode(addressDTO.getZipCode());
        
        String type = addressDTO.getType() != null ? addressDTO.getType() : "PRIMARY";
        
        // Remove existing address of same type
        employee.getAddress().removeIf(a -> type.equals(a.getId())); // Using ID as type indicator for simplicity
        
        employee.getAddress().add(address);
    }

    private void updateVisaStatus(Employee employee, OnboardingDataDTO data) {
        if (employee.getVisaStatus() == null) {
            employee.setVisaStatus(new ArrayList<>());
        }
        
        // Deactivate existing visa statuses
        employee.getVisaStatus().forEach(v -> v.setActiveFlag("N"));
        
        VisaStatus visa = new VisaStatus();
        visa.setId(UUID.randomUUID().toString());
        visa.setVisaType(data.getWorkAuthorizationType());
        visa.setStartDate(data.getWorkAuthStartDate());
        visa.setEndDate(data.getWorkAuthEndDate());
        visa.setActiveFlag("Y");
        visa.setLastModificationDate(LocalDateTime.now());
        
        employee.getVisaStatus().add(visa);
    }

    private void updateEmergencyContacts(Employee employee, List<OnboardingDataDTO.ContactDTO> contacts) {
        if (employee.getContact() == null) {
            employee.setContact(new ArrayList<>());
        }
        
        // Remove existing emergency contacts
        employee.getContact().removeIf(c -> "EMERGENCY".equals(c.getType()));
        
        // Add new emergency contacts
        for (OnboardingDataDTO.ContactDTO dto : contacts) {
            Contact contact = mapContactFromDTO(dto);
            contact.setType("EMERGENCY");
            employee.getContact().add(contact);
        }
    }

    private void updateReference(Employee employee, OnboardingDataDTO.ContactDTO referenceDTO) {
        if (employee.getContact() == null) {
            employee.setContact(new ArrayList<>());
        }
        
        // Remove existing reference
        employee.getContact().removeIf(c -> "REFERENCE".equals(c.getType()));
        
        Contact reference = mapContactFromDTO(referenceDTO);
        reference.setType("REFERENCE");
        employee.getContact().add(reference);
    }

    private Contact mapContactFromDTO(OnboardingDataDTO.ContactDTO dto) {
        Contact contact = new Contact();
        contact.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString());
        contact.setFirstName(dto.getFirstName());
        contact.setLastName(dto.getLastName());
        contact.setCellPhone(dto.getPhone());
        contact.setEmail(dto.getEmail());
        contact.setRelationship(dto.getRelationship());
        return contact;
    }
}
