from __future__ import annotations

import hashlib
import re
import secrets
from datetime import datetime, timedelta, timezone

CATEGORIES = {
    "civic_infra": {"name": "Civic & Infrastructure", "sla": 7, "portal_id": "NJC-CIVIC-01"},
    "health_edu": {"name": "Health & Education", "sla": 5, "portal_id": "NJC-HEALTH-01"},
    "law_order": {"name": "Law & Order", "sla": 3, "portal_id": "NJC-SAFETY-01"},
    "transport": {"name": "Transport & Public Services", "sla": 7, "portal_id": "NJC-TRANSPORT-01"},
    "employment_welfare": {"name": "Employment & Welfare", "sla": 10, "portal_id": "NJC-WELFARE-01"},
}

TRANSITIONS = {
    "submitted": {"acknowledged", "rejected"},
    "acknowledged": {"in_progress", "rejected"},
    "in_progress": {"resolved", "rejected", "in_progress"},
    "resolved": {"reopened"},
    "rejected": {"reopened"},
    "reopened": {"acknowledged", "in_progress"},
}

IMAGE_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def iso_now() -> str:
    return utc_now().isoformat()

def session_expiry(hours: int) -> str:
    return (utc_now() + timedelta(hours=hours)).isoformat()

def sla_expiry(days: int) -> str:
    return (utc_now() + timedelta(days=days)).isoformat()

def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def make_password_hash(password: str, salt: str | None = None) -> tuple[str, str]:
    if len(password) < 12:
        raise ValueError("Department passwords must be at least 12 characters")
    password_salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(password_salt), 120_000)
    return password_salt, digest.hex()

def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    try:
        _, actual_hash = make_password_hash(password, salt)
    except (ValueError, TypeError):
        return False
    return secrets.compare_digest(actual_hash, expected_hash)

def normalize_phone(value: str) -> str:
    phone = re.sub(r"[\s()-]", "", value)
    if not re.fullmatch(r"\+?\d{10,15}", phone):
        raise ValueError("Enter a valid phone number")
    return phone

def valid_email(value: str) -> bool:
    return bool(re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value.strip()))

def image_extension(content_type: str) -> str:
    if content_type not in IMAGE_TYPES:
        raise ValueError("Only JPG, PNG, and WEBP images are allowed")
    return IMAGE_TYPES[content_type]
