package org.example.housingservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;


@FeignClient(name = "employee-service", fallback = EmployeeServiceClientFallback.class)
public interface EmployeeServiceClient {


    @GetMapping("/api/employees/{id}")
    EmployeeInfo getEmployeeById(@PathVariable("id") Long id);

    @GetMapping("/api/employees/house/{houseId}")
    List<EmployeeInfo> getEmployeesByHouseId(@PathVariable("houseId") Long houseId);

    @GetMapping("/api/employees/house/{houseId}/count")
    Integer countEmployeesByHouseId(@PathVariable("houseId") Long houseId);

    @GetMapping("/api/employees/batch")
    List<EmployeeInfo> getEmployeesByIds(@RequestParam("ids") List<Long> ids);

    record EmployeeInfo(
            Long id,
            String firstName,
            String lastName,
            String preferredName,
            String cellPhone,
            String email,
            Long houseId
    ) {
        public String getDisplayName() {
            if (preferredName != null && !preferredName.isEmpty()) {
                return preferredName;
            }
            return firstName;
        }

        public String getFullName() {
            return firstName + " " + lastName;
        }
    }
}
