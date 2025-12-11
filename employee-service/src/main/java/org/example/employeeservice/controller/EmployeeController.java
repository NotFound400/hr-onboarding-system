package org.example.employeeservice.controller;


import org.example.employeeservice.model.Employee;
import org.example.employeeservice.service.EmployeeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping()
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/employees")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/employees/page")
    public ResponseEntity<Page<Employee>> getAllEmployees(
            @PageableDefault(size = 3, sort = "lastName", direction = Sort.Direction.ASC)
            Pageable pageable) {
        return ResponseEntity.ok(employeeService.getAllEmployeesPage(pageable));
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<Employee> getEmployee(@PathVariable String id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("employees/user/{userID}")
    public ResponseEntity<?> getEmployeeByUserID(@PathVariable Long userID) {
        Optional<Employee> employee = employeeService.getEmployeeByUserID(userID);
        return employee.isPresent() ? ResponseEntity.ok(employee.get())
                : ResponseEntity.notFound().build();
    }

    @PostMapping("/employees")
    public ResponseEntity<Employee> saveEmployee(@RequestBody Employee employee) {
        Employee saved = employeeService.saveEmployee(employee);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<Employee> updateEmployee(@RequestBody Employee employee, @PathVariable String id)  {
        employee.setId(id);
        Employee saved = employeeService.updateEmployee(employee);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/employees/search")
    public ResponseEntity<List<Employee>> searchEmployees(@RequestParam String name) {
        return ResponseEntity.ok(employeeService.searchEmployeesByName(name));
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable String id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Get employees by house ID
     * Used by Housing Service to list roommates
     */
    @GetMapping("/api/employees/house/{houseId}")
    public ResponseEntity<List<Employee>> getEmployeesByHouseId(@PathVariable("houseId") Long houseId) {
        List<Employee> employees = employeeService.getEmployeesByHouseId(houseId);
        return ResponseEntity.ok(employees);
    }

    /**
     * Count employees by house ID
     * Used by Housing Service to check house availability
     */
    @GetMapping("/api/employees/house/{houseId}/count")
    public ResponseEntity<Integer> countEmployeesByHouseId(@PathVariable("houseId") Long houseId) {
        int count = employeeService.countEmployeesByHouseId(houseId);
        return ResponseEntity.ok(count);
    }

    /**
     * Create employee (for registration flow)
     * Used by Auth Service during user registration
     * Creates employee only if not already exists
     */
    @PostMapping("/api/employees")
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        Employee saved = employeeService.createEmployeeIfNotExists(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Get employee by userID (with /api prefix)
     * Used by Auth Service
     */
    @GetMapping("/api/employees/user/{userID}")
    public ResponseEntity<?> getEmployeeByUserIDApi(@PathVariable Long userID) {
        Optional<Employee> employee = employeeService.getEmployeeByUserID(userID);
        return employee.isPresent() ? ResponseEntity.ok(employee.get())
                : ResponseEntity.notFound().build();
    }
}
