"""
Triage service — automatic ticket classification using Groq LLM (llama-3.1-8b-instant)
with rule-based fallback.

Scans ticket subject and description to determine:
  1. Urgency level (Critical, High, Medium, Low)
  2. Department (Technical Support, Billing, Account Support, General Support)
  3. Tags (extracted keywords for transparency)
  4. Reasoning (LLM explanation of intent and severity)
"""
import os
import json
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = "llama-3.1-8b-instant"

logger = logging.getLogger("uvicorn.error")

# Rule-based fallback keyword rules
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
    Uses Groq LLM (llama-3.1-8b-instant) if GROQ_API_KEY is available,
    otherwise falls back to rule-based classification.

    Returns:
        dict with keys: urgency, department, tags, reasoning
    """
    # Reload key dynamically in case user added it while running
    api_key = os.getenv("GROQ_API_KEY", "").strip()

    if api_key:
        try:
            return _classify_with_groq_llm(subject, description, api_key)
        except Exception as e:
            logger.warning(f"[TRIAGE LLM ERROR] Groq API call failed: {e}. Falling back to rule-based triage.")

    return _classify_rule_based(subject, description)


def _classify_with_groq_llm(subject: str, description: str, api_key: str) -> dict:
    """Classify ticket using Groq LLM API (llama-3.1-8b-instant)."""
    from groq import Groq

    client = Groq(api_key=api_key)

    system_prompt = """You are an expert customer support triage and intent routing AI engine.
Analyze the customer's support ticket subject and description carefully.
Determine the urgency level, target department, extracted tags, and a brief 1-sentence reasoning.

Requirements:
1. "urgency" must be exactly one of: "Critical", "High", "Medium", "Low"
   - Critical: System outages, security breaches, data loss, payment failures blocking core operations.
   - High: Major feature broken, user completely blocked from work, time-sensitive issues.
   - Medium: General functional issues, non-blocking bugs, minor errors.
   - Low: Feature requests, questions, general inquiries, minor feedback.

2. "department" must be exactly one of: "Technical Support", "Billing", "Account Support", "General Support"
   - Technical Support: Crashes, bugs, code errors, API issues, website down, performance problems.
   - Billing: Payments, invoices, refunds, subscription charges, pricing queries.
   - Account Support: Passwords, account access, email changes, profile locks, 2FA.
   - General Support: Feedback, general inquiries, uncategorized questions.

3. "tags": Array of 2-5 lowercase keyword strings.
4. "reasoning": 1 concise sentence explaining your classification logic.

Output ONLY valid JSON matching this schema:
{
  "urgency": "Critical" | "High" | "Medium" | "Low",
  "department": "Technical Support" | "Billing" | "Account Support" | "General Support",
  "tags": ["tag1", "tag2"],
  "reasoning": "Brief explanation"
}"""

    user_prompt = f"Ticket Subject: {subject}\nTicket Description: {description}"

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        response_format={"type": "json_object"},
        temperature=0.1,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )

    content = response.choices[0].message.content
    data = json.loads(content)

    # Validate enums
    valid_urgencies = ["Critical", "High", "Medium", "Low"]
    valid_departments = ["Technical Support", "Billing", "Account Support", "General Support"]

    urgency = data.get("urgency", "Medium")
    if urgency not in valid_urgencies:
        urgency = "Medium"

    department = data.get("department", "General Support")
    if department not in valid_departments:
        department = "General Support"

    raw_tags = data.get("tags", [])
    if isinstance(raw_tags, list):
        tags_str = ", ".join([str(t).lower().strip() for t in raw_tags[:5]])
    else:
        tags_str = str(raw_tags)

    reasoning = data.get("reasoning", "Classified by Groq llama-3.1-8b-instant LLM.")
    tags_with_ai = f"{tags_str} | ai: llama-3.1-8b"

    print(f"[TRIAGE GROQ LLM] Classified '{subject[:30]}...' -> Dept: {department}, Urgency: {urgency}")

    return {
        "urgency": urgency,
        "department": department,
        "tags": tags_with_ai,
        "reasoning": reasoning,
    }


def _classify_rule_based(subject: str, description: str) -> dict:
    """Fallback rule-based classification."""
    text = f"{subject} {description}".lower()

    urgency = "Medium"
    for level in ["Critical", "High", "Medium", "Low"]:
        if any(kw in text for kw in URGENCY_RULES[level]):
            urgency = level
            break

    scores = {}
    for dept, keywords in DEPARTMENT_RULES.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[dept] = score

    department = max(scores, key=scores.get) if scores else "General Support"

    matched = []
    all_rules = {**URGENCY_RULES, **DEPARTMENT_RULES}
    for category, keywords in all_rules.items():
        for keyword in keywords:
            if keyword in text and keyword not in matched:
                matched.append(keyword)

    tags_str = ", ".join(matched[:6]) if matched else "general"

    return {
        "urgency": urgency,
        "department": department,
        "tags": f"{tags_str} | fallback: rule-engine",
        "reasoning": "Classified using rule-based keyword engine (Groq API key not provided).",
    }
