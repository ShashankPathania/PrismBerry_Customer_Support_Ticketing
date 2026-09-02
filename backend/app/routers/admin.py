"""
Admin router — agent management and system statistics for administrators.
Protected by require_role("admin").
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.models.user import User
from app.models.ticket import Ticket
from app.schemas.user import UserResponse, AgentCreate
from app.utils.auth import hash_password
from app.dependencies import get_db, require_role

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])


@router.get("/agents", response_model=List[UserResponse])
def list_agents(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    """List all support agents along with their active ticket workload."""
    agents = db.query(User).filter(User.role == "agent").all()
    results = []

    for agent in agents:
        active_count = db.query(Ticket).filter(
            Ticket.assigned_agent_id == agent.id,
            Ticket.status != "Resolved",
        ).count()

        resp = UserResponse.model_validate(agent)
        resp.active_tickets_count = active_count
        results.append(resp)

    return results


@router.post("/agents", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_agent(
    agent_data: AgentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    """Create a new support agent account with assigned department."""
    existing = db.query(User).filter(User.email == agent_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    new_agent = User(
        name=agent_data.name,
        email=agent_data.email,
        password_hash=hash_password(agent_data.password),
        role="agent",
        department=agent_data.department,
    )

    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)

    resp = UserResponse.model_validate(new_agent)
    resp.active_tickets_count = 0
    return resp


@router.delete("/agents/{agent_id}", status_code=status.HTTP_200_OK)
def delete_agent(
    agent_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    """
    Remove a support agent account.
    Reassigns any unresolved tickets assigned to this agent to General Support agent(s)
    to ensure tickets are never orphaned.
    """
    agent = db.query(User).filter(User.id == agent_id, User.role == "agent").first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Support agent not found",
        )

    # Reassign unresolved tickets to a fallback agent (General Support or another agent)
    fallback_agent = db.query(User).filter(
        User.role == "agent",
        User.id != agent_id,
    ).first()

    fallback_id = fallback_agent.id if fallback_agent else None

    unresolved_tickets = db.query(Ticket).filter(
        Ticket.assigned_agent_id == agent_id,
        Ticket.status != "Resolved",
    ).all()

    for ticket in unresolved_tickets:
        ticket.assigned_agent_id = fallback_id

    db.delete(agent)
    db.commit()

    return {
        "message": f"Agent {agent.name} deleted successfully",
        "reassigned_tickets": len(unresolved_tickets),
    }


@router.get("/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    """Retrieve system overview metrics."""
    total_users = db.query(User).count()
    total_clients = db.query(User).filter(User.role == "client").count()
    total_agents = db.query(User).filter(User.role == "agent").count()
    total_tickets = db.query(Ticket).count()

    tickets_by_status = {
        "New": db.query(Ticket).filter(Ticket.status == "New").count(),
        "Open": db.query(Ticket).filter(Ticket.status == "Open").count(),
        "In Progress": db.query(Ticket).filter(Ticket.status == "In Progress").count(),
        "Resolved": db.query(Ticket).filter(Ticket.status == "Resolved").count(),
    }

    tickets_by_urgency = {
        "Critical": db.query(Ticket).filter(Ticket.urgency == "Critical").count(),
        "High": db.query(Ticket).filter(Ticket.urgency == "High").count(),
        "Medium": db.query(Ticket).filter(Ticket.urgency == "Medium").count(),
        "Low": db.query(Ticket).filter(Ticket.urgency == "Low").count(),
    }

    return {
        "total_users": total_users,
        "total_clients": total_clients,
        "total_agents": total_agents,
        "total_tickets": total_tickets,
        "tickets_by_status": tickets_by_status,
        "tickets_by_urgency": tickets_by_urgency,
    }
