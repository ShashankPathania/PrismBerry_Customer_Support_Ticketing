"""
Pydantic schemas for Ticket — request/response validation.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# --- Request schemas ---

class TicketCreate(BaseModel):
    subject: str
    description: str


class TicketUpdate(BaseModel):
    """Agent can update these fields."""
    status: Optional[str] = None
    urgency: Optional[str] = None
    department: Optional[str] = None


class StatusUpdate(BaseModel):
    """Simple status-only update."""
    status: str


# --- Response schemas ---

class TicketResponse(BaseModel):
    id: int
    ticket_number: str
    client_id: int
    assigned_agent_id: Optional[int] = None
    subject: str
    description: str
    status: str
    urgency: str
    department: str
    tags: Optional[str] = None
    attachment_path: Optional[str] = None
    attachment_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    # Populated from relationships
    client_name: Optional[str] = None
    agent_name: Optional[str] = None

    class Config:
        from_attributes = True
