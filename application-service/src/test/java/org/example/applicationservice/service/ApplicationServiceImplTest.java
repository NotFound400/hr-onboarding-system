package org.example.applicationservice.service;

import com.example.common.ApplicationStatus;
import com.example.common.ApplicationType;
import com.example.common.Result;
import org.example.applicationservice.client.EmailServiceClient;
import org.example.applicationservice.dao.ApplicationWorkFlowRepository;
import org.example.applicationservice.domain.ApplicationWorkFlow;
import org.example.applicationservice.dto.ApplicationFlowDTO;
import org.example.applicationservice.dto.CreateApplicationDTO;
import org.example.applicationservice.dto.HRRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceImplTest {

    @Mock
    private ApplicationWorkFlowRepository repository;

    @Mock
    private EmailServiceClient emailServiceClient;

    @InjectMocks
    private ApplicationServiceImpl applicationService;

    private ApplicationWorkFlow sampleApplication;

    @BeforeEach
    void setUp() {
        sampleApplication = new ApplicationWorkFlow();
        sampleApplication.setId(1L);
        sampleApplication.setEmployeeId("emp001");
        sampleApplication.setStatus(ApplicationStatus.Open);
        sampleApplication.setComment("Initial Comment");
        sampleApplication.setCreateDate(LocalDateTime.now());
        sampleApplication.setLastModificationDate(LocalDateTime.now());
    }

    // createApplication tests
    @Test
    void testCreateApplication_success() {
        CreateApplicationDTO request = new CreateApplicationDTO();
        request.setEmployeeId("emp001");
        request.setApplicationType(ApplicationType.ONBOARDING);
        request.setComment("New App");

        when(repository.save(any(ApplicationWorkFlow.class))).thenReturn(sampleApplication);

        Result<ApplicationFlowDTO> result = applicationService.createApplication(request);

        assertTrue(result.isSuccess());
        assertEquals(sampleApplication.getId(), result.getData().getId());
        verify(repository, times(1)).save(any(ApplicationWorkFlow.class));
    }

    @Test
    void testCreateApplication_missingEmployeeId() {
        CreateApplicationDTO request = new CreateApplicationDTO();
        request.setApplicationType(ApplicationType.ONBOARDING);

        Result<ApplicationFlowDTO> result = applicationService.createApplication(request);

        assertFalse(result.isSuccess());
        assertEquals("employeeID is required", result.getMessage());
    }

    // getApplicationById tests
    @Test
    void testGetApplicationById_found() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleApplication));

        Result<ApplicationFlowDTO> result = applicationService.getApplicationById(1L);

        assertTrue(result.isSuccess());
        assertEquals(1L, result.getData().getId());
    }

    @Test
    void testGetApplicationById_notFound() {
        when(repository.findById(2L)).thenReturn(Optional.empty());

        Result<ApplicationFlowDTO> result = applicationService.getApplicationById(2L);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Application not found"));
    }

    // submitApplication tests
    @Test
    void testSubmitApplication_success() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleApplication));
        when(repository.save(any(ApplicationWorkFlow.class))).thenReturn(sampleApplication);

        Result<Void> result = applicationService.submitApplication(1L);

        assertTrue(result.isSuccess());
        verify(repository, times(1)).save(any(ApplicationWorkFlow.class));
    }

    @Test
    void testSubmitApplication_invalidStatus() {
        sampleApplication.setStatus(ApplicationStatus.Approved);
        when(repository.findById(1L)).thenReturn(Optional.of(sampleApplication));

        Result<Void> result = applicationService.submitApplication(1L);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Cannot submit application"));
    }

    // approveApplication tests
    @Test
    void testApproveApplication_success() {
        sampleApplication.setStatus(ApplicationStatus.Pending);
        when(repository.findById(1L)).thenReturn(Optional.of(sampleApplication));
        when(repository.save(any(ApplicationWorkFlow.class))).thenReturn(sampleApplication);

        HRRequestDTO request = new HRRequestDTO();
        request.setComment("Approved");

        Result<Void> result = applicationService.approveApplication(1L, request);

        assertTrue(result.isSuccess());
        verify(repository, times(1)).save(any(ApplicationWorkFlow.class));
    }

    @Test
    void testApproveApplication_invalidStatus() {
        sampleApplication.setStatus(ApplicationStatus.Open);
        when(repository.findById(1L)).thenReturn(Optional.of(sampleApplication));

        HRRequestDTO request = new HRRequestDTO();
        request.setComment("Approved");

        Result<Void> result = applicationService.approveApplication(1L, request);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Cannot approve application"));
    }

    // rejectApplication tests
    @Test
    void testRejectApplication_success() {
        sampleApplication.setStatus(ApplicationStatus.Pending);
        when(repository.findById(1L)).thenReturn(Optional.of(sampleApplication));
        when(repository.save(any(ApplicationWorkFlow.class))).thenReturn(sampleApplication);

        HRRequestDTO request = new HRRequestDTO();
        request.setComment("Rejected");

        Result<Void> result = applicationService.rejectApplication(1L, request);

        assertTrue(result.isSuccess());
        verify(repository, times(1)).save(any(ApplicationWorkFlow.class));
    }

    @Test
    void testRejectApplication_invalidStatus() {
        sampleApplication.setStatus(ApplicationStatus.Approved);
        when(repository.findById(1L)).thenReturn(Optional.of(sampleApplication));

        HRRequestDTO request = new HRRequestDTO();
        request.setComment("Rejected");

        Result<Void> result = applicationService.rejectApplication(1L, request);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Cannot reject application"));
    }

    // listOngoingApplications tests
    @Test
    void testListOngoingApplications_success() {
        when(repository.findByStatusInOrderByCreateDateDesc(anyList()))
                .thenReturn(List.of(sampleApplication));

        Result<List<ApplicationFlowDTO>> result = applicationService.listOngoingApplications();

        assertTrue(result.isSuccess());
        assertEquals(1, result.getData().size());
    }

    // deleteApplication tests
    @Test
    void testDeleteApplication_success() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleApplication));

        Result<Void> result = applicationService.deleteApplication(1L);

        assertTrue(result.isSuccess());
        verify(repository, times(1)).delete(sampleApplication);
    }

    @Test
    void testDeleteApplication_notFound() {
        when(repository.findById(2L)).thenReturn(Optional.empty());

        Result<Void> result = applicationService.deleteApplication(2L);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Application not found"));
    }

}
