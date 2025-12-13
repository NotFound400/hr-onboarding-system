# **HR Onboarding System**

Integration Testing Scenarios

# **Overview**

This document provides comprehensive integration testing scenarios with exact API calls, expected responses, and detailed explanations of what each step does and how microservices interact.

**Postman Collection:** HR Onboarding System\_v3

**Base URL:** http://localhost:8080 (API Gateway)

# **Table of Contents**

1. Scenario 1: Complete Employee Onboarding (13 steps)  
2. Scenario 2: Facility Report Lifecycle (7 steps)  
3. Scenario 3: Application Rejection and Resubmission (8 steps)  
4. Service Interaction Summary

# **Scenario 1: Complete Employee Onboarding**

## **Overview**

This scenario covers the complete flow from HR generating a registration token to an employee completing their onboarding application and viewing their assigned housing.

**Services Involved:** API Gateway → Auth Service → Employee Service → Email Service → Application Service → Housing Service

**Total Steps:** 13

## **Step 1: HR Login**

### **What This Step Does**

The HR administrator authenticates with the system to obtain a JWT token. This token will be used for all subsequent HR operations. The Auth Service validates credentials against the MySQL database, retrieves the user's roles, and generates a signed JWT containing the user ID, username, and roles.

### **Why It's Needed**

All protected endpoints require a valid JWT token. The token identifies who is making the request and what permissions they have (HR vs Employee).

### **API Request**

POST http://localhost:8080/api/auth/login  
Content-Type: application/json

{  
    "username": "hr\_admin",  
    "password": "password123"  
}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Login successful",  
    "data": {  
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJocl9hZG1pbiIsInVzZXJJZCI6MSwicm9sZXMiOlsiRW1wbG95ZWUiLCJIUiJdLCJpYXQiOjE3NjU2MTU0MDEsImV4cCI6MTc2NTcwMTgwMX0.2yrrQ9JyAcTtsrlZrQwk4d2de30kS1EtGKQW-j60Ym0",  
        "tokenType": "Bearer",  
        "expiresAt": "2025-12-14T08:43:22.009593900Z",  
        "user": {  
            "id": 1,  
            "username": "hr\_admin",  
            "email": "hr@example.com",  
            "password": "",  
            "active": **true**,  
            "createDate": "2025-12-07T12:23:12",  
            "lastModificationDate": "2025-12-07T12:23:12",  
            "roles": \[  
                "Employee",  
                "HR"  
            \]  
        },  
        "role": "Employee",  
        "roles": \[  
            "Employee",  
            "HR"  
        \],  
        "houseId": **null**,  
        "employeeId": **null**  
    }  
}

Note: "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJocl9hZG1pbiIsInVzZXJJZCI6MSwicm9sZXMiOlsiRW1wbG95ZWUiLCJIUiJdLCJpYXQiOjE3NjU2MTU0MDEsImV4cCI6MTc2NTcwMTgwMX0.2yrrQ9JyAcTtsrlZrQwk4d2de30kS1EtGKQW-j60Ym0" is set to be the {{hr\_token}} used in later auth headers

### **Service Interaction**

Frontend → API Gateway → Auth Service (8081) → MySQL (users, roles tables)

The Gateway allows this request through without authentication since /api/auth/login is configured as a public endpoint.

## **Step 2: HR Creates a House (If Needed)**

### **What This Step Does**

HR creates a new house in the system that will be assigned to incoming employees. The house is linked to an existing landlord and has a maximum occupancy limit. This information is stored in the Housing Service's MySQL database.

### **Why It's Needed**

Before generating a registration token, HR needs a house to assign the new employee to. The house ID will be embedded in the registration token.

### **API Request**

POST http://localhost:8080/api/housing/houses  
Authorization: Bearer {{hr\_token}}  
Content-Type: application/json

{  
    "landlordId": 1,  
    "address": "789 Tree Avenue, Boston, MA 02102",  
    "maxOccupant": 4  
}

### **Expected Response (201 Created)**

{  
    "success": **true**,  
    "message": "House created successfully",  
    "data": {  
        "id": 10,  
        "address": "789 Tree Avenue, Boston, MA 02102",  
        "maxOccupant": 4,  
        "numberOfEmployees": 0,  
        "landlord": {  
            "id": 1,  
            "firstName": "Alice",  
            "lastName": "Wang",  
            "fullName": "Alice Wang",  
            "email": "alice@gmail.com",  
            "cellPhone": "1234567899"  
        },  
        "facilitySummary": {},  
        "facilities": \[\],  
        "residents": \[\]  
    },  
    "timestamp": "2025-12-13T00:49:34.866632"  
}

### **Service Interaction**

Frontend → API Gateway (validates JWT, extracts roles) → Housing Service (8083) → MySQL

The Gateway validates the JWT token, extracts the user's roles, and adds headers (X-User-Id, X-User-Roles) before forwarding to Housing Service.

## **Step 3: HR Generates Registration Token**

### **What This Step Does**

