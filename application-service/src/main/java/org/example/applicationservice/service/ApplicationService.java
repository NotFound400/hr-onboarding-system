package org.example.applicationservice.service;

import com.example.common.ApplicationStatus;
import com.example.common.Result;
import org.example.applicationservice.dto.ApplicationFlowDTO;
import org.example.applicationservice.dto.CreateApplicationDTO;
import org.example.applicationservice.dto.HRRequestDTO;
import org.example.applicationservice.dto.UpdateApplicationDTO;

import java.util.List;

public interface ApplicationService {
    Result<ApplicationFlowDTO> createApplication(CreateApplicationDTO request);
    Result<ApplicationFlowDTO> getLatestActiveApplication(String employeeID);
    Result<ApplicationFlowDTO> getApplicationById(Long applicationId);
    Result<ApplicationFlowDTO> updateApplication(Long applicationId, UpdateApplicationDTO request);
    Result<Void> submitApplication(Long applicationId);
    Result<Void> approveApplication(Long applicationId, HRRequestDTO request);
    Result<Void> rejectApplication(Long applicationId, HRRequestDTO request);
    Result<List<ApplicationFlowDTO>> listOngoingApplications();
    Result<List<ApplicationFlowDTO>> getApplicationsByEmployeeId(String employeeID);
    Result<List<ApplicationFlowDTO>> getApplicationsByStatus(ApplicationStatus status);
    Result<Void> deleteApplication(Long applicationId);
}
