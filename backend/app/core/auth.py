import os

from fastapi import Header, HTTPException
from firebase_admin import auth


def get_admin_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        decoded = auth.verify_id_token(token, clock_skew_seconds=60)
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")

    email = (decoded.get("email") or "").lower()
    allowed = [e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "").split(",") if e.strip()]
    if not allowed:
        raise HTTPException(status_code=403, detail="Admin emails not configured")
    if email not in allowed:
        raise HTTPException(status_code=403, detail="Forbidden")

    return decoded
