package org.example.housingservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "employee-service")
public interface EmployeeServiceClient {


    @GetMapping("/employees/user/{userID}")
    EmployeeInfo getEmployeeByUserID(@PathVariable("userID") Long id);

    @GetMapping("/employees/house/{houseId}")
    List<EmployeeInfo> getEmployeesByHouseId(@PathVariable("houseId") Long houseId);

    @GetMapping("/employees/house/{houseId}/count")
    Integer countEmployeesByHouseId(@PathVariable("houseId") Long houseId);

    @GetMapping("/employees/batch")
    List<EmployeeInfo> getEmployeesByIds(@RequestParam("ids") List<Long> ids);

    record EmployeeInfo(
            Long userID,
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
            return firstName;
        }

        public String getFullName() {
            return firstName + " " + lastName;
        }
    }
}
