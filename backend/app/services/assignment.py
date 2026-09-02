"""
Assignment service — automatically assigns tickets to the best available agent.

Strategy: For the determined department, find the agent with the fewest
active (non-resolved) tickets. This provides simple load balancing.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.ticket import Ticket


def assign_agent(db: Session, department: str) -> int | None:
    """
    Find the best agent for a department based on current workload.

    Args:
        db: Database session
        department: The department to find an agent for

    Returns:
        Agent user ID, or None if no agents exist for the department
    """
    # Find all agents in the target department
    agents = db.query(User).filter(
        User.role == "agent",
        User.department == department,
    ).all()

    # Fallback: if no agent in that department, try "General Support" agents
    if not agents:
        agents = db.query(User).filter(
            User.role == "agent",
            User.department == "General Support",
        ).all()

    # Final fallback: grab any agent
    if not agents:
        agents = db.query(User).filter(User.role == "agent").all()

    if not agents:
        return None

    # Find the agent with the fewest active (non-resolved) tickets
    best_agent = None
    lowest_count = float("inf")

    for agent in agents:
        active_count = db.query(Ticket).filter(
            Ticket.assigned_agent_id == agent.id,
            Ticket.status != "Resolved",
        ).count()

        if active_count < lowest_count:
            lowest_count = active_count
            best_agent = agent

    return best_agent.id if best_agent else None
