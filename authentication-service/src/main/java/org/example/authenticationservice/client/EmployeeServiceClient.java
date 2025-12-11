package org.example.authenticationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "employee-service", url = "${employee.service.url:http://localhost:8082}")
public interface EmployeeServiceClient {

    /**
     * Create a new employee record in MongoDB
     */
    @PostMapping("/api/employees")
    ResponseEntity<EmployeeResponse> createEmployee(@RequestBody CreateEmployeeRequest request);

    /**
     * Get employee by user ID
     */
    @GetMapping("/api/employees/user/{userID}")
    ResponseEntity<EmployeeResponse> getEmployeeByUserID(@PathVariable("userID") Long userID);
}