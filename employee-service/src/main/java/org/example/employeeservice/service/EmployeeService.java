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

    public Employee updateEmployee(Employee employee) {
        if (employee.getId() == null) {
            throw new UpdateUserException("Employee id is required");
        }
        return employeeRepository.save(employee);
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
