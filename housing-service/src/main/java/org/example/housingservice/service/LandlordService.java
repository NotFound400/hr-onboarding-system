package org.example.housingservice.service;

import org.example.housingservice.dto.LandlordDTO;

import java.util.List;

/**
 * Landlord Service Interface
 */
public interface LandlordService {

    /**
     * CreateLandlord
     */
    LandlordDTO.Response createLandlord(LandlordDTO.CreateRequest request);

    /**
     * By ID Get landlord
     */
    LandlordDTO.Response getLandlordById(Long id);

    /**
     * Get all landlords
     */
    List<LandlordDTO.Response> getAllLandlords();

    /**
     * UpdateLandlordInfo
     */
    LandlordDTO.Response updateLandlord(Long id, LandlordDTO.UpdateRequest request);

    /**
     * DeleteLandlord
     */
    void deleteLandlord(Long id);

    /**
     * searchLandlord
     */
    List<LandlordDTO.Response> searchLandlords(String keyword);
}
