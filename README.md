# CareerSphere — Unified Career & Recruitment Platform

> **Tagline:** *Your Career. Your Opportunities. Your Future.*
> **Theme:** *Dark Medieval Royal Realm Aesthetic (Inspired by High Fantasy & Realm Lore)*

CareerSphere is a production-ready, full-stack career platform designed for students, freshers, and professionals. It consolidates **verified corporate tech openings**, **official government recruitment notices (Sarkari notifications)**, **student internships**, **interactive preparation tracks**, **ATS-compliant resume building**, **real-time eligibility matching**, and **secure candidate authentication** into a single cohesive single-page application (SPA).

---

## 🌐 Live Access & 1-Click Deployment

- **Official Repository**: [https://github.com/kashishhhhh-19/CAREER_SPHERE](https://github.com/kashishhhhh-19/CAREER_SPHERE)
- **1-Click Free Cloud Deployment**:
  
  [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/kashishhhhh-19/CAREER_SPHERE)

  *Clicking the badge automatically provisions a free Render Web Service with automated HTTPS, zero-configuration environment setup via `render.yaml`, and automated continuous deployment on `git push`.*

---

## 🌟 Key Features & Capabilities

### 1. ⚔️ Unified Opportunity Feed & Search
- **Corporate Tech Jobs (`#corporate`)**: Curated openings from verified public feeds (Arbeitnow, Remotive, verified company career boards) with filters for salary CTC, experience, remote/onsite, and skills.
- **Government Jobs Portal (`#government`)**: Live official notifications from premier Indian boards including **UPSC**, **Railway Recruitment Boards (RRB)**, **India Post (GDS)**, **National Career Service (NCS)**, **Staff Selection Commission (SSC)**, and **State PSCs**.
- **Student Internships (`#internships`)**: Dedicated portal for fresher and student internships with stipend details, duration, and direct application links.
- **Global Search (`Ctrl + K`)**: Instant search overlay across corporate jobs, government exams, preparation tracks, and student projects.
- **Horizontal Scrollable Card Rails**: Responsive opportunity containers with custom styled drag-to-scroll support across mobile and desktop.

### 2. 🔐 Authentication, Authorization & User Isolation
- **Secure Registration & Login**: Candidates register with verified royal seals (email), password strength validation (minimum 8 characters with letters and numbers), and salt-rounds=12 **bcrypt** hashing.
- **Stateless JWT Tokens**: Signed `HS256` tokens with configurable expiration (`ACCESS_TOKEN_EXPIRE_MINUTES`).
- **Strict Multi-User Data Isolation**: User bookmarks, profile customizations, and notification read states are strictly isolated by `user_id` at the database level. User A cannot view, mutate, or delete User B's saved opportunities.
- **Rate-Limiting Protection**: In-memory rate limiting (15 attempts/minute/IP) to protect authentication endpoints against brute-force attacks.
- **Realm User Menu**: Navbar avatar indicator with dynamic dropdown (My Profile, Saved Opportunities, My Eligibility Matcher, and Sign Out).

### 3. 🎯 Intelligent Eligibility Matcher (`#eligibility`)
- Multi-dimensional qualification assessment: Highest qualification, degree/stream, graduation year & status, technical skills, and sector orientation (*Corporate*, *Government*, or *Both*).
- Dynamic matching engine calculating:
  - `Eligible` vs `Possibly Eligible` breakdown.
  - Transparent match reasons (e.g., `✓ Matches your BCA qualification`, `✓ Matches your Python skill`, `✓ Suitable for freshers`).

### 4. 🔔 Real-Time Notifications & Deadlines (`#notifications`)
- Header notification bell with dynamic unread badge counter.
- Categorized alerts across Government Jobs, Corporate Openings, Internships, Exams, and Closing Soon reminders.
- Background ingestion checker verifying source feed reachability and auto-generating notification items.
- "Mark as Read" / "Mark as Unread" toggle and modal detail views.

### 5. 📄 ATS Resume Builder & Student Portfolio
- **ATS Resume Builder (`#resume`)**: Split-screen live preview with instant ATS formatting, print-optimized stylesheet (`@media print`), and PDF generation.
- **Personal Study Notes (`#notes`)**: Client-persisted study checklists and scratchpad for technical interview preparation.
- **Student Projects (`#projects`)**: Categorized project showcase (Full Stack, Web Development, AI/ML) with GitHub links and preview modals.
- **Saved Opportunities (`#saved`)**: Centralized bookmarks manager synced to the backend database when authenticated.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Vanilla JavaScript (ES6+ Modules), HTML5, CSS3 Custom Properties (BEM-like), SVG Sigils |
| **Backend API** | Python 3.10+, FastAPI, Starlette, Uvicorn (ASGI) |
| **Security & Auth** | PyJWT (HS256 tokens), Bcrypt (password hashing, 12 rounds), Rate Limiter middleware |
| **Database** | SQLite3 (zero-configuration development) / PostgreSQL 16 (production ready via `DATABASE_URL`) |
| **Data Ingestion** | RSS/XML/JSON parsers for official portals (UPSC, RRB, India Post, NCS, Arbeitnow, Remotive) |
| **Testing** | Pytest, FastAPI TestClient, HTTPX |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Repository Structure

```
CAREER_SPHERE/
├── .env.example                # Safe environment variable configuration template
├── .gitignore                  # Git ignore rules for secrets, DBs, caches, logs
├── Dockerfile                  # Production container definition (Python 3.11-slim)
├── docker-compose.yml          # Multi-container orchestration (App + optional PostgreSQL)
├── requirements.txt            # Python dependencies (FastAPI, Uvicorn, Bcrypt, PyJWT, Pytest)
├── index.html                  # Single-Page Application entry point & modal dialogs
├── README.md                   # Complete documentation
│
├── backend/                    # Python / FastAPI Backend Engine
│   ├── server.py               # REST API endpoints, static mount, SPA fallback & router
│   ├── auth.py                 # Bcrypt password hashing, JWT encoding/decoding & validation
│   ├── config.py               # Environment configuration loader
│   ├── database.py             # SQLite/PostgreSQL schema, migrations & CRUD operations
│   ├── storage.py              # File-based caching helpers
│   ├── services/
│   │   ├── scheduler.py        # Background ingestion daemon worker
│   │   └── notification_checker.py # Feed health monitor & notification generator
│   └── sources/                # Live API adapters for real-world recruitment
│       ├── validator.py        # Rule-of-truth strict schema validator
│       ├── employment_news.py  # Employment News official announcements
│       ├── corporate/          # Public remote job feeds (Arbeitnow, Remotive)
│       └── govt/               # UPSC, RRB, India Post GDS, NCS, SSC adapters
│
├── css/                        # Design System & Styling
│   ├── style.css               # Global variables, typography, reset, realm theme
│   ├── components.css          # Cards, buttons, auth modal, badges, dropdowns
│   └── responsive.css          # Breakpoints (375px, 390px, 420px, 768px, 1024px, 1440px)
│
├── js/                         # Frontend Application (ES6 Modules)
│   ├── app.js                  # Main controller, hash router, auth handlers & UI listeners
│   ├── store.js                # Client state, auth sync, localStorage caching & event emitter
│   ├── overlayManager.js       # Central overlay & modal backdrop controller
│   ├── mockData.js             # High-fidelity mock datasets for offline fallback
│   ├── utils.js                # Toasts, date helpers, sanitization
│   └── views/                  # View renderers (Home, Corporate, Govt, Internships, Prep, etc.)
│
├── assets/                     # Media & Visual Assets
│   └── realm/                  # High-fantasy character archetypes & realm background art
│
└── tests/                      # Automated Test Suite
    └── test_backend.py         # Pytest coverage for health, auth, isolation, APIs
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

| Variable Name | Default Value | Description |
|---|---|---|
| `ENVIRONMENT` | `development` | Deployment environment (`development` / `production` / `test`) |
| `HOST` | `0.0.0.0` | Server bind host address |
| `PORT` | `8000` | Server listening port |
| `DEBUG` | `False` | Uvicorn hot-reload and verbose logging flag |
| `DATABASE_URL` | *Empty (uses SQLite)* | Database connection string. Supports PostgreSQL (`postgresql://user:pass@host:5432/db`) or SQLite |
| `JWT_SECRET_KEY` | *(Set strong secret)* | Cryptographic key used to sign and verify JWT authentication tokens |
| `JWT_ALGORITHM` | `HS256` | JWT signature algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| `10080` (7 days) | Token validity duration in minutes |
| `CORS_ORIGINS` | `*` | Comma-separated allowed origins or `*` for open development |
| `INGESTION_INTERVAL_SECONDS` | `14400` (4 hours) | Interval between scheduled background recruitment feed checks |

> **Security Note:** Never commit `.env` containing production credentials to version control. `.env` is explicitly ignored by `.gitignore`.

---

## 🚀 Getting Started Locally

### Prerequisites
- Python 3.10, 3.11, or 3.12+ (or Docker)
- A modern web browser (Chrome, Edge, Firefox, Safari)

### Method 1: Local Python Environment (Recommended)

1. **Clone the repository and enter directory:**
   ```bash
   git clone <repository-url>
   cd CAREER_SPHERE
   ```

2. **(Optional) Create and activate a virtual environment:**
   ```bash
   # Windows PowerShell:
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the CareerSphere production server:**
   ```bash
   python backend/server.py
   ```
   *Alternative using Uvicorn directly:*
   ```bash
   uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
   ```

5. **Open in browser:**
   ```
   http://localhost:8000
   ```
   - **Interactive API Documentation (Swagger UI):** `http://localhost:8000/docs`
   - **Alternative API Docs (ReDoc):** `http://localhost:8000/redoc`
   - **Health Check Endpoint:** `http://localhost:8000/api/health`

---

### Method 2: Docker

1. **Build the container image:**
   ```bash
   docker build -t careersphere .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 8000:8000 --name careersphere-app careersphere
   ```

3. **Access at `http://localhost:8000`.**

---

### Method 3: Docker Compose

To launch the web service with persistent SQLite volume:
```bash
docker compose up -d
```

To launch with an optional dedicated PostgreSQL container:
```bash
docker compose --profile with-postgres up -d
```

---

### Method 4: Client-Side Static Fallback

If running without the Python backend, CareerSphere includes an automatic client-side fallback using LocalStorage and pre-seeded mock datasets:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000`.

---

## 🧪 Running Automated Tests

The backend test suite verifies system health, password hashing, JWT validation, security status codes (401/409), public opportunity feeds, and **multi-user tenant isolation**.

Run the test suite using `pytest`:
```bash
python -m pytest tests/test_backend.py -v
```

---

## 🔒 Security & Data Integrity

- **Rule of Truth**: The platform never fabricates real salaries, examination dates, or qualification criteria. Live feeds are validated against official sources.
- **Tenant Isolation**: User profiles and saved items use foreign key relationships scoped strictly to the authenticated `user_id`.
- **Password Protection**: Passwords are never stored in plaintext. Passwords are salted and hashed using bcrypt (12 rounds) before database insertion.
- **Protection of Secrets**: All sensitive keys, secrets, and environment configurations are excluded via `.gitignore`. A safe template is provided in `.env.example`.

---

## 📜 License

This project is licensed under the MIT License — see the repository files for details.
