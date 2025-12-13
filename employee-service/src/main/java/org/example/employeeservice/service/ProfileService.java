package org.example.employeeservice.service;

import org.example.employeeservice.dto.EmployeeSummaryDTO;
import org.example.employeeservice.dto.ProfileUpdateRequest;
import org.example.employeeservice.exception.UpdateUserException;
import org.example.employeeservice.model.Address;
import org.example.employeeservice.model.Contact;
import org.example.employeeservice.model.Employee;
import org.example.employeeservice.model.VisaStatus;
import org.example.employeeservice.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private static final Logger logger = LoggerFactory.getLogger(ProfileService.class);
    private final EmployeeRepository employeeRepository;

    public ProfileService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    /**
     * Get paginated employee summaries for HR view
     */
    public Page<EmployeeSummaryDTO> getEmployeeSummaries(Pageable pageable) {
        Page<Employee> employees = employeeRepository.findAll(pageable);
        
        return employees.map(this::toSummaryDTO);
    }

    /**
     * Search profiles by name
     */
    public List<EmployeeSummaryDTO> searchProfiles(String query) {
        List<Employee> employees = employeeRepository.searchByName(query);
        
        return employees.stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get full profile by employee ID
     */
    public Optional<Employee> getProfile(String employeeId) {
        return employeeRepository.findById(employeeId);
    }

    /**
     * Get profile summary (for home page display)
     */
    public EmployeeSummaryDTO getProfileSummary(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));
        
        return toSummaryDTO(employee);
    }

    /**
     * Update a specific section of the profile
     */
    public Employee updateProfileSection(String employeeId, String section, ProfileUpdateRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));

        switch (section.toLowerCase()) {
            case "name":
                updateNameSection(employee, request);
                break;
            case "address":
                updateAddressSection(employee, request);
                break;
            case "contact":
                updateContactSection(employee, request);
                break;
            case "employment":
                updateEmploymentSection(employee, request);
                break;
            case "emergency":
                updateEmergencyContacts(employee, request);
                break;
            default:
                throw new UpdateUserException("Unknown section: " + section);
        }

        return employeeRepository.save(employee);
    }

    /**
     * Get masked SSN (only last 4 digits)
     */
    public String getMaskedSSN(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));
        
        String ssn = employee.getSSN();
        if (ssn == null || ssn.length() < 4) {
            return "****";
        }
        
        // Return last 4 digits, mask the rest
        return "***-**-" + ssn.substring(ssn.length() - 4);
    }

    // Private helper methods

    private void updateNameSection(Employee employee, ProfileUpdateRequest request) {
        if (request.getFirstName() != null) employee.setFirstName(request.getFirstName());
        if (request.getLastName() != null) employee.setLastName(request.getLastName());
        if (request.getMiddleName() != null) employee.setMiddleName(request.getMiddleName());
        if (request.getPreferredName() != null) employee.setPreferredName(request.getPreferredName());
        // Note: Avatar is handled by document upload, not here
    }

    private void updateAddressSection(Employee employee, ProfileUpdateRequest request) {
        if (employee.getAddress() == null) {
            employee.setAddress(new ArrayList<>());
        }

        if (request.getPrimaryAddress() != null) {
            updateOrAddAddress(employee, request.getPrimaryAddress(), "PRIMARY");
        }
        if (request.getSecondaryAddress() != null) {
            updateOrAddAddress(employee, request.getSecondaryAddress(), "SECONDARY");
        }
    }

    private void updateOrAddAddress(Employee employee, ProfileUpdateRequest.AddressUpdateDTO dto, String type) {
        // Find existing address of this type or create new
        Address address = employee.getAddress().stream()
                .filter(a -> type.equals(a.getId())) // Using ID as type indicator
                .findFirst()
                .orElseGet(() -> {
                    Address newAddr = new Address();
                    newAddr.setId(type);
                    employee.getAddress().add(newAddr);
                    return newAddr;
                });

        address.setAddressLine1(dto.getAddressLine1());
        address.setAddressLine2(dto.getAddressLine2());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setZipCode(dto.getZipCode());
    }

    private void updateContactSection(Employee employee, ProfileUpdateRequest request) {
        if (request.getCellPhone() != null) employee.setCellPhone(request.getCellPhone());
        if (request.getAlternatePhone() != null) employee.setAlternatePhone(request.getAlternatePhone());
        // Note: Email updates might need special handling for verification
    }

    private void updateEmploymentSection(Employee employee, ProfileUpdateRequest request) {
        if (request.getStartDate() != null) employee.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) employee.setEndDate(request.getEndDate());
        
        // Work authorization updates
        if (request.getWorkAuthType() != null) {
            updateWorkAuthorization(employee, request);
        }

        // Driver's license
        if (request.getDriverLicenseNumber() != null) {
            employee.setDriverLicense(request.getDriverLicenseNumber());
            employee.setDriverLicenseExpiration(request.getDriverLicenseExpiration());
        }
    }

    private void updateWorkAuthorization(Employee employee, ProfileUpdateRequest request) {
        if (employee.getVisaStatus() == null) {
            employee.setVisaStatus(new ArrayList<>());
        }

        // Deactivate existing
        employee.getVisaStatus().forEach(v -> v.setActiveFlag("N"));

        // Add new
        VisaStatus visa = new VisaStatus();
        visa.setId(UUID.randomUUID().toString());
        visa.setVisaType(request.getWorkAuthType());
        visa.setStartDate(request.getWorkAuthStartDate());
        visa.setEndDate(request.getWorkAuthEndDate());
        visa.setActiveFlag("Y");
        visa.setLastModificationDate(LocalDateTime.now());

        employee.getVisaStatus().add(visa);
    }

    private void updateEmergencyContacts(Employee employee, ProfileUpdateRequest request) {
        if (request.getEmergencyContacts() == null || request.getEmergencyContacts().isEmpty()) {
            throw new UpdateUserException("At least one emergency contact is required");
        }

        if (employee.getContact() == null) {
            employee.setContact(new ArrayList<>());
        }

        // Remove existing emergency contacts
        employee.getContact().removeIf(c -> "EMERGENCY".equals(c.getType()));

        // Add new ones
        for (ProfileUpdateRequest.ContactUpdateDTO dto : request.getEmergencyContacts()) {
            Contact contact = new Contact();
            contact.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString());
            contact.setFirstName(dto.getFirstName());
            contact.setLastName(dto.getLastName());
            contact.setCellPhone(dto.getPhone());
            contact.setEmail(dto.getEmail());
            contact.setRelationship(dto.getRelationship());
            contact.setType("EMERGENCY");

            employee.getContact().add(contact);
        }
    }

    private EmployeeSummaryDTO toSummaryDTO(Employee employee) {
        EmployeeSummaryDTO dto = new EmployeeSummaryDTO();
        dto.setEmployeeId(employee.getId());
        dto.setUserId(employee.getUserID());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setMiddleName(employee.getMiddleName());
        dto.setPreferredName(employee.getPreferredName());
        dto.setEmail(employee.getEmail());
        dto.setCellPhone(employee.getCellPhone());
        dto.setStartDate(employee.getStartDate());

        // Build full name
        StringBuilder fullName = new StringBuilder();
        if (employee.getFirstName() != null) fullName.append(employee.getFirstName());
        if (employee.getMiddleName() != null && !employee.getMiddleName().isBlank()) {
            fullName.append(" ").append(employee.getMiddleName());
        }
        if (employee.getLastName() != null) fullName.append(" ").append(employee.getLastName());
        dto.setFullName(fullName.toString().trim());

        // Masked SSN (last 4 digits)
        if (employee.getSSN() != null && employee.getSSN().length() >= 4) {
            dto.setSsnLastFour("***-**-" + employee.getSSN().substring(employee.getSSN().length() - 4));
        } else {
            dto.setSsnLastFour("****");
        }

        // Visa info
        if (employee.getVisaStatus() != null && !employee.getVisaStatus().isEmpty()) {
            employee.getVisaStatus().stream()
                    .filter(v -> "Y".equalsIgnoreCase(v.getActiveFlag()) || "ACTIVE".equalsIgnoreCase(v.getActiveFlag()))
                    .findFirst()
                    .ifPresent(visa -> {
                        dto.setVisaType(visa.getVisaType());
                        dto.setVisaEndDate(visa.getEndDate());
                        if (visa.getEndDate() != null) {
                            long daysLeft = ChronoUnit.DAYS.between(LocalDateTime.now(), visa.getEndDate());
                            dto.setDaysLeftOnVisa(Math.max(0, daysLeft));
                        }
                    });
        }

        return dto;
    }
}
