"""
User model — stores clients and support agents.
The 'role' field determines access: 'client' or 'agent'.
Agents also have a 'department' field for ticket routing.
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="client")  # "client" or "agent"
    department = Column(String, nullable=True)  # Only for agents: "Technical Support", "Billing", etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
