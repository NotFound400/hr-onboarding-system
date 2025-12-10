# Email Service

## Overview

Email Service handles all email notifications for the HR Onboarding System. It provides both synchronous (REST) and asynchronous (RabbitMQ) email delivery.

## Tech Stack

- Java 17
- Spring Boot 4.0
- Spring Cloud Netflix Eureka Client
- RabbitMQ (for async messaging)
- Gmail SMTP
- Swagger/OpenAPI

## Port

- **8085**

## Features

| Feature | Description |
|---------|-------------|
| Registration Email | Send registration link to new employees |
| Application Status Email | Notify employees of onboarding approval/rejection |
| OPT Update Email | Notify employees of visa document status |
| Facility Report Email | Notify employees of facility report updates |
| Sync & Async Delivery | REST endpoints and RabbitMQ queues |

## API Endpoints

### Synchronous (Immediate Delivery)

| Method | Endpoint | Description | Called By |
|--------|----------|-------------|-----------|
| POST | `/api/email/registration` | Send registration email | Auth Service |
| POST | `/api/email/application-status` | Send application status email | Application Service |
| POST | `/api/email/opt-update` | Send OPT document update email | Application Service |
| POST | `/api/email/facility-report` | Send facility report email | Housing Service |

### Asynchronous (Via RabbitMQ)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/email/async/registration` | Queue registration email |
| POST | `/api/email/async/application-status` | Queue application status email |
| POST | `/api/email/async/opt-update` | Queue OPT update email |
| POST | `/api/email/async/facility-report` | Queue facility report email |

## Request/Response Examples

### Registration Email

**Request:**
```json
POST /api/email/registration
{
    "to": "employee@example.com",
    "token": "abc-123-xyz",
    "registrationLink": "http://localhost:3000/register?token=abc-123-xyz"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Registration email sent",
    "data": null
}
```

### Application Status Email

**Request:**
```json
POST /api/email/application-status
{
    "to": "employee@example.com",
    "employeeName": "John Doe",
    "status": "Approved",
    "comment": "Welcome to the team!"
}
```

### OPT Update Email

**Request:**
```json
POST /api/email/opt-update
{
    "to": "employee@example.com",
    "employeeName": "John Doe",
    "documentType": "I-20",
    "status": "Received",
    "nextStep": "Please upload your OPT STEM Receipt"
}
```

### Facility Report Email

**Request:**
```json
POST /api/email/facility-report
{
    "to": "employee@example.com",
    "employeeName": "John Doe",
    "reportTitle": "Broken AC in Room 101",
    "status": "In Progress"
}
```

## RabbitMQ Queues

| Queue Name | Purpose |
|------------|---------|
| `email.registration.queue` | Registration emails |
| `email.application-status.queue` | Application status emails |
| `email.opt-update.queue` | OPT document update emails |
| `email.facility-report.queue` | Facility report emails |

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MAIL_USERNAME` | Gmail address | Yes |
| `MAIL_PASSWORD` | Gmail App Password | Yes |

### application.yml

```yaml
server:
  port: 8085

spring:
  application:
    name: email-service

  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

eureka:
  client:
    enabled: true
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

## Setup Instructions

### 1. Gmail App Password

1. Go to [Google Account](https://myaccount.google.com/)
2. Navigate to **Security**
3. Enable **2-Step Verification**
4. Go to **App Passwords**
5. Create app password for **Mail**
6. Copy the 16-character password

### 2. Configure Environment Variables (IntelliJ)

1. **Run** → **Edit Configurations**
2. Select **EmailServiceApplication**
3. Add Environment Variables:
   ```
   MAIL_USERNAME=your-email@gmail.com;MAIL_PASSWORD=your-app-password
   ```

### 3. Start RabbitMQ (Docker)

```bash
# First time
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management

# Subsequent times
docker start rabbitmq
```

RabbitMQ Dashboard: http://localhost:15672 (guest/guest)

### 4. Start Eureka Server (Optional)

Run EurekaServerApplication first if using service discovery.

### 5. Run Email Service

```bash
mvn spring-boot:run
```

Or run **EmailServiceApplication** in IntelliJ.

## Testing

### Swagger UI

http://localhost:8085/swagger-ui.html

### Verify Eureka Registration

http://localhost:8761 - EMAIL-SERVICE should be listed

### Verify RabbitMQ Queues

http://localhost:15672 → Queues tab

## Project Structure

```
email-service/
├── src/main/java/org/example/emailservice/
│   ├── EmailServiceApplication.java
│   ├── config/
│   │   └── RabbitMQConfig.java
│   ├── consumer/
│   │   └── EmailConsumer.java
│   ├── controller/
│   │   └── EmailController.java
│   ├── dto/
│   │   ├── ApiResponse.java
│   │   ├── ApplicationStatusEmailRequest.java
│   │   ├── FacilityReportEmailRequest.java
│   │   ├── OptUpdateEmailRequest.java
│   │   └── RegistrationEmailRequest.java
│   └── service/
│       └── EmailService.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

## Integration with Other Services

### Auth Service → Email Service

When HR generates a registration token, Auth Service calls Email Service:

```java
@FeignClient(name = "email-service", url = "http://localhost:8085")
public interface EmailServiceClient {
    @PostMapping("/api/email/async/registration")
    ApiResponse<Void> sendRegistrationEmailAsync(@RequestBody RegistrationEmailRequest request);
}
```

### Application Service → Email Service

When HR approves/rejects an application:

```java
emailServiceClient.sendApplicationStatusEmail(request);
```

### Housing Service → Email Service

When facility report status changes:

```java
emailServiceClient.sendFacilityReportEmail(request);
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sending | Check Gmail App Password |
| RabbitMQ connection refused | Run `docker start rabbitmq` |
| Eureka registration failed | Start Eureka Server first |
| 535 Authentication failed | Regenerate Gmail App Password |
