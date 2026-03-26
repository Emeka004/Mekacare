# 🤰 Mekacare Health Platform — Step-by-Step Setup Guide

> Full-stack pregnancy health management system.
> **Stack:** Next.js 14 · Node.js/Express · PostgreSQL 15 · Docker · Nginx

---

## ✅ Is Everything Integrated?

Yes. Here is exactly how the three layers connect:

```
Browser (Next.js pages)
   │  uses hooks → services → Axios (auto-attaches JWT)
   ▼
Express REST API  (Node.js :5000)
   │  Sequelize ORM reads/writes via env DB_HOST, DB_NAME, DB_PASSWORD
   ▼
PostgreSQL 15  (:5432)
   8 tables: users, pregnancy_profiles, provider_profiles,
             appointments, risk_reports, vital_signs,
             education_contents, notifications
```

Every frontend page is wired to a real backend endpoint:

| Page | Live API call |
|---|---|
| `/dashboard` | `GET /api/pregnancy-profiles/me` + `GET /api/vitals/latest` |
| `/appointments` | `GET /api/appointments` |
| `/vitals` | `GET /api/vitals` + `GET /api/vitals/latest` |
| `/risks` | `GET /api/risks` |
| `/education` | `GET /api/education` |
| `/notifications` | `GET /api/notifications` |
| Login / Register | `POST /api/auth/login` · `POST /api/auth/register` |

---

## 📋 Prerequisites

Install these before starting:

| Tool | Min version | How to check |
|---|---|---|
| **Node.js** | 18.17+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **PostgreSQL** | 14+ | `psql --version` |
| **Docker Desktop** | 24+ | `docker --version` |
| **Docker Compose** | 2.20+ | `docker compose version` |
| **Git** | any | `git --version` |

> **Windows users:** Use PowerShell or Git Bash for all commands below.

---

## 🚀 PATH A — Docker (Recommended, Zero Config)

This is the easiest way. One command starts the database, backend, frontend, and Nginx proxy — all pre-configured and networked together.

---

### Step 1 — Download the project

```bash
# If you have the zip file, unzip it:
unzip pregnancy-health-fullstack.zip
cd pregnancy-health-fullstack

# OR clone from GitHub (if pushed):
git clone https://github.com/your-org/pregnancy-health-fullstack.git
cd pregnancy-health-fullstack
```

---

### Step 2 — Create your environment file

```bash
cp .env.example .env
```

Now open `.env` in any text editor and fill in these **required** values:

```env
# ── Required: change these ──────────────────────────────────────
DB_PASSWORD=choose_any_strong_password
JWT_SECRET=any_random_string_of_at_least_32_characters
JWT_REFRESH_SECRET=another_random_string_at_least_32_characters

# ── Optional: email (leave as-is to skip email sending) ─────────
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password

# ── Leave these exactly as-is for local Docker ──────────────────
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pregnancy_health_db
DB_USER=postgres
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> **Tip for JWT secrets:** Just mash your keyboard for 32+ characters, e.g.
> `JWT_SECRET=kJ8#mP2$xQ9@nR5&wL3!vT7*yU4^zI6`

---

### Step 3 — Build and start all services

```bash
docker compose up --build
```

You will see output from four services starting up:
- `pregnancy_db` — PostgreSQL database
- `pregnancy_backend` — Node.js API server
- `pregnancy_frontend` — Next.js app
- `pregnancy_nginx` — Nginx reverse proxy

**⏳ First run takes 3–5 minutes** (Docker downloads images and builds the app).
**Subsequent starts take ~30 seconds.**

Wait until you see this line before continuing:
```
pregnancy_backend  | 🚀 Server running on port 5000 [development]
```

---

### Step 4 — Create the database tables

Open a **new terminal window** (keep the Docker window running) and run:

```bash
docker compose exec backend npm run migrate
```

Expected output:
```
== 20240101000001-create-users: migrating =======
== 20240101000001-create-users: migrated (0.123s)
== 20240101000002-create-pregnancy-profiles: migrating =======
...
== 20240101000008-create-notifications: migrated (0.045s)
```

If you see all 8 migrations complete with no errors, your database tables are ready.

---

### Step 5 — Load demo data

```bash
docker compose exec backend npm run seed
```

This creates demo users, patient profiles, appointments, vital signs, risk reports, and 6 education articles.

---

### Step 6 — Open the app

| URL | What you get |
|---|---|
| **http://localhost** | ✅ Full app via Nginx (use this) |
| http://localhost:3000 | Frontend directly |
| http://localhost:5000/health | Backend health check |
| http://localhost:5000/api | API base |

---

### Step 7 — Log in with a demo account

Go to **http://localhost/auth/login** and use any of these:

| Role | Email | Password |
|---|---|---|
| 👤 Patient | chioma@example.com | `Patient@1234` |
| 👤 Patient (high-risk) | fatima@example.com | `Patient@1234` |
| 🩺 Provider (OB) | dr.amara@pregnancyhealth.com | `Provider@1234` |
| 🩺 Provider (Midwife) | dr.ngozi@pregnancyhealth.com | `Provider@1234` |
| 🔑 Admin | admin@pregnancyhealth.com | `Admin@1234` |

