package org.example.housingservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class EmployeeServiceClientFallback implements EmployeeServiceClient {

    @Override
    public EmployeeInfo getEmployeeById(Long id) {
        log.warn("Fallback: Unable to get employee info for id: {}", id);
        return new EmployeeInfo(id, "Unknown", "User", null, null, null, null);
    }

    @Override
    public List<EmployeeInfo> getEmployeesByHouseId(Long houseId) {
        log.warn("Fallback: Unable to get employees for house id: {}", houseId);
        return Collections.emptyList();
    }

    @Override
    public Integer countEmployeesByHouseId(Long houseId) {
        log.warn("Fallback: Unable to count employees for house id: {}", houseId);
        return 0;
    }

    @Override
    public List<EmployeeInfo> getEmployeesByIds(List<Long> ids) {
        log.warn("Fallback: Unable to get employees for ids: {}", ids);
        return Collections.emptyList();
    }
}
