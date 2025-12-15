package org.example.housingservice.service;

import org.example.housingservice.dto.FacilityReportDTO;
import org.example.housingservice.dto.FacilityReportDetailDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Facility Report Service Interface
 */
public interface FacilityReportService {

    // ==================== Report Management ====================

    /**
     * CreateFacility Report
     *
     * PDF: Employees should be able to report a facility issue in the house
     *
     * @param request CreateRequest
     * @param employeeId Reporter employeeID
     * @return CreateReports
     */
    FacilityReportDTO.DetailResponse createReport(FacilityReportDTO.CreateRequest request, Long employeeId);

    /**
     * Get reportsDetail
     *
     * @param id reportID
     * @param currentEmployeeId current userID（to determineCommentwhether editable）
     * @return reportDetail（containsComment）
     */
    FacilityReportDTO.DetailResponse getReportById(Long id, Long currentEmployeeId);

    /**
     * GetHouse allreport（pagination）
     *
     * PDF: Each page should only display 3-5 reports, sorted by created date
     */
    Page<FacilityReportDTO.ListItem> getReportsByHouseId(Long houseId, Pageable pageable);

    /**
     * GetHouse allreport（notpagination）
     */
    List<FacilityReportDTO.ListItem> getAllReportsByHouseId(Long houseId);

    /**
     * UpdateReport status
     *
     * HR canUpdateReport status
     */
    FacilityReportDTO.DetailResponse updateReportStatus(Long id, FacilityReportDTO.UpdateStatusRequest request);

    /**
     * Updatereportcontent
     *
     * OnlyreportCreateusercanUpdate
     */
    FacilityReportDTO.DetailResponse updateReport(Long id, FacilityReportDTO.UpdateRequest request, Long employeeId);

    // ==================== CommentManagement ====================

    /**
     * AddComment
     *
     * PDF: Employees can add comments or update comments which are created by the employee
     * HR can add comments or update comments which are created by HR
     */
    FacilityReportDetailDTO.Response addComment(FacilityReportDetailDTO.CreateRequest request, Long employeeId);

    /**
     * UpdateComment
     *
     * OnlyCommentCreateusercanUpdateown Comment
     */
    FacilityReportDetailDTO.Response updateComment(Long commentId, FacilityReportDetailDTO.UpdateRequest request, Long employeeId);

    /**
     * Get reports allComment
     */
    List<FacilityReportDetailDTO.Response> getCommentsByReportId(Long reportId, Long currentEmployeeId);

    // ==================== employeeview ====================

    /**
     * employeeview own submitted allreport
     */
    List<FacilityReportDTO.ListItem> getReportsByEmployeeId(Long employeeId);

    /**
     * employeeviewGet reportsDetail
     */
    FacilityReportDTO.EmployeeViewResponse getReportForEmployee(Long reportId, Long employeeId);

    /**
     * Get all facility reports for current employee's assigned house
     *
     * This allows employees to see all reports for their house (including roommates' reports)
     *
     * @param houseId The house ID from JWT (X-House-Id header)
     * @return List of all reports for the house
     */
    List<FacilityReportDTO.ListItem> getReportsForCurrentHouse(Long houseId);
}
