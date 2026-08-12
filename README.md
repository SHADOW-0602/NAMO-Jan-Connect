# NAMO Jan Connect

A Cloudflare-native complaint-management platform with anonymous citizen reporting, isolated department queues, and central administrator oversight.

## Production architecture

| Layer | Cloudflare service | Purpose |
|---|---|---|
| Frontend | Pages | React 19 + Vite single-page application |
| API | FastAPI on Python Workers | Typed HTTP routing, authentication, complaint routing, tracking, and administration |
| Relational data | D1 | Citizens, departments, complaints, history, sessions, and contact records |
| Object storage | R2 Standard | Complaint evidence and department resolution photographs |

No application data is written to local SQLite, PostgreSQL, or a local uploads folder. The Worker accesses D1 and R2 through native bindings; no database passwords or R2 access keys are exposed to the application.

Python Workers are currently a Cloudflare beta feature. The implementation uses the required `python_workers` compatibility flag and Cloudflare's ASGI adapter to run FastAPI. Interactive API documentation is available at `/docs` and the OpenAPI schema at `/openapi.json`.

## Repository layout

- `frontend/` - React, Vite, Pages configuration, and SPA redirects.
- `backend/src/` - FastAPI application and Python Worker ASGI entry point.
- `backend/migrations/` - D1 schema and initial department portal records.
- `backend/wrangler.jsonc` - Worker, D1, and R2 binding configuration.
- `.env.example` - local frontend values and required Worker secret names.

## Cloudflare provisioning

Install Node.js, Wrangler, Python 3.13+, `uv`, and the Python Worker tooling. Authenticate Wrangler with your Cloudflare account before provisioning.

1. Create the D1 database:

```powershell
npx wrangler d1 create namo-jan-connect
```

Copy the returned database ID into `backend/wrangler.jsonc`, replacing `REPLACE_WITH_D1_DATABASE_ID`.

2. Create the private R2 bucket:

```powershell
npx wrangler r2 bucket create namo-jan-connect-evidence
```

3. Apply the D1 schema and seed the five department portal IDs:

```powershell
cd backend
npx wrangler d1 migrations apply namo-jan-connect --remote
```

4. Configure encrypted staff credentials:

```powershell
uv run pywrangler secret put ADMIN_EMAIL
uv run pywrangler secret put ADMIN_PASSWORD
```

5. Deploy the Python Worker:

```powershell
uv run pywrangler deploy
```

6. Set `VITE_API_URL` to the deployed Worker URL and deploy React to Pages:

```powershell
npm run deploy:frontend
```

The Worker allows local development and the deployed Cloudflare Pages/Vercel origins through the comma-separated `FRONTEND_URL` setting.

### Vercel frontend deployment

The React frontend also includes `frontend/vercel.json` for Vite builds and SPA routing on Vercel. Deploy it with `npm run deploy:vercel`; the FastAPI Worker, D1 database, R2 bucket, and gallery media remain on Cloudflare.

## Local development

Wrangler provides local D1 and R2 simulations under `.wrangler/`; production data is not modified during ordinary local development.

```powershell
copy .env.example .env
npm install
npm run dev:backend
```

In a second terminal:

```powershell
npm run dev:frontend
```

Open `http://localhost:5173`. The local Worker API runs at `http://localhost:8787`.

Apply migrations to the local D1 simulator when needed:

```powershell
cd backend
npx wrangler d1 migrations apply namo-jan-connect --local
```

## Application URLs

| Area | Local URL | Sign-in identifier |
|---|---|---|
| Public citizen site | `http://localhost:5173/` | No login required |
| Portal directory | `http://localhost:5173/dashboard` | No login required |
| Citizen dashboard | `http://localhost:5173/citizen` | No login required |
| Civic & Infrastructure | `http://localhost:5173/civic-infra` | `NJC-CIVIC-01` |
| Health & Education | `http://localhost:5173/health-education` | `NJC-HEALTH-01` |
| Law & Order | `http://localhost:5173/law-order` | `NJC-SAFETY-01` |
| Transport & Public Services | `http://localhost:5173/transport` | `NJC-TRANSPORT-01` |
| Employment & Welfare | `http://localhost:5173/employment-welfare` | `NJC-WELFARE-01` |
| Administrator | `http://localhost:5173/admin` | `ADMIN_EMAIL` secret |

`/civil-department` remains an alias for `/civic-infra`.

Portal IDs are assigned by the D1 seed migration and remain stable identifiers for routing and administration. The administrator configures a required staff email and a different password for each portal from `/admin`. Department staff sign in with that email and portal-specific password; passwords are stored only as salted PBKDF2 hashes in D1.

## Data and privacy behavior

- D1 stores relational records and R2 object keys.
- R2 stores the image bytes under complaint-specific prefixes.
- Public tracking responses omit citizen email and phone.
- Public gallery access is limited to resolution images.
- Department queries are filtered by the authenticated staff member's `department_id` in the Worker.
- Staff bearer tokens are stored as SHA-256 hashes in D1 and expire automatically.
- Images are limited to JPG, PNG, or WEBP and the configured size limit.

## Validation

```powershell
npm test
python -m pytest backend/tests
python -m compileall -q backend/src
```
