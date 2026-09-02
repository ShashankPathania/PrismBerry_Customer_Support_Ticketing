# PrismBerry Customer Support Ticketing System

A full-stack, role-based customer support desk built with **FastAPI**, **React**, **SQLite**, and **TailwindCSS v4**. Features automated LLM ticket classification (triage) by urgency and department, automated agent workload balancing, local attachment uploads, real-time conversation threads (Agent ↔ Client replies), customer AI chatbot, agent-side AI reply suggestions, and separate dashboards for clients, support agents, and system administrators.

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

## ✨ Features Completed

1. **Interactive Conversation & Reply System**:
   - **Agent Reply Workspace (`AgentTicketDetails.jsx`)**: Support agents can type and send replies directly to clients on any assigned ticket. When an agent posts the first reply, the ticket status automatically transitions from `New` to `Open`.
   - **Client Reply View (`TicketDetails.jsx`)**: Clients can view agent responses in a clean conversation thread and reply back with additional information or clarification.
   - **AI Reply Assistant**: Agents can click `🤖 AI Suggest Reply` to generate tailored responses via Groq LLM API and click `Use as Reply` to populate the composer instantly.

2. **Customer-Facing AI Assistant Widget (`ChatbotWidget.jsx`)**:
   - Floating interactive assistant powered by Groq LLM API (`qwen/qwen3.6-27b`).
   - Answers support questions in real-time and raises support tickets on demand with instant ticket link chips.

3. **Admin Portal (`/admin/dashboard`)**:
   - Agent CRUD management, safe deletion with automated workload reassignment, and platform metrics overview.

---

## 📡 REST API Summary

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | Public | Register client account |
| `/api/auth/login` | POST | Public | Authenticate user & return JWT token |
| `/api/tickets` | POST | Client | Create ticket (triggers auto-triage & routing) |
| `/api/tickets` | GET | Authenticated | List tickets (filtered by role) |
| `/api/tickets/{id}` | GET | Authenticated | View ticket details |
| `/api/tickets/{id}/responses` | GET | Authenticated | Get full conversation thread for a ticket |
| `/api/tickets/{id}/responses` | POST | Authenticated | Post a reply (Agent or Client) |
| `/api/tickets/{id}/status` | PATCH | Agent | Update status (New ➔ Open ➔ In Progress ➔ Resolved) |
| `/api/chatbot/chat` | POST | Client | Customer-facing AI assistant endpoint |
| `/api/chatbot/suggest-reply` | POST | Agent | Agent-side AI resolution reply generator |
| `/api/admin/agents` | GET/POST/DELETE | Admin | Agent management & workload reassignment |
