package org.example.authenticationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "housing-service", url = "${housing.service.url:http://localhost:8083}")
public interface HousingServiceClient {

    /**
     * Check house availability by ID.
     * Returns house info including current occupancy.
     */
    @GetMapping("/api/housing/houses/{houseId}/availability")
    ApiResponse<HouseAvailabilityResponse> checkHouseAvailability(@PathVariable("houseId") Long houseId);
}