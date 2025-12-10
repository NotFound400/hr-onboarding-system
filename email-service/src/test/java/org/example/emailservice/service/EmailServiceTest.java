package org.example.emailservice.service;

import org.example.emailservice.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailService Unit Tests")
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    private static final String FROM_EMAIL = "hr-system@example.com";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", FROM_EMAIL);
    }

    // ==================== Registration Email Tests ====================
    @Nested
    @DisplayName("Registration Email Tests")
    class RegistrationEmailTests {

        @Test
        @DisplayName("Should send registration email successfully")
        void sendRegistrationEmail_WithValidRequest_ShouldSendEmail() {
            // Arrange
            RegistrationEmailRequest request = new RegistrationEmailRequest();
            request.setTo("newemployee@example.com");
            request.setToken("test-token-123");
            request.setRegistrationLink("http://localhost:3000/register?token=test-token-123");

            ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            doNothing().when(mailSender).send(any(SimpleMailMessage.class));

            // Act
            emailService.sendRegistrationEmail(request);

            // Assert
            verify(mailSender).send(messageCaptor.capture());
            SimpleMailMessage sentMessage = messageCaptor.getValue();

            assertEquals(FROM_EMAIL, sentMessage.getFrom());
            assertArrayEquals(new String[]{"newemployee@example.com"}, sentMessage.getTo());
            assertEquals("HR Onboarding - Complete Your Registration", sentMessage.getSubject());
            assertNotNull(sentMessage.getText());
            assertTrue(sentMessage.getText().contains("test-token-123"));
            assertTrue(sentMessage.getText().contains("http://localhost:3000/register?token=test-token-123"));
        }

        @Test
        @DisplayName("Should include registration link in email body")
        void sendRegistrationEmail_ShouldIncludeRegistrationLink() {
            // Arrange
            RegistrationEmailRequest request = new RegistrationEmailRequest();
            request.setTo("test@example.com");
            request.setToken("abc-123");
            request.setRegistrationLink("http://example.com/register?token=abc-123");

            ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            doNothing().when(mailSender).send(any(SimpleMailMessage.class));

            // Act
            emailService.sendRegistrationEmail(request);

            // Assert
            verify(mailSender).send(messageCaptor.capture());
            String emailBody = messageCaptor.getValue().getText();

            assertTrue(emailBody.contains("http://example.com/register?token=abc-123"));
            assertTrue(emailBody.contains("Welcome to HR Onboarding System"));
        }

        @Test
        @DisplayName("Should include token in email body")
        void sendRegistrationEmail_ShouldIncludeToken() {
            // Arrange
            RegistrationEmailRequest request = new RegistrationEmailRequest();
            request.setTo("test@example.com");
            request.setToken("my-unique-token-xyz");
            request.setRegistrationLink("http://example.com/register");

            ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            doNothing().when(mailSender).send(any(SimpleMailMessage.class));

            // Act
            emailService.sendRegistrationEmail(request);

            // Assert
            verify(mailSender).send(messageCaptor.capture());
            String emailBody = messageCaptor.getValue().getText();

            assertTrue(emailBody.contains("my-unique-token-xyz"));
        }
    }

    // ==================== Application Status Email Tests ====================
    @Nested
    @DisplayName("Application Status Email Tests")
    class ApplicationStatusEmailTests {

        @Test
        @DisplayName("Should send approval email successfully")
        void sendApplicationStatusEmail_WithApproved_ShouldSendApprovalEmail() {
            // Arrange
            ApplicationStatusEmailRequest request = new ApplicationStatusEmailRequest();
            request.setTo("employee@example.com");
            request.setEmployeeName("John Doe");
            request.setStatus("Approved");
            request.setComment("Welcome to the team!");

            ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            doNothing().when(mailSender).send(any(SimpleMailMessage.class));

            // Act
            emailService.sendApplicationStatusEmail(request);

            // Assert
            verify(mailSender).send(messageCaptor.capture());
            SimpleMailMessage sentMessage = messageCaptor.getValue();

            assertEquals("HR Onboarding - Application Approved", sentMessage.getSubject());
            assertTrue(sentMessage.getText().contains("John Doe"));
            assertTrue(sentMessage.getText().contains("Congratulations"));
            assertTrue(sentMessage.getText().contains("approved"));
            assertTrue(sentMessage.getText().contains("Welcome to the team!"));
        }

        @Test
        @DisplayName("Should send rejection email successfully")
        void sendApplicationStatusEmail_WithRejected_ShouldSendRejectionEmail() {
            // Arrange
            ApplicationStatusEmailRequest request = new ApplicationStatusEmailRequest();
            request.setTo("employee@example.com");
            request.setEmployeeName("Jane Smith");
            request.setStatus("Rejected");
            request.setComment("Missing documents");

            ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            doNothing().when(mailSender).send(any(SimpleMailMessage.class));

            // Act
            emailService.sendApplicationStatusEmail(request);

            // Assert
            verify(mailSender).send(messageCaptor.capture());
            SimpleMailMessage sentMessage = messageCaptor.getValue();

            assertEquals("HR Onboarding - Application Rejected", sentMessage.getSubject());
            assertTrue(sentMessage.getText().contains("Jane Smith"));
            assertTrue(sentMessage.getText().contains("rejected"));
            assertTrue(sentMessage.getText().contains("Missing documents"));
        }

        @Test
        @DisplayName("Should handle empty comment")
        void sendApplicationStatusEmail_WithEmptyComment_ShouldWork() {
            // Arrange
            ApplicationStatusEmailRequest request = new ApplicationStatusEmailRequest();
            request.setTo("employee@example.com");
            request.setEmployeeName("John Doe");
            request.setStatus("Approved");
            request.setComment("");

            ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            doNothing().when(mailSender).send(any(SimpleMailMessage.class));

            // Act
            emailService.sendApplicationStatusEmail(request);

            // Assert
            verify(mailSender).send(messageCaptor.capture());
            assertNotNull(messageCaptor.getValue().getText());
        }

        @Test
        @DisplayName("Should handle null comment")
        void sendApplicationStatusEmail_WithNullComment_ShouldWork() {
            // Arrange
            ApplicationStatusEmailRequest request = new ApplicationStatusEmailRequest();
            request.setTo("employee@example.com");
            request.setEmployeeName("John Doe");
            request.setStatus("Approved");
            request.setComment(null);

            ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            doNothing().when(mailSender).send(any(SimpleMailMessage.class));

            // Act
            emailService.sendApplicationStatusEmail(request);

            // Assert
            verify(mailSender).send(messageCaptor.capture());
            assertFalse(messageCaptor.getValue().getText().contains("HR Comment:"));
        }
    }

    // ==================== OPT Update Email Tests ====================
    @Nested
    @DisplayName("OPT Update Email Tests")
    class OptUpdateEmailTests {

        @Test
        @DisplayName("Should send OPT update email successfully")
        void sendOptUpdateEmail_WithValidRequest_ShouldSendEmail() {
            // Arrange
            OptUpdateEmailRequest request = new OptUpdateEmailRequest();
            request.setTo("employee@example.com");
            request.setEmployeeName("John Doe");
            request.setDocumentType("I-20");
            request.setStatus("Received");
            request.setNextStep("Please upload your OPT STEM Receipt");

            ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            doNothing().when(mailSender).send(any(SimpleMailMessage.class));

            // Act
            emailService.sendOptUpdateEmail(request);

            // Assert
            verify(mailSender).send(messageCaptor.capture());
            SimpleMailMessage sentMessage = messageCaptor.getValue();

            assertEquals("HR Onboarding - OPT Document Update", sentMessage.getSubject());
            assertTrue(sentMessage.getText().contains("John Doe"));
            assertTrue(sentMessage.getText().contains("I-20"));
            assertTrue(sentMessage.getText().contains("Received"));
            assertTrue(sentMessage.getText().contains("Please upload your OPT STEM Receipt"));
        }

        @Test
        @DisplayName("Should handle different document types")
        void sendOptUpdateEmail_WithDifferentDocTypes_ShouldWork() {
            // Arrange
            String[] documentTypes = {"I-983", "I-20", "OPT Receipt", "OPT EAD"};

            for (String docType : documentTypes) {
                OptUpdateEmailRequest request = new OptUpdateEmailRequest();
                request.setTo("employee@example.com");
                request.setEmployeeName("John Doe");
                request.setDocumentType(docType);
                request.setStatus("Approved");
                request.setNextStep("Next step info");

                ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
                doNothing().when(mailSender).send(any(SimpleMailMessage.class));

                // Act
                emailService.sendOptUpdateEmail(request);

                // Assert
                verify(mailSender, atLeastOnce()).send(messageCaptor.capture());
                assertTrue(messageCaptor.getValue().getText().contains(docType));
            }
        }

        @Test
        @DisplayName("Should handle empty next step")
        void sendOptUpdateEmail_WithEmptyNextStep_ShouldUseDefault() {
            // Arrange
            OptUpdateEmailRequest request = new OptUpdateEmailRequest();
            request.setTo("employee@example.com");
            request.setEmployeeName("John Doe");
            request.setDocumentType("I-20");
            request.setStatus("Received");
            request.setNextStep("");

            ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            doNothing().when(mailSender).send(any(SimpleMailMessage.class));

            // Act
            emailService.sendOptUpdateEmail(request);

            // Assert
            verify(mailSender).send(messageCaptor.capture());
            assertTrue(messageCaptor.getValue().getText().contains("No action required"));
        }
    }

    // ==================== Facility Report Email Tests ====================
    @Nested
    @DisplayName("Facility Report Email Tests")
    class FacilityReportEmailTests {

        @Test
        @DisplayName("Should send facility report email successfully")
        void sendFacilityReportEmail_WithValidRequest_ShouldSendEmail() {
            // Arrange
            FacilityReportEmailRequest request = new FacilityReportEmailRequest();
            request.setTo("employee@example.com");
            request.setEmployeeName("John Doe");
            request.setReportTitle("Broken AC in Room 101");
            request.setStatus("In Progress");

            ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            doNothing().when(mailSender).send(any(SimpleMailMessage.class));

            // Act
            emailService.sendFacilityReportEmail(request);

            // Assert
            verify(mailSender).send(messageCaptor.capture());
            SimpleMailMessage sentMessage = messageCaptor.getValue();

            assertEquals("HR Onboarding - Facility Report Update", sentMessage.getSubject());
            assertTrue(sentMessage.getText().contains("John Doe"));
            assertTrue(sentMessage.getText().contains("Broken AC in Room 101"));
            assertTrue(sentMessage.getText().contains("In Progress"));
        }

        @Test
        @DisplayName("Should handle different statuses")
        void sendFacilityReportEmail_WithDifferentStatuses_ShouldWork() {
            // Arrange
            String[] statuses = {"Open", "In Progress", "Closed"};

            for (String status : statuses) {
                FacilityReportEmailRequest request = new FacilityReportEmailRequest();
                request.setTo("employee@example.com");
                request.setEmployeeName("John Doe");
                request.setReportTitle("Test Report");
                request.setStatus(status);

                ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
                doNothing().when(mailSender).send(any(SimpleMailMessage.class));

                // Act
                emailService.sendFacilityReportEmail(request);

                // Assert
                verify(mailSender, atLeastOnce()).send(messageCaptor.capture());
                assertTrue(messageCaptor.getValue().getText().contains(status));
            }
        }
    }

    // ==================== Error Handling Tests ====================
    @Nested
    @DisplayName("Error Handling Tests")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should throw exception when mail sender fails")
        void sendEmail_WhenMailSenderFails_ShouldThrowException() {
            // Arrange
            RegistrationEmailRequest request = new RegistrationEmailRequest();
            request.setTo("test@example.com");
            request.setToken("token");
            request.setRegistrationLink("http://example.com");

            doThrow(new RuntimeException("SMTP connection failed"))
                    .when(mailSender).send(any(SimpleMailMessage.class));

            // Act & Assert
            assertThrows(RuntimeException.class, () -> emailService.sendRegistrationEmail(request));
        }
    }

    // ==================== Email Format Tests ====================
    @Nested
    @DisplayName("Email Format Tests")
    class EmailFormatTests {

        @Test
        @DisplayName("Should set correct from address")
        void sendEmail_ShouldSetCorrectFromAddress() {
            // Arrange
            RegistrationEmailRequest request = new RegistrationEmailRequest();
            request.setTo("test@example.com");
            request.setToken("token");
            request.setRegistrationLink("http://example.com");

            ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            doNothing().when(mailSender).send(any(SimpleMailMessage.class));

            // Act
            emailService.sendRegistrationEmail(request);

            // Assert
            verify(mailSender).send(messageCaptor.capture());
            assertEquals(FROM_EMAIL, messageCaptor.getValue().getFrom());
        }

        @Test
        @DisplayName("Should set correct to address")
        void sendEmail_ShouldSetCorrectToAddress() {
            // Arrange
            RegistrationEmailRequest request = new RegistrationEmailRequest();
            request.setTo("recipient@example.com");
            request.setToken("token");
            request.setRegistrationLink("http://example.com");

            ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            doNothing().when(mailSender).send(any(SimpleMailMessage.class));

            // Act
            emailService.sendRegistrationEmail(request);

            // Assert
            verify(mailSender).send(messageCaptor.capture());
            assertArrayEquals(new String[]{"recipient@example.com"}, messageCaptor.getValue().getTo());
        }
    }
}