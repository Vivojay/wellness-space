from fastapi import APIRouter
from datetime import datetime, timezone
from app.core.firebase import db
from app.schemas.booking import BookingCreate

router = APIRouter(prefix="/booking", tags=["Booking"])

@router.post("")
def create_booking(payload: BookingCreate):
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()

    # auto-id doc so you can have multiple bookings per email
    ref = db.collection("bookings").document()
    ref.set(doc)

    return {"status": "ok", "id": ref.id}
