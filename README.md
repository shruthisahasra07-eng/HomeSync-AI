# 🏠 HomeSync AI

### Intelligent Residential Maintenance Management Platform

HomeSync AI is a full-stack residential maintenance management platform designed to streamline and automate maintenance workflows across apartment communities.

The platform combines **AI-assisted & rule-based NLP complaint classification**, **intelligent multi-factor worker assignment**, **conflict-free time-slot scheduling**, **voice-dictated complaint input**, **role-based portals (Resident, Worker, Admin)**, and **real-time notifications**.

---

## 🚀 Key Features

### 👤 Resident Portal
- Secure authentication & profile management (Resident, Worker, Admin).
- Submit maintenance complaints via typing or voice dictation (**🎙️ Speak Your Problem**).
- Real-time tracking of request lifecycle (`SUBMITTED` → `AI_ANALYZED` → `ASSIGNED` → `IN_PROGRESS` → `COMPLETED`).
- View assigned technicians and scheduled visit time slots.
- Rate and review completed maintenance services with analytics.

### 🤖 AI-Assisted & Rule-Based NLP Complaint Analysis
HomeSync AI processes natural-language complaint descriptions using an explainable, deterministic rule-based NLP classification engine. It automatically extracts:
- **Category & Subcategory** (Plumbing, Electrical, Carpentry, Water Supply, Appliance, Civil, Cleaning)
- **Priority Level** (`HIGH`, `MEDIUM`, `LOW`) based on urgency indicators and hazard markers
- **Required Worker Skill**
- **Estimated Repair Duration** (in minutes)
- **AI Confidence Score & Diagnostic Reasoning**

*Why Rule-Based NLP?* Provides instantaneous, zero-latency classification with 100% offline availability, zero token costs, and fully transparent, deterministic logic suitable for robust residential maintenance triage.

#### Example Classification
**Input:**
> *"The bathroom tap has been leaking continuously since yesterday causing water pooling on the floor."*

**NLP Classification Output:**
```text
Category       : Plumbing
Subcategory    : Tap Leakage
Priority       : HIGH (urgency detected: "continuously")
Required Skill : Plumbing
Duration       : 45 minutes
Confidence     : 94%
Reason         : Continuous tap leakage detected. Requires washer replacement or valve inspection.
```

### 🛠️ Smart Worker Matching & Scheduling
- **Multi-Factor Scoring Engine**: Ranks eligible technicians based on required skill match, block proximity, customer rating, and active workload.
- **Conflict-Free Scheduling**: Dynamically computes feasible, non-overlapping time slots against existing technician calendars.

---

## ⚙️ Environment Setup & Configuration

HomeSync AI strictly follows the **Twelve-Factor App** configuration methodology. All database credentials and secrets are loaded via environment variables and **must never be committed to source control**.

1. Copy the sample environment file:
   ```bash
   cp .env.example .env
   cp .env.example backend/.env
   ```

2. Open `.env` and fill in your actual PostgreSQL / Supabase connection details:
   ```env
   PORT=5001
   JWT_SECRET=your_secure_jwt_secret_key

   # PostgreSQL / Supabase Connection URI
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

3. Install dependencies and start the application:
   ```bash
   npm install
   npm run dev
   ```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)

---

## 🔒 Security Best Practices
- Database connection strings are loaded strictly from the environment (`DATABASE_URL`).
- `.env` and local credentials are protected by `.gitignore`.
- Passwords are encrypted with `bcrypt` (10 salt rounds).
- Authenticated endpoints are protected with JWT bearer tokens.
