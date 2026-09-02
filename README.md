# PrismBerry Customer Support Ticketing System

A full-stack, role-based customer support desk built with **FastAPI**, **React**, **SQLite**, and **TailwindCSS v4**. Features automated rule-based ticket classification (triage) by urgency and department, automated agent workload balancing, local attachment uploads, and separate dashboards for clients and support agents.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Run Backend Server
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
*The database automatically creates and seeds demo users and tickets on startup.*
*API Docs available at: [http://localhost:8000/docs](http://localhost:8000/docs)*

### 2. Run Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Access the web UI at: [http://localhost:5173](http://localhost:5173)*

---

## 🔑 Demo Credentials

| Role | Email | Password | Assigned Department |
|------|-------|----------|---------------------|
| **Client** | `client@example.com` | `password123` | N/A (Client User) |
| **Tech Agent** | `tech@example.com` | `password123` | Technical Support |
| **Billing Agent** | `billing@example.com` | `password123` | Billing |
| **Account Agent** | `account@example.com` | `password123` | Account Support |
| **General Agent** | `general@example.com` | `password123` | General Support |

---

## ✨ Features

- **JWT Authentication & RBAC**: Secure access control with role-based routing (Client vs Support Agent).
- **Automated Triage Engine**:
  - **Urgency Detection**: Scans subject and description against prioritized keyword dictionaries (Critical, High, Medium, Low).
  - **Department Classification**: Categorizes into *Technical Support*, *Billing*, *Account Support*, or *General Support* based on keyword matching.
  - **Tagging**: Auto-generates readable tags from detected keywords.
- **Automated Agent Routing**: Assigns incoming tickets to agents in the target department with the lowest current workload (fewest active tickets).
- **Client Dashboard**: Metric cards (Total, Open, In Progress, Resolved), ticket history, detailed ticket view, and ticket creation wizard with instant routing acknowledgment.
- **Agent Console**: Department metrics, multi-attribute filtering (by status, urgency, department), detail view with automated triage breakdown, and status lifecycle controls.
- **Attachments**: Local file upload support saved in `backend/uploads/`.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: TailwindCSS v4 (CSS-first design system with `@theme` design tokens)
- **Routing**: React Router v6
- **HTTP Client**: Axios (with JWT interceptor)

### Backend
- **Framework**: FastAPI (Python 3.12)
- **ORM**: SQLAlchemy 2.0
- **Database**: SQLite (file-based: `support_tickets.db`)
- **Authentication**: JWT (`python-jose`) + password hashing (`passlib` / `bcrypt`)

---

## 🧠 Automated Triage & Routing Architecture

### 1. Keyword-based Classification Engine (`app/services/triage.py`)
```
Ticket Text (Subject + Description)
   │
   ├──► Scan Urgency Rules (Critical ➔ High ➔ Medium ➔ Low)
   │      - Critical: "system down", "outage", "hacked", "security breach", "payment failed repeatedly"
   │      - High: "urgent", "blocked", "unable to work", "major issue"
   │      - Medium: "problem", "issue", "error", "malfunction"
   │      - Low: "question", "feedback", "feature request"
   │
   ├──► Scan Department Rules (Frequency Scoring)
   │      - Technical Support: "error", "bug", "crash", "website", "api", "database"
   │      - Billing: "payment", "invoice", "refund", "subscription", "charged"
   │      - Account Support: "password", "account", "profile", "access", "reset"
   │      - General Support: Default fallback
   │
   └──► Extract Matched Keyword Tags
```

### 2. Workload Balancing Agent Router (`app/services/assignment.py`)
1. Find all support agents associated with the ticket's classified department.
2. Query active (non-resolved) ticket counts for each eligible agent.
3. Automatically assign the ticket to the agent with the lowest active workload.

---

## 📡 REST API Summary

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | Public | Register client account |
| `/api/auth/login` | POST | Public | Authenticate user & return JWT token |
| `/api/auth/me` | GET | Authenticated | Get profile of logged-in user |
| `/api/tickets` | POST | Client | Create ticket (triggers auto-triage & routing) |
| `/api/tickets` | GET | Authenticated | List tickets (filtered: client sees own, agent sees assigned) |
| `/api/tickets/{id}` | GET | Authenticated | View ticket details |
| `/api/tickets/{id}` | PATCH | Agent | Update ticket fields |
| `/api/tickets/{id}/status` | PATCH | Agent | Update status (New ➔ Open ➔ In Progress ➔ Resolved) |

---

## 📋 Architecture & Review Walkthrough

1. **Simple & Modular Backend**: Clear separation of routes (`routers/`), business logic (`services/`), database schemas (`models/`), and request/response models (`schemas/`).
2. **Backend-Enforced Security**: Role checks (`require_role`) and row-level ownership checks happen strictly on the server side.
3. **No Mock Data**: Complete real-time REST API integration with SQLite persistence.
