# PrismBerry Customer Support Ticketing System

A full-stack, role-based customer support desk built with **FastAPI**, **React**, **SQLite**, and **TailwindCSS v4**. Features automated rule-based & LLM ticket classification (triage) by urgency and department, automated agent workload balancing, local attachment uploads, customer AI chatbot, agent-side AI reply suggestions, and separate dashboards for clients, support agents, and system administrators.

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

## ✨ Bonus Features Completed: AI Chatbots & Reply Suggestions

1. **Customer-Facing AI Assistant Widget (`ChatbotWidget.jsx`)**:
   - Floating interactive assistant powered by Groq LLM (`llama-3.1-8b-instant`).
   - Provides real-time troubleshooting answers and interactive quick prompts.
   - **Automated Ticket Creation**: If a customer requests to open a ticket, the AI assistant extracts the problem, automatically calls the backend creation & triage pipeline, creates the ticket in SQLite, and provides a direct `View Ticket #TKT-XXXX` button in chat!

2. **Agent-Side AI Reply Suggestions (`AgentTicketDetails.jsx`)**:
   - Integrated inside the agent ticket management workspace.
   - Powered by Groq LLM (`llama-3.1-8b-instant`).
   - One-click `🤖 Generate AI Suggestion` generates a customized, professional resolution message tailored to the client's issue and department.
   - Includes key resolution points and a `Copy Response` tool for fast resolution workflows.

---

## 📡 REST API Summary

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | Public | Register client account |
| `/api/auth/login` | POST | Public | Authenticate user & return JWT token |
| `/api/auth/me` | GET | Authenticated | Get profile of logged-in user |
| `/api/chatbot/chat` | POST | Client | Customer-facing AI assistant endpoint |
| `/api/chatbot/suggest-reply` | POST | Agent | Agent-side AI resolution reply generator |
| `/api/admin/agents` | GET | Admin | List all support agents & active workloads |
| `/api/admin/agents` | POST | Admin | Create a new support agent |
| `/api/admin/agents/{id}` | DELETE | Admin | Delete support agent & reassign tickets |
| `/api/admin/stats` | GET | Admin | Get system metrics & workload breakdown |
| `/api/tickets` | POST | Client | Create ticket (triggers auto-triage & routing) |
| `/api/tickets` | GET | Authenticated | List tickets (filtered by role) |
| `/api/tickets/{id}` | GET | Authenticated | View ticket details |
| `/api/tickets/{id}/status` | PATCH | Agent | Update status (New ➔ Open ➔ In Progress ➔ Resolved) |
