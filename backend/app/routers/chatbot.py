"""
Chatbot router — AI customer assistant and agent reply suggestions.
Powered by Groq LLM API (llama-3.1-8b-instant).
"""
import os
import json
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.ticket import Ticket
from app.dependencies import get_db, get_current_user
from app.services.triage import classify_ticket
from app.services.assignment import assign_agent
from app.routers.tickets import _ticket_to_response, _generate_ticket_number

router = APIRouter(prefix="/api/chatbot", tags=["AI Chatbot"])

GROQ_MODEL = "llama-3.1-8b-instant"


# --- Schemas ---

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str
    ticket_created: Optional[bool] = False
    ticket_number: Optional[str] = None
    ticket_id: Optional[int] = None


class SuggestReplyRequest(BaseModel):
    ticket_id: int


class SuggestReplyResponse(BaseModel):
    suggested_reply: str
    key_points: List[str]


@router.post("/chat", response_model=ChatResponse)
def client_chat(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Customer-facing AI assistant endpoint.
    Answers support questions or automatically raises a ticket if requested.
    """
    api_key = os.getenv("GROQ_API_KEY", "").strip()

    # Rule-based fallback if GROQ_API_KEY is not set
    if not api_key:
        return _fallback_client_chat(req.message, current_user, db)

    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        system_prompt = f"""You are PrismBerry's AI Support Assistant for our customer support desk.
Your user's name is {current_user.name} ({current_user.email}).

Capabilities:
1. Provide helpful, empathetic troubleshooting advice for technical, billing, or account questions.
2. If the user explicitly asks to open, raise, or create a ticket, OR if their issue requires agent intervention, you can create a ticket on their behalf!

Output Format:
You MUST respond with valid JSON containing:
{{
  "intent": "answer" OR "create_ticket",
  "reply": "Your response message to the customer",
  "ticket_subject": "Short concise summary if creating a ticket (or null)",
  "ticket_description": "Detailed explanation if creating a ticket (or null)"
}}

Guidelines:
- If user wants to open a ticket, set "intent": "create_ticket", provide "ticket_subject" and "ticket_description", and explain in "reply" that you are opening ticket for them.
- If user is asking a general question or chatting, set "intent": "answer", set ticket_subject and ticket_description to null.
- Keep replies friendly, concise, and helpful."""

        messages = [{"role": "system", "content": system_prompt}]
        for h in req.history[-4:]:  # last 4 messages context
            messages.append({"role": h.role, "content": h.content})
        messages.append({"role": "user", "content": req.message})

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature=0.2,
            messages=messages,
        )

        content = response.choices[0].message.content
        parsed = json.loads(content)

        intent = parsed.get("intent", "answer")
        reply_text = parsed.get("reply", "How can I assist you with your support request today?")

        if intent == "create_ticket" and parsed.get("ticket_subject"):
            subj = parsed.get("ticket_subject", req.message[:50])
            desc = parsed.get("ticket_description", req.message)

            # Auto-triage & assign
            classification = classify_ticket(subj, desc)
            agent_id = assign_agent(db, classification["department"])

            ticket = Ticket(
                ticket_number=_generate_ticket_number(db),
                client_id=current_user.id,
                assigned_agent_id=agent_id,
                subject=subj,
                description=desc,
                status="New",
                urgency=classification["urgency"],
                department=classification["department"],
                tags=classification["tags"],
            )

            db.add(ticket)
            db.commit()
            db.refresh(ticket)

            ticket_msg = f"{reply_text}\n\n✅ Ticket #{ticket.ticket_number} has been created and assigned to the {ticket.department} team ({classification['urgency']} priority)."

            return ChatResponse(
                reply=ticket_msg,
                ticket_created=True,
                ticket_number=ticket.ticket_number,
                ticket_id=ticket.id,
            )

        return ChatResponse(reply=reply_text)

    except Exception as e:
        print(f"[CHATBOT ERROR] {e}")
        return _fallback_client_chat(req.message, current_user, db)


def _fallback_client_chat(msg: str, user: User, db: Session) -> ChatResponse:
    """Fallback response if LLM API is unavailable."""
    msg_lower = msg.lower()

    if any(kw in msg_lower for kw in ["ticket", "create", "open", "raise", "help me"]):
        subj = f"Support Request from {user.name}"
        desc = msg
        classification = classify_ticket(subj, desc)
        agent_id = assign_agent(db, classification["department"])

        ticket = Ticket(
            ticket_number=_generate_ticket_number(db),
            client_id=user.id,
            assigned_agent_id=agent_id,
            subject=subj,
            description=desc,
            status="New",
            urgency=classification["urgency"],
            department=classification["department"],
            tags=classification["tags"],
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        return ChatResponse(
            reply=f"I have created a support ticket #{ticket.ticket_number} for you in {ticket.department}.",
            ticket_created=True,
            ticket_number=ticket.ticket_number,
            ticket_id=ticket.id,
        )

    return ChatResponse(
        reply="Hello! I am your AI Support Assistant. You can ask me troubleshooting questions, or say 'create a ticket' to automatically submit a new support request!"
    )


@router.post("/suggest-reply", response_model=SuggestReplyResponse)
def suggest_agent_reply(
    req: SuggestReplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Agent-side AI reply generator endpoint.
    Generates a professional response tailored to the ticket.
    """
    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(status_code=403, detail="Only agents or admins can request AI reply suggestions")

    ticket = db.query(Ticket).filter(Ticket.id == req.ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    api_key = os.getenv("GROQ_API_KEY", "").strip()

    if not api_key:
        return SuggestReplyResponse(
            suggested_reply=f"Hello {ticket.client.name if ticket.client else 'Customer'},\n\nThank you for reaching out regarding: '{ticket.subject}'. We are reviewing your issue and working on a resolution.\n\nBest regards,\n{current_user.name}\n{ticket.department}",
            key_points=["Confirm receipt of request", "Provide estimated review timeframe", "Request additional logs if needed"]
        )

    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        prompt = f"""You are an expert customer support agent assistant.
Generate a professional, empathetic, and solution-focused reply for a support ticket.

Ticket Details:
- Ticket #: {ticket.ticket_number}
- Client Name: {ticket.client.name if ticket.client else 'Customer'}
- Department: {ticket.department}
- Urgency: {ticket.urgency}
- Subject: {ticket.subject}
- Description: {ticket.description}
- Agent Name: {current_user.name}

Output MUST be JSON:
{{
  "suggested_reply": "Complete professional response message",
  "key_points": ["Point 1", "Point 2", "Point 3"]
}}"""

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature=0.2,
            messages=[
                {"role": "system", "content": "You are a customer support AI assistant."},
                {"role": "user", "content": prompt},
            ],
        )

        content = response.choices[0].message.content
        parsed = json.loads(content)

        return SuggestReplyResponse(
            suggested_reply=parsed.get("suggested_reply", ""),
            key_points=parsed.get("key_points", ["Empathetic greeting", "Actionable troubleshooting steps", "Follow-up guarantee"])
        )

    except Exception as e:
        print(f"[AI SUGGESTION ERROR] {e}")
        return SuggestReplyResponse(
            suggested_reply=f"Hello {ticket.client.name if ticket.client else 'Customer'},\n\nThank you for contacting {ticket.department} regarding '{ticket.subject}'. I am reviewing the issue and will follow up shortly.\n\nBest regards,\n{current_user.name}",
            key_points=["Acknowledge client concern", "Assure investigation", "Provide direct support contact"]
        )
