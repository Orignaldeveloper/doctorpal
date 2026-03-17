# DoctorPal — SaaS Clinic Queue & Patient Management System

A **production-ready, multi-tenant SaaS** platform for managing clinic queues, patient records, and staff — built with Spring Boot 3, React (Vite), MongoDB, and Docker.

---

## Architecture

```
Super Admin (Platform Owner)
  └── Doctor (Clinic Owner)
        ├── Receptionists
        └── Patients (data isolated per doctor)
```

Each doctor's data is fully isolated. Doctor A can never access Doctor B's patients.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Java 17, Spring Boot 3, Spring Security |
| Auth       | JWT (JJWT 0.11.5)                       |
| Database   | MongoDB 7                               |
| Frontend   | React 18, Vite, Tailwind CSS            |
| HTTP       | Axios                                   |
| API Docs   | Swagger / OpenAPI 3                     |
| DevOps     | Docker, Docker Compose, Nginx           |

---

## Quick Start (Docker)

### Prerequisites
- Docker Desktop installed and running

### Run the full stack
```bash
git clone <your-repo-url> doctorpal
cd doctorpal

# Copy environment file
cp .env .env.local  # Optional: edit values

# Start everything
docker-compose up --build
```

Open in browser:
- **Frontend:** http://localhost
- **Backend API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html

---

## Local Development (Without Docker)

### Backend

**Prerequisites:** Java 17, Maven, MongoDB running locally

```bash
cd backend

# Copy and configure environment
cp ../env.example .env

# Run with Maven
./mvnw spring-boot:run

# Or build JAR first
./mvnw clean package -DskipTests
java -jar target/doctorpal-backend-1.0.0.jar
```

Backend starts at: http://localhost:8080

### Frontend

**Prerequisites:** Node.js 18+

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api → localhost:8080)
npm run dev
```

Frontend starts at: http://localhost:5173

---

## Default Credentials

On first startup, a **Super Admin** account is auto-created:

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@doctorpal.in     |
| Password | Admin@123              |

> **Change the password immediately in production!**

---

## API Reference

Full interactive docs at: `http://localhost:8080/swagger-ui.html`

### Auth
```
POST /api/auth/login     — Login (returns JWT)
POST /api/auth/logout    — Logout
```

### Super Admin (`SUPER_ADMIN` role)
```
GET    /api/admin/doctors              — List all doctors
POST   /api/admin/doctors              — Create doctor
PUT    /api/admin/doctors/{id}         — Update doctor
PATCH  /api/admin/doctors/{id}/status  — Activate/deactivate
GET    /api/admin/stats                — Platform statistics
```

### Doctor (`DOCTOR` role)
```
GET    /api/doctor/queue                        — Today's live queue
POST   /api/doctor/queue/next                   — Call next patient
PATCH  /api/doctor/visits/{id}/status           — Update visit status
DELETE /api/doctor/visits/{id}                  — Delete visit
GET    /api/doctor/patients                     — Search patients
GET    /api/doctor/patients/{id}/history        — Patient visit history
GET    /api/doctor/receptionists                — List receptionists
POST   /api/doctor/receptionists                — Create receptionist
PATCH  /api/doctor/receptionists/{id}/toggle    — Toggle active/inactive
GET    /api/doctor/reports/daily                — Daily report
GET    /api/doctor/reports/weekly               — Weekly report
GET    /api/doctor/reports/monthly              — Monthly report
```

### Receptionist (`RECEPTIONIST` role)
```
POST /api/receptionist/patient-entry   — Add patient & get token
GET  /api/receptionist/today-queue     — View today's queue
GET  /api/receptionist/lookup?phone=X  — Auto-detect returning patient
```

---

## Feature Highlights

### Multi-Tenant Isolation
Every patient and visit record is tagged with `doctorId`. All queries are scoped to the authenticated doctor's ID — enforced at the service layer, not just the UI.

### Auto Token Generation
Tokens are generated per-doctor per-day using a `TokenCounter` collection. Resets daily automatically. Configurable start number per clinic.

### Returning Patient Auto-Detection
When receptionist types a phone number, the system checks if the patient already exists and pre-fills all their details — saving time and preventing duplicate records.

### Estimated Wait Time
Each queue entry calculates estimated wait based on number of patients ahead (`waitingAhead × 8 minutes`).

### Role-Based Access Control
- `SUPER_ADMIN` — full platform access
- `DOCTOR` — own clinic only
- `RECEPTIONIST` — add patients + view queue only (no delete, no reports)

When a doctor is deactivated, all their receptionists are automatically deactivated too.

---

## Project Structure

```
doctorpal/
├── backend/
│   └── src/main/java/com/doctorpal/
│       ├── config/          # Security, Swagger, MongoDB, DataSeeder
│       ├── controller/      # Auth, Admin, Doctor, Receptionist
│       ├── dto/             # Request/Response DTOs
│       ├── exception/       # GlobalExceptionHandler
│       ├── model/           # User, Doctor, Patient, Visit, TokenCounter
│       ├── repository/      # MongoDB repositories
│       ├── security/        # JWT, AuthFilter, UserDetailsService
│       └── service/impl/    # AuthService, AdminService, DoctorService, ReceptionistService
├── frontend/
│   └── src/
│       ├── api/             # axios instance + service functions
│       ├── components/      # Sidebar, Modal, StatusBadge
│       ├── context/         # AuthContext
│       ├── pages/
│       │   ├── admin/       # Overview, Doctors, Stats
│       │   ├── doctor/      # Queue, Patients, Reports, Receptionists
│       │   └── receptionist/# AddPatient, TodayQueue
│       └── styles/          # Tailwind CSS
├── docker-compose.yml
├── .env
└── README.md
```

---

## Environment Variables

| Variable         | Default                                      | Description                  |
|------------------|----------------------------------------------|------------------------------|
| `MONGO_URI`      | `mongodb://localhost:27017/doctorpal`        | MongoDB connection string     |
| `MONGO_DB`       | `doctorpal`                                  | Database name                 |
| `JWT_SECRET`     | (long random string)                         | **Change in production!**     |
| `JWT_EXPIRATION` | `86400000`                                   | Token expiry in ms (24 hours) |
| `PORT`           | `8080`                                       | Backend port                  |
| `CORS_ORIGINS`   | `http://localhost:5173,http://localhost:80`  | Allowed frontend origins      |

---

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random 64+ char string
- [ ] Change default Super Admin password (`Admin@123`)
- [ ] Set `CORS_ORIGINS` to your actual frontend domain
- [ ] Enable MongoDB authentication (`MONGO_URI` with credentials)
- [ ] Set up SSL/TLS (use a reverse proxy like Nginx or Caddy)
- [ ] Configure log rotation and monitoring

---

## License

MIT — free for personal and commercial use.
