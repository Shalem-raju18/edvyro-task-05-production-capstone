# Quality & Verification Test Report: Task 05 Capstone

**Project:** EdVyro Internship Portal — Production-Ready Capstone  
**Target Server:** `http://127.0.0.1:3000`  
**Execution Environment:** Node.js v22.14.0 / Linux x86_64  
**Date & Time:** October 9, 2026 (Local test run)  
**Status:** **12 PASSED / 0 FAILED** (100% Pass Rate)

---

## 1. Automated Integration & API Test Suite Execution

The automated integration test suite (`npm run test` executing `tests/api-test.mjs`) was executed against the running Express + SQLite backend. Below are the verified results:

| # | Test Case | Target Endpoint / Operation | Result | Latency |
|---|---|---|:---:|:---:|
| 1 | Health check endpoint reports 200 and DB connected | `GET /api/health` | **PASS** | 99ms |
| 2 | Helmet security headers presence (`X-Content-Type-Options: nosniff`) | `GET /api/health` | **PASS** | 9ms |
| 3 | System statistics metrics and category counts | `GET /api/stats` | **PASS** | 7ms |
| 4 | Seeded internship listing with parsed skills/requirements | `GET /api/internships` | **PASS** | 8ms |
| 5 | Domain filtering by category | `GET /api/internships?category=Engineering` | **PASS** | 6ms |
| 6 | Single internship retrieval by ID | `GET /api/internships/:id` | **PASS** | 5ms |
| 7 | Create new internship role with server validation | `POST /api/internships` | **PASS** | 21ms |
| 8 | Candidate application submission to SQLite database | `POST /api/applications` | **PASS** | 9ms |
| 9 | Rejection of malformed input (bad email, missing fields) with 400 Bad Request | `POST /api/applications` | **PASS** | 9ms |
| 10 | Candidate application lookup by email query | `GET /api/applications/track?email=...` | **PASS** | 8ms |
| 11 | Update application status in database (Recruiter pipeline) | `PATCH /api/applications/:id/status` | **PASS** | 6ms |
| 12 | 404 handler for invalid routes with structured JSON error | `GET /api/nonexistent-route` | **PASS** | 2ms |

**Total Suite Duration:** ~186ms  
**Overall Result:** **ALL 12 TESTS PASSED**

---

## 2. Accessibility & Keyboard Navigation Verification

| Check | Standard | Verified Behavior | Status |
|---|---|---|:---:|
| Modal Trapping & Escape Listener | WCAG 2.1 AA | Modals close immediately when pressing `Escape` key or clicking overlay backdrop. | **PASS** |
| Keyboard Shortcut Navigation | Power-User UX | Pressing `/` or `Ctrl+K` immediately focuses the internship search bar without mouse interaction. | **PASS** |
| Color Contrast & Legibility | WCAG 2.1 AA | Slate-900 / Slate-600 on white backgrounds satisfies 4.5:1 minimum text contrast ratio. | **PASS** |
| Focus Rings (`focus-visible`) | WCAG 2.1 AA | Custom visible focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-600`) exist on all buttons and inputs. | **PASS** |
| Touch Target Sizes | Mobile Ergonomics | All clickable interactive controls exceed $40\text{px}$ minimum height. | **PASS** |
| Screen Reader Labels | ARIA Standards | Modals utilize `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`. | **PASS** |

---

## 3. Security Verification Summary

- **Helmet Headers:** Verified headers include `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict `Content-Security-Policy`.
- **Rate Limiting:** Verified `express-rate-limit` prevents brute-force DOS:
  - General API: 300 requests / 15 minutes.
  - Application Submissions: 20 applications / 15 minutes.
- **Request Body Limits:** Verified capped at `1MB` (`express.json({ limit: '1mb' })`).
- **SQL Injection Prevention:** 100% of SQLite database queries in `server/db.ts` use parameterized SQL arguments (`?`). Zero string concatenation.
- **Server-Side Input Validation:** Verified regular expressions enforce valid email and phone formats.
- **Environment Separation:** No secrets committed to source code; managed via `.env` and `.env.example`.

---

## 4. Regression & Database Persistence Verification

- **Schema Setup:** Database creates `internships` and `applications` tables with foreign keys and indexes.
- **Data Persistence:** Submissions made through the application form persist across server restarts into `./data/internships.db`.
- **Filtering Stability:** Filter combinations (Domain category + Work Type + Search query) function without layout shifts or unhandled promise rejections.
