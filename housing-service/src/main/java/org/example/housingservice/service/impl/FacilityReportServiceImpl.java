package org.example.housingservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.housingservice.client.EmailServiceClient;
import org.example.housingservice.client.EmployeeServiceClient;
import org.example.housingservice.dto.FacilityReportDTO;
import org.example.housingservice.dto.FacilityReportDetailDTO;
import org.example.housingservice.dto.FacilityReportEmailRequest;
import org.example.housingservice.entity.Facility;
import org.example.housingservice.entity.FacilityReport;
import org.example.housingservice.entity.FacilityReportDetail;
import org.example.housingservice.enums.FacilityReportStatus;
import org.example.housingservice.exception.ResourceNotFoundException;
import org.example.housingservice.exception.UnauthorizedException;
import org.example.housingservice.repository.FacilityReportDetailRepository;
import org.example.housingservice.repository.FacilityReportRepository;
import org.example.housingservice.repository.FacilityRepository;
import org.example.housingservice.service.FacilityReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Facility Report Service Implementation
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FacilityReportServiceImpl implements FacilityReportService {

    private final FacilityReportRepository reportRepository;
    private final FacilityReportDetailRepository commentRepository;
    private final FacilityRepository facilityRepository;
    private final EmployeeServiceClient employeeServiceClient;
    private final EmailServiceClient emailServiceClient;

    // ==================== Report Management ====================

    @Override
    @Transactional
    public FacilityReportDTO.DetailResponse createReport(FacilityReportDTO.CreateRequest request, Long employeeId) {
        log.info("Creating facility report by employee: {}, facilityId: {}", employeeId, request.getFacilityId());

        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", request.getFacilityId()));

        FacilityReport report = FacilityReport.builder()
                .facility(facility)
                .employeeId(employeeId)
                .title(request.getTitle())
                .description(request.getDescription())
                .createDate(LocalDateTime.now())
                .status(FacilityReportStatus.Open)  // NewCreateReports default to Open Status
                .build();

        FacilityReport saved = reportRepository.save(report);
        log.info("Facility report created with id: {}", saved.getId());

        return mapToDetailResponse(saved, employeeId);
    }

    @Override
    public FacilityReportDTO.DetailResponse getReportById(Long id, Long currentEmployeeId) {
        FacilityReport report = reportRepository.findByIdWithComments(id)
                .orElseThrow(() -> new ResourceNotFoundException("FacilityReport", "id", id));

        return mapToDetailResponse(report, currentEmployeeId);
    }

    @Override
    public Page<FacilityReportDTO.ListItem> getReportsByHouseId(Long houseId, Pageable pageable) {
        return reportRepository.findByHouseIdOrderByCreateDateDesc(houseId, pageable)
                .map(this::mapToListItem);
    }

    @Override
    public List<FacilityReportDTO.ListItem> getAllReportsByHouseId(Long houseId) {
        return reportRepository.findByHouseIdOrderByCreateDateDesc(houseId)
                .stream()
                .map(this::mapToListItem)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FacilityReportDTO.DetailResponse updateReportStatus(Long id, FacilityReportDTO.UpdateStatusRequest request) {
        log.info("Updating report status: {}, newStatus: {}", id, request.getStatus());

        FacilityReport report = findReportById(id);
        report.setStatus(request.getStatus());

        FacilityReport updated = reportRepository.save(report);

        // NEW: Send email notification
        sendStatusUpdateEmail(updated);

        return mapToDetailResponse(updated, null);
    }

    @Override
    @Transactional
    public FacilityReportDTO.DetailResponse updateReport(Long id, FacilityReportDTO.UpdateRequest request, Long employeeId) {
        log.info("Updating report: {}, by employee: {}", id, employeeId);

        FacilityReport report = findReportById(id);

        // Check if is reportCreateuser
        if (!report.getEmployeeId().equals(employeeId)) {
            throw new UnauthorizedException("You can only update your own reports");
        }

        if (request.getTitle() != null) {
            report.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            report.setDescription(request.getDescription());
        }

        FacilityReport updated = reportRepository.save(report);
        return mapToDetailResponse(updated, employeeId);
    }

    // ==================== CommentManagement ====================

    @Override
    @Transactional
    public FacilityReportDetailDTO.Response addComment(FacilityReportDetailDTO.CreateRequest request, Long employeeId) {
        log.info("Adding comment to report: {}, by employee: {}", request.getFacilityReportId(), employeeId);

        FacilityReport report = findReportById(request.getFacilityReportId());

        FacilityReportDetail comment = FacilityReportDetail.builder()
                .facilityReport(report)
                .employeeId(employeeId)
                .comment(request.getComment())
                .createDate(LocalDateTime.now())
                .build();

        FacilityReportDetail saved = commentRepository.save(comment);
        log.info("Comment added with id: {}", saved.getId());

        return mapToCommentResponse(saved, employeeId);
    }

    @Override
    @Transactional
    public FacilityReportDetailDTO.Response updateComment(Long commentId, FacilityReportDetailDTO.UpdateRequest request, Long employeeId) {
        log.info("Updating comment: {}, by employee: {}", commentId, employeeId);

        FacilityReportDetail comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        // Check if isCommentCreateuser
        if (!comment.getEmployeeId().equals(employeeId)) {
            throw new UnauthorizedException("You can only update your own comments");
        }

        comment.setComment(request.getComment());
        FacilityReportDetail updated = commentRepository.save(comment);

        return mapToCommentResponse(updated, employeeId);
    }

    @Override
    public List<FacilityReportDetailDTO.Response> getCommentsByReportId(Long reportId, Long currentEmployeeId) {
        // Validatereport exists
        if (!reportRepository.existsById(reportId)) {
            throw new ResourceNotFoundException("FacilityReport", "id", reportId);
        }

        return commentRepository.findByFacilityReportIdOrderByCreateDateAsc(reportId)
                .stream()
                .map(comment -> mapToCommentResponse(comment, currentEmployeeId))
                .collect(Collectors.toList());
    }

    // ==================== employeeview ====================

    @Override
    public List<FacilityReportDTO.ListItem> getReportsByEmployeeId(Long employeeId) {
        return reportRepository.findByEmployeeIdOrderByCreateDateDesc(employeeId)
                .stream()
                .map(this::mapToListItem)
                .collect(Collectors.toList());
    }

    @Override
    public FacilityReportDTO.EmployeeViewResponse getReportForEmployee(Long reportId, Long employeeId) {
        FacilityReport report = reportRepository.findByIdWithComments(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("FacilityReport", "id", reportId));

        // Get reportsCreateusername
        String createdBy = getEmployeeName(report.getEmployeeId());

        List<FacilityReportDetailDTO.Response> comments = report.getComments()
                .stream()
                .map(comment -> mapToCommentResponse(comment, employeeId))
                .collect(Collectors.toList());

        return FacilityReportDTO.EmployeeViewResponse.builder()
                .id(report.getId())
                .title(report.getTitle())
                .description(report.getDescription())
                .createdBy(createdBy)
                .createDate(report.getCreateDate())
                .status(report.getStatus())
                .statusDisplayName(report.getStatus().getDisplayName())
                .comments(comments)
                .build();
    }


    @Override
    public List<FacilityReportDTO.ListItem> getReportsForCurrentHouse(Long houseId) {
        log.debug("Getting all facility reports for house: {}", houseId);

        if (houseId == null) {
            log.warn("House ID is null, returning empty list");
            return List.of();
        }

        return reportRepository.findByHouseIdOrderByCreateDateDesc(houseId)
                .stream()
                .map(this::mapToListItem)
                .collect(Collectors.toList());
    }

    // ==================== Private Helper Methods ====================

    private FacilityReport findReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FacilityReport", "id", id));
    }

    private String getEmployeeName(Long userId) {
        try {
            // Use getEmployeeByUserId instead of getEmployeeById
            EmployeeServiceClient.EmployeeInfo employee =
                    employeeServiceClient.getEmployeeByUserId(userId);
            if (employee != null && employee.firstName() != null) {
                return employee.getDisplayName();
            }
            return "Unknown";
        } catch (Exception e) {
            log.warn("Failed to get employee name for userId: {}", userId);
            return "Unknown";
        }
    }

    private FacilityReportDTO.ListItem mapToListItem(FacilityReport report) {
        return FacilityReportDTO.ListItem.builder()
                .id(report.getId())
                .title(report.getTitle())
                .createDate(report.getCreateDate())
                .status(report.getStatus())
                .statusDisplayName(report.getStatus().getDisplayName())
                .build();
    }

    private FacilityReportDTO.DetailResponse mapToDetailResponse(FacilityReport report, Long currentEmployeeId) {
        Facility facility = report.getFacility();

        // Get reportsCreateusername
        String createdBy = getEmployeeName(report.getEmployeeId());

        // mappingComment
        List<FacilityReportDetailDTO.Response> comments = report.getComments() != null
                ? report.getComments().stream()
                        .map(comment -> mapToCommentResponse(comment, currentEmployeeId))
                        .collect(Collectors.toList())
                : List.of();

        return FacilityReportDTO.DetailResponse.builder()
                .id(report.getId())
                .facilityId(facility.getId())
                .facilityType(facility.getType())
                .houseId(facility.getHouse().getId())
                .houseAddress(facility.getHouse().getAddress())
                .title(report.getTitle())
                .description(report.getDescription())
                .employeeId(report.getEmployeeId())
                .createdBy(createdBy)
                .createDate(report.getCreateDate())
                .status(report.getStatus())
                .statusDisplayName(report.getStatus().getDisplayName())
                .comments(comments)
                .build();
    }

    private FacilityReportDetailDTO.Response mapToCommentResponse(FacilityReportDetail comment, Long currentEmployeeId) {
        String createdBy = getEmployeeName(comment.getEmployeeId());
        
        // determinecurrent userisnocanedit thisComment
        boolean canEdit = currentEmployeeId != null && currentEmployeeId.equals(comment.getEmployeeId());

        return FacilityReportDetailDTO.Response.builder()
                .id(comment.getId())
                .facilityReportId(comment.getFacilityReport().getId())
                .employeeId(comment.getEmployeeId())
                .createdBy(createdBy)
                .comment(comment.getComment())
                .createDate(comment.getCreateDate())
                .lastModificationDate(comment.getLastModificationDate())
                .displayDate(comment.getDisplayDate())
                .canEdit(canEdit)
                .build();
    }

    /**
     * Send email notification when report status is updated
     */
    private void sendStatusUpdateEmail(FacilityReport report) {
        try {
            // Get employee info by userId (stored as employeeId in report)
            EmployeeServiceClient.EmployeeInfo employee =
                    employeeServiceClient.getEmployeeByUserId(report.getEmployeeId());

            if (employee != null && employee.email() != null) {
                EmailServiceClient.FacilityReportEmailRequest emailRequest =
                        new EmailServiceClient.FacilityReportEmailRequest(
                                employee.email(),
                                employee.getFullName(),
                                report.getTitle(),
                                report.getStatus().getDisplayName()
                        );

                // Send async email
                emailServiceClient.sendFacilityReportEmailAsync(emailRequest);
                log.info("Facility report status email queued for: {}", employee.email());
            }
        } catch (Exception e) {
            // Don't fail the status update if email fails
            log.error("Failed to send facility report status email: {}", e.getMessage());
        }
    }
}
