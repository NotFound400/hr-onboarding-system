package org.example.housingservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.housingservice.context.UserContext;
import org.example.housingservice.dto.ApiResponse;
import org.example.housingservice.dto.HouseDTO;
import org.example.housingservice.service.HouseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * House Management Controller
 * 
 * Provides unified endpoints that return different views based on user role:
 * - HR: Full access to all houses with detailed information
 * - Employee: Limited access to their assigned house with roommate info
 * 
 * User role is extracted from X-User-Roles header set by API Gateway
 */
@RestController
@RequestMapping("/api/housing/houses")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "House Management", description = "House management APIs with role-based views")
public class HouseController {

    private final HouseService houseService;

    // ==================== Unified Role-based Endpoints ====================

    /**
     * Get all houses (Unified API - returns different views based on role)
     * 
     * HR View: All houses with Address, Number of Employees, Landlord Info
     * Employee View: Only their assigned house with Address and Roommate list
     */
    @GetMapping
    @Operation(
        summary = "Get all houses (role-based)",
        description = "Returns different data based on user role. HR sees all houses with full info. Employee sees only their assigned house."
    )
    public ResponseEntity<ApiResponse<List<HouseDTO.UnifiedListResponse>>> getAllHouses(
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Parameter(hidden = true) @RequestHeader(value = "X-Username", required = false) String username,
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        
        UserContext userContext = buildUserContext(userId, username, roles);
        log.info("Getting all houses for user: {}, roles: {}", userId, roles);
        
        List<HouseDTO.UnifiedListResponse> houses = houseService.getAllHouses(userContext);
        return ResponseEntity.ok(ApiResponse.success(houses));
    }

