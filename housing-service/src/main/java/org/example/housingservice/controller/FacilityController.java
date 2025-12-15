package org.example.housingservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.housingservice.dto.ApiResponse;
import org.example.housingservice.dto.FacilityDTO;
import org.example.housingservice.exception.ForbiddenException;
import org.example.housingservice.service.FacilityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Facility Management Controller (HR functionality)
 */
@RestController
@RequestMapping("/facilities")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Facility Management", description = "Facility management APIs (HR)")
public class FacilityController {

    private final FacilityService facilityService;

    /**
     * Add facility to house
     */
    @PostMapping
    @Operation(summary = "Add facility", description = "HR adds facility to a house")
    public ResponseEntity<ApiResponse<FacilityDTO.Response>> addFacility(
            @RequestHeader("X-User-Roles") String userRoles,
            @Valid @RequestBody FacilityDTO.CreateRequest request) {

        if (!userRoles.contains("HR")) {
            throw new ForbiddenException("Only HR can add facility");
        }

        log.info("Adding facility to house: {}, type: {}", request.getHouseId(), request.getType());
        FacilityDTO.Response facility = facilityService.addFacility(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Facility added successfully", facility));
    }

    /**
     * Get facility details
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get facility details", description = "Get facility information by ID")
    public ResponseEntity<ApiResponse<FacilityDTO.Response>> getFacilityById(
            @RequestHeader("X-User-Roles") String userRoles,
            @PathVariable Long id) {

        if (!userRoles.contains("HR")) {
            throw new ForbiddenException("Only HR can check facility details");
        }

        FacilityDTO.Response facility = facilityService.getFacilityById(id);
        return ResponseEntity.ok(ApiResponse.success(facility));
    }

    /**
     * Get all facilities of a house
     */
    @GetMapping("/house/{houseId}")
    @Operation(summary = "Get house facilities", description = "Get all facilities of a specified house")
    public ResponseEntity<ApiResponse<List<FacilityDTO.Response>>> getFacilitiesByHouseId(
            @PathVariable Long houseId) {

        List<FacilityDTO.Response> facilities = facilityService.getFacilitiesByHouseId(houseId);
        return ResponseEntity.ok(ApiResponse.success(facilities));
    }

    /**
     * Get facility summary for a house
     *
     * PDF: Facility Information (Number of Beds, Mattress, Tables, Chairs)
     */
    @GetMapping("/house/{houseId}/summary")
    @Operation(summary = "Get facility summary", description = "Get facility statistics for a house")
    public ResponseEntity<ApiResponse<List<FacilityDTO.Summary>>> getFacilitySummary(
            @RequestHeader("X-User-Roles") String userRoles,
            @PathVariable Long houseId) {

        if (!userRoles.contains("HR")) {
            throw new ForbiddenException("Only HR can check facility summary");
        }

        List<FacilityDTO.Summary> summary = facilityService.getFacilitySummaryByHouseId(houseId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    /**
     * Update facility
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update facility", description = "Update facility information")
    public ResponseEntity<ApiResponse<FacilityDTO.Response>> updateFacility(
            @RequestHeader("X-User-Roles") String userRoles,
            @PathVariable Long id,
            @Valid @RequestBody FacilityDTO.UpdateRequest request) {

        if (!userRoles.contains("HR")) {
            throw new ForbiddenException("Only HR can update facility");
        }

        log.info("Updating facility: {}", id);
        FacilityDTO.Response facility = facilityService.updateFacility(id, request);

        return ResponseEntity.ok(ApiResponse.success("Facility updated successfully", facility));
    }

    /**
     * Delete facility
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete facility", description = "Delete a facility")
    public ResponseEntity<ApiResponse<Void>> deleteFacility(
            @RequestHeader("X-User-Roles") String userRoles,
            @PathVariable Long id) {

        if (!userRoles.contains("HR")) {
            throw new ForbiddenException("Only HR can delete facility");
        }

        log.info("Deleting facility: {}", id);
        facilityService.deleteFacility(id);
        return ResponseEntity.ok(ApiResponse.success("Facility deleted successfully"));
    }
}
