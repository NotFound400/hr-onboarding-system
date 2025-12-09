package org.example.emailservice.consumer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.emailservice.dto.*;
import org.example.emailservice.service.EmailService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailConsumer {

    private final EmailService emailService;

    @RabbitListener(queues = "${email.queues.registration}")
    public void handleRegistrationEmail(RegistrationEmailRequest request) {
        log.info("Received registration email request from queue for: {}", request.getTo());
        try {
            emailService.sendRegistrationEmail(request);
        } catch (Exception e) {
            log.error("Failed to send registration email: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = "${email.queues.application-status}")
    public void handleApplicationStatusEmail(ApplicationStatusEmailRequest request) {
        log.info("Received application status email request from queue for: {}", request.getTo());
        try {
            emailService.sendApplicationStatusEmail(request);
        } catch (Exception e) {
            log.error("Failed to send application status email: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = "${email.queues.opt-update}")
    public void handleOptUpdateEmail(OptUpdateEmailRequest request) {
        log.info("Received OPT update email request from queue for: {}", request.getTo());
        try {
            emailService.sendOptUpdateEmail(request);
        } catch (Exception e) {
            log.error("Failed to send OPT update email: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = "${email.queues.facility-report}")
    public void handleFacilityReportEmail(FacilityReportEmailRequest request) {
        log.info("Received facility report email request from queue for: {}", request.getTo());
        try {
            emailService.sendFacilityReportEmail(request);
        } catch (Exception e) {
            log.error("Failed to send facility report email: {}", e.getMessage());
        }
    }
}