    /**
     * Get house detail by ID (Unified API - returns different views based on role)
     * 
     * HR View: Full house info + landlord + facilities + employee count
     * Employee View: Address + Roommate list (must be assigned to this house)
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Get house detail (role-based)",
        description = "Returns different data based on user role. HR sees full info. Employee sees address and roommates (only for their assigned house)."
    )
    public ResponseEntity<ApiResponse<HouseDTO.UnifiedDetailResponse>> getHouseDetail(
            @PathVariable Long id,
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Parameter(hidden = true) @RequestHeader(value = "X-Username", required = false) String username,
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        
        UserContext userContext = buildUserContext(userId, username, roles);
        log.info("Getting house detail for id: {}, user: {}, roles: {}", id, userId, roles);
        
        HouseDTO.UnifiedDetailResponse house = houseService.getHouseDetail(id, userContext);
        return ResponseEntity.ok(ApiResponse.success(house));
    }

    // ==================== HR Specific Endpoints ====================

    /**
     * Create house (HR only)
     */
    @PostMapping
    @Operation(summary = "Create house (HR only)", description = "HR creates a new house")
    public ResponseEntity<ApiResponse<HouseDTO.DetailResponse>> createHouse(
            @Valid @RequestBody HouseDTO.CreateRequest request,
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        
        // Note: Role validation should ideally be done in a security filter or aspect
        log.info("Creating house at address: {}, roles: {}", request.getAddress(), roles);
        HouseDTO.DetailResponse house = houseService.createHouse(request);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("House created successfully", house));
    }

    /**
     * Update house (HR only)
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update house (HR only)", description = "HR updates house information")
    public ResponseEntity<ApiResponse<HouseDTO.DetailResponse>> updateHouse(
            @PathVariable Long id,
            @Valid @RequestBody HouseDTO.UpdateRequest request,
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        
        log.info("Updating house: {}, roles: {}", id, roles);
        HouseDTO.DetailResponse house = houseService.updateHouse(id, request);
        
        return ResponseEntity.ok(ApiResponse.success("House updated successfully", house));
    }

    /**
     * Delete house (HR only)
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete house (HR only)", description = "HR deletes a house")
    public ResponseEntity<ApiResponse<Void>> deleteHouse(
            @PathVariable Long id,
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        
        log.info("Deleting house: {}, roles: {}", id, roles);
        houseService.deleteHouse(id);
        return ResponseEntity.ok(ApiResponse.success("House deleted successfully"));
    }

    /**
     * Get all houses for HR (explicit HR endpoint)
     * 
     * PDF: HR should be able to view all houses with:
     * Address, Number of Employees, Landlord Info (Full Name, Phone, Email)
     */
    @GetMapping("/hr/list")
    @Operation(summary = "Get all houses (HR explicit)", description = "HR gets all houses with full information")
    public ResponseEntity<ApiResponse<List<HouseDTO.ListResponse>>> getAllHousesForHR() {
        List<HouseDTO.ListResponse> houses = houseService.getAllHousesForHR();
        return ResponseEntity.ok(ApiResponse.success(houses));
    }

    /**
     * Get house detail for HR (explicit HR endpoint)
     * 
     * PDF: HR can view house details:
     * - Basic House Information (Address, Landlord, Phone, Email, Number of People)
     * - Facility Information (Number of Beds, Mattress, Tables, Chairs)
     */
    @GetMapping("/hr/{id}")
    @Operation(summary = "Get house detail (HR explicit)", description = "HR gets house detail with full information")
    public ResponseEntity<ApiResponse<HouseDTO.DetailResponse>> getHouseDetailForHR(@PathVariable Long id) {
        HouseDTO.DetailResponse house = houseService.getHouseDetailForHR(id);
        return ResponseEntity.ok(ApiResponse.success(house));
    }

    // ==================== Employee Specific Endpoints ====================

    /**
     * Get my assigned house (Employee)
     * 
     * PDF: The employee will be assigned to a house when their registration token has been generated.
     * Employees can only view the details about the house.
     * 
     * Returns: Address, List of employees who live in the house (Name, Phone)
     */
    @GetMapping("/my-house")
    @Operation(summary = "Get my assigned house (Employee)", description = "Employee gets their assigned house with roommate info")
    public ResponseEntity<ApiResponse<HouseDTO.EmployeeViewResponse>> getMyHouse(
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        Long employeeId = userId != null ? userId : 1L;
        log.info("Getting house for employee: {}", employeeId);
        
        HouseDTO.EmployeeViewResponse house = houseService.getMyHouse(employeeId);
        
        if (house == null) {
            return ResponseEntity.ok(ApiResponse.success("You are not assigned to any house", null));
        }
        
        return ResponseEntity.ok(ApiResponse.success(house));
    }

    /**
     * Get house detail for employee (explicit Employee endpoint)
     * Employee can only view their assigned house
     */
    @GetMapping("/employee/{id}")
    @Operation(summary = "Get house detail (Employee explicit)", description = "Employee gets house detail (must be assigned to this house)")
    public ResponseEntity<ApiResponse<HouseDTO.EmployeeViewResponse>> getHouseForEmployee(
            @PathVariable Long id,
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        Long employeeId = userId != null ? userId : 1L;
        HouseDTO.EmployeeViewResponse house = houseService.getHouseForEmployee(id, employeeId);
        return ResponseEntity.ok(ApiResponse.success(house));
    }

    // ==================== Common Endpoints ====================

    /**
     * Get house summaries (for dropdown selections)
     */
    @GetMapping("/summaries")
    @Operation(summary = "Get house summaries", description = "Get all house summaries for dropdown selections")
    public ResponseEntity<ApiResponse<List<HouseDTO.Summary>>> getAllHouseSummaries() {
        List<HouseDTO.Summary> summaries = houseService.getAllHouseSummaries();
        return ResponseEntity.ok(ApiResponse.success(summaries));
    }

    /**
     * Get single house summary
     */
    @GetMapping("/{id}/summary")
    @Operation(summary = "Get house summary", description = "Get single house summary")
    public ResponseEntity<ApiResponse<HouseDTO.Summary>> getHouseSummary(@PathVariable Long id) {
        HouseDTO.Summary summary = houseService.getHouseSummary(id);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    // ==================== Helper Methods ====================

    /**
     * Build UserContext from request headers
     * If headers are missing, creates a default user context for testing
     */
    private UserContext buildUserContext(Long userId, String username, String roles) {
        if (userId == null && roles == null) {
            // For testing without Gateway - default to HR
            log.warn("No user context headers found, using default HR user for testing");
            return UserContext.hrUser(1L);
        }
        return UserContext.fromHeaders(userId, username, roles);
    }
}
