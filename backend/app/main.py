"""
FastAPI application entry point.

Sets up:
  - CORS for frontend communication
  - Database table creation
  - Router registration
  - Seed data on startup
  - Static file serving for uploads
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.ticket import Ticket
from app.routers import auth, tickets, admin, chatbot
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed data on startup."""
    Base.metadata.create_all(bind=engine)

    # Seed demo data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield  # App runs here


app = FastAPI(
    title="PrismBerry Support Desk",
    description="Customer Support Ticketing System with automatic triage and routing",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register routers
app.include_router(auth.router)
app.include_router(tickets.router)
app.include_router(admin.router)
app.include_router(chatbot.router)


@app.get("/")
def root():
    return {"message": "PrismBerry Support Desk API", "docs": "/docs"}
