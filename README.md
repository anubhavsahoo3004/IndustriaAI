# INDUSTRIAAI
### Intelligent Industrial Approval & Compliance Navigator
**Smart India Hackathon Prototype (Problem Statement: SIH26130)**
*“Efficiency in streamlining industrial approvals, compliance processes, and access to government support services”*

---

## 🏛️ 1. Product Overview

**IndustriaAI** is an enterprise-grade statutory compliance and approval intelligence platform built specifically for industrial units and entrepreneurs in **Maharashtra, India**.

Instead of acting as a generic static portal, IndustriaAI utilizes a **Personalized Approval Intelligence Engine** that transforms an industrial unit's technical profile (sector, scale, location, workforce, electricity load, water requirement, and effluent discharge) into an actionable, transparent roadmap.

### 🌟 Key Differentiators:
1. **Personalized Statutory Mapping**: Explains *why* each statutory requirement applies (e.g. MPCB Consent to Establish, FDA/FSSAI Food License, DISH Factory Plan Approval, MIDC Fire NOC).
2. **AI Document Completeness & Consistency Checking**: Evaluates uploaded PDFs, DOCX, and text files against the registered business profile, verifying entity name consistency, jurisdiction, PAN/GSTIN alignment, and technical specifications.
3. **Transparent Rule-Based SLA Delay Intelligence**: Diagnoses stage velocity risks (`LOW`, `MEDIUM`, `HIGH`) with exact explainable signals (e.g. review stage hold time, missing mandatory documents, unscheduled inspections).
4. **Contextual AI Compliance Navigator**: Cites actual database approval and inspection records when answering user questions (e.g., *"What should I do next?"*, *"Which documents are currently missing?"*).
5. **Departmental Scrutiny & Bottleneck Analytics**: Empowers government administrators with real-time bottleneck analysis across workflow stages (`Document Verification`, `Department Review`, `Site Inspection`, `Final Decision`).
6. **Government Support & Subsidy Matching**: Automatically matches industrial units with eligible Maharashtra government policies (e.g., Maharashtra Package Scheme of Incentives PSI 2019/2024, MAIDC Food Processing Scheme, CMEGP).

---

## 🛠️ 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Recharts, Lucide Icons |
| **Backend** | Python 3.9+, FastAPI, Pydantic v2, SQLAlchemy, Uvicorn |
| **Document Processing** | PyMuPDF (fitz), python-docx |
| **Database** | SQLite (Default for seamless local dev) / PostgreSQL (Production ready) |
| **AI Integration** | Google Gemini API (`gemini-2.5-flash` backend-only key isolation) + Deterministic Fallback Engine |
| **Authentication** | JWT Bearer Tokens, Bcrypt Password Hashing, Role-Based Access Control |

---

## 🚀 3. Quickstart & Local Setup Instructions

### Prerequisites:
- Python 3.9+
- Node.js 18+ and npm

### Step 1: Clone and Configure Environment
```bash
git clone <repository-url>
cd IndustriaAI

# Copy example environment configuration
cp .env.example .env
```

### Step 2: Backend Setup & Database Seeding
```bash
# Create Python Virtual Environment
python3 -m venv backend/venv
source backend/venv/bin/activate  # On Windows: backend\venv\Scripts\activate

# Install Dependencies
pip install -r backend/requirements.txt

# Initialize Database & Seed Demo Data
python backend/seed.py

# Start FastAPI Backend Server (Port 8000)
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend interactive Swagger documentation available at:* `http://127.0.0.1:8000/docs`

### Step 3: Frontend Setup & Dev Server
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite Development Server (Port 5173)
npm run dev
```
*Open Application in Browser:* `http://127.0.0.1:5173`

---

## 🔑 4. Demo Login Credentials

The application includes built-in **1-Click Demo Persona buttons** on the login page as well as standard credentials:

| Persona | Email | Password | Role & Scope |
|---|---|---|---|
| **Applicant** (Primary Demo) | `applicant@industria.ai` | `password123` | **Rajesh Kulkarni** (Promoter, *Maharashtra Fresh Foods Pvt. Ltd.*, Chakan MIDC, Pune) |
| **Department Admin** | `admin@industria.ai` | `password123` | **Dr. Sunita Deshmukh** (Directorate of Industries, Maharashtra — Analytics, SLA Bottlenecks, Approvals) |
| **Field Inspecting Officer** | `officer@industria.ai` | `password123` | **Sanjay Patil** (Regional Scrutiny Officer, Pune MPCB / DISH) |

---

## 📋 5. Complete End-to-End Demo Scenario Walkthrough

Follow this 10-minute demonstration flow directly in the application:

