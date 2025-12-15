package org.example.employeeservice.service;


import org.example.employeeservice.exception.UpdateUserException;
import org.example.employeeservice.model.Employee;
import org.example.employeeservice.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeService.class);
    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Page<Employee> getAllEmployeesPage(Pageable pageable) {
        return employeeRepository.findAll(pageable);
    }

    public Optional<Employee> getEmployeeById(String id) {
        return employeeRepository.findById(id);
    }

    public Optional<Employee> getEmployeeByUserID(Long userID) {
        return employeeRepository.findByUserID(userID);
    }

    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Employee updatedEmployee) {
        if (updatedEmployee.getId() == null) {
            throw new UpdateUserException("Employee id is required");
        }

        // 1. Fetch existing employee
        Employee existing = employeeRepository.findById(updatedEmployee.getId())
                .orElseThrow(() -> new UpdateUserException("Employee not found with id: " + updatedEmployee.getId()));

        // 2. Merge non-null fields only (incremental update)

        // Name Section
        if (updatedEmployee.getFirstName() != null) {
            existing.setFirstName(updatedEmployee.getFirstName());
        }
        if (updatedEmployee.getLastName() != null) {
            existing.setLastName(updatedEmployee.getLastName());
        }
        if (updatedEmployee.getMiddleName() != null) {
            existing.setMiddleName(updatedEmployee.getMiddleName());
        }
        if (updatedEmployee.getPreferredName() != null) {
            existing.setPreferredName(updatedEmployee.getPreferredName());
        }
        if (updatedEmployee.getGender() != null) {
            existing.setGender(updatedEmployee.getGender());
        }
        if (updatedEmployee.getSSN() != null) {
            existing.setSSN(updatedEmployee.getSSN());
        }
        if (updatedEmployee.getDOB() != null) {
            existing.setDOB(updatedEmployee.getDOB());
        }

        // Contact Section
        if (updatedEmployee.getEmail() != null) {
            existing.setEmail(updatedEmployee.getEmail());
        }
        if (updatedEmployee.getCellPhone() != null) {
            existing.setCellPhone(updatedEmployee.getCellPhone());
        }
        if (updatedEmployee.getAlternatePhone() != null) {
            existing.setAlternatePhone(updatedEmployee.getAlternatePhone());
        }

        // Employment Section
        if (updatedEmployee.getStartDate() != null) {
            existing.setStartDate(updatedEmployee.getStartDate());
        }
        if (updatedEmployee.getEndDate() != null) {
            existing.setEndDate(updatedEmployee.getEndDate());
        }

        // Driver License
        if (updatedEmployee.getDriverLicense() != null) {
            existing.setDriverLicense(updatedEmployee.getDriverLicense());
        }
        if (updatedEmployee.getDriverLicenseExpiration() != null) {
            existing.setDriverLicenseExpiration(updatedEmployee.getDriverLicenseExpiration());
        }

        // Nested Lists - Address
        if (updatedEmployee.getAddress() != null) {
            existing.setAddress(updatedEmployee.getAddress());
        }

        // Nested Lists - Contact (includes Emergency Contacts)
        if (updatedEmployee.getContact() != null) {
            existing.setContact(updatedEmployee.getContact());
        }

        // Nested Lists - Visa Status
        if (updatedEmployee.getVisaStatus() != null) {
            existing.setVisaStatus(updatedEmployee.getVisaStatus());
        }

        // Nested Lists - Personal Documents
        if (updatedEmployee.getPersonalDocument() != null) {
            existing.setPersonalDocument(updatedEmployee.getPersonalDocument());
        }

        // House ID
        if (updatedEmployee.getHouseID() != null) {
            existing.setHouseID(updatedEmployee.getHouseID());
        }

        // User ID - typically shouldn't change
        if (updatedEmployee.getUserID() != null) {
            existing.setUserID(updatedEmployee.getUserID());
        }

        // 3. Save and return merged employee
        return employeeRepository.save(existing);
    }

    public List<Employee> searchEmployeesByName(String name) {
        logger.info("search by name: {}", name);
        return employeeRepository.searchByName(name);
    }

    public void deleteEmployee(String id) {
        employeeRepository.deleteById(id);
    }

    /**
     * Get all employees assigned to a specific house
     */
    public List<Employee> getEmployeesByHouseId(Long houseId) {
        logger.info("Getting employees for house: {}", houseId);
        return employeeRepository.findByHouseID(houseId);
    }

    /**
     * Count employees in a specific house
     */
    public int countEmployeesByHouseId(Long houseId) {
        int count = employeeRepository.countByHouseID(houseId);
        logger.info("House {} has {} employees", houseId, count);
        return count;
    }

    /**
     * Check if employee exists by userID
     */
    public boolean existsByUserID(Long userID) {
        return employeeRepository.existsByUserID(userID);
    }

    /**
     * Create employee if not exists (for registration)
     */
    public Employee createEmployeeIfNotExists(Employee employee) {
        if (employee.getUserID() != null) {
            Optional<Employee> existing = employeeRepository.findByUserID(employee.getUserID());
            if (existing.isPresent()) {
                logger.info("Employee already exists for userID: {}", employee.getUserID());
                return existing.get();
            }
        }
        logger.info("Creating new employee for userID: {}", employee.getUserID());
        return employeeRepository.save(employee);
    }
}
