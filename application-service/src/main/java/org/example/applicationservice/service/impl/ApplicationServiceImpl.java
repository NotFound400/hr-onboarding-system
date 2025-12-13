package org.example.applicationservice.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.example.applicationservice.client.EmployeeServiceClient;
import org.example.applicationservice.service.ApplicationService;
import org.example.applicationservice.utils.*;
import org.example.applicationservice.client.EmailServiceClient;
import org.example.applicationservice.dao.ApplicationWorkFlowRepository;
import org.example.applicationservice.domain.ApplicationWorkFlow;
import org.example.applicationservice.dto.*;
import org.example.applicationservice.utils.OwnershipValidator;
import org.example.applicationservice.utils.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ApplicationServiceImpl implements ApplicationService {
    private final ApplicationWorkFlowRepository repository;
    private final EmailServiceClient emailServiceClient;
    private final OwnershipValidator ownershipValidator;
    private final EmployeeServiceClient employeeServiceClient;
    private static final Logger log = LoggerFactory.getLogger(ApplicationServiceImpl.class);

    public ApplicationServiceImpl(ApplicationWorkFlowRepository repository,
                                  EmailServiceClient emailServiceClient,
                                  EmployeeServiceClient employeeServiceClient,
                                  SecurityUtils securityUtils,
                                  OwnershipValidator ownershipValidator) {
        this.repository = repository;
        this.emailServiceClient = emailServiceClient;
        this.employeeServiceClient = employeeServiceClient;
        this.ownershipValidator = ownershipValidator;
    }

    @Override
    @Transactional
    public Result<ApplicationFlowDTO> createApplication(CreateApplicationDTO request) {
        if (request == null) {
            return Result.fail("Request body is missing");
        }
        if (request.getEmployeeId() == null || request.getEmployeeId().trim().isEmpty()) {
            return Result.fail("employeeID is required");
        }
        if (request.getApplicationType() == null) {
            return Result.fail("applicationType is required");
        }

//        ownershipValidator.checkOwnership(request.getEmployeeId());

        ApplicationWorkFlow entity = new ApplicationWorkFlow();
        entity.setEmployeeId(request.getEmployeeId());
        entity.setApplicationType(request.getApplicationType());
        entity.setComment(request.getComment());
        entity.setCreateDate(LocalDateTime.now());
        entity.setLastModificationDate(LocalDateTime.now());
        entity.setStatus(ApplicationStatus.Pending);

        ApplicationWorkFlow saved = repository.save(entity);

        ApplicationFlowDTO responseDto = new ApplicationFlowDTO();
        responseDto.setId(saved.getId());
        responseDto.setEmployeeId(saved.getEmployeeId());
        responseDto.setApplicationType(saved.getApplicationType());
        responseDto.setComment(saved.getComment());
        responseDto.setCreateDate(saved.getCreateDate());
        responseDto.setLastModificationDate(saved.getLastModificationDate());
        responseDto.setStatus(saved.getStatus());

        return Result.success(responseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Result<ApplicationFlowDTO> getLatestActiveApplication(String employeeID) {
        if (employeeID == null || employeeID.trim().isEmpty()) {
            return Result.fail("employeeID is required");
        }

        List<ApplicationStatus> activeStatuses = Arrays.asList(
                ApplicationStatus.Open,
                ApplicationStatus.Pending
        );

        Optional<ApplicationWorkFlow> optionalApp =
                repository.findFirstByEmployeeIdAndStatusInOrderByCreateDateDesc(employeeID, activeStatuses);

        if (optionalApp.isEmpty()) {
            return Result.fail("No active application found for employeeID: " + employeeID);
        }

        ApplicationWorkFlow app = optionalApp.get();

        ApplicationFlowDTO dto = new ApplicationFlowDTO();
        dto.setId(app.getId());
        dto.setEmployeeId(app.getEmployeeId());
        dto.setApplicationType(app.getApplicationType());
        dto.setComment(app.getComment());
        dto.setCreateDate(app.getCreateDate());
        dto.setLastModificationDate(app.getLastModificationDate());
        dto.setStatus(app.getStatus());

        return Result.success(dto);
    }

    @Override
    @Transactional(readOnly = true)
    public Result<List<ApplicationListResponseDTO>> getActiveApplications(String employeeID) {
        if (employeeID == null || employeeID.trim().isEmpty()) {
            return Result.fail("employeeID is required");
        }

        List<ApplicationStatus> activeStatuses = Arrays.asList(
                ApplicationStatus.Open,
                ApplicationStatus.Pending
        );

        List<ApplicationWorkFlow> apps =
                repository.findByEmployeeIdAndStatusInOrderByCreateDateDesc(employeeID, activeStatuses);

        if (apps == null || apps.isEmpty()) {
            return Result.fail("No active applications found for employeeID: " + employeeID);
        }

        List<ApplicationListResponseDTO> dtoList = apps.stream().map(app -> {
            ApplicationListResponseDTO dto = new ApplicationListResponseDTO();
            dto.setId(app.getId());
            dto.setEmployeeId(app.getEmployeeId());
            dto.setApplicationType(app.getApplicationType());
            dto.setComment(app.getComment());
            dto.setStatus(app.getStatus());
            return dto;
        }).toList();

        return Result.success(dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public Result<ApplicationFlowDTO> getApplicationById(Long applicationId) {
        if (applicationId == null) {
            return Result.fail("applicationId is required");
        }

        Optional<ApplicationWorkFlow> optionalApp = repository.findById(applicationId);

        if (optionalApp.isEmpty()) {
            return Result.fail("Application not found with ID: " + applicationId);
        }

        ApplicationWorkFlow app = optionalApp.get();
//        ownershipValidator.checkOwnership(app.getEmployeeId());

        ApplicationFlowDTO dto = new ApplicationFlowDTO();
        dto.setId(app.getId());
        dto.setEmployeeId(app.getEmployeeId());
        dto.setApplicationType(app.getApplicationType());
        dto.setComment(app.getComment());
        dto.setCreateDate(app.getCreateDate());
        dto.setLastModificationDate(app.getLastModificationDate());
        dto.setStatus(app.getStatus());

        return Result.success(dto);
    }

    @Override
    @Transactional
    public Result<ApplicationFlowDTO> updateApplication(Long applicationId, UpdateApplicationDTO request) {
        if (applicationId == null) {
            return Result.fail("applicationId is required");
        }

        Optional<ApplicationWorkFlow> optionalApp = repository.findById(applicationId);

        if (optionalApp.isEmpty()) {
            return Result.fail("Application not found with ID: " + applicationId);
        }

        ApplicationWorkFlow app = optionalApp.get();
//        ownershipValidator.checkOwnership(app.getEmployeeId());

        // Only allow update if status = OPEN or REJECTED
        if (!(app.getStatus() == ApplicationStatus.Open || app.getStatus() == ApplicationStatus.Rejected || app.getStatus() == ApplicationStatus.Pending)) {
            return Result.fail("Cannot update application with status: " + app.getStatus());
        }

        if (request.getComment() != null) {
            app.setComment(request.getComment());
        }
        if (request.getApplicationType() != null) {
            app.setApplicationType(request.getApplicationType());
        }

        app.setLastModificationDate(LocalDateTime.now());

        ApplicationWorkFlow updated = repository.save(app);

        ApplicationFlowDTO dto = new ApplicationFlowDTO();
        dto.setId(updated.getId());
        dto.setEmployeeId(updated.getEmployeeId());
        dto.setApplicationType(updated.getApplicationType());
        dto.setComment(updated.getComment());
        dto.setCreateDate(updated.getCreateDate());
        dto.setLastModificationDate(updated.getLastModificationDate());
        dto.setStatus(updated.getStatus());

        return Result.success(dto);
    }

    @Override
    @Transactional
    public Result<Void> submitApplication(Long applicationId) {
        if (applicationId == null) {
            return Result.fail("applicationId is required");
        }

        Optional<ApplicationWorkFlow> optionalApp = repository.findById(applicationId);
        if (optionalApp.isEmpty()) {
            return Result.fail("Application not found with ID: " + applicationId);
        }

        ApplicationWorkFlow app = optionalApp.get();
//        ownershipValidator.checkOwnership(app.getEmployeeId());
        // Only allow submission if status = Open or Rejected
        if (!(app.getStatus() == ApplicationStatus.Open || app.getStatus() == ApplicationStatus.Rejected)) {
            return Result.fail("Cannot submit application with status: " + app.getStatus());
        }

        // Set status to Pending (reuse)
        app.setStatus(ApplicationStatus.Pending);
        app.setLastModificationDate(LocalDateTime.now());

        repository.save(app);

        return Result.success(null); // No data needed
    }

    @Override
    @Transactional
    public Result<UpdateApplicationStatusDTO> approveApplication(Long applicationId, HRRequestDTO request) {
        Optional<ApplicationWorkFlow> optional = repository.findById(applicationId);
        if (optional.isEmpty()) {
            return Result.fail("Application not found");
        }

        ApplicationWorkFlow app = optional.get();
        if (app.getStatus() != ApplicationStatus.Pending) {
            return Result.fail("Cannot approve application with status: " + app.getStatus());
        }


        // update status
        app.setStatus(ApplicationStatus.Approved);
        app.setComment(request.getComment());
        app.setLastModificationDate(LocalDateTime.now());

        repository.save(app);
        sendApplicationStatusEmail(app.getEmployeeId(), "Approved", request.getComment());

        // Trigger Email Service (Feign)
//        try {
//            emailServiceClient.sendApprovalEmail(app.getEmployeeID(), request.getComment());
//        } catch (Exception e) {
//            System.err.println("Failed to send approval email: " + e.getMessage());
//        }

        // create response DTO
        UpdateApplicationStatusDTO dto = new UpdateApplicationStatusDTO(
                app.getStatus(),
                app.getComment()
        );

        return Result.success(dto);
    }

    @Override
    @Transactional
    public Result<UpdateApplicationStatusDTO> rejectApplication(Long applicationId, HRRequestDTO request) {

        if (applicationId == null) {
            return Result.fail("applicationId is required");
        }

        Optional<ApplicationWorkFlow> optionalApp = repository.findById(applicationId);
        if (optionalApp.isEmpty()) {
            return Result.fail("Application not found with ID: " + applicationId);
        }

        ApplicationWorkFlow app = optionalApp.get();

        // Only allow rejection if status = Pending
        if (app.getStatus() != ApplicationStatus.Pending) {
            return Result.fail("Cannot reject application with status: " + app.getStatus());
        }

        // update fields
        app.setStatus(ApplicationStatus.Rejected);
        app.setComment(request.getComment());
        app.setLastModificationDate(LocalDateTime.now());

        repository.save(app);
        sendApplicationStatusEmail(app.getEmployeeId(), "Rejected", request.getComment());

        //        try {
//            emailServiceClient.sendRejectEmail(app.getEmployeeID(), request.getComment());
//        } catch (Exception e) {
//            System.out.println("[Placeholder] Failed to send approval email to " +
//                    app.getEmployeeID() + " — " + e.getMessage());
//        }

        // return DTO like approveApplication
        UpdateApplicationStatusDTO dto = new UpdateApplicationStatusDTO(
                app.getStatus(),
                app.getComment()
        );

        return Result.success(dto);
    }

    @Override
    @Transactional(readOnly = true)
    public Result<List<ApplicationFlowDTO>> listOngoingApplications() {
        List<ApplicationStatus> ongoingStatuses = List.of(ApplicationStatus.Open, ApplicationStatus.Pending);

        List<ApplicationWorkFlow> ongoingApps = repository.findByStatusInOrderByCreateDateDesc(ongoingStatuses);

        // Map to DTO
        List<ApplicationFlowDTO> dtos = ongoingApps.stream()
                .map(app -> {
                    ApplicationFlowDTO dto = new ApplicationFlowDTO();
                    dto.setId(app.getId());
                    dto.setEmployeeId(app.getEmployeeId());
                    dto.setCreateDate(app.getCreateDate());
                    dto.setLastModificationDate(app.getLastModificationDate());
                    dto.setStatus(app.getStatus());
                    dto.setComment(app.getComment());
                    dto.setApplicationType(app.getApplicationType());
                    return dto;
                })
                .toList();

        return Result.success(dtos);
    }

    @Override
    public Result<List<ApplicationFlowDTO>> getApplicationsByEmployeeId(String employeeID) {
        List<ApplicationWorkFlow> applications = repository.findByEmployeeIdOrderByCreateDateDesc(employeeID);

        List<ApplicationFlowDTO> dtos = applications.stream()
                .map(app -> new ApplicationFlowDTO(
                        app.getId(),
                        app.getEmployeeId(),
                        app.getCreateDate(),
                        app.getLastModificationDate(),
                        app.getStatus(),
                        app.getComment(),
                        app.getApplicationType()
                ))
                .collect(Collectors.toList());

        return Result.success(dtos);
    }

    @Override
    public Result<List<ApplicationFlowDTO>> getApplicationsByStatus(ApplicationStatus status) {
        List<ApplicationWorkFlow> applications = repository.findByStatusOrderByCreateDateDesc(status);

        List<ApplicationFlowDTO> dtos = applications.stream()
                .map(app -> new ApplicationFlowDTO(
                        app.getId(),
                        app.getEmployeeId(),
                        app.getCreateDate(),
                        app.getLastModificationDate(),
                        app.getStatus(),
                        app.getComment(),
                        app.getApplicationType()
                ))
                .collect(Collectors.toList());

        return Result.success(dtos);
    }

    @Override
    public Result<Void> deleteApplication(Long applicationId) {
        return repository.findById(applicationId)
                .map(app -> {
                    // Optional: trigger S3 deletion for all documents
//                    app.getDocuments().forEach(doc -> {
//                        System.out.println("[Placeholder] Deleting file from S3: " + doc.getPath());
//                    });

                    repository.delete(app);
                    return Result.<Void>success(null);
                })
                .orElse(Result.fail("Application not found with id: " + applicationId));
    }

    private void sendApplicationStatusEmail(String employeeId, String status, String comment) {
        try {
            EmployeeDTO employee = employeeServiceClient.getEmployeeById(employeeId);

            if (employee == null || employee.getEmail() == null || employee.getEmail().isBlank()) {
                log.warn("Cannot send email: Employee {} has no email address", employeeId);
                return;
            }

            ApplicationStatusEmailRequest emailRequest = ApplicationStatusEmailRequest.builder()
                    .to(employee.getEmail())
                    .employeeName(employee.getDisplayName())
                    .status(status)
                    .comment(comment)
                    .build();

            log.info("Sending {} email to {} for employee {}", status, employee.getEmail(), employeeId);
            emailServiceClient.sendApplicationStatusEmailAsync(emailRequest);
            log.info("Application status email queued successfully");

        } catch (Exception e) {
            log.error("Failed to send application status email: {}", e.getMessage());
        }
    }
}
