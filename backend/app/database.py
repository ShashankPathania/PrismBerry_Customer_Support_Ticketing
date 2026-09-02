"""
Database configuration — SQLAlchemy + SQLite.
Creates engine, session factory, and Base class for models.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file lives next to the app directory
SQLALCHEMY_DATABASE_URL = "sqlite:///./support_tickets.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite with FastAPI
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
