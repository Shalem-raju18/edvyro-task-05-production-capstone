# EdVyro Internship Portal — Task 05: Production-Ready Capstone

A full-stack, responsive, production-ready **Internship Portal** engineered with Node.js, Express, SQLite persistence, React 19, TypeScript, and modern security defenses.

![EdVyro Internship Portal](https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80)

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Key Features](#key-features)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Prerequisites & Installation](#prerequisites--installation)
7. [Environment Variables](#environment-variables)
8. [Database Setup & Persistence](#database-setup--persistence)
9. [REST API Documentation](#rest-api-documentation)
10. [Automated Quality & Test Suite](#automated-quality--test-suite)
11. [Security Architecture](#security-architecture)
12. [Production Deployment Guide](#production-deployment-guide)
13. [Walkthrough Video Guide](#walkthrough-video-guide)

---

## 🌟 1. Project Overview

EdVyro Internship Portal is a production-grade web application built to connect ambitious students and graduates with high-impact internships in Software Engineering, AI & Machine Learning, Product Management, Design, Cloud DevOps, and Cybersecurity.

The portal provides an end-to-end journey:
- **For Candidates:** Browse active openings, search by keywords, filter by category and work arrangement (Remote/Hybrid/On-site), inspect comprehensive job requirements, submit validated applications, and track their review lifecycle in real time using their email.
- **For Employers & Recruiters:** Review applicant submissions, progress candidates through the hiring pipeline, and publish new internship opportunities directly to the persistent SQLite database.
- **For System Administrators:** Inspect live health telemetries, query latencies, and audit security layers.

---

## 🏗️ 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT 19 SPA FRONTEND                     │
│  - Tailwind CSS Styling (Zero-Pill Typography)             │
│  - Real-Time Search & Domain Filter Engine                  │
│  - Accessible Keyboard Navigation & Modal Trapping (WCAG AA)│
│  - Candidate Application Form with Client Validation        │
│  - Live Candidate Status Tracking by Email                  │
│  - Employer Admin Review Board                              │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API (HTTP / fetch)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS & NODE.JS BACKEND                 │
│  - Helmet Security Headers (CSP, XSS, nosniff)              │
│  - Rate Limiting (express-rate-limit)                       │
│  - 1MB Request Payload Boundary                             │
│  - Server-Side Validation (Regex, Ranges, Types)            │
│  - Structured Request Logger (Method, Route, Status, MS)    │
│  - Centralized Error Handler (Sanitized in Production)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prepared SQL Statements (?)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 SQLITE PERSISTENCE (@libsql)                │
│  - Tables: internships, applications                        │
│  - Foreign Key Constraints & Cascade Operations             │
│  - B-Tree Indexes on Category, Status, Email                │
│  - Stored in persistent volume: ./data/internships.db       │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ 3. Key Features

### User Experience
- **Responsive Layout:** Optimized across mobile smartphones ($\ge 320\text{px}$), tablets, and high-resolution desktop viewports.
- **Keyboard Usability:** Keyboard shortcuts (`/` or `Ctrl+K` to search, `Escape` to dismiss modals, full tab order traversal).
- **Anti-Slop Design:** Adheres to clean, unboxed typography with subtle typographic separators (`·`), avoiding generic pill containers.
- **Resilient States:** Skeleton loading cards, empty states with one-click filter reset, and retry actions for network disruptions.

### Reliability & Backend
- **Real SQLite Database:** Zero mock data; all internships and applications are persisted to `./data/internships.db`.
- **Parameterized SQL:** Prepared queries protect 100% against SQL injection attacks.
- **Health Probing:** Real-time `/api/health` diagnostics showing uptime, memory usage, and SQLite query round-trip latency.

---

## 💻 4. Tech Stack

- **Runtime & Server:** Node.js v22+, Express 4.21, TypeScript
- **Database:** SQLite / LibSQL Client (`@libsql/client`)
- **Frontend Framework:** React 19, TypeScript
- **Build Tool:** Vite 8, `@vitejs/plugin-react`
- **Styling:** Tailwind CSS v4, Lucide React Icons
- **Security:** Helmet, CORS, Express-Rate-Limit

---

## 📁 5. Project Structure

```
├── .env.example              # Environment variables template
├── index.html                # Entry HTML with accessible meta tags
├── metadata.json             # AI Studio configuration
├── package.json              # Project scripts and dependencies
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite client build configuration
├── server.ts                 # Express full-stack server & middleware
├── server/
│   └── db.ts                 # SQLite connection, schema, seed & CRUD helpers
├── src/
│   ├── main.tsx              # React mounting root
│   ├── App.tsx               # Primary application component
│   ├── index.css             # Tailwind CSS & custom typography
│   ├── types.ts              # TypeScript domain interfaces
│   └── components/
│       ├── Navbar.tsx        # Accessible navigation & status indicator
│       ├── InternshipCard.tsx# Clean role presentation card
│       ├── InternshipDetailModal.tsx # Full role overview dialog
│       ├── ApplicationModal.tsx      # Accessible candidate submission form
│       ├── ApplicationTracker.tsx    # Candidate status lookup by email
│       ├── RecruiterHub.tsx          # Employer CRUD & hiring pipeline
│       └── SystemHealthModal.tsx     # Live diagnostic telemetry & API tester
├── tests/
│   └── api-test.mjs          # Automated integration quality test suite
├── TEST_REPORT.md            # Verified test execution results
└── SECURITY_CHECKLIST.md     # Defensive security audit & disclosures
```

---

## 🚀 6. Prerequisites & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) version 18.0 or higher
- [npm](https://www.npmjs.com/) version 9.0 or higher

### Step-by-Step Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/edvyro-internship-portal.git
   cd edvyro-internship-portal
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## ⚙️ 7. Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Listening port for Express server | `3000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `DATABASE_URL` | SQLite database connection string | `file:./data/internships.db` |
| `CORS_ORIGIN` | Allowed CORS origins (`*` or frontend domain) | `*` |
| `APP_URL` | Hosted application URL | `http://localhost:3000` |

---

## 🗄️ 8. Database Setup & Persistence

The database automatically initializes upon server start:
- Creates the `./data/` folder if it does not exist.
- Executes `CREATE TABLE IF NOT EXISTS` for `internships` and `applications`.
- Seeds 6 production-grade internship roles and initial sample tracking data.
- Enforces relational foreign keys (`FOREIGN KEY(internship_id) REFERENCES internships(id)`).

To reset or re-seed the database:
```bash
rm -rf data/internships.db
npm run dev
```

---

## 📡 9. REST API Documentation

### Health & Telemetry
- **`GET /api/health`**
  - Returns backend health status, database ping latency, system memory, and uptime.
  - Response:
    ```json
    {
      "status": "healthy",
      "version": "1.0.0",
      "uptimeSeconds": 142,
      "database": {
        "status": "connected",
        "latencyMs": 4,
        "engine": "SQLite / LibSQL"
      }
    }
    ```

- **`GET /api/stats`**
  - Returns total internship counts, active counts, and category breakdowns.

### Internships Endpoints
- **`GET /api/internships`**
  - Query parameters: `search`, `category`, `work_type`, `status`.
- **`GET /api/internships/:id`**
  - Returns complete internship details.
- **`POST /api/internships`**
  - Creates a new internship role with server validation.
- **`PUT /api/internships/:id`**
  - Updates existing internship attributes or toggles status (`Active` / `Closed`).
- **`DELETE /api/internships/:id`**
  - Deletes an internship.

### Applications Endpoints
- **`POST /api/applications`**
  - Submits a candidate application. Rate-limited to 20 submissions per 15 minutes per IP.
  - Payload:
    ```json
    {
      "internship_id": 1,
      "full_name": "Jane Doe",
      "email": "jane.doe@university.edu",
      "phone": "+1 (555) 123-4567",
      "college": "Stanford University",
      "graduation_year": 2026,
      "resume_url": "https://linkedin.com/in/janedoe",
      "cover_letter": "Passionate about full-stack engineering."
    }
    ```
- **`GET /api/applications/track?email={email}`**
  - Retrieves all applications submitted by a specific candidate.
- **`PATCH /api/applications/:id/status`**
  - Updates applicant status (`Submitted` -> `Under Review` -> `Interview` -> `Accepted` / `Rejected`).

---

## 🧪 10. Automated Quality & Test Suite

Run the automated integration test suite:
```bash
npm run test
```

The test runner verifies:
1. Health check availability (`200 OK`) and database connectivity.
2. Helmet security headers (`X-Content-Type-Options: nosniff`).
3. Statistics reporting.
4. Active internship listing and category filtering.
5. Role creation and validation.
6. Candidate application submission and persistence.
7. Validation rejections (`400 Bad Request` for malformed email/phone).
8. Candidate status tracking by email.
9. Recruiter status progression (`PATCH`).
10. Proper `404` structured JSON handling for non-existent endpoints.

---

## 🔒 11. Security Architecture

- **Helmet Headers:** Disables MIME sniffing, clickjacking (`X-Frame-Options`), and restricts script origins.
- **Rate Limiting:** Protects the server against automated bots and DOS attacks.
- **Request Size Limiting:** Express body parser restricted to `1mb`.
- **Parameterized SQL:** All queries use parameterized inputs (`?`), preventing SQL injection.
- **Server Validation:** Server validates email regex, phone formatting, and valid year ranges.
- **Security Disclosures:** See [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) for full audit.

---

## 🌐 12. Production Deployment Guide

### Deploying to Render / Railway / Fly.io

1. **Deploy Repository:**
   - Link your GitHub repository to [Render](https://render.com) or [Railway](https://railway.app).
   - Select **Web Service**.
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start` (or `node --loader tsx server.ts`)

2. **Configure Persistent Disk Storage:**
   - Since SQLite stores data in `./data/internships.db`, configure a **Persistent Disk** on your hosting provider mounted to `/data` or `./data`.
   - Alternatively, connect to [Turso](https://turso.tech) by setting `DATABASE_URL=libsql://[your-db].turso.io` and providing `TURSO_AUTH_TOKEN`. The `@libsql/client` driver in `server/db.ts` supports remote Turso URLs with zero code changes!

3. **Verify Deployment:**
   - Test health check: `https://your-domain.com/api/health`
   - Submit a test application and verify it persists after restarting the container.

---

## 🎥 13. Walkthrough Video Guide

When recording your Task 05 submission walkthrough video (3-5 minutes), follow this structured flow:

1. **Introduction (30s):**
   - Introduce yourself and state the project goal: "EdVyro Internship Portal — Task 05 Production Capstone."
   - Point out the clean user interface, platform metrics, and active backend badge.

2. **Candidate Experience (90s):**
   - Demonstrate searching roles (e.g. type `React` or press `/` to trigger the search bar).
   - Filter by domain (e.g. `Engineering`, `Data & AI`) and work type (`Remote`, `Hybrid`).
   - Open a role overview modal to review qualifications and requirements.
   - Click **Apply Now**, fill out the application form with your details, and submit.
   - Show the confirmation screen with the reference ID (`#APP-X`).

3. **Candidate Tracking (45s):**
   - Navigate to **Track Application**.
   - Search with the submitted email to show the real-time review pipeline.

4. **Employer Hub & Admin (45s):**
   - Switch to **Employer Hub**.
   - Show the newly submitted application in the review board.
   - Update candidate status from `Submitted` to `Interview` or `Accepted`.
   - Publish a new internship position and demonstrate it appears immediately on the job board.

5. **Architecture & Tests (45s):**
   - Open the **System Health** modal to show the live database latency and Helmet headers.
   - In terminal, execute `npm run test` to show 12 passing integration tests.
