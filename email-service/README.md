# Email Service

## Overview
Email notification service for the HR Onboarding System. Handles sending various notification emails.

## Tech Stack
- Java 17 + Spring Boot 4.0
- Spring Cloud Netflix Eureka
- RabbitMQ + Gmail SMTP

## Port
- **8085**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/email/registration` | Send registration email (sync) |
| POST | `/api/email/application-status` | Send application status email |
| POST | `/api/email/opt-update` | Send OPT update email |
| POST | `/api/email/facility-report` | Send facility report email |
| POST | `/api/email/async/*` | Async versions (via RabbitMQ) |

## Prerequisites
1. Start RabbitMQ: `docker start rabbitmq`
2. Configure environment variables: `MAIL_USERNAME`, `MAIL_PASSWORD`

## Run
```bash
mvn spring-boot:run
```

## Swagger UI
```
http://localhost:8085/swagger-ui.html
```