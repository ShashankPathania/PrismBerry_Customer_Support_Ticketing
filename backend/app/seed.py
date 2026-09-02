"""
Seed data — populates the database with demo users and sample tickets.
Run automatically on app startup if the database is empty.
"""
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.ticket import Ticket
from app.utils.auth import hash_password
from app.services.triage import classify_ticket
from app.services.assignment import assign_agent


def seed_database(db: Session):
    """Create demo users and sample tickets if database is empty."""

    # Skip if users already exist
    if db.query(User).count() > 0:
        return

    print("[SEED] Seeding database with demo data...")

    # --- Create users ---
    hashed = hash_password("password123")

    client = User(
        name="Demo Client",
        email="client@example.com",
        password_hash=hashed,
        role="client",
    )

    tech_agent = User(
        name="Alex Tech",
        email="tech@example.com",
        password_hash=hashed,
        role="agent",
        department="Technical Support",
    )

    billing_agent = User(
        name="Sarah Billing",
        email="billing@example.com",
        password_hash=hashed,
        role="agent",
        department="Billing",
    )

    account_agent = User(
        name="Mike Account",
        email="account@example.com",
        password_hash=hashed,
        role="agent",
        department="Account Support",
    )

    general_agent = User(
        name="Jordan General",
        email="general@example.com",
        password_hash=hashed,
        role="agent",
        department="General Support",
    )

    db.add_all([client, tech_agent, billing_agent, account_agent, general_agent])
    db.commit()
    db.refresh(client)

    # --- Create sample tickets ---
    sample_tickets = [
        {
            "subject": "Website keeps crashing on checkout",
            "description": "Every time I try to complete a purchase, the website crashes and shows a 500 error. This is a major issue blocking my orders.",
        },
        {
            "subject": "Refund not received for cancelled subscription",
            "description": "I cancelled my subscription two weeks ago and was told I'd receive a refund within 5-7 business days. The payment has not been returned to my account.",
        },
        {
            "subject": "Cannot reset my password",
            "description": "I've tried resetting my password multiple times but the reset email never arrives. I've checked spam. I cannot access my account.",
        },
        {
            "subject": "Feature request: Dark mode",
            "description": "It would be great to have a dark mode option in the dashboard. This is just a minor suggestion for improvement.",
        },
        {
            "subject": "System down - cannot access anything",
            "description": "The entire system appears to be down. None of our team members can access the platform. This is critical as we have deadlines today.",
        },
    ]

    for i, ticket_data in enumerate(sample_tickets):
        classification = classify_ticket(ticket_data["subject"], ticket_data["description"])
        agent_id = assign_agent(db, classification["department"])

        ticket = Ticket(
            ticket_number=f"TKT-{i + 1:04d}",
            client_id=client.id,
            assigned_agent_id=agent_id,
            subject=ticket_data["subject"],
            description=ticket_data["description"],
            status="New" if i < 3 else ("In Progress" if i == 3 else "Open"),
            urgency=classification["urgency"],
            department=classification["department"],
            tags=classification["tags"],
        )
        db.add(ticket)

    db.commit()
    print("[SEED] Seed data created successfully!")
    print("   Demo credentials:")
    print("   Client:  client@example.com / password123")
    print("   Agents:  tech@example.com, billing@example.com, account@example.com / password123")
