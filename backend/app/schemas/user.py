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
    role: str = "client"  # Default to client; agents are seeded


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

    class Config:
        from_attributes = True  # Allows creating from SQLAlchemy model


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