HR generates a unique registration token for a new employee. This token is a UUID that is linked to the employee's email address, has an expiration date (typically 3 days), contains the assigned house ID, and can only be used once. The system also triggers an email to the new employee with the registration link.

### **Why It's Needed**

This is the security mechanism that ensures only invited employees can register. Without a valid token, no one can create an account.

### **API Request**

POST http://localhost:8080/api/auth/registration-token  
Authorization: Bearer {{hr\_token}}  
Content-Type: application/json

{  
    "email": "newuser12@test.com",  
    "houseId": 10  
}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Registration token generated",  
    "data": {  
        "id": 42,  
        "token": "1a77fe21-6099-4cfa-8721-b4a7247b5846",  
        "email": "newuser12@test.com",  
        "expirationDate": "2025-12-13T03:51:28.2593599",  
        "createdByUserId": "1",  
        "createBy": "1",  
        "createDate": "2025-12-13T00:51:28.5144352",  
        "houseId": 10,  
        "houseAddress": "789 Tree Avenue, Boston, MA 02102"  
    }  
}

Note: “Token”: 1a77fe21-6099-4cfa-8721-b4a7247b5846 sets to be *{{registration\_token}} to be used in later endpoints*

### **Service Interaction**

Auth Service calls Housing Service via Feign to get the house address, creates the token in MySQL, and sends a registration email via RabbitMQ.

Email format:

Welcome to HR Onboarding System\!

You have been invited to join our company. Please complete your registration using the link below:

Registration Link: [http://localhost:3000/register?token=1a77fe21-6099-4cfa-8721-b4a7247b5846](http://localhost:3000/register?token=1a77fe21-6099-4cfa-8721-b4a7247b5846)

Your registration token: 1a77fe21-6099-4cfa-8721-b4a7247b5846

This link will expire in 3 hours.

If you did not request this, please ignore this email.

Best regards,

HR Team

## **Step 4: New Employee Validates Registration Token**

### **What This Step Does**

Before showing the registration form, the frontend validates that the token is legitimate. This endpoint checks if the token exists, hasn't been used, and hasn't expired.

### **Why It's Needed**

This prevents users from wasting time filling out a form with an invalid token. It also pre-populates the email field since it must match the token.

### **API Request**

GET http://localhost:8080/api/auth/validate-token/*{{registration\_token}}*

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Token is valid",  
    "data": {  
        "id": 42,  
        "token": "1a77fe21-6099-4cfa-8721-b4a7247b5846",  
        "email": "newuser12@test.com",  
        "expirationDate": "2025-12-13T03:51:28",  
        "createdByUserId": "1",  
        "createBy": "1",  
        "createDate": "2025-12-13T00:54:27.9356999",  
        "houseId": 10,  
        "houseAddress": "789 Tree Avenue, Boston, MA 02102"  
    }  
}

### **Service Interaction**

This is a public endpoint (no authentication required) since the user doesn't have an account yet.

## **Step 5: New Employee Registers Account**

### **What This Step Does**

The new employee creates their account using the registration token. This validates the token, creates the user account in Auth Service (MySQL), assigns the 'Employee' role, creates an initial employee record in Employee Service (MongoDB), and marks the token as used.

### **Why It's Needed**

This is the account creation step. It links the Auth user to an Employee record and associates them with their assigned house.

### **API Request**

POST http://localhost:8080/api/auth/register  
Content-Type: application/json

{  
    "token": "*{{registration\_token}}*",  
    "username": "newuser12",  
    "email": "newuser12@test.com",  
    "password": "password123"  
}

### **Expected Response (201 Created)**

{  
    "success": **true**,  
    "message": "User registered successfully",  
    "data": {  
        "id": 23,  
        "username": "newuser12",  
        "email": "newuser12@test.com",  
        "password": "",  
        "active": **true**,  
        "createDate": "2025-12-13T00:56:24.4323835",  
        "lastModificationDate": "2025-12-13T00:56:24.4323835",  
        "roles": \[  
            "Employee"  
        \]  
    }  
}

### **Service Interaction**

Auth Service calls Employee Service synchronously via Feign to create the MongoDB employee document.

## **Step 6: New Employee Logs In**

### **What This Step Does**

The newly registered employee logs in to get their JWT token. The response includes their employeeId (MongoDB ID) and houseId which the frontend uses for navigation and API calls.

### **Why It's Needed**

The employee needs their own JWT token to access protected resources like updating their profile and creating applications.

### **API Request**

POST http://localhost:8080/api/auth/login  
Content-Type: application/json

