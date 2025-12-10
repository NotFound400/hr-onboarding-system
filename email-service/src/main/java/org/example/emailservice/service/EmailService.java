package org.example.emailservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.emailservice.dto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendRegistrationEmail(RegistrationEmailRequest request) {
        log.info("Sending registration email to: {}", request.getTo());

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(request.getTo());
        message.setSubject("HR Onboarding - Complete Your Registration");
        message.setText(buildRegistrationEmailBody(request));

        mailSender.send(message);
        log.info("Registration email sent successfully to: {}", request.getTo());
    }

    public void sendApplicationStatusEmail(ApplicationStatusEmailRequest request) {
        log.info("Sending application status email to: {}", request.getTo());

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(request.getTo());
        message.setSubject("HR Onboarding - Application " + request.getStatus());
        message.setText(buildApplicationStatusEmailBody(request));

        mailSender.send(message);
        log.info("Application status email sent successfully to: {}", request.getTo());
    }

    public void sendOptUpdateEmail(OptUpdateEmailRequest request) {
        log.info("Sending OPT update email to: {}", request.getTo());

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(request.getTo());
        message.setSubject("HR Onboarding - OPT Document Update");
        message.setText(buildOptUpdateEmailBody(request));

        mailSender.send(message);
        log.info("OPT update email sent successfully to: {}", request.getTo());
    }

    public void sendFacilityReportEmail(FacilityReportEmailRequest request) {
        log.info("Sending facility report email to: {}", request.getTo());

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(request.getTo());
        message.setSubject("HR Onboarding - Facility Report Update");
        message.setText(buildFacilityReportEmailBody(request));

        mailSender.send(message);
        log.info("Facility report email sent successfully to: {}", request.getTo());
    }

    private String buildRegistrationEmailBody(RegistrationEmailRequest request) {
        return String.format("""
            Welcome to HR Onboarding System!

            You have been invited to join our company. Please complete your registration using the link below:

            Registration Link: %s

            Your registration token: %s

            This link will expire in 3 hours.

            If you did not request this, please ignore this email.

            Best regards,
            HR Team
            """, request.getRegistrationLink(), request.getToken());
    }

    private String buildApplicationStatusEmailBody(ApplicationStatusEmailRequest request) {
        String statusMessage = request.getStatus().equalsIgnoreCase("Approved")
                ? "Congratulations! Your onboarding application has been approved."
                : "Unfortunately, your onboarding application has been rejected.";

        String comment = (request.getComment() != null && !request.getComment().isBlank())
                ? "\nHR Comment: " + request.getComment()
                : "";

        return String.format("""
            Dear %s,

            %s
            %s

            If you have any questions, please contact HR.

            Best regards,
            HR Team
            """, request.getEmployeeName(), statusMessage, comment);
    }

    private String buildOptUpdateEmailBody(OptUpdateEmailRequest request) {
        String nextStep = (request.getNextStep() != null && !request.getNextStep().isBlank())
                ? request.getNextStep()
                : "No action required";

        return String.format("""
            Dear %s,

            Your OPT document (%s) status has been updated to: %s

            Next Step: %s

            Please log in to the system to view details.

            Best regards,
            HR Team
            """, request.getEmployeeName(), request.getDocumentType(), request.getStatus(), nextStep);
    }

    private String buildFacilityReportEmailBody(FacilityReportEmailRequest request) {
        return String.format("""
            Dear %s,

            Your facility report "%s" status has been updated to: %s

            Please log in to the system to view details.

            Best regards,
            HR Team
            """, request.getEmployeeName(), request.getReportTitle(), request.getStatus());
    }
}