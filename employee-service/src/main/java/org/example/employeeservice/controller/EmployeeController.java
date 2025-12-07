package org.example.employeeservice.controller;


import org.example.employeeservice.model.Employee;
import org.example.employeeservice.service.EmployeeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
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

    @GetMapping("/employee/{id}")
    public ResponseEntity<Employee> getEmployee(@PathVariable String id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("employee/user/{userID}")
    public ResponseEntity<?> getEmployeeByUserID(@PathVariable Long userID) {
        Optional<Employee> employee = employeeService.getEmployeeByUserID(userID);
        return employee.isPresent() ? ResponseEntity.ok(employee.get())
                : ResponseEntity.notFound().build();
    }

    @PostMapping("/employee")
    public ResponseEntity<Employee> saveEmployee(@RequestBody Employee employee) {
        Employee saved = employeeService.saveEmployee(employee);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/employee")
    public ResponseEntity<Employee> updateEmployee(@RequestBody Employee employee)  {
        Employee saved = employeeService.updateEmployee(employee);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/employees/search")
    public ResponseEntity<List<Employee>> searchEmployees(@RequestParam String name) {
        return ResponseEntity.ok(employeeService.searchEmployeesByName(name));
    }


    @DeleteMapping("/employee/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable String id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }
}
