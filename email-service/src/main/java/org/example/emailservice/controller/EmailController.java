package org.example.emailservice.controller;

import lombok.RequiredArgsConstructor;
import org.example.emailservice.dto.*;
import org.example.emailservice.service.EmailService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;
    private final RabbitTemplate rabbitTemplate;

    @Value("${email.queues.registration}")
    private String registrationQueue;

    @Value("${email.queues.application-status}")
    private String applicationStatusQueue;

    @Value("${email.queues.opt-update}")
    private String optUpdateQueue;

    @Value("${email.queues.facility-report}")
    private String facilityReportQueue;

    // ==================== Synchronous Endpoints ====================

    @PostMapping("/registration")
    public ResponseEntity<ApiResponse<Void>> sendRegistrationEmail(
            @RequestBody RegistrationEmailRequest request) {
        try {
            emailService.sendRegistrationEmail(request);
            return ResponseEntity.ok(ApiResponse.ok("Registration email sent", null));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to send email: " + ex.getMessage()));
        }
    }

    @PostMapping("/application-status")
    public ResponseEntity<ApiResponse<Void>> sendApplicationStatusEmail(
            @RequestBody ApplicationStatusEmailRequest request) {
        try {
            emailService.sendApplicationStatusEmail(request);
            return ResponseEntity.ok(ApiResponse.ok("Application status email sent", null));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to send email: " + ex.getMessage()));
        }
    }

    @PostMapping("/opt-update")
    public ResponseEntity<ApiResponse<Void>> sendOptUpdateEmail(
            @RequestBody OptUpdateEmailRequest request) {
        try {
            emailService.sendOptUpdateEmail(request);
            return ResponseEntity.ok(ApiResponse.ok("OPT update email sent", null));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to send email: " + ex.getMessage()));
        }
    }

    @PostMapping("/facility-report")
    public ResponseEntity<ApiResponse<Void>> sendFacilityReportEmail(
            @RequestBody FacilityReportEmailRequest request) {
        try {
            emailService.sendFacilityReportEmail(request);
            return ResponseEntity.ok(ApiResponse.ok("Facility report email sent", null));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to send email: " + ex.getMessage()));
        }
    }

    // ==================== Asynchronous Endpoints (via RabbitMQ) ====================

    @PostMapping("/async/registration")
    public ResponseEntity<ApiResponse<Void>> queueRegistrationEmail(
            @RequestBody RegistrationEmailRequest request) {
        rabbitTemplate.convertAndSend(registrationQueue, request);
        return ResponseEntity.ok(ApiResponse.ok("Registration email queued", null));
    }

    @PostMapping("/async/application-status")
    public ResponseEntity<ApiResponse<Void>> queueApplicationStatusEmail(
            @RequestBody ApplicationStatusEmailRequest request) {
        rabbitTemplate.convertAndSend(applicationStatusQueue, request);
        return ResponseEntity.ok(ApiResponse.ok("Application status email queued", null));
    }

    @PostMapping("/async/opt-update")
    public ResponseEntity<ApiResponse<Void>> queueOptUpdateEmail(
            @RequestBody OptUpdateEmailRequest request) {
        rabbitTemplate.convertAndSend(optUpdateQueue, request);
        return ResponseEntity.ok(ApiResponse.ok("OPT update email queued", null));
    }

    @PostMapping("/async/facility-report")
    public ResponseEntity<ApiResponse<Void>> queueFacilityReportEmail(
            @RequestBody FacilityReportEmailRequest request) {
        rabbitTemplate.convertAndSend(facilityReportQueue, request);
        return ResponseEntity.ok(ApiResponse.ok("Facility report email queued", null));
    }
}