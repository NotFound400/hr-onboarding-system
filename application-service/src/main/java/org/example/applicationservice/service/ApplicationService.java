package org.example.applicationservice.service;


import org.example.applicationservice.utils.*;
import org.example.applicationservice.dto.*;
import java.util.List;

public interface ApplicationService {
    Result<ApplicationFlowDTO> createApplication(CreateApplicationDTO request);
    Result<ApplicationFlowDTO> getLatestActiveApplication(String employeeID);
//    Result<List<ApplicationFlowDTO>> getActiveApplications(String employeeID);
    public Result<List<ApplicationListResponseDTO>> getActiveApplications(String employeeID);
    Result<ApplicationFlowDTO> getApplicationById(Long applicationId);
    Result<ApplicationFlowDTO> updateApplication(Long applicationId, UpdateApplicationDTO request);
    Result<Void> submitApplication(Long applicationId);
//    Result<Void> approveApplication(Long applicationId, HRRequestDTO request);
    Result<UpdateApplicationStatusDTO> approveApplication(Long applicationId, HRRequestDTO request);
//    Result<Void> rejectApplication(Long applicationId, HRRequestDTO request);
    Result<UpdateApplicationStatusDTO> rejectApplication(Long applicationId, HRRequestDTO request);
    Result<List<ApplicationFlowDTO>> listOngoingApplications();
    Result<List<ApplicationFlowDTO>> getApplicationsByEmployeeId(String employeeID);
    Result<List<ApplicationFlowDTO>> getApplicationsByStatus(ApplicationStatus status);
    Result<Void> deleteApplication(Long applicationId);
}