{  
    "username": "newuser12@test.com",  
    "password": "password123"  
}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Login successful",  
    "data": {  
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuZXd1c2VyMTIiLCJ1c2VySWQiOjIzLCJyb2xlcyI6WyJFbXBsb3llZSJdLCJpYXQiOjE3NjU2MTY1MzUsImV4cCI6MTc2NTcwMjkzNSwiaG91c2VJZCI6MTAsImVtcGxveWVlSWQiOiI2OTNkMmEzOTYyYWRjMTZlZDgwNzlmMmMifQ.Ue50KFnC2tT0q3ByBekJI5eODfj8-ZzMYrleDuRfmEE",  
        "tokenType": "Bearer",  
        "expiresAt": "2025-12-14T09:02:15.713237600Z",  
        "user": {  
            "id": 23,  
            "username": "newuser12",  
            "email": "newuser12@test.com",  
            "password": "",  
            "active": **true**,  
            "createDate": "2025-12-13T00:56:24",  
            "lastModificationDate": "2025-12-13T00:56:24",  
            "roles": \[  
                "Employee"  
            \]  
        },  
        "role": "Employee",  
        "roles": \[  
            "Employee"  
        \],  
        "houseId": 10,  
        "employeeId": "693d2a3962adc16ed8079f2c"  
    }  
}

Note: "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuZXd1c2VyMTIiLCJ1c2VySWQiOjIzLCJyb2xlcyI6WyJFbXBsb3llZSJdLCJpYXQiOjE3NjU2MTY1MzUsImV4cCI6MTc2NTcwMjkzNSwiaG91c2VJZCI6MTAsImVtcGxveWVlSWQiOiI2OTNkMmEzOTYyYWRjMTZlZDgwNzlmMmMifQ.Ue50KFnC2tT0q3ByBekJI5eODfj8-ZzMYrleDuRfmEE" is set to be {{employee\_token}} used in later auth header  
And "employeeId": "693d2a3962adc16ed8079f2c" is set to be {{employeeId}} used in later endpoints

## **Step 7: Employee Updates Personal Information**

### **What This Step Does**

The employee fills out their personal information including name, contact details, emergency contacts, address, and visa status. This updates their MongoDB document in Employee Service with all the nested embedded documents.

### **Why It's Needed**

This information is required for the onboarding application. HR needs to know the employee's personal details, emergency contacts, and work authorization status.

### **API Request**

PUT http://localhost:8080/api/employees/{{employeeId}}  
Authorization: Bearer {{employee\_token}}  
Content-Type: application/json

{  
    "id": "693ca6a43f2e47be25b6f992",  
    "userID": 23,  
    "firstName": "Benjamin update",  
    "lastName": "Harper update",  
    "middleName": "T",  
    "preferredName": "Ben",  
    "email": "ben.harper@example.com",  
    "cellPhone": "415-555-2099",  
    "alternatePhone": "415-555-1122",  
    "gender": "Femail",  
    "SSN": "567-89-0123",  
    "DOB": "1991-03-22T00:00:00",  
    "startDate": "2025-01-10T08:30:00",  
    "endDate": **null**,  
    "driverLicense": "H78902345",  
    "driverLicenseExpiration": "2029-03-22T00:00:00",  
    "houseID": 10,  
    "contact": \[  
        {  
            "id": **null**,  
            "firstName": "Olivia",  
            "lastName": "Harper",  
            "cellPhone": "415-555-3344",  
            "alternatePhone": **null**,  
            "email": "olivia.harper@example.com",  
            "relationship": "Wife",  
            "type": "Emergency"  
        },  
        {  
            "id": **null**,  
            "firstName": "Liam",  
            "lastName": "Harper",  
            "cellPhone": "415-555-5566",  
            "alternatePhone": **null**,  
            "email": "liam.harper@example.com",  
            "relationship": "Brother",  
            "type": "Backup Emergency"  
        }  
    \],  
    "address": \[  
        {  
            "id": **null**,  
            "addressLine1": "842 Market St",  
            "addressLine2": "Floor 5",  
            "city": "San Francisco",  
            "state": "CA",  
            "zipCode": "94103"  
        }  
    \],  
    "visaStatus": \[  
        {  
            "id": **null**,  
            "visaType": "Green Card",  
            "activeFlag": "Yes",  
            "startDate": "2020-08-01T00:00:00",  
            "endDate": **null**,  
            "lastModificationDate": "2024-12-01T09:15:00"  
        }  
    \],  
    "personalDocument": \[  
        {  
            "id": **null**,  
            "path": "/docs/ben/green\_card.pdf",  
            "title": "Green Card",  
            "comment": "Permanent resident ID",  
            "createDate": "2024-12-01T09:20:00"  
        },  
        {  
            "id": **null**,  
            "path": "/docs/ben/driver\_license.png",  
            "title": "Driver License",  
            "comment": "Scanned at HR office",  
            "createDate": "2024-12-05T12:45:00"  
        }  
    \]  
}

### **Expected Response (200 OK)**

