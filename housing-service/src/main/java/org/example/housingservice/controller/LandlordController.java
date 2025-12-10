package org.example.housingservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.housingservice.dto.ApiResponse;
import org.example.housingservice.dto.LandlordDTO;
import org.example.housingservice.exception.ForbiddenException;
import org.example.housingservice.service.LandlordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Landlord Management Controller (HR functionality)
 */
@RestController
@RequestMapping("/api/housing/landlords")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Landlord Management", description = "Landlord management APIs (HR)")
public class LandlordController {

    private final LandlordService landlordService;

    @PostMapping
    @Operation(summary = "Create landlord", description = "HR creates new landlord information")
    public ResponseEntity<ApiResponse<LandlordDTO.Response>> createLandlord(
            @RequestHeader("X-User-Roles") String userRoles,
            @Valid @RequestBody LandlordDTO.CreateRequest request) {

        if (!userRoles.equals("HR")) {
            throw new ForbiddenException("Only HR can create landlords");
        }

        log.info("Creating landlord: {} {}", request.getFirstName(), request.getLastName());
        LandlordDTO.Response landlord = landlordService.createLandlord(request);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Landlord created successfully", landlord));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get landlord details", description = "Get landlord information by ID")
    public ResponseEntity<ApiResponse<LandlordDTO.Response>> getLandlordById(@PathVariable Long id) {
        LandlordDTO.Response landlord = landlordService.getLandlordById(id);
        return ResponseEntity.ok(ApiResponse.success(landlord));
    }

    @GetMapping
    @Operation(summary = "Get all landlords", description = "Get list of all landlords")
    public ResponseEntity<ApiResponse<List<LandlordDTO.Response>>> getAllLandlords(
            @RequestHeader("X-User-Roles") String userRoles
    ) {

        if (!userRoles.equals("HR")) {
            throw new ForbiddenException("Only HR can view landlords");
        }

        List<LandlordDTO.Response> landlords = landlordService.getAllLandlords();

        return ResponseEntity.ok(ApiResponse.success(landlords));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update landlord", description = "Update landlord information")
    public ResponseEntity<ApiResponse<LandlordDTO.Response>> updateLandlord(
            @RequestHeader("X-User-Roles") String userRoles,
            @PathVariable Long id,
            @Valid @RequestBody LandlordDTO.UpdateRequest request) {

        if (!userRoles.equals("HR")) {
            throw new ForbiddenException("Only HR can update landlord");
        }

        log.info("Updating landlord: {}", id);
        LandlordDTO.Response landlord = landlordService.updateLandlord(id, request);
        
        return ResponseEntity.ok(ApiResponse.success("Landlord updated successfully", landlord));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete landlord", description = "Delete landlord information")
    public ResponseEntity<ApiResponse<Void>> deleteLandlord(
            @RequestHeader("X-User-Roles") String userRoles,
            @PathVariable Long id) {

        if (!userRoles.equals("HR")) {
            throw new ForbiddenException("Only HR can delete landlord");
        }

        log.info("Deleting landlord: {}", id);
        landlordService.deleteLandlord(id);
        return ResponseEntity.ok(ApiResponse.success("Landlord deleted successfully"));
    }

    @GetMapping("/search")
    @Operation(summary = "Search landlords", description = "Search landlords by name")
    public ResponseEntity<ApiResponse<List<LandlordDTO.Response>>> searchLandlords(
            @RequestParam String keyword) {
        List<LandlordDTO.Response> landlords = landlordService.searchLandlords(keyword);
        return ResponseEntity.ok(ApiResponse.success(landlords));
    }
}
