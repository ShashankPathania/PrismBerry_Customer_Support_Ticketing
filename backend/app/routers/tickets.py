"""
Ticket router — CRUD operations with automatic triage and role-based filtering.

Key behaviors:
  - POST creates a ticket, auto-classifies it, and auto-assigns an agent
  - GET list is filtered by role: clients see their own, agents see assigned
  - PATCH operations are restricted to agents
"""
import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from app.models.user import User
from app.models.ticket import Ticket
from app.models.response import Response as ResponseModel
from app.schemas.ticket import TicketResponse, TicketUpdate, StatusUpdate
from app.dependencies import get_db, get_current_user
from app.services.triage import classify_ticket
from app.services.assignment import assign_agent

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


# --- Response Schemas (inline for simplicity) ---

class ResponseCreate(BaseModel):
    message: str

class ResponseOut(BaseModel):
    id: int
    ticket_id: int
    author_id: int
    author_name: str
    author_role: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

# Directory for uploaded attachments
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _ticket_to_response(ticket: Ticket) -> TicketResponse:
    """Convert a Ticket ORM object to a TicketResponse with client/agent names."""
    return TicketResponse(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        client_id=ticket.client_id,
        assigned_agent_id=ticket.assigned_agent_id,
        subject=ticket.subject,
        description=ticket.description,
        status=ticket.status,
        urgency=ticket.urgency,
        department=ticket.department,
        tags=ticket.tags,
        attachment_path=ticket.attachment_path,
        attachment_name=ticket.attachment_name,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        resolved_at=ticket.resolved_at,
        client_name=ticket.client.name if ticket.client else None,
        agent_name=ticket.assigned_agent.name if ticket.assigned_agent else None,
    )


def _generate_ticket_number(db: Session) -> str:
    """Generate a unique ticket number like TKT-0001."""
    count = db.query(Ticket).count()
    return f"TKT-{count + 1:04d}"


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    subject: str = Form(...),
    description: str = Form(...),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new support ticket.
    The backend automatically:
      1. Classifies urgency and department via keyword triage
      2. Assigns an appropriate agent based on department
    """
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can create tickets",
        )

    # Step 1: Auto-classify the ticket
    classification = classify_ticket(subject, description)

    # Step 2: Auto-assign an agent
    agent_id = assign_agent(db, classification["department"])

    # Step 3: Handle file attachment
    attachment_path = None
    attachment_name = None
    if attachment and attachment.filename:
        # Save with a unique name to avoid collisions
        ext = os.path.splitext(attachment.filename)[1]
        safe_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, safe_name)

        content = await attachment.read()
        with open(file_path, "wb") as f:
            f.write(content)

        attachment_path = file_path
        attachment_name = attachment.filename

    # Step 4: Create the ticket
    ticket = Ticket(
        ticket_number=_generate_ticket_number(db),
        client_id=current_user.id,
        assigned_agent_id=agent_id,
        subject=subject,
        description=description,
        status="New",
        urgency=classification["urgency"],
        department=classification["department"],
        tags=classification["tags"],
        attachment_path=attachment_path,
        attachment_name=attachment_name,
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return _ticket_to_response(ticket)


@router.get("", response_model=list[TicketResponse])
def list_tickets(
    status_filter: Optional[str] = None,
    urgency: Optional[str] = None,
    department: Optional[str] = None,
    sort_by: Optional[str] = "newest",  # "newest", "oldest"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List tickets filtered by role:
      - Clients see only their own tickets
      - Agents see tickets assigned to them
    Optional query params for filtering by status, urgency, department, and sorting by response time/age.
    """
    query = db.query(Ticket)

    # Role-based filtering (enforced on backend)
    if current_user.role == "client":
        query = query.filter(Ticket.client_id == current_user.id)
    elif current_user.role == "agent":
        query = query.filter(Ticket.assigned_agent_id == current_user.id)

    # Optional filters
    if status_filter:
        query = query.filter(Ticket.status == status_filter)
    if urgency:
        query = query.filter(Ticket.urgency == urgency)
    if department:
        query = query.filter(Ticket.department == department)

    # Sorting by creation/response time
    if sort_by == "oldest":
        query = query.order_by(Ticket.created_at.asc())
    else:
        query = query.order_by(Ticket.created_at.desc())

    tickets = query.all()

    return [_ticket_to_response(t) for t in tickets]


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single ticket's details. Access enforced by role."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Authorization: clients can only view their own tickets
    if current_user.role == "client" and ticket.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Agents can only view tickets assigned to them
    if current_user.role == "agent" and ticket.assigned_agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return _ticket_to_response(ticket)


@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    update: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update ticket fields (agent only)."""
    if current_user.role != "agent":
        raise HTTPException(status_code=403, detail="Only agents can update tickets")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.assigned_agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not assigned to you")

    # Apply updates
    if update.status is not None:
        ticket.status = update.status
        if update.status == "Resolved":
            ticket.resolved_at = datetime.now(timezone.utc)
    if update.urgency is not None:
        ticket.urgency = update.urgency
    if update.department is not None:
        ticket.department = update.department

    db.commit()
    db.refresh(ticket)

    return _ticket_to_response(ticket)


@router.patch("/{ticket_id}/status", response_model=TicketResponse)
def update_ticket_status(
    ticket_id: int,
    status_update: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Simple status-only update endpoint (agent only)."""
    if current_user.role != "agent":
        raise HTTPException(status_code=403, detail="Only agents can update ticket status")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.assigned_agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not assigned to you")

    # Validate status transition
    valid_statuses = ["New", "Open", "In Progress", "Resolved"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}",
        )

    ticket.status = status_update.status
    if status_update.status == "Resolved":
        ticket.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(ticket)

    return _ticket_to_response(ticket)


# ======================================================================
#  Ticket Responses / Replies
# ======================================================================

def _response_to_out(resp: ResponseModel) -> ResponseOut:
    """Convert a Response ORM object to a ResponseOut schema."""
    return ResponseOut(
        id=resp.id,
        ticket_id=resp.ticket_id,
        author_id=resp.author_id,
        author_name=resp.author.name if resp.author else "Unknown",
        author_role=resp.author.role if resp.author else "unknown",
        message=resp.message,
        created_at=resp.created_at,
    )


@router.get("/{ticket_id}/responses", response_model=List[ResponseOut])
def list_responses(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all responses/replies for a ticket, ordered by creation time."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Authorization: clients only see their own ticket threads
    if current_user.role == "client" and ticket.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == "agent" and ticket.assigned_agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    responses = (
        db.query(ResponseModel)
        .filter(ResponseModel.ticket_id == ticket_id)
        .order_by(ResponseModel.created_at.asc())
        .all()
    )

    return [_response_to_out(r) for r in responses]


@router.post("/{ticket_id}/responses", response_model=ResponseOut, status_code=status.HTTP_201_CREATED)
def create_response(
    ticket_id: int,
    body: ResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Post a reply/response to a ticket. Both agents and clients can respond."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Authorization
    if current_user.role == "client" and ticket.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == "agent" and ticket.assigned_agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not assigned to you")

    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Response message cannot be empty")

    # Auto-open the ticket when the agent sends the first reply
    if current_user.role == "agent" and ticket.status == "New":
        ticket.status = "Open"

    resp = ResponseModel(
        ticket_id=ticket_id,
        author_id=current_user.id,
        message=body.message.strip(),
    )

    db.add(resp)
    db.commit()
    db.refresh(resp)

    return _response_to_out(resp)
