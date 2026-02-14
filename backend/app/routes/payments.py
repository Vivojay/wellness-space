import os
from datetime import datetime, timezone

import razorpay
from fastapi import APIRouter, HTTPException

from app.core.firebase import db
from app.schemas.payment import DonationOrderCreate, DonationVerify


router = APIRouter(prefix="/payments", tags=["Payments"])


def _get_client() -> razorpay.Client:
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        raise HTTPException(status_code=500, detail="Razorpay credentials not configured")
    return razorpay.Client(auth=(key_id, key_secret))


@router.post("/razorpay/order")
def create_order(payload: DonationOrderCreate):
    client = _get_client()
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    order = client.order.create({
        "amount": payload.amount,
        "currency": payload.currency,
        "payment_capture": 1,
    })

    doc = payload.model_dump()
    doc.update({
        "order_id": order.get("id"),
        "status": "created",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    db.collection("donations").document(order.get("id")).set(doc)
    db.collection("donation_events").add({
        "event": "order_created",
        "order_id": order.get("id"),
        "amount": order.get("amount"),
        "currency": order.get("currency"),
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "order_id": order.get("id"),
        "amount": order.get("amount"),
        "currency": order.get("currency"),
    }


@router.post("/razorpay/verify")
def verify_payment(payload: DonationVerify):
    client = _get_client()

    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": payload.order_id,
            "razorpay_payment_id": payload.payment_id,
            "razorpay_signature": payload.signature,
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    ref = db.collection("donations").document(payload.order_id)
    ref.set({
        "status": "paid",
        "payment_id": payload.payment_id,
        "signature": payload.signature,
        "amount": payload.amount,
        "currency": payload.currency,
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }, merge=True)
    db.collection("donation_events").add({
        "event": "payment_verified",
        "order_id": payload.order_id,
        "payment_id": payload.payment_id,
        "amount": payload.amount,
        "currency": payload.currency,
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"status": "ok"}
