# NAMO Jan Connect — Implementation Plan

A transparent, public complaint-management platform connecting citizens, in-platform department portals, and administrators, with real-time email updates and image-based evidence. Complaint routing is fully self-contained — complaints are forwarded to the correct department's own portal on this platform, with no external government API or system involved.

---

## 1. Project Overview

**Goal:** Let any citizen file a complaint under one of five categories, have it automatically routed to the correct department, track its status transparently end-to-end, and receive email updates at every stage — while departments and admins get dedicated portals to manage and resolve complaints.

**Core principles:**
- **Transparency** — every complaint gets a public tracking ID; status history is visible to the citizen who filed it.
- **Accountability** — every complaint is tied to a department and an assigned officer/handler.
- **Simplicity** — clean, minimal UI; no clutter, no jargon.
- **Traceability** — full audit trail (who changed status, when, why).

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | **Python + FastAPI** | async, auto-generated OpenAPI docs, fast to build REST APIs |
| ORM/DB | **PostgreSQL + SQLAlchemy (async) + Alembic** | relational integrity for complaints/users/departments, migrations |
| Auth | **JWT (access + refresh tokens)**, `passlib[bcrypt]` for hashing | stateless, works cleanly across 3 portal types |
| File storage | Local `/uploads` volume for dev; **Cloudflare R2** for production | image uploads for complaints, S3-compatible API, no egress fees |
| Email | `smtplib` / `aiosmtplib` via **Gmail SMTP (App Password)**, or SendGrid/Amazon SES for production scale | status update emails |
| Background jobs | **Celery + Redis** (or FastAPI `BackgroundTasks` for MVP) | sending emails/forwarding complaints without blocking requests |
| Frontend | **React (Vite) + TypeScript + TailwindCSS** | fast dev, clean styling |
| State/data fetching | **React Query (TanStack Query)** + Axios | caching, loading/error states out of the box |
| Routing | **React Router v6** | multi-portal routing (public / user / department / admin) |
| Charts (admin analytics) | **Recharts** | complaint volume, resolution time, department load |
| Deployment | Backend: Render/Railway/EC2 + Docker. Frontend: Vercel/Netlify/**Cloudflare Pages**. DB: managed Postgres (Supabase/Neon/RDS). Files: **Cloudflare R2** | |

---

## 3. User Roles & Portals

Four distinct experiences, one codebase (route-guarded by role):

1. **Public / Citizen (no login needed to track by ID; login needed to file & manage own complaints)**
   - Register/login, file complaint, upload images, track status, view timeline, get email updates, rate resolution.
2. **Department Portal** (per department: Civic & Infrastructure, Health & Education, Law & Order, Transport & Public Services, Employment & Welfare)
   - Login as department staff, see only complaints routed to their department, update status, add remarks, upload resolution photos, close complaint.
3. **Admin Portal**
   - Full visibility across all departments, reassign complaints, manage department accounts, view analytics (SLA breaches, complaint heatmap by area, category-wise volume), manage users, audit logs.
4. **Public Transparency Dashboard** (no login)
   - Aggregate, anonymized stats: total complaints filed, resolved, pending, avg resolution time per department/category — builds public trust.

---

## 4. Complaint Categories → Department Mapping

These are **internal department portals you create and manage on the platform** (each with its own staff logins) — modeled after real-world equivalents, but not connected to any actual government system:

| Category | Modeled after (for naming/context only — not connected) |
|---|---|
| Civic & Infrastructure | Municipal Corporation / Urban Local Body (roads, water, sanitation, streetlights) |
| Health & Education | District Health Office / Dept. of Education |
| Law & Order | Local Police Station / District SP office |
| Transport & Public Services | RTO / State Transport Dept. / Public Works |
| Employment & Welfare | District Employment Exchange / Social Welfare Dept. |

Store this mapping in a `departments` table (not hardcoded) so admins can edit routing rules, add sub-departments per city/state, or add new categories without a code change.

**Important:** "Forwarding to the original department" is handled **entirely inside the platform** — no external government APIs, no CPGRAMS/state-portal integration, no third-party dependency at all. It works like this:

1. Citizen files a complaint → it's tagged with a `category`.
2. The system auto-assigns a `department_id` based on the category (and region, if you support multiple cities/states) using the routing rules stored in the `departments` table.
3. The complaint immediately appears in that department's portal queue (`GET /complaints/department`, filtered server-side by the logged-in staff member's `department_id`). This *is* the forwarding — it's an internal routing/visibility change, not a network call to an outside system.
4. The citizen also gets an email confirming which department the complaint was routed to.

Department staff log in only to their own portal and only ever see complaints assigned to their department — this is the entire "forwarding" mechanism. No email, webhook, or API call ever leaves the platform to a real-world government system. If in future you want a department to be notified outside the platform too (e.g. SMS/email alert to staff), that's an *internal* notification (Section 7), not an external integration, and is optional.

---

## 5. Database Schema (core tables)

```
users
 - id, name, email (unique), phone, password_hash, role [citizen|department_staff|admin],
   department_id (nullable, for staff), is_verified, created_at

departments
 - id, name, category [enum: civic_infra|health_edu|law_order|transport|employment_welfare],
   region/state/city, sla_days
   (this is an in-platform department entity with its own staff logins — not linked to any
   external/government system)

complaints
 - id, tracking_id (public, e.g. NJC-2026-000123), citizen_id (FK users),
   category, department_id (FK departments), title, description,
   location_text, latitude, longitude,
   status [enum: submitted|acknowledged|in_progress|resolved|rejected|reopened],
   priority [low|medium|high|critical],
   created_at, updated_at, resolved_at, sla_due_at

complaint_attachments
 - id, complaint_id (FK), file_url, file_type [image|document], uploaded_by, uploaded_at
   (supports both citizen-submitted evidence and department resolution-proof photos)

status_history
 - id, complaint_id (FK), old_status, new_status, remarks, changed_by (FK users),
   changed_at
   → this table IS the transparency timeline shown to the citizen

email_logs
 - id, complaint_id, recipient, subject, status [sent|failed], sent_at

feedback
 - id, complaint_id, rating (1-5), comment, submitted_at
```

---

## 6. Backend Architecture (FastAPI)

```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py          # env vars, settings via pydantic-settings
│   │   ├── security.py        # JWT, password hashing
│   │   └── deps.py            # get_current_user, role guards
│   ├── models/                # SQLAlchemy models
│   ├── schemas/                # Pydantic request/response models
│   ├── api/
│   │   ├── auth.py            # register/login/refresh
│   │   ├── complaints.py      # CRUD + status update + track-by-id (public)
│   │   ├── departments.py     # admin CRUD
│   │   ├── users.py
│   │   ├── uploads.py         # image upload endpoint
│   │   └── analytics.py       # dashboard aggregates
│   ├── services/
│   │   ├── email_service.py     # SMTP sending + templates
│   │   ├── routing_service.py   # assigns department_id from category (+ region), purely internal
│   │   └── storage_service.py   # local/Cloudflare R2 file handling
│   ├── tasks/                  # Celery tasks (or BackgroundTasks)
│   └── db/
│       ├── session.py
│       └── migrations/         # Alembic
├── requirements.txt
└── Dockerfile
```

**Key API endpoints:**

```
POST   /auth/register
POST   /auth/login
POST   /complaints/                     (citizen: file complaint, multipart with images)
GET    /complaints/track/{tracking_id}  (public: no auth, view status timeline)
GET    /complaints/my                   (citizen: own complaints)
GET    /complaints/department           (dept staff: assigned complaints, filtered by dept_id)
PATCH  /complaints/{id}/status          (dept staff/admin: update status + remarks + optional photo)
POST   /complaints/{id}/reassign        (admin only)
GET    /admin/analytics/overview
GET    /public/stats                    (aggregate, no auth — powers transparency dashboard)
POST   /complaints/{id}/feedback        (citizen: rate after resolution)
```

Every status-changing action:
1. writes to `status_history`
2. triggers an async confirmation/update email to the citizen (including, on submission, which internal department the complaint was routed to)
3. is logged in `email_logs`

No step in this flow ever calls an external/government system — routing is a database write (`department_id` assignment) that instantly changes what the department's own staff can see in their portal.

---

## 7. Email Notification System

- Use `aiosmtplib` with Gmail SMTP (`smtp.gmail.com:587`, TLS) and a **Gmail App Password** (not the real account password — requires 2FA enabled on the Gmail account).
- Store credentials in environment variables, never in code:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=namojanconnect@gmail.com
  SMTP_PASSWORD=<app_password>
  SMTP_FROM_NAME=NAMO Jan Connect
  ```
- HTML email templates (Jinja2) for each event:
  - Complaint filed → confirmation + tracking ID + name of the department it was routed to + link to track page
  - Acknowledged by department
  - Status changed (in progress / resolved / rejected / reopened)
  - Resolution with photo proof attached
  - Feedback request after resolution
- Send via background task/Celery so the API response to the user isn't blocked by SMTP latency.
- For production scale (Gmail SMTP has ~500 emails/day limits), plan migration to **Amazon SES** or **SendGrid** — architecture should keep `email_service.py` provider-agnostic.

---

## 8. Frontend Architecture (React)

```
frontend/
├── src/
│   ├── main.tsx
│   ├── routes/
│   │   ├── public/         # Landing, File Complaint, Track Complaint, Transparency Dashboard
│   │   ├── citizen/        # My Complaints, Complaint Detail, Profile
│   │   ├── department/     # Dept Dashboard, Complaint Queue, Update Status
│   │   └── admin/          # Admin Dashboard, Manage Departments, Manage Users, Analytics
│   ├── components/
│   │   ├── ui/              # Button, Card, Badge, StatusPill, Timeline, ImageUploader
│   │   ├── layout/          # Navbar per role, Sidebar, Footer
│   │   └── complaint/       # ComplaintCard, ComplaintForm, StatusTimeline, ImageGallery
│   ├── hooks/                # useAuth, useComplaints (React Query)
│   ├── api/                  # axios instance + typed API calls
│   ├── context/               # AuthContext (role, token)
│   └── styles/                 # Tailwind config, design tokens
```

**Design direction (beautiful but simple):**
- Neutral base (white/off-white) with **one accent color per category** (e.g. amber for civic, teal for health, red for law & order, blue for transport, green for welfare) used consistently as badges/tags — helps users visually scan complaint lists instantly.
- Big, friendly "File a Complaint" CTA on the landing page with a 3-step visual (Describe → Attach photo → Track).
- Status shown always as a **horizontal timeline/stepper** (Submitted → Acknowledged → In Progress → Resolved), not just a text label — this is the core "transparency" UX moment.
- Card-based complaint lists with category color-coding, thumbnail of attached image, tracking ID, and status pill.
- Department/Admin portals: simple table + filters (status, category, date range, SLA overdue flag) rather than heavy dashboards — clarity over density.
- Fully responsive (citizens will file complaints from mobile).

---

## 9. Complaint Lifecycle

```
Submitted (auto-routed to department portal instantly) → Acknowledged (dept action) → In Progress → Resolved
                                                                                       ↘ Rejected (with mandatory remarks)
Resolved → Reopened (if citizen disputes resolution, within X days)
```

Note: routing to the department happens the moment the complaint is submitted (it's a database assignment, not a separate workflow step), so there's no "forwarded" status — the complaint is simply visible in the right department's queue from second one.

- SLA timer per category (configurable per department) — complaints nearing/exceeding SLA are flagged red in admin/department views.
- Every transition requires a remark (free text) from the staff member — visible to citizen for full transparency.

---

## 10. Security & Compliance

- Role-based access control enforced server-side on every endpoint (never trust frontend role checks alone).
- Rate-limit complaint filing (prevent spam) — e.g. 10/day per account, CAPTCHA on public forms.
- Sanitize/validate uploaded images (file type, size limit ~5MB, strip EXIF GPS data unless user opts to share location).
- HTTPS everywhere; JWT short-lived access tokens + refresh token rotation.
- Since this handles citizen PII (name, phone, email, sometimes location), plan for **India's DPDP Act 2023** compliance: consent on data collection, data retention policy, and a way for users to request account/data deletion.

---

## 11. Suggested Build Order (Phased)

**Phase 1 — Core MVP (2–3 weeks)**
- Auth (citizen + admin only), complaint filing with image upload, tracking-by-ID page, basic status update by admin, SMTP email on submit + status change.

**Phase 2 — Department Portals (1–2 weeks)**
- Department accounts, auto-routing by category (purely internal `department_id` assignment), department-scoped complaint queue, status update with remarks/photos.

**Phase 3 — Transparency & Analytics (1 week)**
- Public stats dashboard, SLA tracking, admin analytics (Recharts), feedback/rating system.

**Phase 4 — Hardening (ongoing)**
- Rate limiting, DPDP-compliant data policies, move email provider to SES/SendGrid if volume grows, move file storage to Cloudflare R2, load testing.

This is the complete scope — the platform is fully self-contained. There is no external government API or portal integration anywhere in this plan.

---

## 12. Sample `.env` (backend)

```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/namojanconnect
JWT_SECRET=<random-64-char-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=namojanconnect@gmail.com
SMTP_PASSWORD=<gmail-app-password>
UPLOAD_STORAGE=local   # or r2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=          # e.g. custom domain or r2.dev subdomain for serving images
FRONTEND_URL=https://namojanconnect.example.com
```

---

## 13. What I'd Recommend Building First (if you want me to start coding)

The highest-value, lowest-risk starting point is **Phase 1**: auth + complaint filing + image upload + email-on-submit + track-by-ID page. That alone is a demoable product. I can scaffold this next — either the FastAPI backend, the React frontend, or both — whichever you'd like to start with.
