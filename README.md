# PrismBerry Customer Support Ticketing System

A full-stack, role-based customer support desk built with **FastAPI**, **React**, **SQLite**, and **TailwindCSS v4**. Features automated rule-based ticket classification (triage) by urgency and department, automated agent workload balancing, local attachment uploads, and separate dashboards for clients, support agents, and system administrators.

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

## 🔑 Demo Credentials (All Roles & Agents)

| Role | Email | Password | Assigned Department / Capabilities |
|------|-------|----------|-----------------------------------|
| **System Admin** | `admin@example.com` | `password123` | Provision/delete agents, view system metrics & workload |
| **Client** | `client@example.com` | `password123` | Raise & track client support tickets |
| **Tech Agent** | `tech@example.com` | `password123` | Technical Support Agent |
| **Billing Agent** | `billing@example.com` | `password123` | Billing Agent |
| **Account Agent** | `account@example.com` | `password123` | Account Support Agent |
| **General Agent** | `general@example.com` | `password123` | General Support Agent |

---

## ✨ Key Features

- **JWT Authentication & RBAC**: Secure access control with role-based routing (Client, Support Agent, Administrator).
- **Admin Portal (`/admin/dashboard`)**:
  - **Agent Provisioning**: Add new support agents with assigned department and password.
  - **Safe Agent Removal**: Delete agents with automatic ticket re-assignment to ensure active tickets are never orphaned.
  - **System Metrics**: Overview of total users, clients, agents, tickets, and status breakdown.
- **Automated Triage Engine**:
  - **Urgency Detection**: Scans subject and description against prioritized keyword dictionaries (Critical, High, Medium, Low).
  - **Department Classification**: Categorizes into *Technical Support*, *Billing*, *Account Support*, or *General Support* based on keyword matching.
  - **Tagging**: Auto-generates readable tags from detected keywords.
- **Automated Agent Routing**: Assigns incoming tickets to agents in the target department with the lowest current workload (fewest active tickets).
- **Client Dashboard**: Metric cards (Total, Open, In Progress, Resolved), ticket history, detailed ticket view, and ticket creation wizard with instant routing acknowledgment.
- **Agent Console**: Department metrics, multi-attribute filtering (by status, urgency, department, SLA response times), detail view with automated triage breakdown, and status lifecycle controls.
- **Attachments**: Local file upload support saved in `backend/uploads/`.

---

## 📡 REST API Summary

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | Public | Register client account |
| `/api/auth/login` | POST | Public | Authenticate user & return JWT token |
| `/api/auth/me` | GET | Authenticated | Get profile of logged-in user |
| `/api/admin/agents` | GET | Admin | List all support agents & active workloads |
| `/api/admin/agents` | POST | Admin | Create a new support agent |
| `/api/admin/agents/{id}` | DELETE | Admin | Delete support agent & reassign tickets |
| `/api/admin/stats` | GET | Admin | Get system metrics & workload breakdown |
| `/api/tickets` | POST | Client | Create ticket (triggers auto-triage & routing) |
| `/api/tickets` | GET | Authenticated | List tickets (filtered: client sees own, agent sees assigned) |
| `/api/tickets/{id}` | GET | Authenticated | View ticket details |
| `/api/tickets/{id}/status` | PATCH | Agent | Update status (New ➔ Open ➔ In Progress ➔ Resolved) |
