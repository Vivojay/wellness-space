from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from google.cloud.firestore_v1 import Query

from app.core.firebase import db
from app.core.auth import get_admin_user
from app.schemas.feed import FeedCreate


router = APIRouter(prefix="/feed", tags=["Feed"])


def _to_datetime(value: str | None) -> datetime | None:
    if value is None:
        return None
    text = value.strip()
    if not text:
        return None
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid since cursor") from exc

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _safe_count(query, fallback_limit: int = 5000) -> int:
    try:
        aggregate = query.count().get()
        if aggregate:
            value = getattr(aggregate[0], "value", None)
            if value is not None:
                return int(value)
    except Exception:
        pass
    return sum(1 for _ in query.limit(fallback_limit).stream())


@router.post("")
def create_feed(payload: FeedCreate, _: dict = Depends(get_admin_user)):
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()

    ref = db.collection("feed").document()
    ref.set(doc)
    return {"status": "ok", "id": ref.id}


@router.get("")
def list_feed(limit: int = 10, page: int = 1):
    query = (
        db.collection("feed")
        .where("published", "==", True)
        .order_by("created_at", direction=Query.DESCENDING)
    )
    safe_limit = min(max(limit, 1), 50)
    safe_page = max(page, 1)
    offset = (safe_page - 1) * safe_limit
    docs = list(query.offset(offset).limit(safe_limit).stream())
    results = []
    for d in docs:
        data = d.to_dict() or {}
        data["id"] = d.id
        results.append(data)
    total = _safe_count(query, fallback_limit=1000)
    total_pages = max(1, (total + safe_limit - 1) // safe_limit)
    return {"items": results, "page": safe_page, "total": total, "total_pages": total_pages}


@router.get("/meta")
def feed_meta(since: str | None = None):
    cursor_dt = _to_datetime(since)
    base_query = db.collection("feed").where("published", "==", True)

    latest_cursor = None
    latest_docs = list(base_query.order_by("created_at", direction=Query.DESCENDING).limit(1).stream())
    if latest_docs:
        latest_data = latest_docs[0].to_dict() or {}
        latest_cursor = latest_data.get("created_at")

    total_published = _safe_count(base_query, fallback_limit=5000)

    if cursor_dt is None:
        unread_count = int(total_published)
    else:
        cursor_iso = cursor_dt.isoformat()
        unread_query = (
            base_query
            .where("created_at", ">", cursor_iso)
            .order_by("created_at", direction=Query.DESCENDING)
        )
        unread_count = _safe_count(unread_query, fallback_limit=5000)

    return {
        "latest_cursor": latest_cursor,
        "unread_count": unread_count,
        "total_published": int(total_published),
    }


@router.get("/admin/list")
def list_feed_admin(limit: int = 50, page: int = 1, _: dict = Depends(get_admin_user)):
    query = (
        db.collection("feed")
        .order_by("created_at", direction=Query.DESCENDING)
    )
    safe_limit = min(max(limit, 1), 100)
    safe_page = max(page, 1)
    offset = (safe_page - 1) * safe_limit
    docs = list(query.offset(offset).limit(safe_limit).stream())
    results = []
    for d in docs:
        data = d.to_dict() or {}
        data["id"] = d.id
        results.append(data)
    total = _safe_count(query, fallback_limit=1000)
    total_pages = max(1, (total + safe_limit - 1) // safe_limit)
    return {"items": results, "page": safe_page, "total": total, "total_pages": total_pages}


@router.put("/{feed_id}")
def update_feed(feed_id: str, payload: FeedCreate, _: dict = Depends(get_admin_user)):
    ref = db.collection("feed").document(feed_id)
    existing_snapshot = ref.get()
    existing = existing_snapshot.to_dict() if existing_snapshot else None
    if not existing:
        raise HTTPException(status_code=404, detail="Not found")

    doc = payload.model_dump()
    doc["created_at"] = existing.get("created_at")
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    ref.set(doc)
    return {"status": "ok"}


@router.delete("/{feed_id}")
def delete_feed(feed_id: str, _: dict = Depends(get_admin_user)):
    ref = db.collection("feed").document(feed_id)
    snapshot = ref.get()
    existing = snapshot.to_dict() if snapshot else None
    if not existing:
        raise HTTPException(status_code=404, detail="Not found")
    ref.delete()
    return {"status": "ok"}
