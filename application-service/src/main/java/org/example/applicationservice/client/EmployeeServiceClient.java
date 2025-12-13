package org.example.applicationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "employee-service")
public interface EmployeeServiceClient {
    @GetMapping("api/employees/{employeeId}")
    Long getUserIdByEmployeeId(@PathVariable String employeeId);

    @GetMapping("api/employees/{userId}")
    String getEmployeeIdByUserId(@PathVariable Long userId);
}