After login:
- **Patients** → redirected to `/dashboard` (pregnancy overview, vitals, appointments)
- **Providers** → redirected to `/dashboard/provider` (patient list, today's schedule, risk reports)
- **Admins** → redirected to `/admin` (platform stats, user management)

---

### Docker: daily workflow

```bash
# Start the project (after first setup)
docker compose up

# Stop everything
docker compose down

# Stop and wipe the database (full reset)
docker compose down -v

# View logs from a specific service
docker compose logs -f backend
docker compose logs -f frontend

# Restart just one service after a code change
docker compose restart backend
```

---

## 💻 PATH B — Local Development (No Docker)

Use this if you want hot reload while editing code, or if Docker is not available.

---

### Step 1 — Install PostgreSQL and create the database

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
psql postgres -c "CREATE DATABASE pregnancy_health_db;"
```

**Ubuntu / Debian:**
```bash
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE DATABASE pregnancy_health_db;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

**Windows:**
1. Download installer from https://www.postgresql.org/download/windows/
2. Run installer, set password to `postgres`
3. Open pgAdmin or SQL Shell and run:
   ```sql
   CREATE DATABASE pregnancy_health_db;
   ```

---

### Step 2 — Set up the backend

```bash
# Navigate into the backend folder
cd pregnancy-health-fullstack/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Open `backend/.env` and set:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=pregnancy_health_db
DB_USER=postgres
DB_PASSWORD=postgres          # or whatever you set during PostgreSQL install

JWT_SECRET=any_32_plus_character_string_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=another_32_plus_character_string
JWT_REFRESH_EXPIRES_IN=30d

CLIENT_URL=http://localhost:3000
```

---

### Step 3 — Run database migrations

```bash
# Still inside /backend
npm run migrate
```

You should see all 8 tables being created. If you get a connection error, double-check your `DB_PASSWORD` and that PostgreSQL is running.

---

### Step 4 — Load seed data

```bash
npm run seed
```

---

### Step 5 — Start the backend server

```bash
npm run dev
```

You will see:
```
✅  Database connection established
✅  Sequelize models synced
🚀  Server running on port 5000 [development]
```

The API is now live at **http://localhost:5000**

Test it:
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","env":"development"}
```

---

### Step 6 — Set up the frontend (new terminal)

Open a **new terminal window**, keeping the backend running.

```bash
# Navigate into the frontend folder
cd pregnancy-health-fullstack/frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

The `.env.local` file should contain:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Pregnancy Health
```

---

### Step 7 — Start the frontend

```bash
npm run dev
```

You will see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

---

### Step 8 — Open the app

Go to **http://localhost:3000**

You now have:
- Frontend running on port **3000** (hot reloads when you edit files)
- Backend running on port **5000** (restarts when you edit files)
- PostgreSQL running on port **5432**

> In local dev, Next.js automatically proxies `/api/*` requests to the backend via `next.config.js`, so there are no CORS issues.

---

## 🔁 Resetting the Database

If you want to wipe all data and start fresh:

```bash
# Docker
docker compose exec backend npm run db:reset

# Local
cd backend
npm run migrate:undo   # drops all tables
npm run migrate        # recreates all tables
npm run seed           # reloads demo data
```

---

## 📁 Project Structure at a Glance

```
Mekacare-fullstack/
│
├── docker-compose.yml          ← starts all 4 services together
├── docker-compose.dev.yml      ← hot-reload dev override
├── .env.example                ← copy this to .env and fill in values
│
├── db/
│   └── init.sql                ← PostgreSQL extensions (auto-run by Docker)
│
├── nginx/
│   └── nginx.conf              ← routes /api/* → backend, /* → frontend
│
├── backend/                    ← Node.js / Express REST API
│   ├── Dockerfile
│   ├── .env.example            ← copy this to .env for local dev
│   └── src/
│       ├── server.js           ← entry point
│       ├── app.js              ← Express setup (CORS, middleware, routes)
│       ├── models/             ← 8 Sequelize models (User, Appointment, etc.)
│       ├── controllers/        ← business logic for each resource
│       ├── routes/             ← Express routers
│       ├── middleware/         ← JWT auth, role guards, validation, errors
│       ├── migrations/         ← 8 database migration files
│       ├── seeders/            ← demo data
│       └── utils/              ← logger, JWT helpers, email templates
│
└── frontend/                   ← Next.js 14 application
    ├── Dockerfile
    ├── .env.local.example      ← copy this to .env.local for local dev
    └── src/
        ├── app/                ← pages (Next.js App Router)
        │   ├── auth/           ← login, register
        │   ├── dashboard/      ← patient dashboard
        │   ├── appointments/   ← appointment list + booking
        │   ├── vitals/         ← vital signs log + trends
        │   ├── risks/          ← risk report filing + list
        │   ├── education/      ← article library
        │   └── notifications/  ← notification centre
        ├── contexts/
        │   └── AuthContext.tsx ← login/logout/user state (wired to /api/auth)
        ├── services/
        │   └── index.ts        ← all API calls (8 service modules)
        ├── hooks/
        │   └── index.ts        ← useAppointments, useVitals, useNotifications…
        ├── lib/
        │   └── api.ts          ← Axios instance (auto JWT + silent refresh)
        └── components/
            └── layout/
                ├── Sidebar.tsx         ← role-aware navigation
                └── ProtectedRoute.tsx  ← redirects if not logged in
```

---

## 🌐 All Available URLs

| URL | Description |
|---|---|
| http://localhost | App homepage (via Nginx) |
| http://localhost/auth/login | Login page |
| http://localhost/auth/register | Registration page |
| http://localhost/dashboard | Patient dashboard |
| http://localhost/appointments | Appointments |
| http://localhost/vitals | Vital signs |
| http://localhost/risks | Risk reports |
| http://localhost/education | Education library |
| http://localhost/notifications | Notifications |
| http://localhost/admin | Admin panel |
| http://localhost:5000/health | Backend health check |
| http://localhost:5000/api/auth/login | API login endpoint |

---

## ❌ Common Errors & Fixes

### "Cannot connect to database"
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Fix:** PostgreSQL is not running.
- Docker: `docker compose up db`
- Local: `sudo systemctl start postgresql` (Linux) or `brew services start postgresql@15` (Mac)

---

### "FATAL: password authentication failed for user postgres"
**Fix:** Your `DB_PASSWORD` in `.env` doesn't match what PostgreSQL expects.

Local fix:
```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```
Then set `DB_PASSWORD=postgres` in your `.env`.

---

### "JWT_SECRET is not defined"
**Fix:** You haven't filled in `.env`. Open it and add:
```
JWT_SECRET=any_long_random_string_here_at_least_32_chars
JWT_REFRESH_SECRET=another_long_random_string_at_least_32_chars
```

---

### Port 3000 or 5000 already in use
```bash
# Find what's using the port (e.g. port 3000)
lsof -i :3000          # Mac / Linux
netstat -ano | findstr :3000   # Windows

# Kill the process
kill -9 <PID>          # Mac / Linux
taskkill /PID <PID> /F # Windows
```

---

### Frontend shows blank page or "Failed to fetch"
1. Make sure the backend is running: `curl http://localhost:5000/health`
2. Check `NEXT_PUBLIC_API_URL=http://localhost:5000/api` in `frontend/.env.local`
3. Restart the frontend: `npm run dev`

---

### "Relation does not exist" (SQL error)
Migrations haven't been run yet.
```bash
# Docker
docker compose exec backend npm run migrate

# Local
cd backend && npm run migrate
```

---

### Login fails with "Invalid email or password"
Seeds haven't been loaded.
```bash
# Docker
docker compose exec backend npm run seed

# Local
cd backend && npm run seed
```

---

## 🔑 How Authentication Works

```
1. You enter email + password on /auth/login
2. Frontend sends POST to http://localhost:5000/api/auth/login
3. Backend checks password hash in PostgreSQL → returns { accessToken, refreshToken }
4. Frontend stores both tokens in localStorage
5. Every subsequent API request automatically includes:
   Authorization: Bearer <accessToken>
6. When accessToken expires (7 days), Axios silently calls /api/auth/refresh
   → gets a new token → retries the original request
   → you never see a logout or error
7. When refreshToken expires (30 days) → redirected to /auth/login
```

---

## 👥 Demo Accounts (after seeding)

| Role | Email | Password | What you see |
|---|---|---|---|
| Patient | chioma@example.com | `Patient@1234` | Dashboard, vitals, 2 appointments |
| Patient (High Risk) | fatima@example.com | `Patient@1234` | High-risk banner, abnormal vitals |
| Provider (OB) | dr.amara@pregnancyhealth.com | `Provider@1234` | 2 patients, today's schedule |
| Provider (Midwife) | dr.ngozi@pregnancyhealth.com | `Provider@1234` | 1 patient, virtual appointment |
| Admin | admin@pregnancyhealth.com | `Admin@1234` | Full platform stats |

---

## 🚢 Deploying to the Cloud

### Free deployment (student projects)

**Database → Supabase (free PostgreSQL)**
1. Go to https://supabase.com → New project
2. Copy the connection string
3. Set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` in your backend env

**Backend → Render (free Node.js)**
1. Go to https://render.com → New Web Service
2. Connect your GitHub repo, set root to `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all env vars from `backend/.env.example`
6. After deploy, open the Render Shell and run:
   ```bash
   npm run migrate && npm run seed
   ```

**Frontend → Vercel (free Next.js)**
1. Go to https://vercel.com → New Project
2. Connect your GitHub repo, set root to `frontend/`
3. Add env var: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
4. Deploy

---

## 📄 License

MIT © Mekacare Health Platform
