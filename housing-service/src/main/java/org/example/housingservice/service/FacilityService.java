package org.example.housingservice.service;

import org.example.housingservice.dto.FacilityDTO;

import java.util.List;

/**
 * Facility Service Interface
 */
public interface FacilityService {

    /**
     * Add facility to house
     */
    FacilityDTO.Response addFacility(FacilityDTO.CreateRequest request);

    /**
     * By ID Get facilities
     */
    FacilityDTO.Response getFacilityById(Long id);

    /**
     * Get all facilities for a house
     */
    List<FacilityDTO.Response> getFacilitiesByHouseId(Long houseId);

    /**
     * GetHousefacilitiesStatistics
     */
    List<FacilityDTO.Summary> getFacilitySummaryByHouseId(Long houseId);

    /**
     * Updatefacility
     */
    FacilityDTO.Response updateFacility(Long id, FacilityDTO.UpdateRequest request);

    /**
     * Deletefacility
     */
    void deleteFacility(Long id);
}
