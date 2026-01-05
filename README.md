# Riwi Employability API

**Developed by:** Carlos Vellojin

REST API for managing employability vacancies and coder applications for the Riwi program.

## Description

Centralized platform that allows:
- Managing job vacancies with comprehensive information
- Enabling autonomous applications from coders
- Access control through roles (Administrator, Manager, Coder)
- Business rule validation (maximum slots, application limits)
- Complete traceability of the employability process

## Technologies Used

- **Backend:** Node.js with NestJS
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT + API Key
- **Documentation:** Swagger
- **Testing:** Jest
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla with Promises)

## Prerequisites

- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm or yarn

## Installation and Execution

### 1. Clone the repository

```bash
git clone <your-repository>
cd riwi-employability-api
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=riwi_employability
JWT_SECRET=riwi_employability_secret_key_change_in_production
JWT_EXPIRES_IN=24h
API_KEY=riwi_api_key_2024_change_in_production
```

### 4. Create the database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE riwi_employability;
\q
```

### 5. Run seeders (users with roles)

```bash
npm run seed
```

This will create the following test users:
- **Administrator:** admin@riwi.io / password123
- **Manager:** gestor@riwi.io / password123
- **Coder:** carlos@example.com / password123

### 6. Start the server

```bash
# Development with hot-reload
npm run start:dev

# Production
npm run build
npm run start:prod
```

The server will be available at: `http://localhost:3001`

### 7. Start the frontend

Open `public/frontend/index.html` in a web browser, or use a local server:

```bash
npm run dev
```

Frontend available at: `http://localhost:3000`

## Swagger URL

Interactive API documentation:

**http://localhost:3001/api/docs**

## Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── dto/           # DTOs for login and registration
│   │   ├── strategies/    # JWT Strategy
│   │   ├── auth.service.ts
│   │   └── auth.controller.ts
│   ├── users/             # Users module
│   │   ├── entities/      # User entity
│   │   └── users.service.ts
│   ├── vacancies/         # Vacancies module
│   │   ├── entities/      # Vacancy entity
│   │   ├── dto/           # DTOs for creating/updating vacancies
│   │   ├── vacancies.service.ts
│   │   └── vacancies.controller.ts
│   ├── applications/      # Applications module
│   │   ├── entities/      # Application entity
│   │   ├── dto/           # DTOs for applications
│   │   ├── applications.service.ts
│   │   └── applications.controller.ts
│   ├── technologies/      # Technologies module
│   │   ├── entities/      # Technology entity
│   │   └── technologies.service.ts
│   ├── common/            # Shared elements
│   │   ├── decorators/    # @Roles, @CurrentUser, @Public
│   │   ├── guards/        # JWT Guard, API Key Guard, Roles Guard
│   │   ├── interceptors/  # Response Interceptor
│   │   └── enums/         # Role enum
│   ├── database/
│   │   └── seeds/         # Seeder scripts
│   ├── app.module.ts
│   └── main.ts
├── test/
└── package.json

public/frontend/
├── index.html             # Main interface
├── styles.css             # Styles
└── app.js                 # Logic with promises
```

## Main Endpoints

### Authentication

- `POST /api/auth/register` - Register new coder
- `POST /api/auth/login` - Log in

### Vacancies

- `GET /api/vacancies` - List active vacancies
- `GET /api/vacancies/:id` - Detailed view of a vacancy
- `POST /api/vacancies` - Create vacancy (Manager/Admin)
- `PATCH /api/vacancies/:id` - Update vacancy (Manager/Admin)
- `PATCH /api/vacancies/:id/toggle-active` - Activate/Deactivate (Manager/Admin)

### Applications

- `POST /api/applications` - Apply to vacancy (Coder)
- `GET /api/applications/my-applications` - My applications (Coder)
- `GET /api/applications` - All applications (Manager/Admin)
- `GET /api/applications/vacancy/:id` - Applications per vacancy (Manager/Admin)
- `DELETE /api/applications/:id` - Cancel application (Coder)

### Endpoint Authentication

All endpoints (except register and login) require:

**Headers:**
```
Authorization: Bearer <jwt-token>
x-api-key: riwi_api_key_2024_change_in_production
```

## Usage Examples

### User Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-api-key: riwi_api_key_2024_change_in_production" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-api-key: riwi_api_key_2024_change_in_production" \
  -d '{
    "email": "gestor@riwi.io",
    "password": "password123"
  }'
```

### Create Vacancy (requires Manager/Admin role)

```bash
curl -X POST http://localhost:3001/api/vacancies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -H "x-api-key: riwi_api_key_2024_change_in_production" \
  -d '{
    "title": "Full Stack Developer",
    "description": "Looking for a developer with experience in React and Node.js",
    "technologies": ["JavaScript", "React", "Node.js"],
    "seniority": "Semi-Senior",
    "softSkills": "Teamwork, effective communication",
    "location": "Medellín",
    "modality": "remote",
    "salaryRange": "$3,000,000 - $5,000,000",
    "company": "Riwi Tech",
    "maxApplicants": 10
  }'
```

### Apply to Vacancy (requires Coder role)

```bash
curl -X POST http://localhost:3001/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -H "x-api-key: riwi_api_key_2024_change_in_production" \
  -d '{
    "vacancyId": "vacancy-uuid"
  }'
```

## Unit Testing

Run tests:

```bash
# All tests
npm test

# With coverage
npm run test:cov

# In watch mode
npm run test:watch
```

Current coverage: **>40%** (meets minimum requirement)

## Implemented Business Rules

1. A coder **cannot apply twice** to the same vacancy
2. **Applications are not allowed** when the slot capacity is full
3. A coder **cannot apply to more than 3 active vacancies** simultaneously
4. Only users with the **Manager or Administrator** role can create/modify vacancies
5. The default role upon registration is **Coder**
6. Administrator and Manager roles are assigned **only via seeders**

## Roles and Permissions

| Role | Permissions |
|-----|----------|
| **Administrator** | Full access to all endpoints |
| **Manager** | Create/update/deactivate vacancies, view applications |
| **Coder** | Register, view vacancies, apply, cancel applications |

## Architecture

- **MVC Pattern** with independent modules
- **Dependency Injection** for low coupling
- **DTOs with class-validator** for robust validation
- **Custom Guards** for granular authorization
- **Global Interceptor** for standardized responses
- **TypeORM** for relational database management
- **SOLID Principles** applied throughout the architecture

## Author

**Carlos Vellojin**

Developed as part of the employability test for the Riwi program - Node.js with NestJS module.

---

For any questions or issues, please contact [carlos@example.com]
