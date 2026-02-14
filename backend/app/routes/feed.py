from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from firebase_admin import firestore

from app.core.firebase import db
from app.schemas.feed import FeedCreate


router = APIRouter(prefix="/feed", tags=["Feed"])


@router.post("")
def create_feed(payload: FeedCreate):
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()

    ref = db.collection("feed").document()
    ref.set(doc)
    return {"status": "ok", "id": ref.id}


@router.get("")
def list_feed(limit: int = 10):
    fetch_limit = min(max(limit * 3, limit), 50)
    docs = (
        db.collection("feed")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(fetch_limit)
        .stream()
    )
    results = []
    for d in docs:
        data = d.to_dict()
        if not data.get("published", False):
            continue
        data["id"] = d.id
        results.append(data)
        if len(results) >= limit:
            break
    return results


@router.put("/{feed_id}")
def update_feed(feed_id: str, payload: FeedCreate):
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
def delete_feed(feed_id: str):
    ref = db.collection("feed").document(feed_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Not found")
    ref.delete()
    return {"status": "ok"}