{  
    "id": "693d2a3962adc16ed8079f2c",  
    "userID": 23,  
    "firstName": "Benjamin update",  
    "lastName": "Harper update",  
    "middleName": "T",  
    "preferredName": "Ben",  
    "email": "ben.harper@example.com",  
    "cellPhone": "415-555-2099",  
    "alternatePhone": "415-555-1122",  
    "gender": "Femail",  
    "startDate": "2025-01-10T08:30:00",  
    "endDate": **null**,  
    "driverLicense": "H78902345",  
    "driverLicenseExpiration": "2029-03-22T00:00:00",  
    "houseID": 10,  
    "contact": \[  
        {  
            "id": **null**,  
            "firstName": "Olivia",  
            "lastName": "Harper",  
            "cellPhone": "415-555-3344",  
            "alternatePhone": **null**,  
            "email": "olivia.harper@example.com",  
            "relationship": "Wife",  
            "type": "Emergency"  
        },  
        {  
            "id": **null**,  
            "firstName": "Liam",  
            "lastName": "Harper",  
            "cellPhone": "415-555-5566",  
            "alternatePhone": **null**,  
            "email": "liam.harper@example.com",  
            "relationship": "Brother",  
            "type": "Backup Emergency"  
        }  
    \],  
    "address": \[  
        {  
            "id": **null**,  
            "addressLine1": "842 Market St",  
            "addressLine2": "Floor 5",  
            "city": "San Francisco",  
            "state": "CA",  
            "zipCode": "94103"  
        }  
    \],  
    "visaStatus": \[  
        {  
            "id": **null**,  
            "visaType": "Green Card",  
            "activeFlag": "Yes",  
            "startDate": "2020-08-01T00:00:00",  
            "endDate": **null**,  
            "lastModificationDate": "2024-12-01T09:15:00"  
        }  
    \],  
    "personalDocument": \[  
        {  
            "id": **null**,  
            "path": "/docs/ben/green\_card.pdf",  
            "title": "Green Card",  
            "comment": "Permanent resident ID",  
            "createDate": "2024-12-01T09:20:00"  
        },  
        {  
            "id": **null**,  
            "path": "/docs/ben/driver\_license.png",  
            "title": "Driver License",  
            "comment": "Scanned at HR office",  
            "createDate": "2024-12-05T12:45:00"  
        }  
    \],  
    "ssn": **null**,  
    "dob": **null**  
}

Note that the backend allows editing all the fields for the employee object, but the frontend should make only certain fields editable depending on if HR or employee is editing it.Depending on what token is included in the header {{hr\_token}} or {{employee\_token}}, the frontend should expose different fields.

### **Service Interaction**

Employee Service updates the MongoDB document, automatically generating UUIDs for any new embedded documents.

## **Step 8: Employee Creates Onboarding Application**

### **What This Step Does**

The employee creates an onboarding application to formally begin the HR review process. The application starts in 'Open' status, meaning the employee can still make changes and upload documents.

### **Why It's Needed**

The application workflow tracks the employee's onboarding progress. It provides a structured way for employees to submit documents and for HR to review.

### **API Request**

POST post http://localhost:8080/api/applications/  
Authorization: Bearer {{employee\_token}}

{  
  "employeeId": "693d2a3962adc16ed8079f2c",  
  "applicationType": "OPT",  
  "comment": "OPT Pending 222"  
}

### **Expected Response (201 Created)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "id": 26,  
        "employeeId": "693d2a3962adc16ed8079f2c",  
        "createDate": "2025-12-13T01:43:50.6082668",  
        "lastModificationDate": "2025-12-13T01:43:50.6082668",  
        "status": "Open",  
        "comment": "OPT Pending 222",  
        "applicationType": "OPT"  
    }  
}

## **Step 9: Employee Uploads Required Documents**

### **What This Step Does**

The employee uploads required documents (driver's license, work authorization, etc.) to their application. Each document is uploaded to AWS S3 with a unique key and recorded in the database with metadata.

### **Why It's Needed**

HR needs to review supporting documents before approving the onboarding. Documents are stored in S3 for durability.

### **API Request**

POST http://localhost:8080/api/applications/documents/upload  
Authorization: Bearer {{employee\_token}}  
Content-Type: multipart/form-data

file: \[Binary file\]  
metadata: {"applicationId":26,"type":"F1 visa","title":"F1 visa Scan","description":"Scan of employee F1 visa"}

Response:  
{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "id": 34,  
        "type": "F1 visa",  
        "isRequired": **true**,  
        "path": "https://hr-onboarding-storage.s3.us-east-2.amazonaws.com/documents/26/abd66a4c-dc83-407d-946e-e14c64f0a0c8-upload\_picture.jpg",  
        "description": "Scan of employee F1 visa",  
        "title": "F1 visa Scan",  
        "applicationId": 26  
    }  
}

### **Service Interaction**

Application Service uploads the file to S3 and creates a database record linking the document to the application.

## **Step 10: Employee Submits Application**

### **What This Step Does**

The employee submits their application for HR review. This changes the status from 'Open' to 'Pending' and locks the application from further edits until HR takes action.

### **Why It's Needed**

Submission signals that the employee has completed their portion and is ready for HR review.

### **API Request**

POST http://localhost:8080/api/applications/26/submit  
Authorization: Bearer {{employee\_token}}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "id": 26,  
        "status": "Pending",  
        "comment": "OPT Pending 222"  
    }  
}

Before changing status, Application Service validates that all required documents have been uploaded.

## **Step 11: HR Views Pending Applications**