1. **Sign In as Applicant**:
   - Open `http://127.0.0.1:5173/login`.
   - Click the **Applicant Persona** 1-click card.
2. **Review Industrial Dashboard**:
   - Inspect the active unit banner (*Maharashtra Fresh Foods Pvt. Ltd.*).
   - Review the 5 core metric cards: **Total Clearances (8)**, **Completed (4)**, **Under Review (3)**, **Action Required (1)**, **Near / Delayed SLA (2)**.
   - Inspect the **Status Distribution Pie Chart**, **Upcoming Inspections**, and **Statutory Compliance Calendar**.
3. **Inspect Business Profile & Generate Approval Plan**:
   - Navigate to **Business Profile** in the sidebar.
   - Review the configured technical parameters: *Food Processing*, *Pune District*, *Medium Scale*, *45 Workers*, *350 kW Connected Load*, *45 KLD Water*, *Trade Effluent: Yes*.
   - Click **Generate Personalized Approval Plan**.
4. **Personalized Approval Intelligence**:
   - On the **Approval Plan** page, review the statutory roadmap.
   - Read the **"Why It Applies to Your Business"** section on each card.
   - Note statutory standard SLAs, mandatory site inspection tags, and required document manifests.
5. **Application Detail, Workflow Timeline & Document Validation**:
   - Click **Open Application** on an application (e.g. *Consent to Establish* or *FSSAI Manufacturing License*).
   - Review the **Statutory Workflow Timeline** (Submitted → Document Verification → Department Review → Site Inspection → Decision).
   - Inspect the **Document Completeness Checklist**.
   - Click **Upload Document** to attach a technical annexure or **Run Completeness Check** to view the AI consistency report (Business Name match, Jurisdiction check, PAN/GSTIN alignment).
6. **Contextual AI Compliance Assistant**:
   - Click **AI Assistant** in the sidebar.
   - Click the preset prompt: **"What should I do next?"**.
   - Observe the database-grounded response citing specific application numbers, missing documents, and scheduled inspection dates.
   - Try asking: *"Which documents are currently missing?"* or *"Summarize my current approval journey."*.
7. **View In-App Notifications**:
   - Click **Notifications** in the sidebar to review alerts for scheduled inspections and SLA risk warnings.
8. **Switch to Government Department Administration**:
   - In the top bar, click the **Admin Portal** button.
   - On the **Admin Dashboard**, review the **Bottleneck Analysis** percentages (*Document Verification*, *Department Review*, *Site Inspection* calculated from live database stage velocity).
   - Inspect the **Applications by Industry** and **Status Breakdown** charts.
9. **SLA Delay Intelligence Queue**:
   - Navigate to **SLA Delay Queue** in the sidebar.
   - Inspect delayed applications and read the exact **Delay Risk Signals** (e.g. *Department review stage active 18 days > 15-day benchmark*).
10. **Scrutiny Queue & Application Stage Advancement**:
    - Navigate to **Scrutiny & Review**.
    - Click **Update** on an application.
    - Change status, add official scrutiny remarks, toggle *Advance workflow timeline*, and save.
    - Switch back to the **Applicant Persona** and verify that the updated stage is reflected immediately on their dashboard and timeline.

---

## 🏛️ 6. System Architecture & Folder Layout

```
IndustriaAI/
├── .env.example
├── README.md
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── router.py
│   │   │   └── routes/ (auth, businesses, approvals, applications, documents, inspections, compliance, schemes, analytics, ai, audit_logs)
│   │   ├── core/ (config, database, security, dependencies)
│   │   ├── models/ (user, business, approval, application, workflow, document, inspection, compliance, scheme, notification, audit, knowledge)
│   │   ├── schemas/ (Pydantic models for validation & serialization)
│   │   ├── rules/ (approval_engine, delay_risk_engine, scheme_matching_engine, knowledge_data)
│   │   ├── services/ (business logic & database transactions)
│   │   ├── ai/ (gemini_client, document_analyzer, assistant_service)
│   │   └── utils/ (document_parser)
│   ├── seed.py (Database seeder for full Maharashtra demo dataset)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/ (common, layout, badges, modals, timeline, stat cards)
    │   ├── contexts/ (AuthContext, NotificationContext)
    │   ├── layouts/ (AppLayout)
    │   ├── pages/ (Dashboard, Profile, Approvals, Applications, Detail, Documents, Inspections, Compliance, Schemes, Notifications, AI Assistant, Audit Logs, Admin Dashboard, Scrutiny Queue, SLA Risk, Inspection Dispatch)
    │   ├── services/ (api client and modular service handlers)
    │   ├── types/ (TypeScript interfaces)
    │   └── App.tsx (React Router v6)
    ├── package.json
    └── tailwind.config.js
```

