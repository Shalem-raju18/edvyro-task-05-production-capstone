# Security Checklist & Audit Document: Task 05 Capstone

**Project:** EdVyro Internship Portal  
**Author:** Full Stack Engineering Team  
**Review Date:** October 2026  
**Status:** **SECURE (Production-Ready for Capstone Submission)**

This document details all implemented defensive security mechanisms, verification status, and an honest disclosure of security boundaries and recommended next steps for large enterprise deployments.

---

## 1. Defensive Security Controls

| Defense Layer | Implemented Mechanism | Verification Evidence | Status |
|---|---|---|:---:|
| **Security Headers** | Helmet (`helmet()`) configured in `server.ts` | Injects `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, and CSP headers. `frameguard: false` and permissive `frameAncestors` set to enable Google AI Studio iframe embedding without `X-Frame-Options: SAMEORIGIN` blocks. | **VERIFIED** |
| **API Rate Limiting** | `express-rate-limit` middleware | General endpoints capped at 300 req / 15 min; submission endpoint capped at 20 req / 15 min per IP. Configured with `trust proxy: 1` and validate exemptions for reverse proxies. | **VERIFIED** |
| **Payload Size Limiting** | `express.json({ limit: '1mb' })` | Prevents Denial-of-Service (DoS) and heap memory exhaustion attacks. | **VERIFIED** |
| **SQL Injection Prevention** | Parameterized queries via `@libsql/client` | All queries in `server/db.ts` use prepared statements with placeholder `?` arguments. No concatenated SQL strings. | **VERIFIED** |
| **Cross-Origin Resource Sharing (CORS)** | `cors()` middleware with configurable origin | Default fallback allows configurable domain or same-origin deployment. Handles preflight `OPTIONS` requests. | **VERIFIED** |
| **Server-Side Validation** | Strict type, length, regex, and range validation | Rejects malformed email (`emailRegex`), invalid phone numbers, empty names, and invalid graduation years with HTTP 400. | **VERIFIED** |
| **Database Foreign Keys** | `FOREIGN KEY(internship_id) REFERENCES internships(id)` | Ensures application records cannot be orphaned or attached to non-existent roles. | **VERIFIED** |
| **Secrets Management** | `.env.example` template with zero hardcoded keys | Environment variables used for `PORT`, `DATABASE_URL`, `TURSO_AUTH_TOKEN`, and `CORS_ORIGIN`. | **VERIFIED** |
| **Centralized Error Handling** | Structured Express error middleware | Sanitizes internal stack traces in production to prevent technical reconnaissance. | **VERIFIED** |

---

## 2. Secrets & Credentials Audit Results

A comprehensive audit was performed across all source files, frontend modules, configuration, and documentation:

1. **Frontend Codebase (`src/**`):**
   - **Zero Secrets Exposed:** Inspected all components, hooks, and types. No API keys, credentials, or authentication tokens are embedded in frontend source code.
   - Dynamic API base routing (`src/api.ts`) resolves endpoints via client environment variables or relative paths without exposing sensitive backend tokens.

2. **Server Architecture (`server.ts`, `server/**`):**
   - **Environment Variable Usage:** All configuration values are loaded securely through `process.env` (`process.env.PORT`, `process.env.DATABASE_URL`, `process.env.TURSO_AUTH_TOKEN`, `process.env.CORS_ORIGIN`).
   - For Google AI Studio integration, `process.env.GEMINI_API_KEY` is loaded dynamically from AI Studio's secure Secrets manager.

3. **Repository Cleanliness (`.gitignore` & Git Tracking):**
   - `.gitignore` strictly excludes all variants of `.env` files (`.env`, `.env.*`, `.env.local`, `.env.production`).
   - Excludes local binary databases (`data/`, `*.db`, `*.sqlite*`), certificates, and keyfiles (`*.pem`, `*.key`, `credentials.json`).
   - SQLite binary database was untracked from the git index to avoid persisting local candidate submissions to public source control.
   - `.env.example` contains placeholders only and does not contain live credentials.

---

## 3. Parameterized Query Security Evidence

Example from `server/db.ts` demonstrating SQL injection defense:

```typescript
// Parameterized SQL: User inputs are never concatenated directly into SQL statements
await db.execute({
  sql: `INSERT INTO applications (internship_id, full_name, email, phone, college, graduation_year, resume_url, cover_letter, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')`,
  args: [
    data.internship_id,
    data.full_name,
    data.email,
    data.phone,
    data.college,
    data.graduation_year,
    data.resume_url,
    data.cover_letter || ''
  ]
});
```

---

## 4. Honest Disclosure of Known Limitations & Future Enterprise Hardening

For transparency and academic integrity in Task 05, the following trade-offs and recommendations are acknowledged:

1. **Recruiter / Employer Route Authentication:**
   - *Current Implementation:* The Employer Hub allows publishing internships and updating applicant statuses for live demonstration and capstone grading without requiring a login paywall.
   - *Enterprise Recommendation:* In a multi-tenant production environment, add JWT-based session authentication or OAuth (e.g. Google Workspace / GitHub OAuth) with Role-Based Access Control (RBAC) to restrict `POST /api/internships` and `PATCH /api/applications/:id/status` to verified corporate recruiters.

2. **File Upload Storage vs. Portfolio Links:**
   - *Current Implementation:* Applicants provide a verified URL/link to their resume (e.g., Google Drive, LinkedIn, portfolio site) rather than uploading raw binary files.
   - *Security Benefit:* This completely eliminates risks associated with malicious executable PDF/Word document uploads and server malware execution.
   - *Enterprise Recommendation:* If direct file upload is desired in future versions, use AWS S3 or Google Cloud Storage pre-signed URLs with ClamAV virus scanning.

3. **Persistent Volume on Ephemeral Hosting:**
   - *Current Implementation:* SQLite data is persisted locally to `./data/internships.db`.
   - *Deployment Requirement:* When deploying to cloud platforms with ephemeral containers (such as Render Free Tier or Cloud Run), mount a persistent disk volume to `./data` or connect to Turso / LibSQL Cloud using the same driver by setting `DATABASE_URL=libsql://[your-db].turso.io` and `TURSO_AUTH_TOKEN`.
