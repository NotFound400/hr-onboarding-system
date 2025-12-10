package org.example.emailservice.consumer;

import org.example.emailservice.dto.*;
import org.example.emailservice.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailConsumer Unit Tests")
class EmailConsumerTest {

    @Mock
    private EmailService emailService;

    @InjectMocks
    private EmailConsumer emailConsumer;

    @Nested
    @DisplayName("Registration Email Consumer Tests")
    class RegistrationEmailConsumerTests {

        @Test
        @DisplayName("Should process registration email from queue")
        void handleRegistrationEmail_WithValidRequest_ShouldCallService() {
            // Arrange
            RegistrationEmailRequest request = new RegistrationEmailRequest();
            request.setTo("test@example.com");
            request.setToken("test-token");
            request.setRegistrationLink("http://localhost:3000/register");

            doNothing().when(emailService).sendRegistrationEmail(any(RegistrationEmailRequest.class));

            // Act
            emailConsumer.handleRegistrationEmail(request);

            // Assert
            verify(emailService).sendRegistrationEmail(request);
        }

        @Test
        @DisplayName("Should handle exception gracefully")
        void handleRegistrationEmail_WhenServiceFails_ShouldNotThrow() {
            // Arrange
            RegistrationEmailRequest request = new RegistrationEmailRequest();
            request.setTo("test@example.com");

            doThrow(new RuntimeException("SMTP error"))
                    .when(emailService).sendRegistrationEmail(any(RegistrationEmailRequest.class));

            // Act & Assert - should not throw
            emailConsumer.handleRegistrationEmail(request);

            verify(emailService).sendRegistrationEmail(request);
        }
    }

    @Nested
    @DisplayName("Application Status Email Consumer Tests")
    class ApplicationStatusEmailConsumerTests {

        @Test
        @DisplayName("Should process application status email from queue")
        void handleApplicationStatusEmail_WithValidRequest_ShouldCallService() {
            // Arrange
            ApplicationStatusEmailRequest request = new ApplicationStatusEmailRequest();
            request.setTo("employee@example.com");
            request.setEmployeeName("John Doe");
            request.setStatus("Approved");

            doNothing().when(emailService).sendApplicationStatusEmail(any(ApplicationStatusEmailRequest.class));

            // Act
            emailConsumer.handleApplicationStatusEmail(request);

            // Assert
            verify(emailService).sendApplicationStatusEmail(request);
        }

        @Test
        @DisplayName("Should handle exception gracefully")
        void handleApplicationStatusEmail_WhenServiceFails_ShouldNotThrow() {
            // Arrange
            ApplicationStatusEmailRequest request = new ApplicationStatusEmailRequest();
            request.setTo("test@example.com");

            doThrow(new RuntimeException("SMTP error"))
                    .when(emailService).sendApplicationStatusEmail(any(ApplicationStatusEmailRequest.class));

            // Act & Assert - should not throw
            emailConsumer.handleApplicationStatusEmail(request);

            verify(emailService).sendApplicationStatusEmail(request);
        }
    }

    @Nested
    @DisplayName("OPT Update Email Consumer Tests")
    class OptUpdateEmailConsumerTests {

        @Test
        @DisplayName("Should process OPT update email from queue")
        void handleOptUpdateEmail_WithValidRequest_ShouldCallService() {
            // Arrange
            OptUpdateEmailRequest request = new OptUpdateEmailRequest();
            request.setTo("employee@example.com");
            request.setEmployeeName("John Doe");
            request.setDocumentType("I-20");
            request.setStatus("Received");

            doNothing().when(emailService).sendOptUpdateEmail(any(OptUpdateEmailRequest.class));

            // Act
            emailConsumer.handleOptUpdateEmail(request);

            // Assert
            verify(emailService).sendOptUpdateEmail(request);
        }

        @Test
        @DisplayName("Should handle exception gracefully")
        void handleOptUpdateEmail_WhenServiceFails_ShouldNotThrow() {
            // Arrange
            OptUpdateEmailRequest request = new OptUpdateEmailRequest();
            request.setTo("test@example.com");

            doThrow(new RuntimeException("SMTP error"))
                    .when(emailService).sendOptUpdateEmail(any(OptUpdateEmailRequest.class));

            // Act & Assert - should not throw
            emailConsumer.handleOptUpdateEmail(request);

            verify(emailService).sendOptUpdateEmail(request);
        }
    }

    @Nested
    @DisplayName("Facility Report Email Consumer Tests")
    class FacilityReportEmailConsumerTests {

        @Test
        @DisplayName("Should process facility report email from queue")
        void handleFacilityReportEmail_WithValidRequest_ShouldCallService() {
            // Arrange
            FacilityReportEmailRequest request = new FacilityReportEmailRequest();
            request.setTo("employee@example.com");
            request.setEmployeeName("John Doe");
            request.setReportTitle("Broken AC");
            request.setStatus("Open");

            doNothing().when(emailService).sendFacilityReportEmail(any(FacilityReportEmailRequest.class));

            // Act
            emailConsumer.handleFacilityReportEmail(request);

            // Assert
            verify(emailService).sendFacilityReportEmail(request);
        }

        @Test
        @DisplayName("Should handle exception gracefully")
        void handleFacilityReportEmail_WhenServiceFails_ShouldNotThrow() {
            // Arrange
            FacilityReportEmailRequest request = new FacilityReportEmailRequest();
            request.setTo("test@example.com");

            doThrow(new RuntimeException("SMTP error"))
                    .when(emailService).sendFacilityReportEmail(any(FacilityReportEmailRequest.class));

            // Act & Assert - should not throw
            emailConsumer.handleFacilityReportEmail(request);

            verify(emailService).sendFacilityReportEmail(request);
        }
    }
}