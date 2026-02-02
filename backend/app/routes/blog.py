from firebase_admin import firestore
from fastapi import APIRouter, HTTPException
from app.core.firebase import db
from app.schemas.blog import BlogCreate
from datetime import datetime, timezone

router = APIRouter(prefix="/blog", tags=["Blog"])

@router.post("")
def create_blog(blog: BlogCreate):
    doc = blog.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()

    db.collection("blogs").document(blog.slug).set(doc)
    return {"status": "ok"}

@router.get("")
def list_blogs():
    docs = (
        db.collection("blogs")
        .where("published", "==", True)
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .stream()
    )
    return [d.to_dict() for d in docs]

@router.get("/{slug}")
def get_blog(slug: str):
    doc = db.collection("blogs").document(slug).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Not found")
    return doc.to_dict()

@router.put("/{slug}")
def update_blog(slug: str, blog: BlogCreate):
    ref = db.collection("blogs").document(slug)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Not found")

    doc = blog.model_dump()
    # keep existing created_at if you want; simplest: overwrite (or read + preserve)
    existing = ref.get().to_dict()
    doc["created_at"] = existing.get("created_at")
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    ref.set(doc)
    return {"status": "ok"}

@router.delete("/{slug}")
def delete_blog(slug: str):
    ref = db.collection("blogs").document(slug)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Not found")
    ref.delete()
    return {"status": "ok"}