import hashlib
import hmac
import os
from datetime import datetime, timezone

import requests
from fastapi import APIRouter, HTTPException

from app.core.firebase import db
from app.schemas.payment import RazorpayOrderCreate, RazorpayVerifyPayment


router = APIRouter(prefix="/payments", tags=["Payments"])


def _get_razorpay_credentials() -> tuple[str, str]:
    key_id = (os.getenv("RAZORPAY_KEY_ID") or "").strip()
    key_secret = (os.getenv("RAZORPAY_KEY_SECRET") or "").strip()
    if not key_id or not key_secret:
        raise HTTPException(status_code=500, detail="Razorpay API keys not configured")
    return key_id, key_secret


def _get_razorpay_base_url() -> str:
    return (os.getenv("RAZORPAY_API_BASE") or "https://api.razorpay.com/v1").rstrip("/")


def _parse_error(response: requests.Response) -> str:
    try:
        payload = response.json()
        if isinstance(payload, dict):
            err = payload.get("error")
            if isinstance(err, dict):
                desc = err.get("description") or err.get("reason") or err.get("code")
                if desc:
                    return str(desc)
        return str(payload)
    except Exception:
        return response.text


@router.post("/razorpay/order")
def create_razorpay_order(payload: RazorpayOrderCreate):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    currency = (payload.currency or "INR").upper()
    if currency != "INR":
        raise HTTPException(status_code=400, detail="Only INR is supported")

    key_id, key_secret = _get_razorpay_credentials()
    base_url = _get_razorpay_base_url()

    now = datetime.now(timezone.utc)
    receipt = f"don_{now.strftime('%Y%m%d%H%M%S%f')[:18]}"

    order_body = {
        "amount": payload.amount,
        "currency": currency,
        "receipt": receipt,
        "notes": {
            "type": "donation",
            "name": payload.name or "",
            "email": str(payload.email) if payload.email else "",
            "phone": payload.phone or "",
        },
    }

    response = requests.post(
        f"{base_url}/orders",
        auth=(key_id, key_secret),
        json=order_body,
        timeout=20,
    )
    if not response.ok:
        raise HTTPException(status_code=response.status_code, detail=_parse_error(response))

    order = response.json()
    order_id = order.get("id")
    created_at = datetime.now(timezone.utc).isoformat()

    if order_id:
        db.collection("donations_orders").document(order_id).set(
            {
                "order_id": order_id,
                "amount": order.get("amount", payload.amount),
                "currency": order.get("currency", currency),
                "status": order.get("status", "created"),
                "provider": "razorpay",
                "name": payload.name,
                "email": str(payload.email) if payload.email else None,
                "phone": payload.phone,
                "created_at": created_at,
            }
        )

    db.collection("donation_events").add(
        {
            "event": "razorpay_order_created",
            "provider": "razorpay",
            "order_id": order_id,
            "amount": order.get("amount", payload.amount),
            "currency": order.get("currency", currency),
            "created_at": created_at,
        }
    )

    return {
        "key_id": key_id,
        "order_id": order_id,
        "amount": order.get("amount", payload.amount),
        "currency": order.get("currency", currency),
    }


@router.post("/razorpay/verify")
def verify_razorpay_payment(payload: RazorpayVerifyPayment):
    key_id, key_secret = _get_razorpay_credentials()
    base_url = _get_razorpay_base_url()

    expected_signature = hmac.new(
        key_secret.encode("utf-8"),
        f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, payload.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    payment_response = requests.get(
        f"{base_url}/payments/{payload.razorpay_payment_id}",
        auth=(key_id, key_secret),
        timeout=20,
    )
    if not payment_response.ok:
        raise HTTPException(status_code=payment_response.status_code, detail=_parse_error(payment_response))

    payment = payment_response.json()
    payment_status = payment.get("status")

    if payment_status == "authorized":
        capture_response = requests.post(
            f"{base_url}/payments/{payload.razorpay_payment_id}/capture",
            auth=(key_id, key_secret),
            json={
                "amount": payment.get("amount"),
                "currency": payment.get("currency", "INR"),
            },
            timeout=20,
        )
        if capture_response.ok:
            payment = capture_response.json()
            payment_status = payment.get("status")

    created_at_epoch = payment.get("created_at")
    if isinstance(created_at_epoch, (int, float)):
        paid_at = datetime.fromtimestamp(created_at_epoch, tz=timezone.utc).isoformat()
    else:
        paid_at = datetime.now(timezone.utc).isoformat()

    record = {
        "provider": "razorpay",
        "order_id": payload.razorpay_order_id,
        "payment_id": payload.razorpay_payment_id,
        "signature_verified": True,
        "status": payment_status,
        "amount": payment.get("amount"),
        "currency": payment.get("currency", "INR"),
        "method": payment.get("method"),
        "bank": payment.get("bank"),
        "wallet": payment.get("wallet"),
        "vpa": payment.get("vpa"),
        "name": payload.name,
        "email": str(payload.email) if payload.email else None,
        "phone": payload.phone,
        "captured": payment.get("captured"),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "paid_at": paid_at,
    }

    db.collection("donations").document(payload.razorpay_payment_id).set(record, merge=True)
    db.collection("donation_events").add(
        {
            "event": "razorpay_payment_verified",
            "provider": "razorpay",
            "order_id": payload.razorpay_order_id,
            "payment_id": payload.razorpay_payment_id,
            "payment_status": payment_status,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )

    return {
        "order_id": payload.razorpay_order_id,
        "payment_id": payload.razorpay_payment_id,
        "payment_status": payment_status,
        "amount": payment.get("amount"),
        "currency": payment.get("currency", "INR"),
        "method": payment.get("method"),
        "bank": payment.get("bank"),
        "wallet": payment.get("wallet"),
        "vpa": payment.get("vpa"),
        "captured": payment.get("captured"),
        "paid_at": paid_at,
    }
