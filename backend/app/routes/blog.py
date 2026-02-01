from fastapi import APIRouter
from app.core.firebase import db
from app.schemas.blog import BlogCreate
from datetime import datetime

router = APIRouter(prefix="/blog", tags=["Blog"])

@router.post("")
def create_blog(blog: BlogCreate):
    doc = blog.model_dump()
    doc["created_at"] = datetime.now()

    db.collection("blogs").document(blog.slug).set(doc)
    return {"status": "ok"}

@router.get("")
def list_blogs():
    docs = (
        db.collection("blogs")
        .where("published", "==", True)
        .order_by("created_at", direction="DESCENDING")
        .stream()
    )
    return [d.to_dict() for d in docs]

@router.get("/{slug}")
def get_blog(slug: str):
    doc = db.collection("blogs").document(slug).get()
    if not doc.exists:
        return {"detail": "Not found"}
    return doc.to_dict()
