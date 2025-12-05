# HR Onboarding System

Employee and HR portal for managing the onboarding process using microservices architecture.

## Team Members
- [Tengyang Zhang] - Team Lead
- [Wang, Dongdong] - Backend Developer
- [Minghao Guo] - Backend Developer
- [Yanyan Jiang] - Full Stack Developer
- [Wu, Shili] - Frontend Developer

## Tech Stack

### Frontend
- React
- React Router
- Axios
- Tailwind CSS / Material-UI

### Backend
- Spring Boot
- Spring Cloud (Eureka, Gateway, Config, OpenFeign)
- Spring Security
- Spring Data JPA / MongoDB
- MySQL & MongoDB
- RabbitMQ (for async messaging)
- AWS S3 (file storage)
- AWS RDS (MySQL hosting)
- MongoDB Atlas (MongoDB hosting)

### Testing
- JUnit 5
- Mockito
- Jacoco (code coverage)

## Project Structure
hr-onboarding-system/  
├── backend/              # All microservices  
├── frontend/             # React application  
├── config-repo/          # Spring Cloud Config files  
└── docs/                 # Documentation  

## Getting Started

### Prerequisites
- Java 17+
- Node.js 16+
- Maven 3.8+
- MySQL 8.0+
- MongoDB 5.0+

### Setup Instructions
See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

## Architecture
![Architecture Diagram](docs/architecture-diagram.png)

## API Documentation
- Swagger UI available at: `http://localhost:8080/swagger-ui.html` (after starting API Gateway)
