package org.example.applicationservice.client;

import org.example.applicationservice.dto.EmployeeDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "employee-service",
        url = "${employee.service.url:http://localhost:8082}"
)
public interface EmployeeServiceClient {

    @GetMapping("/employees/{employeeId}")
    EmployeeDTO getEmployeeById(@PathVariable("employeeId") String employeeId);

    @GetMapping("/employee/{employeeId}/userId")
    Long getUserIdByEmployeeId(@PathVariable("employeeId") Long employeeId);

    @GetMapping("/employees/user/{userId}")
    EmployeeDTO getEmployeeByUserId(@PathVariable("userId") Long userId);
}