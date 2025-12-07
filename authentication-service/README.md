# Authentication Service

## Overview
Handles user authentication, registration, and JWT token management for the HR Onboarding System.

## Tech Stack
- Java 17
- Spring Boot 4.0
- Spring Security + JWT
- MySQL (AWS RDS)
- Hibernate

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | None | User login |
| POST | /api/auth/register | None | Register new user |
| GET | /api/auth/profile | Bearer | Get user profile |
| POST | /api/auth/registration-token | Bearer (HR) | Generate registration token |
| GET | /api/auth/registration-token/{token} | None | Validate token |
| POST | /api/auth/logout | Bearer | Logout |

## Request/Response Examples

### Login
**Request:**
```json
POST /api/auth/login
{
    "username": "hr_admin",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "eyJ...",
        "tokenType": "Bearer",
        "user": {
            "id": "1",
            "username": "hr_admin",
            "email": "hr@example.com",
            "roles": ["Employee", "HR"]
        },
        "role": "Employee",
        "roles": ["Employee", "HR"]
    }
}
```

### Register
**Request:**
```json
POST /api/auth/register
{
    "token": "registration-token-uuid",
    "username": "employee1",
    "email": "employee1@example.com",
    "password": "password123"
}
```

### Generate Registration Token (HR Only)
**Request:**
```json
POST /api/auth/registration-token
Authorization: Bearer <jwt-token>
{
    "email": "newemployee@example.com"
}
```

## Running Locally

1. Configure database in `application.yml`
2. Run: `mvn spring-boot:run`
3. Access Swagger: http://localhost:8081/swagger-ui.html

## Testing
Swagger UI has built-in testing capabilities.