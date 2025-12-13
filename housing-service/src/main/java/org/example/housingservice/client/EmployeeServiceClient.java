package org.example.housingservice.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(
        name = "employee-service",
        url = "${employee.service.url:http://localhost:8082}",  // ADD THIS
        fallback = EmployeeServiceClientFallback.class
)
public interface EmployeeServiceClient {

    @GetMapping("/employees/{id}")
    EmployeeInfo getEmployeeById(@PathVariable("id") String id);  // Changed to String

    @GetMapping("/employees/user/{userId}")
    EmployeeInfo getEmployeeByUserId(@PathVariable("userId") Long userId);

    @GetMapping("/employees/house/{houseId}")
    List<EmployeeInfo> getEmployeesByHouseId(@PathVariable("houseId") Long houseId);

    @GetMapping("/employees/house/{houseId}/count")
    Integer countEmployeesByHouseId(@PathVariable("houseId") Long houseId);

    @GetMapping("/employees/batch")
    List<EmployeeInfo> getEmployeesByIds(@RequestParam("ids") List<Long> ids);

    record EmployeeInfo(
            String id,                              // MongoDB ObjectId is String, not Long
            String firstName,
            String lastName,
            String preferredName,
            String cellPhone,
            String email,
            Long houseID
    ) {
        public String getDisplayName() {
            if (preferredName != null && !preferredName.isEmpty()) {
                return preferredName;
            }
            if (firstName != null && !firstName.isEmpty()) {
                return firstName;
            }
            return "Unknown";
        }

        public String getFullName() {
            String first = firstName != null ? firstName : "";
            String last = lastName != null ? lastName : "";
            String full = (first + " " + last).trim();
            return full.isEmpty() ? "Unknown" : full;
        }

        // Add getter for compatibility with houseId() calls
        public Long houseId() {
            return houseID;
        }
    }
}