"""
Pydantic schemas for User — request/response validation.
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# --- Request schemas ---

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "client"


class AgentCreate(BaseModel):
    name: str
    email: str
    password: str
    department: str = "General Support"


class UserLogin(BaseModel):
    email: str
    password: str


# --- Response schemas ---

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: Optional[str] = None
    created_at: datetime
    active_tickets_count: Optional[int] = 0

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
