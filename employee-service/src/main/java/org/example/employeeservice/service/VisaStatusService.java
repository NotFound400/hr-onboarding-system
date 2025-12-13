package org.example.employeeservice.service;

import org.example.employeeservice.dto.VisaStatusDTO;
import org.example.employeeservice.dto.VisaStatusUpdateRequest;
import org.example.employeeservice.exception.UpdateUserException;
import org.example.employeeservice.model.Employee;
import org.example.employeeservice.model.VisaStatus;
import org.example.employeeservice.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VisaStatusService {

    private static final Logger logger = LoggerFactory.getLogger(VisaStatusService.class);
    private static final Set<String> CITIZEN_TYPES = Set.of("CITIZEN", "GREEN_CARD", "GREENCARD", "US_CITIZEN");

    private final EmployeeRepository employeeRepository;

    public VisaStatusService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    /**
     * Get all visa statuses for an employee
     */
    public List<VisaStatus> getVisaStatuses(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));
        
        return employee.getVisaStatus() != null ? employee.getVisaStatus() : new ArrayList<>();
    }

    /**
     * Get active visa status for an employee
     */
    public Optional<VisaStatus> getActiveVisaStatus(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));
        
        if (employee.getVisaStatus() == null || employee.getVisaStatus().isEmpty()) {
            return Optional.empty();
        }

        return employee.getVisaStatus().stream()
                .filter(v -> "Y".equalsIgnoreCase(v.getActiveFlag()) || "ACTIVE".equalsIgnoreCase(v.getActiveFlag()))
                .findFirst();
    }

    /**
     * Add a new visa status to an employee
     */
    public VisaStatus addVisaStatus(String employeeId, VisaStatusUpdateRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));

        // Deactivate all existing visa statuses
        if (employee.getVisaStatus() != null) {
            employee.getVisaStatus().forEach(v -> v.setActiveFlag("N"));
        } else {
            employee.setVisaStatus(new ArrayList<>());
        }

        // Create new visa status
        VisaStatus newVisa = new VisaStatus();
        newVisa.setId(UUID.randomUUID().toString());
        newVisa.setVisaType(request.getVisaType());
        newVisa.setStartDate(request.getStartDate());
        newVisa.setEndDate(request.getEndDate());
        newVisa.setActiveFlag("Y");
        newVisa.setLastModificationDate(LocalDateTime.now());

        employee.getVisaStatus().add(newVisa);
        employeeRepository.save(employee);

        logger.info("Added visa status {} for employee {}", newVisa.getVisaType(), employeeId);
        return newVisa;
    }

    /**
     * Update an existing visa status
     */
    public VisaStatus updateVisaStatus(String employeeId, String visaStatusId, VisaStatusUpdateRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));

        if (employee.getVisaStatus() == null || employee.getVisaStatus().isEmpty()) {
            throw new UpdateUserException("No visa status found for employee: " + employeeId);
        }

        VisaStatus targetVisa = employee.getVisaStatus().stream()
                .filter(v -> v.getId().equals(visaStatusId))
                .findFirst()
                .orElseThrow(() -> new UpdateUserException("Visa status not found: " + visaStatusId));

        // Update fields
        if (request.getVisaType() != null) {
            targetVisa.setVisaType(request.getVisaType());
        }
        if (request.getStartDate() != null) {
            targetVisa.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            targetVisa.setEndDate(request.getEndDate());
        }
        if (request.getActiveFlag() != null) {
            targetVisa.setActiveFlag(request.getActiveFlag());
        }
        targetVisa.setLastModificationDate(LocalDateTime.now());

        employeeRepository.save(employee);
        logger.info("Updated visa status {} for employee {}", visaStatusId, employeeId);
        return targetVisa;
    }

    /**
     * Get all employees with their visa status info (for HR page)
     */
    public List<VisaStatusDTO> getAllEmployeesWithVisaStatus() {
        List<Employee> allEmployees = employeeRepository.findAll();
        
        return allEmployees.stream()
                .filter(e -> needsVisaManagement(e))
                .map(this::toVisaStatusDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get employees with visas expiring within N days
     */
    public List<VisaStatusDTO> getEmployeesWithExpiringVisas(int days) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusDays(days);

        List<Employee> allEmployees = employeeRepository.findAll();
        
        return allEmployees.stream()
                .filter(this::needsVisaManagement)
                .filter(e -> {
                    Optional<VisaStatus> activeVisa = getActiveVisaFromEmployee(e);
                    if (activeVisa.isEmpty() || activeVisa.get().getEndDate() == null) {
                        return false;
                    }
                    LocalDateTime endDate = activeVisa.get().getEndDate();
                    return endDate.isAfter(now) && endDate.isBefore(threshold);
                })
                .map(this::toVisaStatusDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get employees by visa type
     */
    public List<VisaStatusDTO> getEmployeesByVisaType(String visaType) {
        List<Employee> allEmployees = employeeRepository.findAll();
        
        return allEmployees.stream()
                .filter(e -> {
                    Optional<VisaStatus> activeVisa = getActiveVisaFromEmployee(e);
                    return activeVisa.isPresent() && 
                           activeVisa.get().getVisaType() != null &&
                           activeVisa.get().getVisaType().toUpperCase().contains(visaType.toUpperCase());
                })
                .map(this::toVisaStatusDTO)
                .collect(Collectors.toList());
    }

    /**
     * Check if employee needs visa management (not citizen or green card)
     */
    public boolean needsVisaManagement(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new UpdateUserException("Employee not found: " + employeeId));
        return needsVisaManagement(employee);
    }

    private boolean needsVisaManagement(Employee employee) {
        if (employee.getVisaStatus() == null || employee.getVisaStatus().isEmpty()) {
            return false;
        }

        Optional<VisaStatus> activeVisa = getActiveVisaFromEmployee(employee);
        if (activeVisa.isEmpty()) {
            return false;
        }

        String visaType = activeVisa.get().getVisaType();
        if (visaType == null) {
            return false;
        }

        // Check if it's a citizen or green card holder
        return !CITIZEN_TYPES.contains(visaType.toUpperCase().replace(" ", "_"));
    }

    private Optional<VisaStatus> getActiveVisaFromEmployee(Employee employee) {
        if (employee.getVisaStatus() == null || employee.getVisaStatus().isEmpty()) {
            return Optional.empty();
        }
        return employee.getVisaStatus().stream()
                .filter(v -> "Y".equalsIgnoreCase(v.getActiveFlag()) || "ACTIVE".equalsIgnoreCase(v.getActiveFlag()))
                .findFirst();
    }

    private VisaStatusDTO toVisaStatusDTO(Employee employee) {
        VisaStatusDTO dto = new VisaStatusDTO();
        dto.setEmployeeId(employee.getId());
        dto.setUserId(employee.getUserID());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setPreferredName(employee.getPreferredName());
        dto.setEmail(employee.getEmail());

        // Set full name
        String fullName = buildFullName(employee);
        dto.setFullName(fullName);

        // Get active visa info
        Optional<VisaStatus> activeVisa = getActiveVisaFromEmployee(employee);
        if (activeVisa.isPresent()) {
            VisaStatus visa = activeVisa.get();
            dto.setVisaType(visa.getVisaType());
            dto.setVisaStartDate(visa.getStartDate());
            dto.setVisaEndDate(visa.getEndDate());
            
            // Calculate days left
            if (visa.getEndDate() != null) {
                long daysLeft = ChronoUnit.DAYS.between(LocalDateTime.now(), visa.getEndDate());
                dto.setDaysLeft(Math.max(0, daysLeft));
            }
        }

        return dto;
    }

    private String buildFullName(Employee employee) {
        StringBuilder name = new StringBuilder();
        if (employee.getFirstName() != null) {
            name.append(employee.getFirstName());
        }
        if (employee.getMiddleName() != null && !employee.getMiddleName().isBlank()) {
            name.append(" ").append(employee.getMiddleName());
        }
        if (employee.getLastName() != null) {
            name.append(" ").append(employee.getLastName());
        }
        return name.toString().trim();
    }
}
