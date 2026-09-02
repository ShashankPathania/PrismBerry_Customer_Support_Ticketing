"""
Triage service — automatic ticket classification using keyword matching.

Scans ticket subject and description to determine:
  1. Urgency level (Critical, High, Medium, Low)
  2. Department (Technical Support, Billing, Account Support, General Support)
  3. Tags (matched keywords for transparency)

This is a simple rule-based system — no ML or external APIs required.
"""


# --- Urgency keyword definitions (checked in priority order) ---

URGENCY_RULES = {
    "Critical": [
        "system down", "outage", "hacked", "security breach",
        "cannot access", "payment failed repeatedly", "data loss",
        "service unavailable", "production down", "critical error",
    ],
    "High": [
        "urgent", "immediately", "blocked", "unable to work",
        "major issue", "not working", "broken", "emergency",
        "asap", "time sensitive",
    ],
    "Medium": [
        "problem", "issue", "error", "not functioning",
        "difficulty", "trouble", "malfunction", "incorrect",
        "wrong", "failing",
    ],
    "Low": [
        "question", "feedback", "feature request", "suggestion",
        "minor", "cosmetic", "improvement", "information",
        "how to", "inquiry",
    ],
}


# --- Department keyword definitions ---

DEPARTMENT_RULES = {
    "Technical Support": [
        "error", "bug", "crash", "website", "login issue",
        "api", "technical", "system", "server", "code",
        "software", "hardware", "integration", "database",
        "performance", "slow", "loading",
    ],
    "Billing": [
        "payment", "invoice", "refund", "charged", "subscription",
        "billing", "price", "cost", "plan", "upgrade",
        "downgrade", "receipt", "transaction", "credit",
    ],
    "Account Support": [
        "password", "account", "profile", "login", "access",
        "reset", "locked", "verify", "verification",
        "two-factor", "2fa", "email change", "username",
    ],
}


def classify_ticket(subject: str, description: str) -> dict:
    """
    Analyze ticket text and return classification result.

    Returns:
        dict with keys: urgency, department, tags
    """
    # Combine and lowercase for matching
    text = f"{subject} {description}".lower()

    urgency = _determine_urgency(text)
    department = _determine_department(text)
    tags = _extract_tags(text)

    return {
        "urgency": urgency,
        "department": department,
        "tags": tags,
    }


def _determine_urgency(text: str) -> str:
    """Check urgency keywords in priority order (Critical first)."""
    for level in ["Critical", "High", "Medium", "Low"]:
        keywords = URGENCY_RULES[level]
        for keyword in keywords:
            if keyword in text:
                return level
    return "Medium"  # Default if no keywords match


def _determine_department(text: str) -> str:
    """Match department by keyword frequency — most matches wins."""
    scores = {}
    for dept, keywords in DEPARTMENT_RULES.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[dept] = score

    if scores:
        # Return department with highest keyword match count
        return max(scores, key=scores.get)

    return "General Support"  # Default fallback


def _extract_tags(text: str) -> str:
    """Collect all matched keywords as comma-separated tags."""
    matched = []
    all_rules = {**URGENCY_RULES, **DEPARTMENT_RULES}
    for category, keywords in all_rules.items():
        for keyword in keywords:
            if keyword in text and keyword not in matched:
                matched.append(keyword)

    return ", ".join(matched[:8]) if matched else "general"  # Cap at 8 tags
