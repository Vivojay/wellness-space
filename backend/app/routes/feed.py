from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from google.cloud.firestore_v1 import Query

from app.core.firebase import db
from app.core.auth import get_admin_user
from app.schemas.feed import FeedCreate


router = APIRouter(prefix="/feed", tags=["Feed"])


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
        data = d.to_dict()
        data["id"] = d.id
        results.append(data)
    try:
        total = query.count().get()[0].value
    except Exception:
        total_query = query.limit(1000).stream()
        total = sum(1 for _ in total_query)
    total_pages = max(1, (total + safe_limit - 1) // safe_limit)
    return {"items": results, "page": safe_page, "total": total, "total_pages": total_pages}


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
        data = d.to_dict()
        data["id"] = d.id
        results.append(data)
    try:
        total = query.count().get()[0].value
    except Exception:
        total = query.limit(1000).stream()
        total = sum(1 for _ in total)
    total_pages = max(1, (total + safe_limit - 1) // safe_limit)
    return {"items": results, "page": safe_page, "total": total, "total_pages": total_pages}


@router.put("/{feed_id}")
def update_feed(feed_id: str, payload: FeedCreate, _: dict = Depends(get_admin_user)):
    ref = db.collection("feed").document(feed_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Not found")

    doc = payload.model_dump()
    existing = ref.get().to_dict()
    doc["created_at"] = existing.get("created_at")
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    ref.set(doc)
    return {"status": "ok"}


@router.delete("/{feed_id}")
def delete_feed(feed_id: str, _: dict = Depends(get_admin_user)):
    ref = db.collection("feed").document(feed_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Not found")
    ref.delete()
    return {"status": "ok"}