### **What This Step Does**

HR retrieves a list of all applications awaiting review. For each application, the system fetches the employee name from Employee Service.

### **API Request**

GET http://localhost:8080/api/applications/status/Pending  
Authorization: Bearer {{hr\_token}}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": \[  
        {  
            "id": 26,  
            "employeeId": "693d2a3962adc16ed8079f2c",  
            "createDate": "2025-12-13T01:43:51",  
            "lastModificationDate": "2025-12-13T01:57:41",  
            "status": "Pending",  
            "comment": "OPT Pending 222",  
            "applicationType": "OPT"  
        },  
        {  
            "id": 25,  
            "employeeId": "693cf0f802bc4445bcbf5160",  
            "createDate": "2025-12-12T23:56:27",  
            "lastModificationDate": "2025-12-12T23:57:20",  
            "status": "Pending",  
            "comment": "Updated remark before submission",  
            "applicationType": "OPT"  
        },  
        {  
            "id": 23,  
            "employeeId": "693cf0f802bc4445bcbf5160",  
            "createDate": "2025-12-12T23:40:35",  
            "lastModificationDate": "2025-12-12T23:45:09",  
            "status": "Pending",  
            "comment": "Updated remark before submission",  
            "applicationType": "OPT"  
        },  
        {  
            "id": 16,  
            "employeeId": "693cf0f802bc4445bcbf5160",  
            "createDate": "2025-12-12T21:54:46",  
            "lastModificationDate": "2025-12-12T22:03:51",  
            "status": "Pending",  
            "comment": "OPT Pending 222",  
            "applicationType": "OPT"  
        },  
        {  
            "id": 14,  
            "employeeId": "693ca6a43f2e47be25b6f992",  
            "createDate": "2025-12-12T20:57:59",  
            "lastModificationDate": "2025-12-12T20:57:59",  
            "status": "Pending",  
            "comment": "OPT Pending 222",  
            "applicationType": "OPT"  
        },  
        {  
            "id": 13,  
            "employeeId": "693ca6a43f2e47be25b6f992",  
            "createDate": "2025-12-12T16:23:19",  
            "lastModificationDate": "2025-12-12T19:26:57",  
            "status": "Pending",  
            "comment": "Updated remark before submission",  
            "applicationType": "OPT"  
        },  
        {  
            "id": 12,  
            "employeeId": "693ca6a43f2e47be25b6f992",  
            "createDate": "2025-12-12T15:39:11",  
            "lastModificationDate": "2025-12-12T15:39:11",  
            "status": "Pending",  
            "comment": "OPT Pending 222",  
            "applicationType": "OPT"  
        },  
        {  
            "id": 6,  
            "employeeId": "6936fd1151aab8bb4fad7293",  
            "createDate": "2025-12-10T13:48:09",  
            "lastModificationDate": "2025-12-10T13:48:09",  
            "status": "Pending",  
            "comment": "OPT Pending",  
            "applicationType": "OPT"  
        },  
        {  
            "id": 5,  
            "employeeId": "6935ab81bb163e670e6c5be2",  
            "createDate": "2025-12-10T13:47:33",  
            "lastModificationDate": "2025-12-10T13:47:33",  
            "status": "Pending",  
            "comment": "Start Onboarding",  
            "applicationType": "ONBOARDING"  
        },  
        {  
            "id": 4,  
            "employeeId": "6935ab37bb163e670e6c5be1",  
            "createDate": "2025-12-10T13:47:12",  
            "lastModificationDate": "2025-12-10T13:47:12",  
            "status": "Pending",  
            "comment": "Start Onboarding",  
            "applicationType": "ONBOARDING"  
        },  
        {  
            "id": 3,  
            "employeeId": "69349799cdc561de9cddb191",  
            "createDate": "2025-12-10T13:46:43",  
            "lastModificationDate": "2025-12-10T13:46:43",  
            "status": "Pending",  
            "comment": "Start Onboarding",  
            "applicationType": "ONBOARDING"  
        },  
        {  
            "id": 2,  
            "employeeId": "693495f1cdc561de9cddb190",  
            "createDate": "2025-12-10T13:44:03",  
            "lastModificationDate": "2025-12-10T13:44:03",  
            "status": "Pending",  
            "comment": "Start OPT STEM",  
            "applicationType": "OPT"  
        }  
    \]  
}

### **Service Interaction**

Application Service makes Feign calls to Employee Service to retrieve each employee's name.

## **Step 12: HR Approves Application**

### **What This Step Does**

HR approves the application after reviewing the documents. This changes the status to 'Approved', records the HR user who approved it, and triggers an email notification to the employee.

### **API Request**

POST http://localhost:8080/api/applications/26/approve  
Authorization: Bearer {{hr\_token}}

{  
  "comment": "Approved, welcome aboard\!"  
}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "id": 26,  
        "status": "Approved",  
        "comment": "Approved, welcome aboard\!"  
    }  
}  
Approval Email:  
Dear Ben,

Congratulations\! Your onboarding application has been approved.

