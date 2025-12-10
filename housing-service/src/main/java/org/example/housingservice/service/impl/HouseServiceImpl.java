package org.example.housingservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.housingservice.client.EmployeeServiceClient;
import org.example.housingservice.context.UserContext;
import org.example.housingservice.dto.FacilityDTO;
import org.example.housingservice.dto.HouseDTO;
import org.example.housingservice.dto.LandlordDTO;
import org.example.housingservice.entity.Facility;
import org.example.housingservice.entity.House;
import org.example.housingservice.entity.Landlord;
import org.example.housingservice.exception.BusinessException;
import org.example.housingservice.exception.ForbiddenException;
import org.example.housingservice.exception.ResourceNotFoundException;
import org.example.housingservice.repository.FacilityRepository;
import org.example.housingservice.repository.HouseRepository;
import org.example.housingservice.repository.LandlordRepository;
import org.example.housingservice.service.HouseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * House Service Implementation
 * 
 * Provides role-based access to house information
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HouseServiceImpl implements HouseService {

    private final HouseRepository houseRepository;
    private final LandlordRepository landlordRepository;
    private final FacilityRepository facilityRepository;
    private final EmployeeServiceClient employeeServiceClient;

    // View type constants
    private static final String HR_VIEW = "HR_VIEW";
    private static final String EMPLOYEE_VIEW = "EMPLOYEE_VIEW";

    // ==================== Role-based Unified Methods ====================

    @Override
    public HouseDTO.UnifiedDetailResponse getHouseDetail(Long houseId, UserContext userContext) {
        log.debug("Getting house detail for id: {}, user: {}, roles: {}", 
                houseId, userContext.getUserId(), userContext.getRoles());

        House house = houseRepository.findByIdWithDetails(houseId)
                .orElseThrow(() -> new ResourceNotFoundException("House", "id", houseId));

        if (userContext.isHR() || userContext.isAdmin()) {
            // HR View: Full information
            return buildHRDetailView(house);
        } else {
            // Employee View: Must be assigned to this house
            validateEmployeeHouseAccess(userContext.getUserId(), houseId);
            return buildEmployeeDetailView(house);
        }
    }

    @Override
    public List<HouseDTO.UnifiedListResponse> getAllHouses(UserContext userContext) {
        log.debug("Getting all houses for user: {}, roles: {}", 
                userContext.getUserId(), userContext.getRoles());

        if (userContext.isHR() || userContext.isAdmin()) {
            // HR View: All houses with full info
            List<House> houses = houseRepository.findAllWithLandlord();
            return houses.stream()
                    .map(this::buildHRListView)
                    .collect(Collectors.toList());
        } else {
            // Employee View: Only their assigned house
            Long employeeHouseId = getEmployeeHouseId(userContext.getUserId());
            if (employeeHouseId == null) {
                return Collections.emptyList();
            }
            
            House house = houseRepository.findById(employeeHouseId)
                    .orElse(null);
            if (house == null) {
                return Collections.emptyList();
            }
            
            return List.of(buildEmployeeListView(house));
        }
    }

    // ==================== HR Specific Methods ====================

    @Override
    @Transactional
    public HouseDTO.DetailResponse createHouse(HouseDTO.CreateRequest request) {
        log.info("Creating house at address: {}", request.getAddress());

        // Check if address already exists
        if (houseRepository.existsByAddress(request.getAddress())) {
            throw new BusinessException("House already exists at address: " + request.getAddress());
        }

        // Get landlord
        Landlord landlord = landlordRepository.findById(request.getLandlordId())
                .orElseThrow(() -> new ResourceNotFoundException("Landlord", "id", request.getLandlordId()));

        // Create house
        House house = House.builder()
                .landlord(landlord)
                .address(request.getAddress())
                .maxOccupant(request.getMaxOccupant())
                .build();

        House savedHouse = houseRepository.save(house);

        // Add facilities if provided
        if (request.getFacilities() != null && !request.getFacilities().isEmpty()) {
            for (FacilityDTO.CreateRequest facilityReq : request.getFacilities()) {
                Facility facility = Facility.builder()
                        .house(savedHouse)
                        .type(facilityReq.getType())
                        .description(facilityReq.getDescription())
                        .quantity(facilityReq.getQuantity())
                        .build();
                savedHouse.addFacility(facility);
            }
            savedHouse = houseRepository.save(savedHouse);
        }

        log.info("House created with id: {}", savedHouse.getId());
        return mapToDetailResponse(savedHouse);
    }

    @Override
    public List<HouseDTO.ListResponse> getAllHousesForHR() {
        log.debug("Getting all houses for HR");

        List<House> houses = houseRepository.findAllWithLandlord();
        
        return houses.stream()
                .map(house -> {
                    Integer employeeCount = employeeServiceClient.countEmployeesByHouseId(house.getId());
                    return mapToListResponse(house, employeeCount);
                })
                .collect(Collectors.toList());
    }

    @Override
    public HouseDTO.DetailResponse getHouseDetailForHR(Long id) {
        log.debug("Getting house detail for HR, id: {}", id);

        House house = houseRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("House", "id", id));

        return mapToDetailResponse(house);
    }

    @Override
    @Transactional
    public HouseDTO.DetailResponse updateHouse(Long id, HouseDTO.UpdateRequest request) {
        log.info("Updating house: {}", id);

        House house = houseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("House", "id", id));

        if (request.getLandlordId() != null) {
            Landlord landlord = landlordRepository.findById(request.getLandlordId())
                    .orElseThrow(() -> new ResourceNotFoundException("Landlord", "id", request.getLandlordId()));
            house.setLandlord(landlord);
        }

        if (request.getAddress() != null) {
            // Check if new address is used by another house
            if (!house.getAddress().equals(request.getAddress()) 
                    && houseRepository.existsByAddress(request.getAddress())) {
                throw new BusinessException("Address already in use: " + request.getAddress());
            }
            house.setAddress(request.getAddress());
        }

        if (request.getMaxOccupant() != null) {
            house.setMaxOccupant(request.getMaxOccupant());
        }

        House updated = houseRepository.save(house);
        return mapToDetailResponse(updated);
    }

    @Override
    @Transactional
    public void deleteHouse(Long id) {
        log.info("Deleting house: {}", id);

        House house = houseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("House", "id", id));

        // Check if employees are living in this house
        Integer employeeCount = employeeServiceClient.countEmployeesByHouseId(id);
        if (employeeCount > 0) {
            throw new BusinessException("Cannot delete house with " + employeeCount + " employees living in it");
        }

        houseRepository.delete(house);
    }

    // ==================== Employee Specific Methods ====================

    @Override
    public HouseDTO.EmployeeViewResponse getHouseForEmployee(Long houseId, Long employeeId) {
        log.debug("Getting house info for employee: {}, houseId: {}", employeeId, houseId);

        House house = houseRepository.findById(houseId)
                .orElseThrow(() -> new ResourceNotFoundException("House", "id", houseId));

        // Validate employee access if employeeId is provided
        if (employeeId != null) {
            validateEmployeeHouseAccess(employeeId, houseId);
        }

        return buildEmployeeViewResponse(house);
    }

    @Override
    public HouseDTO.EmployeeViewResponse getMyHouse(Long employeeId) {
        log.debug("Getting house for employee: {}", employeeId);

        // Get employee's house ID from EmployeeService
        Long houseId = getEmployeeHouseId(employeeId);
        if (houseId == null) {
            log.warn("Employee {} is not assigned to any house", employeeId);
            return null;
        }

        House house = houseRepository.findById(houseId)
                .orElseThrow(() -> new ResourceNotFoundException("House", "id", houseId));

        return buildEmployeeViewResponse(house);
    }

    // ==================== Common Methods ====================

    @Override
    public HouseDTO.Summary getHouseSummary(Long id) {
        House house = houseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("House", "id", id));

        Integer currentOccupant = employeeServiceClient.countEmployeesByHouseId(id);

        return HouseDTO.Summary.builder()
                .id(house.getId())
                .address(house.getAddress())
                .maxOccupant(house.getMaxOccupant())
                .currentOccupant(currentOccupant)
                .build();
    }

    @Override
    public List<HouseDTO.Summary> getAllHouseSummaries() {
        return houseRepository.findAll().stream()
                .map(house -> {
                    Integer currentOccupant = employeeServiceClient.countEmployeesByHouseId(house.getId());
                    return HouseDTO.Summary.builder()
                            .id(house.getId())
                            .address(house.getAddress())
                            .maxOccupant(house.getMaxOccupant())
                            .currentOccupant(currentOccupant)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsById(Long id) {
        return houseRepository.existsById(id);
    }

    // ==================== Private Helper Methods ====================

    /**
     * Validate that an employee is assigned to the specified house
     */
    private void validateEmployeeHouseAccess(Long employeeId, Long houseId) {
        Long employeeHouseId = getEmployeeHouseId(employeeId);
        if (employeeHouseId == null || !employeeHouseId.equals(houseId)) {
            log.warn("Employee {} attempted to access house {} but is assigned to house {}", 
                    employeeId, houseId, employeeHouseId);
            throw new ForbiddenException("house", 
                    "You can only view the house you are assigned to");
        }
    }

    /**
     * Get employee's assigned house ID from EmployeeService
     */
    private Long getEmployeeHouseId(Long employeeId) {
        try {
            EmployeeServiceClient.EmployeeInfo employee = employeeServiceClient.getEmployeeById(employeeId);
            return employee != null ? employee.houseId() : null;
        } catch (Exception e) {
            log.warn("Failed to get employee info for id: {}", employeeId, e);
            return null;
        }
    }

    /**
     * Get roommate list for a house
     */
    private List<HouseDTO.ResidentInfo> getRoommates(Long houseId) {
        List<EmployeeServiceClient.EmployeeInfo> employees = 
                employeeServiceClient.getEmployeesByHouseId(houseId);

        return employees.stream()
                .map(emp -> HouseDTO.ResidentInfo.builder()
                        .employeeId(emp.id())
                        .name(emp.getDisplayName())
                        .phone(emp.cellPhone())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Build HR detail view response
     */
    private HouseDTO.UnifiedDetailResponse buildHRDetailView(House house) {
        Integer employeeCount = employeeServiceClient.countEmployeesByHouseId(house.getId());

        // Get facility summary
        Map<String, Integer> facilitySummary = new HashMap<>();
        List<FacilityDTO.Response> facilityResponses = new ArrayList<>();

        if (house.getFacilities() != null) {
            for (Facility facility : house.getFacilities()) {
                facilitySummary.merge(facility.getType(), 
                        facility.getQuantity() != null ? facility.getQuantity() : 0, 
                        Integer::sum);

                facilityResponses.add(FacilityDTO.Response.builder()
                        .id(facility.getId())
                        .houseId(house.getId())
                        .type(facility.getType())
                        .description(facility.getDescription())
                        .quantity(facility.getQuantity())
                        .build());
            }
        }

        Landlord landlord = house.getLandlord();
        LandlordDTO.Response landlordResponse = LandlordDTO.Response.builder()
                .id(landlord.getId())
                .firstName(landlord.getFirstName())
                .lastName(landlord.getLastName())
                .fullName(landlord.getFullName())
                .email(landlord.getEmail())
                .cellPhone(landlord.getCellPhone())
                .build();

        return HouseDTO.UnifiedDetailResponse.builder()
                .id(house.getId())
                .address(house.getAddress())
                .maxOccupant(house.getMaxOccupant())
                .numberOfEmployees(employeeCount)
                .landlord(landlordResponse)
                .facilitySummary(facilitySummary)
                .facilities(facilityResponses)
                .viewType(HR_VIEW)
                .build();
    }

    /**
     * Build Employee detail view response
     */
    private HouseDTO.UnifiedDetailResponse buildEmployeeDetailView(House house) {
        List<HouseDTO.ResidentInfo> roommates = getRoommates(house.getId());

        return HouseDTO.UnifiedDetailResponse.builder()
                .id(house.getId())
                .address(house.getAddress())
                .roommates(roommates)
                .viewType(EMPLOYEE_VIEW)
                .build();
    }

    /**
     * Build HR list view response
     */
    private HouseDTO.UnifiedListResponse buildHRListView(House house) {
        Integer employeeCount = employeeServiceClient.countEmployeesByHouseId(house.getId());
        Landlord landlord = house.getLandlord();

        return HouseDTO.UnifiedListResponse.builder()
                .id(house.getId())
                .address(house.getAddress())
                .maxOccupant(house.getMaxOccupant())
                .numberOfEmployees(employeeCount)
                .landlordId(landlord.getId())
                .landlordFullName(landlord.getFullName())
                .landlordPhone(landlord.getCellPhone())
                .landlordEmail(landlord.getEmail())
                .viewType(HR_VIEW)
                .build();
    }

    /**
     * Build Employee list view response
     */
    private HouseDTO.UnifiedListResponse buildEmployeeListView(House house) {
        List<HouseDTO.ResidentInfo> roommates = getRoommates(house.getId());

        return HouseDTO.UnifiedListResponse.builder()
                .id(house.getId())
                .address(house.getAddress())
                .roommates(roommates)
                .viewType(EMPLOYEE_VIEW)
                .build();
    }

    /**
     * Build employee view response (original format)
     */
    private HouseDTO.EmployeeViewResponse buildEmployeeViewResponse(House house) {
        List<HouseDTO.ResidentInfo> roommates = getRoommates(house.getId());

        return HouseDTO.EmployeeViewResponse.builder()
                .id(house.getId())
                .address(house.getAddress())
                .residents(roommates)
                .build();
    }

    /**
     * Map House to ListResponse (HR view)
     */
    private HouseDTO.ListResponse mapToListResponse(House house, Integer employeeCount) {
        Landlord landlord = house.getLandlord();
        
        return HouseDTO.ListResponse.builder()
                .id(house.getId())
                .address(house.getAddress())
                .maxOccupant(house.getMaxOccupant())
                .numberOfEmployees(employeeCount)
                .landlordId(landlord.getId())
                .landlordFullName(landlord.getFullName())
                .landlordPhone(landlord.getCellPhone())
                .landlordEmail(landlord.getEmail())
                .build();
    }

    /**
     * Map House to DetailResponse (HR view)
     */
    private HouseDTO.DetailResponse mapToDetailResponse(House house) {
        Integer employeeCount = employeeServiceClient.countEmployeesByHouseId(house.getId());

        // Get facility summary
        Map<String, Integer> facilitySummary = new HashMap<>();
        List<FacilityDTO.Response> facilityResponses = new ArrayList<>();

        if (house.getFacilities() != null) {
            for (Facility facility : house.getFacilities()) {
                facilitySummary.merge(facility.getType(), 
                        facility.getQuantity() != null ? facility.getQuantity() : 0, 
                        Integer::sum);

                facilityResponses.add(FacilityDTO.Response.builder()
                        .id(facility.getId())
                        .houseId(house.getId())
                        .type(facility.getType())
                        .description(facility.getDescription())
                        .quantity(facility.getQuantity())
                        .build());
            }
        }

        Landlord landlord = house.getLandlord();
        LandlordDTO.Response landlordResponse = LandlordDTO.Response.builder()
                .id(landlord.getId())
                .firstName(landlord.getFirstName())
                .lastName(landlord.getLastName())
                .fullName(landlord.getFullName())
                .email(landlord.getEmail())
                .cellPhone(landlord.getCellPhone())
                .build();

        return HouseDTO.DetailResponse.builder()
                .id(house.getId())
                .address(house.getAddress())
                .maxOccupant(house.getMaxOccupant())
                .numberOfEmployees(employeeCount)
                .landlord(landlordResponse)
                .facilitySummary(facilitySummary)
                .facilities(facilityResponses)
                .build();
    }
}
