# Authentication Service

## Overview
Authentication service for the HR Onboarding System. Handles user login, registration, and JWT token management.

## Tech Stack
- Java 17 + Spring Boot 4.0
- Spring Security + JWT
- MySQL (AWS RDS)

## Port
- **8081**

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | User login |
| POST | `/api/auth/register` | No | User registration |
| GET | `/api/auth/profile` | Bearer | Get user profile |
| POST | `/api/auth/registration-token` | Bearer (HR) | Generate registration token |
| GET | `/api/auth/validate-token/{token}` | No | Validate registration token |
| POST | `/api/auth/logout` | Bearer | Logout |

## Run
```bash
mvn spring-boot:run
```

## Swagger UI
```
http://localhost:8081/swagger-ui.html
```

## Test Account
- HR: `hr_admin` / `password123`