HR Comment: Approved, welcome aboard\!

If you have any questions, please contact HR.

Best regards,  
HR Team

### **Service Interaction**

The email flow is asynchronous via RabbitMQ, ensuring the approval isn't blocked by slow email delivery.

## **Step 13: Employee Views Assigned House**

### **What This Step Does**

The employee views details about their assigned housing, including the address, landlord contact information, facilities available, and their roommates.

### **API Request**

GET http://localhost:8080/api/housing/houses/my-house  
Authorization: Bearer {{employee\_token}}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "id": 10,  
        "address": "789 Tree Avenue, Boston, MA 02102",  
        "landlordContact": {  
            "fullName": "Alice Wang",  
            "phone": "1234567899",  
            "email": "alice@gmail.com"  
        },  
        "facilitySummary": {},  
        "residents": \[  
            {  
                "employeeId": "693d2a3962adc16ed8079f2c",  
                "name": "Ben",  
                "phone": "415-555-2099"  
            }  
        \]  
    },  
    "timestamp": "2025-12-13T02:15:09.256035"  
}

### **Service Interaction**

The Gateway extracts houseId from the JWT claims. Housing Service calls Employee Service to get all employees assigned to that house (roommates).

# **Scenario 2: Facility Report Lifecycle**

## **Overview**

An employee reports a facility issue in their assigned house. HR manages the report through its lifecycle, and both parties communicate via comments. Email notifications are sent when the status changes.

**Services Involved:** API Gateway → Housing Service → Employee Service → Email Service

**Total Steps:** 7

## **Step 1: Employee Views House Facilities**

The employee views all facilities in their assigned house to identify which one has an issue. This returns a list of all facility items (beds, desks, AC units, etc.) with their descriptions.

### **API Request**

GET http://localhost:8080/api/housing/facilities/house/10

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": \[  
        {  
            "id": 6,  
            "houseId": 10,  
            "type": "Bed",  
            "description": "King size bed",  
            "quantity": 3  
        }  
    \],  
    "timestamp": "2025-12-13T02:26:10.8584423"  
}

## **Step 2: Employee Creates Facility Report**

The employee creates a report describing the facility issue. The report is linked to a specific facility and starts in 'Open' status. The system records who created the report.

### **API Request**

POST http://localhost:8080/api/housing/facility-reports  
{ "facilityId": 1, "title": "Broken bed frame", "description": "..." }

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Report created successfully",  
    "data": {  
        "id": 6,  
        "facilityId": 6,  
        "facilityType": "Bed",  
        "houseId": 10,  
        "houseAddress": "789 Tree Avenue, Boston, MA 02102",  
        "title": "Broken bed frame",  
        "description": "The bed frame in room 2 has a broken leg and needs repair",  
        "employeeId": 23,  
        "createdBy": "Ben",  
        "createDate": "2025-12-13T02:41:51.167754",  
        "status": "Open",  
        "statusDisplayName": "Open",  
        "comments": \[\]  
    },  
    "timestamp": "2025-12-13T02:41:51.6043981"  
}

## **Step 3: HR Views Reports for House**

HR views all facility reports for a specific house. Results are paginated (5 per page by default) and include a count of comments for each report.

### **API Request**

GET http://localhost:8080/api/housing/facility-reports/house/10?page=0

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "content": \[  
            {  
                "id": 6,  
                "title": "Broken bed frame",  
                "createDate": "2025-12-13T02:41:51",  
                "status": "Open",  
                "statusDisplayName": "Open"  
            }  
        \],  
        "pageable": {  
            "pageNumber": 0,  
            "pageSize": 5,  
            "sort": \[\],  
            "offset": 0,  
            "unpaged": **false**,  
            "paged": **true**  
        },  
        "last": **true**,  
        "totalElements": 1,  
        "totalPages": 1,  
        "size": 5,  
        "number": 0,  
        "sort": \[\],  
        "first": **true**,  
        "numberOfElements": 1,  
        "empty": **false**  
    },  
    "timestamp": "2025-12-13T02:47:36.8156256"  
}

## **Step 4: HR Updates Report Status**

HR changes the report status (e.g., from 'Open' to 'In Progress') and adds a comment. This triggers an email notification to the employee who created the report.

### **API Request**

PUT http://localhost:8080/api/housing/facility-reports/6  
{  
    "status": "IN PROGRESS", // Can be “CLOSE” or “OPEN”  
    "comment": "Maintenance team has been notified"  
}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Report status updated successfully",  
    "data": {  
        "id": 6,  
        "facilityId": 6,  
        "facilityType": "Bed",  
        "houseId": 10,  
        "houseAddress": "789 Tree Avenue, Boston, MA 02102",  
        "title": "Broken bed frame",  
        "description": "The bed frame in room 2 has a broken leg and needs repair",  
        "employeeId": 23,  
        "createdBy": "Ben",  
        "createDate": "2025-12-13T02:41:51",  
        "status": "InProgress",  
        "statusDisplayName": "In Progress",  
        "comments": \[\]  
    },  
    "timestamp": "2025-12-13T02:51:34.1348005"  
}

