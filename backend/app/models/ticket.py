"""
Ticket model — the core entity of the support system.
Tracks subject, description, auto-classified urgency/department,
assigned agent, status lifecycle, and optional file attachment.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, unique=True, index=True, nullable=False)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)

    # Auto-classified fields
    status = Column(String, nullable=False, default="New")        # New, Open, In Progress, Resolved
    urgency = Column(String, nullable=False, default="Medium")    # Low, Medium, High, Critical
    department = Column(String, nullable=False, default="General Support")
    tags = Column(String, nullable=True)  # Comma-separated tags from triage

    # File attachment (optional)
    attachment_path = Column(String, nullable=True)
    attachment_name = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships for easy querying
    client = relationship("User", foreign_keys=[client_id])
    assigned_agent = relationship("User", foreign_keys=[assigned_agent_id])
