package org.example.applicationservice.service;

import org.example.applicationservice.dto.*;
import org.example.applicationservice.utils.Result;

import java.util.List;

/**
 * Service interface for OPT/OPT STEM application workflow
 */
public interface VisaApplicationService {

    /**
     * Create a new OPT STEM application
     */
    Result<VisaApplicationDTO> createOptStemApplication(CreateVisaApplicationRequest request);

    /**
     * Get current visa application for an employee
     */
    Result<VisaApplicationDTO> getCurrentVisaApplication(String employeeId);

    /**
     * Get visa application by ID
     */
    Result<VisaApplicationDTO> getVisaApplicationById(Long applicationId);

    /**
     * Get I-983 template URL
     */
    Result<String> getI983TemplateUrl();

    /**
     * Upload I-20 document
     */
    Result<VisaApplicationDTO> uploadI20(Long applicationId, UploadVisaDocumentRequest request);

    /**
     * Upload OPT STEM Receipt
     */
    Result<VisaApplicationDTO> uploadOptStemReceipt(Long applicationId, UploadVisaDocumentRequest request);

    /**
     * Upload OPT STEM EAD
     */
    Result<VisaApplicationDTO> uploadOptStemEad(Long applicationId, UploadVisaDocumentRequest request);

    /**
     * Get all pending visa applications (for HR)
     */
    Result<List<VisaApplicationDTO>> getPendingVisaApplications();

    /**
     * Get all visa applications (for HR)
     */
    Result<List<VisaApplicationDTO>> getAllVisaApplications();

    /**
     * Approve visa application step
     */
    Result<VisaApplicationDTO> approveVisaApplication(Long applicationId, HRRequestDTO request);

    /**
     * Reject visa application step
     */
    Result<VisaApplicationDTO> rejectVisaApplication(Long applicationId, HRRequestDTO request);

    /**
     * Get next steps for an application
     */
    Result<VisaNextStepsDTO> getNextSteps(Long applicationId);
}
