package org.example.housingservice.service;

import org.example.housingservice.client.EmployeeServiceClient;
import org.example.housingservice.dto.FacilityReportDTO;
import org.example.housingservice.dto.FacilityReportDetailDTO;
import org.example.housingservice.entity.*;
import org.example.housingservice.enums.FacilityReportStatus;
import org.example.housingservice.exception.ResourceNotFoundException;
import org.example.housingservice.exception.UnauthorizedException;
import org.example.housingservice.repository.FacilityReportDetailRepository;
import org.example.housingservice.repository.FacilityReportRepository;
import org.example.housingservice.repository.FacilityRepository;
import org.example.housingservice.service.impl.FacilityReportServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * FacilityReportService Unit Tests
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("FacilityReportService Unit Tests")
class FacilityReportServiceTest {

    @Mock
    private FacilityReportRepository reportRepository;

    @Mock
    private FacilityReportDetailRepository commentRepository;

    @Mock
    private FacilityRepository facilityRepository;

    @Mock
    private EmployeeServiceClient employeeServiceClient;

    @InjectMocks
    private FacilityReportServiceImpl reportService;

    private Landlord testLandlord;
    private House testHouse;
    private Facility testFacility;
    private FacilityReport testReport;

    @BeforeEach
    void setUp() {
        testLandlord = Landlord.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .build();

        testHouse = House.builder()
                .id(1L)
                .landlord(testLandlord)
                .address("123 Main Street")
                .build();

        testFacility = Facility.builder()
                .id(1L)
                .house(testHouse)
                .type("Bed")
                .description("Queen size bed")
                .quantity(2)
                .build();

        testReport = FacilityReport.builder()
                .id(1L)
                .facility(testFacility)
                .employeeId(100L)
                .title("Broken bed")
                .description("The bed frame is broken")
                .status(FacilityReportStatus.Open)
                .createDate(LocalDateTime.now())
                .comments(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("CreateFacility Report - Success")
    void createReport_Success() {
        // Given
        FacilityReportDTO.CreateRequest request = FacilityReportDTO.CreateRequest.builder()
                .facilityId(1L)
                .title("Broken bed")
                .description("The bed frame is broken")
                .build();

        when(facilityRepository.findById(1L)).thenReturn(Optional.of(testFacility));
        when(reportRepository.save(any(FacilityReport.class))).thenReturn(testReport);
        when(employeeServiceClient.getEmployeeByUserID(anyLong()))
                .thenReturn(new EmployeeServiceClient.EmployeeInfo(100L, "Test", "User", null, null, null, 1L));

        // When
        FacilityReportDTO.DetailResponse result = reportService.createReport(request, 100L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Broken bed");
        assertThat(result.getStatus()).isEqualTo(FacilityReportStatus.Open);
        verify(reportRepository).save(any(FacilityReport.class));
    }

    @Test
    @DisplayName("CreateFacility Report - When facility does not existThrowException")
    void createReport_FacilityNotFound_ThrowsException() {
        // Given
        FacilityReportDTO.CreateRequest request = FacilityReportDTO.CreateRequest.builder()
                .facilityId(999L)
                .title("Broken bed")
                .build();

        when(facilityRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> reportService.createReport(request, 100L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Facility");
    }

    @Test
    @DisplayName("UpdateReport status - Success")
    void updateReportStatus_Success() {
        // Given
        FacilityReportDTO.UpdateStatusRequest request = FacilityReportDTO.UpdateStatusRequest.builder()
                .status(FacilityReportStatus.InProgress)
                .build();

        when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));
        when(reportRepository.save(any(FacilityReport.class))).thenReturn(testReport);
        when(employeeServiceClient.getEmployeeByUserID(anyLong()))
                .thenReturn(new EmployeeServiceClient.EmployeeInfo(100L, "Test", "User", null, null, null, 1L));

        // When
        FacilityReportDTO.DetailResponse result = reportService.updateReportStatus(1L, request);

        // Then
        assertThat(result).isNotNull();
        verify(reportRepository).save(any(FacilityReport.class));
    }

    @Test
    @DisplayName("Updatereport - nonCreateuserUpdatewhenThrowException")
    void updateReport_NotCreator_ThrowsException() {
        // Given
        FacilityReportDTO.UpdateRequest request = FacilityReportDTO.UpdateRequest.builder()
                .title("Updated title")
                .build();

        when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));

        // When/Then - report is employeeId=100 Create ，but employeeId=200 attemptUpdate
        assertThatThrownBy(() -> reportService.updateReport(1L, request, 200L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("only update your own");
    }

    @Test
    @DisplayName("AddComment - Success")
    void addComment_Success() {
        // Given
        FacilityReportDetailDTO.CreateRequest request = FacilityReportDetailDTO.CreateRequest.builder()
                .facilityReportId(1L)
                .comment("This is a comment")
                .build();

        FacilityReportDetail savedComment = FacilityReportDetail.builder()
                .id(1L)
                .facilityReport(testReport)
                .employeeId(100L)
                .comment("This is a comment")
                .createDate(LocalDateTime.now())
                .build();

        when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));
        when(commentRepository.save(any(FacilityReportDetail.class))).thenReturn(savedComment);
        when(employeeServiceClient.getEmployeeByUserID(anyLong()))
                .thenReturn(new EmployeeServiceClient.EmployeeInfo(100L, "Test", "User", null, null, null, 1L));

        // When
        FacilityReportDetailDTO.Response result = reportService.addComment(request, 100L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getComment()).isEqualTo("This is a comment");
        verify(commentRepository).save(any(FacilityReportDetail.class));
    }

    @Test
    @DisplayName("UpdateComment - nonCreateuserUpdatewhenThrowException")
    void updateComment_NotCreator_ThrowsException() {
        // Given
        FacilityReportDetailDTO.UpdateRequest request = FacilityReportDetailDTO.UpdateRequest.builder()
                .comment("Updated comment")
                .build();

        FacilityReportDetail existingComment = FacilityReportDetail.builder()
                .id(1L)
                .facilityReport(testReport)
                .employeeId(100L)  // Createuseris 100
                .comment("Original comment")
                .createDate(LocalDateTime.now())
                .build();

        when(commentRepository.findById(1L)).thenReturn(Optional.of(existingComment));

        // When/Then - employeeId=200 attemptUpdate employeeId=100 Create Comment
        assertThatThrownBy(() -> reportService.updateComment(1L, request, 200L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("only update your own");
    }
}
