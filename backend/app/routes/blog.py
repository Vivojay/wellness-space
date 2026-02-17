from firebase_admin import firestore
from google.cloud.firestore_v1 import Query
from fastapi import APIRouter, Depends, HTTPException
from app.core.firebase import db
from app.core.auth import get_admin_user
from app.schemas.blog import BlogCreate
from datetime import datetime, timezone

router = APIRouter(prefix="/blog", tags=["Blog"])

@router.post("")
def create_blog(blog: BlogCreate, _: dict = Depends(get_admin_user)):
    doc = blog.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()

    db.collection("blogs").document(blog.slug).set(doc)
    return {"status": "ok"}

@router.get("/admin/list")
def list_blogs_admin(limit: int = 20, page: int = 1, _: dict = Depends(get_admin_user)):
    query = (
        db.collection("blogs")
        .order_by("created_at", direction=Query.DESCENDING)
    )
    safe_limit = min(max(limit, 1), 50)
    safe_page = max(page, 1)
    offset = (safe_page - 1) * safe_limit
    docs = list(query.offset(offset).limit(safe_limit).stream())
    items = [d.to_dict() for d in docs]
    try:
        total = query.count().get()[0].value
    except Exception:
        total = query.limit(1000).stream()
        total = sum(1 for _ in total)
    total_pages = max(1, (total + safe_limit - 1) // safe_limit)
    return {"items": items, "page": safe_page, "total": total, "total_pages": total_pages}

@router.get("/admin/{slug}")
def get_blog_admin(slug: str, _: dict = Depends(get_admin_user)):
    doc = db.collection("blogs").document(slug).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Not found")
    return doc.to_dict()

@router.put("/{slug}")
def update_blog(slug: str, blog: BlogCreate, _: dict = Depends(get_admin_user)):
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
def delete_blog(slug: str, _: dict = Depends(get_admin_user)):
    ref = db.collection("blogs").document(slug)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Not found")
    ref.delete()
    return {"status": "ok"}
@router.get("")
def list_blogs(limit: int = 10, page: int = 1):
    query = (
        db.collection("blogs")
        .where("published", "==", True)
        .order_by("created_at", direction=Query.DESCENDING)
    )
    safe_limit = min(max(limit, 1), 50)
    safe_page = max(page, 1)
    offset = (safe_page - 1) * safe_limit
    docs = list(query.offset(offset).limit(safe_limit).stream())
    items = [d.to_dict() for d in docs]
    try:
        total = query.count().get()[0].value
    except Exception:
        total = query.limit(1000).stream()
        total = sum(1 for _ in total)
    total_pages = max(1, (total + safe_limit - 1) // safe_limit)
    return {"items": items, "page": safe_page, "total": total, "total_pages": total_pages}

@router.get("/{slug}")
def get_blog(slug: str):
    doc = db.collection("blogs").document(slug).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Not found")
    data = doc.to_dict()
    if not data.get("published", False):
        raise HTTPException(status_code=404, detail="Not found")
    return data