Email Format:

Dear Benjamin update Harper update,

Your facility report "Broken bed frame" status has been updated to: In Progress

Please log in to the system to view details.

Best regards,  
HR Team

## **Step 5: Employee Adds Comment**

The employee adds a comment to the report, such as providing availability for a repair visit.

### **API Request**

POST http://localhost:8080/api/housing/facility-reports/comments  
{  
    "facilityReportId": 6,  
    "comment": "I am available on Friday"  
}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Comment added successfully",  
    "data": {  
        "id": 4,  
        "facilityReportId": 6,  
        "employeeId": 23,  
        "createdBy": "Ben",  
        "comment": "I am available on Friday",  
        "createDate": "2025-12-13T02:54:27.9943911",  
        "lastModificationDate": **null**,  
        "displayDate": "2025-12-13T02:54:27.9943911",  
        "canEdit": **true**  
    },  
    "timestamp": "2025-12-13T02:54:28.2461055"  
}

## **Step 6: View All Comments**

Retrieve all comments for a specific facility report. This shows the complete communication history.

### **API Request**

GET http://localhost:8080/api/housing/facility-reports/6/comments

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": \[  
        {  
            "id": 4,  
            "facilityReportId": 6,  
            "employeeId": 23,  
            "createdBy": "Ben",  
            "comment": "I am available on Friday",  
            "createDate": "2025-12-13T02:54:28",  
            "lastModificationDate": **null**,  
            "displayDate": "2025-12-13T02:54:28",  
            "canEdit": **true**  
        }  
    \],  
    "timestamp": "2025-12-13T02:57:00.0531549"  
}

## **Step 7: HR Closes Report**

HR marks the report as closed after the issue is resolved. A final comment documents the resolution. Another email notification is sent.

### **API Request**

PUT http://localhost:8080/api/housing/facility-reports/6  
{  
    "status": "CLOSED",  
    "comment": "Maintenance has finished"  
}

Email Format:

Dear Benjamin update Harper update,

Your facility report "Broken bed frame" status has been updated to: Closed

Please log in to the system to view details.

Best regards,  
HR Team

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Report status updated successfully",  
    "data": {  
        "id": 6,  
        "facilityId": 6,  
        "facilityType": "Bed",  
        "houseId": 10,  
        "houseAddress": "789 Tree Avenue, Boston, MA 02102",  
        "title": "Broken bed frame",  
        "description": "The bed frame in room 1 has a broken leg and needs repair",  
        "employeeId": 23,  
        "createdBy": "Ben",  
        "createDate": "2025-12-13T02:41:51",  
        "status": "Closed",  
        "statusDisplayName": "Closed",  
        "comments": \[  
            {  
                "id": 4,  
                "facilityReportId": 6,  
                "employeeId": 23,  
                "createdBy": "Ben",  
                "comment": "I am available on Sat",  
                "createDate": "2025-12-13T02:54:28",  
                "lastModificationDate": **null**,  
                "displayDate": "2025-12-13T02:54:28",  
                "canEdit": **false**  
            }  
        \]  
    },  
    "timestamp": "2025-12-13T03:04:17.2595315"  
}

### 

### **Status Progression**

Report Status: Open → In Progress → Closed

# **Scenario 3: Application Rejection and Resubmission**

## **Overview**

HR rejects an application because of document issues. The employee corrects the problems and resubmits. This scenario tests the rejection workflow and the ability to resubmit.

**Services Involved:** API Gateway → Application Service → Employee Service → Email Service → S3

**Total Steps:** 8

## **Step 1: HR Rejects Application**

HR rejects the application with a detailed comment explaining what needs to be fixed. This changes the status to 'Rejected' and sends an email notification to the employee.

### **API Request**

POST http://localhost:8080/api/applications/27/reject  
{  
  "comment": "Denied, more documents needed\!"  
}  
Note: Application with id 27 is the newly submitted application with Pending status

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "id": 27,  
        "status": "Rejected",  
        "comment": "Denied, more documents needed\!"  
    }  
}  
Email Format:

Dear Ben,

Unfortunately, your onboarding application has been rejected.

HR Comment: Denied, more documents needed\!

If you have any questions, please contact HR.

Best regards,

HR Team

Key Point: The 'Rejected' status allows the employee to modify the application again.

## **Step 2: Employee Views Rejection Details**

The employee views their rejected application to see HR's feedback and understand what needs to be fixed.

### **API Request**

GET http://localhost:8080/api/applications/27

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "id": 27,  
        "status": "Rejected",  
        "comment": "Denied, more documents needed\!"  
    }  
}

## **Step 3: Employee Deletes Problematic Document**

The employee deletes the blurry driver's license scan. This removes both the database record and the file from S3.

### **API Request**

DELETE http://localhost:8080/api/applications/documents/delete/35

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": "Document deleted successfully"  
}

Key Point: Documents can only be deleted when the application is in 'Open' or 'Rejected' status.

