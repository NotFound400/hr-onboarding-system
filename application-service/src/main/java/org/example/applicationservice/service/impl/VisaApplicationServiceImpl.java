package org.example.applicationservice.service.impl;

import org.example.applicationservice.client.EmailServiceClient;
import org.example.applicationservice.client.EmployeeServiceClient;
import org.example.applicationservice.dao.ApplicationWorkFlowRepository;
import org.example.applicationservice.dao.DigitalDocumentRepository;
import org.example.applicationservice.domain.ApplicationWorkFlow;
import org.example.applicationservice.domain.DigitalDocument;
import org.example.applicationservice.dto.*;
import org.example.applicationservice.service.VisaApplicationService;
import org.example.applicationservice.utils.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VisaApplicationServiceImpl implements VisaApplicationService {

    private static final Logger log = LoggerFactory.getLogger(VisaApplicationServiceImpl.class);

    private final ApplicationWorkFlowRepository repository;
    private final DigitalDocumentRepository documentRepository;
    private final EmailServiceClient emailServiceClient;
    private final EmployeeServiceClient employeeServiceClient;
    private final OwnershipValidator ownershipValidator;

    @Value("${visa.i983.template.url:https://hr-onboarding-storage.s3.us-east-2.amazonaws.com/templates/i983.pdf}")
    private String i983TemplateUrl;

    public VisaApplicationServiceImpl(ApplicationWorkFlowRepository repository,
                                      DigitalDocumentRepository documentRepository,
                                      EmailServiceClient emailServiceClient,
                                      EmployeeServiceClient employeeServiceClient,
                                      OwnershipValidator ownershipValidator) {
        this.repository = repository;
        this.documentRepository = documentRepository;
        this.emailServiceClient = emailServiceClient;
        this.employeeServiceClient = employeeServiceClient;
        this.ownershipValidator = ownershipValidator;
    }

    @Override
    @Transactional
    public Result<VisaApplicationDTO> createOptStemApplication(CreateVisaApplicationRequest request) {
        if (request == null || request.getEmployeeId() == null) {
            return Result.fail("Employee ID is required");
        }

        // Check if employee already has an active OPT application
        Optional<ApplicationWorkFlow> existing = repository
                .findFirstByEmployeeIdAndStatusInOrderByCreateDateDesc(
                        request.getEmployeeId(),
                        List.of(ApplicationStatus.Open, ApplicationStatus.Pending)
                );

        if (existing.isPresent() && existing.get().getApplicationType() == ApplicationType.OPT) {
            return Result.fail("Employee already has an active OPT application");
        }

        // Create new OPT application
        ApplicationWorkFlow app = new ApplicationWorkFlow();
        app.setEmployeeId(request.getEmployeeId());
        app.setApplicationType(ApplicationType.OPT);
        app.setStatus(ApplicationStatus.Open);
        app.setComment("OPT STEM Application - Awaiting I-983 submission");
        app.setCreateDate(LocalDateTime.now());
        app.setLastModificationDate(LocalDateTime.now());

        ApplicationWorkFlow saved = repository.save(app);
        log.info("Created OPT STEM application {} for employee {}", saved.getId(), request.getEmployeeId());

        return Result.success(toVisaApplicationDTO(saved));
    }

    @Override
    public Result<VisaApplicationDTO> getCurrentVisaApplication(String employeeId) {
        if (employeeId == null || employeeId.isBlank()) {
            return Result.fail("Employee ID is required");
        }

        Optional<ApplicationWorkFlow> app = repository
                .findFirstByEmployeeIdAndStatusInOrderByCreateDateDesc(
                        employeeId,
                        List.of(ApplicationStatus.Open, ApplicationStatus.Pending)
                );

        if (app.isEmpty()) {
            return Result.fail("No active visa application found");
        }

        return Result.success(toVisaApplicationDTO(app.get()));
    }

    @Override
    public Result<VisaApplicationDTO> getVisaApplicationById(Long applicationId) {
        Optional<ApplicationWorkFlow> app = repository.findById(applicationId);
        if (app.isEmpty()) {
            return Result.fail("Application not found");
        }
        return Result.success(toVisaApplicationDTO(app.get()));
    }

    @Override
    public Result<String> getI983TemplateUrl() {
        return Result.success(i983TemplateUrl);
    }

    @Override
    @Transactional
    public Result<VisaApplicationDTO> uploadI20(Long applicationId, UploadVisaDocumentRequest request) {
        Optional<ApplicationWorkFlow> appOpt = repository.findById(applicationId);
        if (appOpt.isEmpty()) {
            return Result.fail("Application not found");
        }

        ApplicationWorkFlow app = appOpt.get();

        // Create document record
        DigitalDocument doc = createVisaDocument(app, request, "I-20", true);
        documentRepository.save(doc);

        // Update application status
        app.setStatus(ApplicationStatus.Pending);
        app.setComment("I-20 uploaded - Awaiting HR approval");
        app.setLastModificationDate(LocalDateTime.now());
        repository.save(app);

        // Send notification email
        sendVisaStatusEmail(app.getEmployeeId(), "I-20 Uploaded", 
                "Your I-20 has been uploaded and is pending HR review. Next step: Upload OPT STEM Receipt.");

        log.info("I-20 uploaded for application {}", applicationId);
        return Result.success(toVisaApplicationDTO(app));
    }

    @Override
    @Transactional
    public Result<VisaApplicationDTO> uploadOptStemReceipt(Long applicationId, UploadVisaDocumentRequest request) {
        Optional<ApplicationWorkFlow> appOpt = repository.findById(applicationId);
        if (appOpt.isEmpty()) {
            return Result.fail("Application not found");
        }

        ApplicationWorkFlow app = appOpt.get();

        // Check if I-20 was already uploaded and approved
        List<DigitalDocument> docs = documentRepository.findByApplicationId(applicationId);
        boolean hasI20 = docs.stream().anyMatch(d -> "I-20".equals(d.getType()));
        if (!hasI20) {
            return Result.fail("Please upload I-20 first");
        }

        // Create document record
        DigitalDocument doc = createVisaDocument(app, request, "OPT_STEM_RECEIPT", true);
        documentRepository.save(doc);

        // Update application status
        app.setStatus(ApplicationStatus.Pending);
        app.setComment("OPT STEM Receipt uploaded - Awaiting HR approval");
        app.setLastModificationDate(LocalDateTime.now());
        repository.save(app);

        // Send notification email
        sendVisaStatusEmail(app.getEmployeeId(), "OPT STEM Receipt Uploaded", 
                "Your OPT STEM Receipt has been uploaded. Next step: Upload OPT STEM EAD when received.");

        log.info("OPT STEM Receipt uploaded for application {}", applicationId);
        return Result.success(toVisaApplicationDTO(app));
    }

    @Override
    @Transactional
    public Result<VisaApplicationDTO> uploadOptStemEad(Long applicationId, UploadVisaDocumentRequest request) {
        Optional<ApplicationWorkFlow> appOpt = repository.findById(applicationId);
        if (appOpt.isEmpty()) {
            return Result.fail("Application not found");
        }

        ApplicationWorkFlow app = appOpt.get();

        // Check if Receipt was already uploaded
        List<DigitalDocument> docs = documentRepository.findByApplicationId(applicationId);
        boolean hasReceipt = docs.stream().anyMatch(d -> "OPT_STEM_RECEIPT".equals(d.getType()));
        if (!hasReceipt) {
            return Result.fail("Please upload OPT STEM Receipt first");
        }

        // Create document record
        DigitalDocument doc = createVisaDocument(app, request, "OPT_STEM_EAD", true);
        documentRepository.save(doc);

        // Update application status
        app.setStatus(ApplicationStatus.Pending);
        app.setComment("OPT STEM EAD uploaded - Awaiting final HR approval");
        app.setLastModificationDate(LocalDateTime.now());
        repository.save(app);

        // Send notification email
        sendVisaStatusEmail(app.getEmployeeId(), "OPT STEM EAD Uploaded", 
                "Your OPT STEM EAD has been uploaded and is pending final HR approval.");

        log.info("OPT STEM EAD uploaded for application {}", applicationId);
        return Result.success(toVisaApplicationDTO(app));
    }

    @Override
    public Result<List<VisaApplicationDTO>> getPendingVisaApplications() {
        List<ApplicationWorkFlow> apps = repository.findByStatusOrderByCreateDateDesc(ApplicationStatus.Pending);
        
        List<VisaApplicationDTO> dtos = apps.stream()
                .filter(app -> app.getApplicationType() == ApplicationType.OPT)
                .map(this::toVisaApplicationDTO)
                .collect(Collectors.toList());

        return Result.success(dtos);
    }

    @Override
    public Result<List<VisaApplicationDTO>> getAllVisaApplications() {
        List<ApplicationWorkFlow> apps = repository.findAll();
        
        List<VisaApplicationDTO> dtos = apps.stream()
                .filter(app -> app.getApplicationType() == ApplicationType.OPT)
                .map(this::toVisaApplicationDTO)
                .collect(Collectors.toList());

        return Result.success(dtos);
    }

    @Override
    @Transactional
    public Result<VisaApplicationDTO> approveVisaApplication(Long applicationId, HRRequestDTO request) {
        Optional<ApplicationWorkFlow> appOpt = repository.findById(applicationId);
        if (appOpt.isEmpty()) {
            return Result.fail("Application not found");
        }

        ApplicationWorkFlow app = appOpt.get();
        if (app.getStatus() != ApplicationStatus.Pending) {
            return Result.fail("Cannot approve application with status: " + app.getStatus());
        }

        // Check which stage we're at based on documents
        List<DigitalDocument> docs = documentRepository.findByApplicationId(applicationId);
        String currentStage = determineCurrentStage(docs);

        if ("EAD_UPLOADED".equals(currentStage)) {
            // Final approval
            app.setStatus(ApplicationStatus.Approved);
            app.setComment("OPT STEM Application approved. " + (request.getComment() != null ? request.getComment() : ""));
        } else {
            // Stage approval - keep as pending for next stage
            app.setStatus(ApplicationStatus.Open);
            app.setComment("Stage approved. " + getNextStepMessage(currentStage));
        }

        app.setLastModificationDate(LocalDateTime.now());
        repository.save(app);

        // Send notification
        sendVisaStatusEmail(app.getEmployeeId(), "Approved", 
                "Your submission has been approved. " + getNextStepMessage(currentStage));

        log.info("Approved visa application {} at stage {}", applicationId, currentStage);
        return Result.success(toVisaApplicationDTO(app));
    }

    @Override
    @Transactional
    public Result<VisaApplicationDTO> rejectVisaApplication(Long applicationId, HRRequestDTO request) {
        Optional<ApplicationWorkFlow> appOpt = repository.findById(applicationId);
        if (appOpt.isEmpty()) {
            return Result.fail("Application not found");
        }

        ApplicationWorkFlow app = appOpt.get();
        if (app.getStatus() != ApplicationStatus.Pending) {
            return Result.fail("Cannot reject application with status: " + app.getStatus());
        }

        app.setStatus(ApplicationStatus.Rejected);
        app.setComment("Rejected: " + (request.getComment() != null ? request.getComment() : "Please review and resubmit"));
        app.setLastModificationDate(LocalDateTime.now());
        repository.save(app);

        // Send notification
        sendVisaStatusEmail(app.getEmployeeId(), "Rejected", 
                "Your submission has been rejected. Reason: " + request.getComment());

        log.info("Rejected visa application {}", applicationId);
        return Result.success(toVisaApplicationDTO(app));
    }

    @Override
    public Result<VisaNextStepsDTO> getNextSteps(Long applicationId) {
        Optional<ApplicationWorkFlow> appOpt = repository.findById(applicationId);
        if (appOpt.isEmpty()) {
            return Result.fail("Application not found");
        }

        ApplicationWorkFlow app = appOpt.get();
        List<DigitalDocument> docs = documentRepository.findByApplicationId(applicationId);
        String currentStage = determineCurrentStage(docs);

        VisaNextStepsDTO nextSteps = new VisaNextStepsDTO();
        nextSteps.setApplicationId(applicationId);
        nextSteps.setCurrentStage(currentStage);
        nextSteps.setStatus(app.getStatus().getValue());

        switch (currentStage) {
            case "INITIAL":
                nextSteps.setNextAction("DOWNLOAD_I983");
                nextSteps.setMessage("Download I-983 form, fill it out, and submit to your school");
                nextSteps.setDownloadUrl(i983TemplateUrl);
                break;
            case "I983_SUBMITTED":
                nextSteps.setNextAction("UPLOAD_I20");
                nextSteps.setMessage("After receiving new I-20 from school, upload it here");
                break;
            case "I20_UPLOADED":
                if (app.getStatus() == ApplicationStatus.Pending) {
                    nextSteps.setNextAction("WAIT_APPROVAL");
                    nextSteps.setMessage("Please wait for HR to review your I-20");
                } else {
                    nextSteps.setNextAction("UPLOAD_RECEIPT");
                    nextSteps.setMessage("Please upload your OPT STEM Receipt");
                }
                break;
            case "RECEIPT_UPLOADED":
                if (app.getStatus() == ApplicationStatus.Pending) {
                    nextSteps.setNextAction("WAIT_APPROVAL");
                    nextSteps.setMessage("Please wait for HR to review your OPT STEM Receipt");
                } else {
                    nextSteps.setNextAction("UPLOAD_EAD");
                    nextSteps.setMessage("Please upload your OPT STEM EAD card when received");
                }
                break;
            case "EAD_UPLOADED":
                if (app.getStatus() == ApplicationStatus.Pending) {
                    nextSteps.setNextAction("WAIT_FINAL_APPROVAL");
                    nextSteps.setMessage("Please wait for HR to review your OPT STEM EAD");
                } else if (app.getStatus() == ApplicationStatus.Approved) {
                    nextSteps.setNextAction("COMPLETE");
                    nextSteps.setMessage("Congratulations! Your OPT STEM application has been approved");
                }
                break;
            default:
                nextSteps.setNextAction("UNKNOWN");
                nextSteps.setMessage("Please contact HR for assistance");
        }

        return Result.success(nextSteps);
    }

    // Helper methods

    private DigitalDocument createVisaDocument(ApplicationWorkFlow app, 
                                               UploadVisaDocumentRequest request, 
                                               String type, 
                                               boolean isRequired) {
        DigitalDocument doc = new DigitalDocument();
        doc.setApplication(app);
        doc.setType(type);
        doc.setTitle(request.getTitle() != null ? request.getTitle() : type);
        doc.setDescription(request.getDescription());
        doc.setPath(request.getDocumentPath());
        doc.setIsRequired(isRequired);
        return doc;
    }

    private String determineCurrentStage(List<DigitalDocument> docs) {
        boolean hasI20 = docs.stream().anyMatch(d -> "I-20".equals(d.getType()));
        boolean hasReceipt = docs.stream().anyMatch(d -> "OPT_STEM_RECEIPT".equals(d.getType()));
        boolean hasEad = docs.stream().anyMatch(d -> "OPT_STEM_EAD".equals(d.getType()));

        if (hasEad) return "EAD_UPLOADED";
        if (hasReceipt) return "RECEIPT_UPLOADED";
        if (hasI20) return "I20_UPLOADED";
        return "INITIAL";
    }

    private String getNextStepMessage(String currentStage) {
        return switch (currentStage) {
            case "INITIAL" -> "Please download I-983, fill it out, and submit to your school.";
            case "I20_UPLOADED" -> "Please upload your OPT STEM Receipt.";
            case "RECEIPT_UPLOADED" -> "Please upload your OPT STEM EAD when received.";
            case "EAD_UPLOADED" -> "Your OPT STEM application is complete!";
            default -> "Please contact HR for next steps.";
        };
    }

    private VisaApplicationDTO toVisaApplicationDTO(ApplicationWorkFlow app) {
        VisaApplicationDTO dto = new VisaApplicationDTO();
        dto.setId(app.getId());
        dto.setEmployeeId(app.getEmployeeId());
        dto.setApplicationType(app.getApplicationType().getValue());
        dto.setStatus(app.getStatus().getValue());
        dto.setComment(app.getComment());
        dto.setCreateDate(app.getCreateDate());
        dto.setLastModificationDate(app.getLastModificationDate());

        // Get documents and determine stage
        List<DigitalDocument> docs = documentRepository.findByApplicationId(app.getId());
        dto.setCurrentStage(determineCurrentStage(docs));
        dto.setDocuments(docs.stream()
                .map(d -> new VisaDocumentDTO(d.getId(), d.getType(), d.getTitle(), d.getPath()))
                .collect(Collectors.toList()));

        // Try to get employee info
        try {
            EmployeeDTO employee = employeeServiceClient.getEmployeeById(app.getEmployeeId());
            if (employee != null) {
                dto.setEmployeeName(employee.getFullName());
                dto.setEmployeeEmail(employee.getEmail());
            }
        } catch (Exception e) {
            log.warn("Could not fetch employee info for {}", app.getEmployeeId());
        }

        return dto;
    }

    private void sendVisaStatusEmail(String employeeId, String status, String message) {
        try {
            EmployeeDTO employee = employeeServiceClient.getEmployeeById(employeeId);
            if (employee == null || employee.getEmail() == null) {
                log.warn("Cannot send email: Employee {} has no email", employeeId);
                return;
            }

            ApplicationStatusEmailRequest emailRequest = ApplicationStatusEmailRequest.builder()
                    .to(employee.getEmail())
                    .employeeName(employee.getDisplayName())
                    .status(status)
                    .comment(message)
                    .build();

            emailServiceClient.sendApplicationStatusEmailAsync(emailRequest);
            log.info("Visa status email sent to {}", employee.getEmail());
        } catch (Exception e) {
            log.error("Failed to send visa status email: {}", e.getMessage());
        }
    }
}
