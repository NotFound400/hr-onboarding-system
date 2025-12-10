package org.example.housingservice.service;

import org.example.housingservice.context.UserContext;
import org.example.housingservice.dto.HouseDTO;
import org.example.housingservice.exception.ForbiddenException;

import java.util.List;

/**
 * House Service Interface
 * 
 * Provides role-based access to house information:
 * - HR: Full access to all houses with detailed information
 * - Employee: Limited access to their assigned house with roommate info
 */
public interface HouseService {

    // ==================== Role-based Unified Methods ====================

    /**
     * Get house detail based on user role (Unified API)
     * 
     * Same endpoint returns different views:
     * - HR: Full house info + landlord + facilities
     * - Employee: Address + roommate list (must be assigned to this house)
     * 
     * @param houseId House ID
     * @param userContext User context containing userId and roles
     * @return UnifiedDetailResponse with role-appropriate data
     */
    HouseDTO.UnifiedDetailResponse getHouseDetail(Long houseId, UserContext userContext);

    /**
     * Get all houses list based on user role (Unified API)
     * 
     * - HR: All houses with landlord info and employee count
     * - Employee: Only their assigned house with roommate info
     * 
     * @param userContext User context containing userId and roles
     * @return List of houses with role-appropriate data
     */
    List<HouseDTO.UnifiedListResponse> getAllHouses(UserContext userContext);

    // ==================== HR Specific Methods ====================

    /**
     * Create house (HR only)
     */
    HouseDTO.DetailResponse createHouse(HouseDTO.CreateRequest request);

    /**
     * Get house detail for HR
     * 
     * PDF: HR can view house details:
     * - Basic House Information (Address, Landlord, Phone, Email, Number of People)
     * - Facility Information (Number of Beds, Mattress, Tables, Chairs)
     */
    HouseDTO.DetailResponse getHouseDetailForHR(Long id);

    /**
     * Get all houses list for HR
     * 
     * PDF: HR should be able to view all houses with:
     * Address, Number of Employees, Landlord Info
     */
    List<HouseDTO.ListResponse> getAllHousesForHR();

    /**
     * Update house info (HR only)
     */
    HouseDTO.DetailResponse updateHouse(Long id, HouseDTO.UpdateRequest request);

    /**
     * Delete house (HR only)
     */
    void deleteHouse(Long id);

    // ==================== Employee Specific Methods ====================

    /**
     * Get house detail for Employee
     * 
     * PDF: The employee will be assigned to a house when their registration token has been generated.
     * Employees can only view the details about the house, but can not change the house assigned to them.
     * 
     * Contains: Address, List of employees who live in the house (Name, Phone)
     * 
     * @param houseId House ID
     * @param employeeId Employee ID (for validation)
     * @return Employee view response
     * @throws ForbiddenException if employee is not assigned to this house
     */
    HouseDTO.EmployeeViewResponse getHouseForEmployee(Long houseId, Long employeeId);

    /**
     * Get employee's assigned house
     * 
     * @param employeeId Employee ID
     * @return Employee's house info, or null if not assigned
     */
    HouseDTO.EmployeeViewResponse getMyHouse(Long employeeId);

    // ==================== Common Methods ====================

    /**
     * Get house summary by ID
     */
    HouseDTO.Summary getHouseSummary(Long id);

    /**
     * Get all house summaries (for dropdown selections)
     */
    List<HouseDTO.Summary> getAllHouseSummaries();

    /**
     * Check if house exists
     */
    boolean existsById(Long id);

    // ==================== Deprecated Methods (for backward compatibility) ====================

    /**
     * @deprecated Use {@link #getAllHousesForHR()} instead
     */
    @Deprecated
    default List<HouseDTO.ListResponse> getAllHouses() {
        return getAllHousesForHR();
    }

    /**
     * @deprecated Use {@link #getHouseDetailForHR(Long)} instead
     */
    @Deprecated
    default HouseDTO.DetailResponse getHouseDetailById(Long id) {
        return getHouseDetailForHR(id);
    }

    /**
     * @deprecated Use {@link #getHouseForEmployee(Long, Long)} instead
     */
    @Deprecated
    default HouseDTO.EmployeeViewResponse getHouseForEmployee(Long houseId) {
        return getHouseForEmployee(houseId, null);
    }
}