---

## 🔒 7. Security & Extensibility

- **No Secrets in Frontend**: AI API keys and database credentials reside strictly on the backend.
- **Role-Based Authorization**: Applicants can only access their own businesses and applications; administrators have access to state-wide analytics and scrutiny queues.
- **Configurable Rules & Clearances**: New sectors (e.g. Pharmaceuticals, Chemical Manufacturing), additional Maharashtra districts, and central approvals can be added simply via database records and rule manifests without rewriting application code.

---

## 🚀 8. Public Cloud Deployment Guide (Render + Supabase)

IndustriaAI is fully configured for long-term public deployment without purchasing a custom domain. The frontend and backend run as distinct services on Render with an external hosted Supabase PostgreSQL database.

### 🏗️ Architecture

```
GitHub Repository
       ↓
 Render Cloud
   ├── React/Vite Static Site (Frontend: https://<your-frontend>.onrender.com)
   └── FastAPI Web Service    (Backend:  https://<your-backend>.onrender.com)
            ↓
       Supabase PostgreSQL    (Managed Database: Transaction & Session Pooler)
            ↓
        Gemini API             (Backend-Only Generative AI via Google AI Studio)
```

> **Note on Prototype / Free Hosting:**
> - **Domain purchase is not required**: Render generates free HTTPS URLs (e.g., `*.onrender.com`).
> - **Cold Starts**: Render free-tier web services spin down after 15 minutes of inactivity; initial requests may take 30–50 seconds to wake up.
> - **Ephemeral Storage**: Render containers have ephemeral disks. Document records and metadata persist permanently in Supabase PostgreSQL; for high-volume production file persistence, configure cloud object storage (e.g. Supabase Storage / S3 / R2).

---

### Step 1: Database Setup (Supabase PostgreSQL)

1. Create a free account at [Supabase](https://supabase.com) and create a new project.
2. In your Supabase Project Settings → **Database** → **Connection string**:
   - Select **URI** mode.
   - Use the **Transaction Pooler** (port `6543`) or Direct Connection (`5432`).
   - Example URI: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require`

---

### Step 2: Backend Deployment (Render Web Service)

1. Log into [Render](https://render.com) and click **New → Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `industriaai-api`
   - **Region**: Closest to your users (e.g., Singapore, Frankfurt, Oregon)
   - **Root Directory**: `.` (leave empty / repository root)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
4. Configure **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `APP_ENV` | `production` | Enables production validation |
   | `DEBUG` | `false` | Disables debug stack traces |
   | `DATABASE_URL` | `postgresql://...` | Your Supabase connection string |
   | `SECRET_KEY` | *(generate 32+ char token)* | Cryptographic JWT signing key |
   | `GEMINI_API_KEY` | `AIza...` | Google AI Studio Gemini API Key |
   | `CORS_ORIGINS` | `https://industriaai-app.onrender.com` | Deployed frontend URL |
   | `FRONTEND_URL` | `https://industriaai-app.onrender.com` | Deployed frontend URL |
   | `DEMO_MODE` | `true` | Enables statutory demonstration features |
   | `MAHARASHTRA_FOCUS` | `true` | Enables Maharashtra single-window rules |

5. Deploy the service. Once deployed, verify `https://industriaai-api.onrender.com/health` returns:
   ```json
   {"status": "healthy", "database": "connected"}
   ```

6. *(Optional One-Time Demo Seed)*: To populate the remote Supabase database with demo data:
   ```bash
   DATABASE_URL="postgresql://..." python -m backend.seed
   ```

---

### Step 3: Frontend Deployment (Render Static Site)

1. In Render, click **New → Static Site**.
2. Connect the same GitHub repository.
3. Configure static site settings:
   - **Name**: `industriaai-app`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
4. Configure **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://industriaai-api.onrender.com` | Public URL of your deployed FastAPI service |
5. Configure **Client-Side Routing (SPA)**:
   - The repository includes `frontend/public/_redirects` and `render.yaml` rewrite rules (`/*` → `/index.html`) so refreshing routes like `/dashboard`, `/applications`, `/documents`, etc., never returns 404.
6. Deploy the static site. Render will provide your HTTPS live link.

---

### Quick Launch using Blueprint (`render.yaml`)

Alternatively, use Render's Blueprint feature:
1. In Render Dashboard, click **New → Blueprint**.
2. Select your repository. Render will automatically read `render.yaml` and provision both the Web Service and Static Site.
3. Fill in `DATABASE_URL`, `GEMINI_API_KEY`, and cross-reference the service URLs.
