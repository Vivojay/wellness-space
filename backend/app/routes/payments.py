import json
import os
from datetime import datetime, timezone

import requests
from fastapi import APIRouter, HTTPException, Request
from standardwebhooks import Webhook

from app.core.firebase import db
from app.schemas.payment import DodoCheckoutCreate


router = APIRouter(prefix="/payments", tags=["Payments"])


def _get_dodo_api_key() -> str:
    api_key = os.getenv("DODO_API_KEY") or os.getenv("DODO_PAYMENTS_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Dodo Payments API key not configured")
    return api_key


def _get_dodo_base_url() -> str:
    base_url = os.getenv("DODO_API_BASE")
    if base_url:
        return base_url.rstrip("/")
    env = os.getenv("DODO_ENVIRONMENT", "test_mode")
    return "https://live.dodopayments.com" if env == "live_mode" else "https://test.dodopayments.com"


@router.post("/dodo/checkout")
def create_checkout(payload: DodoCheckoutCreate):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    if payload.currency != "INR":
        raise HTTPException(status_code=400, detail="Only INR is supported")

    product_id = os.getenv("DODO_PRODUCT_ID")
    if not product_id:
        raise HTTPException(status_code=500, detail="Dodo product ID not configured")

    api_key = _get_dodo_api_key()
    base_url = _get_dodo_base_url()

    return_url = os.getenv("DODO_RETURN_URL")

    body = {
        "product_cart": [
            {
                "product_id": product_id,
                "quantity": 1,
                "amount": payload.amount,
            }
        ],
        "customer": {
            "email": payload.email,
            "name": payload.name,
            "phone_number": payload.phone,
        },
        "billing_currency": payload.currency,
        "feature_flags": {
            "allow_currency_selection": False,
        },
    }
    if return_url:
        body["return_url"] = return_url

    response = requests.post(
        f"{base_url}/checkouts",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        data=json.dumps(body),
        timeout=20,
    )

    if not response.ok:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    session = response.json()
    session_id = session.get("session_id") or session.get("id")
    checkout_url = session.get("checkout_url") or session.get("url")

    doc = payload.model_dump()
    doc.update({
        "session_id": session_id,
        "status": "created",
        "provider": "dodo",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    if session_id:
        db.collection("donations").document(session_id).set(doc)
    db.collection("donation_events").add({
        "event": "checkout_created",
        "provider": "dodo",
        "session_id": session_id,
        "amount": payload.amount,
        "currency": payload.currency,
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "session_id": session_id,
        "checkout_url": checkout_url,
    }


@router.get("/dodo/session/{session_id}")
def get_session_status(session_id: str):
    api_key = _get_dodo_api_key()
    base_url = _get_dodo_base_url()

    session_res = requests.get(
        f"{base_url}/checkouts/{session_id}",
        headers={
            "Authorization": f"Bearer {api_key}",
        },
        timeout=20,
    )

    if not session_res.ok:
        raise HTTPException(status_code=session_res.status_code, detail=session_res.text)

    session = session_res.json()
    payment_id = session.get("payment_id")
    payment_status = session.get("payment_status")

    payment = None
    if payment_id:
        payment_res = requests.get(
            f"{base_url}/payments/{payment_id}",
            headers={
                "Authorization": f"Bearer {api_key}",
            },
            timeout=20,
        )
        if payment_res.ok:
            payment = payment_res.json()

    if payment_status == "succeeded":
        ref = db.collection("donations").document(session_id)
        ref.set({
            "status": "paid",
            "provider": "dodo",
            "payment_id": payment_id,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }, merge=True)
        db.collection("donation_events").add({
            "event": "payment_succeeded",
            "provider": "dodo",
            "session_id": session_id,
            "payment_id": payment_id,
            "payment_status": payment_status,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    return {
        "session_id": session_id,
        "payment_id": payment_id,
        "payment_status": payment_status,
        "customer_name": session.get("customer_name"),
        "customer_email": session.get("customer_email"),
        "invoice_url": payment.get("invoice_url") if payment else None,
        "amount": payment.get("total_amount") if payment else None,
        "currency": payment.get("currency") if payment else None,
    }


@router.post("/dodo/webhook")
async def dodo_webhook(request: Request):
    secret = os.getenv("DODO_WEBHOOK_SECRET")
    if not secret:
        raise HTTPException(status_code=500, detail="Dodo webhook secret not configured")

    webhook_id = request.headers.get("webhook-id", "")
    webhook_signature = request.headers.get("webhook-signature", "")
    webhook_timestamp = request.headers.get("webhook-timestamp", "")

    raw_body = await request.body()
    webhook = Webhook(secret)

    try:
        webhook.verify(
            raw_body.decode("utf-8"),
            {
                "webhook-id": webhook_id,
                "webhook-signature": webhook_signature,
                "webhook-timestamp": webhook_timestamp,
            },
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid webhook signature") from exc

    payload = json.loads(raw_body.decode("utf-8"))
    db.collection("donation_events").add({
        "event": "dodo_webhook",
        "provider": "dodo",
        "payload": payload,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"status": "ok"}
