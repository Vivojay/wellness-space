from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from firebase_admin import firestore

from app.core.firebase import db
from app.schemas.testimonial import TestimonialCreate


router = APIRouter(prefix="/testimonials", tags=["Testimonials"])


@router.post("")
def create_testimonial(payload: TestimonialCreate):
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()

    ref = db.collection("testimonials").document()
    ref.set(doc)
    return {"status": "ok", "id": ref.id}


@router.get("")
def list_testimonials(limit: int = 10):
    docs = (
        db.collection("testimonials")
        .where("published", "==", True)
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(limit)
        .stream()
    )
    results = []
    for d in docs:
        data = d.to_dict()
        data["id"] = d.id
        results.append(data)
    return results


@router.put("/{testimonial_id}")
def update_testimonial(testimonial_id: str, payload: TestimonialCreate):
    ref = db.collection("testimonials").document(testimonial_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Not found")

    doc = payload.model_dump()
    existing = ref.get().to_dict()
    doc["created_at"] = existing.get("created_at")
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    ref.set(doc)
    return {"status": "ok"}


@router.delete("/{testimonial_id}")
def delete_testimonial(testimonial_id: str):
    ref = db.collection("testimonials").document(testimonial_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Not found")
    ref.delete()
    return {"status": "ok"}
