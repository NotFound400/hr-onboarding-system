package org.example.housingservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.housingservice.dto.FacilityDTO;
import org.example.housingservice.entity.Facility;
import org.example.housingservice.entity.House;
import org.example.housingservice.exception.ResourceNotFoundException;
import org.example.housingservice.repository.FacilityRepository;
import org.example.housingservice.repository.HouseRepository;
import org.example.housingservice.service.FacilityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Facility Service Implementation
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FacilityServiceImpl implements FacilityService {

    private final FacilityRepository facilityRepository;
    private final HouseRepository houseRepository;

    @Override
    @Transactional
    public FacilityDTO.Response addFacility(FacilityDTO.CreateRequest request) {
        log.info("Adding facility to house: {}, type: {}", request.getHouseId(), request.getType());

        House house = houseRepository.findById(request.getHouseId())
                .orElseThrow(() -> new ResourceNotFoundException("House", "id", request.getHouseId()));

        Facility facility = Facility.builder()
                .house(house)
                .type(request.getType())
                .description(request.getDescription())
                .quantity(request.getQuantity())
                .build();

        Facility saved = facilityRepository.save(facility);
        log.info("Facility added with id: {}", saved.getId());

        return mapToResponse(saved);
    }

    @Override
    public FacilityDTO.Response getFacilityById(Long id) {
        Facility facility = findFacilityById(id);
        return mapToResponse(facility);
    }

    @Override
    public List<FacilityDTO.Response> getFacilitiesByHouseId(Long houseId) {
        // ValidateHouse exists
        if (!houseRepository.existsById(houseId)) {
            throw new ResourceNotFoundException("House", "id", houseId);
        }

        return facilityRepository.findByHouseId(houseId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FacilityDTO.Summary> getFacilitySummaryByHouseId(Long houseId) {
        // ValidateHouse exists
        if (!houseRepository.existsById(houseId)) {
            throw new ResourceNotFoundException("House", "id", houseId);
        }

        List<Object[]> results = facilityRepository.getFacilitySummaryByHouseId(houseId);
        
        return results.stream()
                .map(row -> FacilityDTO.Summary.builder()
                        .type((String) row[0])
                        .totalQuantity(((Number) row[1]).intValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FacilityDTO.Response updateFacility(Long id, FacilityDTO.UpdateRequest request) {
        log.info("Updating facility: {}", id);

        Facility facility = findFacilityById(id);

        if (request.getType() != null) {
            facility.setType(request.getType());
        }
        if (request.getDescription() != null) {
            facility.setDescription(request.getDescription());
        }
        if (request.getQuantity() != null) {
            facility.setQuantity(request.getQuantity());
        }

        Facility updated = facilityRepository.save(facility);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteFacility(Long id) {
        log.info("Deleting facility: {}", id);
        Facility facility = findFacilityById(id);
        facilityRepository.delete(facility);
    }

    // ==================== Private Helper Methods ====================

    private Facility findFacilityById(Long id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", id));
    }

    private FacilityDTO.Response mapToResponse(Facility facility) {
        return FacilityDTO.Response.builder()
                .id(facility.getId())
                .houseId(facility.getHouse().getId())
                .type(facility.getType())
                .description(facility.getDescription())
                .quantity(facility.getQuantity())
                .build();
    }
}