## **Step 4: Employee Uploads Corrected Document**

The employee uploads a clearer scan of their F1 visa.

### **API Request**

POST http://localhost:8080/api/applications/documents/upload  
Authorization: Bearer {{employee\_token}}  
Content-Type: multipart/form-data

file: \[Binary file\]  
metadata: {"applicationId":27,"type":"F1 visa","title":"F1 visa Scan","description":"Scan of employee F1 visa"}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "id": 37,  
        "type": "F1 visa",  
        "isRequired": **true**,  
        "path": "https://hr-onboarding-storage.s3.us-east-2.amazonaws.com/documents/27/c46187a3-9e83-4352-985a-2fb683628f21-upload\_picture.jpg",  
        "description": "Scan of employee F1 visa",  
        "title": "F1 visa Scan",  
        "applicationId": 27  
    }  
}

## **Step 5: Employee Uploads Missing Document**

The employee uploads the missing I-9 form that HR mentioned in the rejection comment.

### **API Request**

POST http://localhost:8080/api/applications/documents/upload  
Authorization: Bearer {{employee\_token}}  
Content-Type: multipart/form-data

file: \[Binary file\]  
metadata: {"applicationId":27,"type":"F1 visa","title":"F1 visa Scan","description":"Scan of employee F1 visa"}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "id": 38,  
        "type": "I9",  
        "isRequired": **false**,  
        "path": "https://hr-onboarding-storage.s3.us-east-2.amazonaws.com/documents/27/fc2f0580-3d30-4645-a3ea-aa262b96a51a-upload\_picture.jpg",  
        "description": "Scan of employee I9",  
        "title": "I9 Scan",  
        "applicationId": 27  
    }  
}

## **Step 6: Employee Updates Application Comment**

The employee updates their application comment to explain the changes made.

### **API Request**

PUT http://localhost:8080/api/applications/27  
{  
  "comment": "Updated remark before submission",  
  "applicationType": "OPT"  
}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "id": 27,  
        "employeeId": "693d2a3962adc16ed8079f2c",  
        "createDate": "2025-12-13T03:10:26",  
        "lastModificationDate": "2025-12-13T03:41:48.9626517",  
        "status": "Rejected",  
        "comment": "Updated remark before submission",  
        "applicationType": "OPT"  
    }  
}

## **Step 7: Employee Resubmits Application**

The employee submits the corrected application for HR review again. This changes the status from 'Rejected' back to 'Pending'.

### **API Request**

POST http://localhost:8080/api/applications/27/submit

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "id": 27,  
        "status": "Pending",  
        "comment": "Updated remark before submission"  
    }  
}

Key Point: The submit endpoint allows submission from both 'Open' AND 'Rejected' status.

## **Step 8: HR Approves Resubmitted Application**

HR reviews the corrected application and approves it, completing the rejection/resubmission cycle.

### **API Request**

POST http://localhost:8080/api/applications/27/approve  
{  
  "comment": "Approved, welcome aboard\!"  
}

### **Expected Response (200 OK)**

{  
    "success": **true**,  
    "message": "Success",  
    "data": {  
        "id": 2,  
        "status": "Approved",  
        "comment": "Approved, welcome aboard\!"  
    }  
}  
Email Format:

Dear Ben,

Congratulations\! Your onboarding application has been approved.

HR Comment: Approved, welcome aboard\!

If you have any questions, please contact HR.

Best regards,  
HR Team

### **Status Progression**

Pending → Rejected → (Modified & Resubmitted) → Pending → Approved

### **Valid Status Transitions**

| Current Status | Allowed Actions |
| :---- | :---- |
| Open | Update, Upload docs, Delete docs, Submit |
| Pending | Approve (HR only), Reject (HR only) |
| Rejected | Update, Upload docs, Delete docs, Submit |
| Approved | (Terminal state \- no changes allowed) |

# **Service Interaction Summary**

## **Communication Patterns**

| Pattern | Used For | Services |
| :---- | :---- | :---- |
| Synchronous (Feign) | Real-time data needs | Auth↔Employee, Housing↔Employee |
| Async (RabbitMQ) | Email notifications | Auth→Email, App→Email, Housing→Email |
| File Storage (S3) | Document management | Application→S3 |

## **Gateway Header Injection**

When JWT is valid, Gateway adds these headers for downstream services:

* X-User-Id: User ID from JWT userId claim  
* X-Username: Username from JWT sub claim  
* X-User-Roles: Roles from JWT (e.g., 'Employee,HR')  
* X-House-Id: House ID from JWT custom claim

## **Database Distribution**

| Service | Database | Key Tables/Collections |
| :---- | :---- | :---- |
| Auth Service | MySQL | users, roles, registration\_tokens |
| Employee Service | MongoDB | employees (embedded documents) |
| Housing Service | MySQL | houses, landlords, facility\_reports |
| Application Service | MySQL | application\_workflow, digital\_documents |

*Document Version: 2.0  |  Last Updated: December 2024  |  Compatible with HR Onboarding System v3*