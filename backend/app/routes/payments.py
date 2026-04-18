import hashlib
import hmac
import os
import csv
from io import StringIO
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, time, timezone
from urllib.parse import quote, urlencode

import requests
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from google.cloud.firestore_v1 import Query

from app.core.auth import get_admin_user
from app.core.firebase import db
from app.schemas.payment import (
    DonationDeclarationAuditCreate,
    DonationDeclarationIntentCreate,
    RazorpayOrderCreate,
    RazorpayVerifyPayment,
)


router = APIRouter(prefix="/payments", tags=["Payments"])

DEFAULT_UPI_PA = "vartikashukla2000@okhdfcbank"
DEFAULT_UPI_PN = "Vartika Shukla"
DEFAULT_UPI_AID = "uGICAgMDw8-nPUg"
DEFAULT_UPI_CURRENCY = "INR"
DECLARATION_COLLECTION = "donation_declarations"
DECLARATION_AUDIT_COLLECTION = "donation_declaration_audits"


def _get_razorpay_credentials() -> tuple[str, str]:
    key_id = (os.getenv("RAZORPAY_KEY_ID") or "").strip()
    key_secret = (os.getenv("RAZORPAY_KEY_SECRET") or "").strip()
    if not key_id or not key_secret:
        raise HTTPException(status_code=500, detail="Razorpay API keys not configured")
    return key_id, key_secret


def _get_razorpay_base_url() -> str:
    return (os.getenv("RAZORPAY_API_BASE") or "https://api.razorpay.com/v1").rstrip("/")


def _get_upi_config() -> tuple[str, str, str]:
    payee = (os.getenv("UPI_DONATION_PA") or DEFAULT_UPI_PA).strip()
    payee_name = (os.getenv("UPI_DONATION_PN") or DEFAULT_UPI_PN).strip()
    aid = (os.getenv("UPI_DONATION_AID") or DEFAULT_UPI_AID).strip()

    if not payee:
        raise HTTPException(status_code=500, detail="UPI payee ID is not configured")
    if not payee_name:
        raise HTTPException(status_code=500, detail="UPI payee name is not configured")
    if not aid:
        raise HTTPException(status_code=500, detail="UPI AID is not configured")

    return payee, payee_name, aid


def _format_upi_amount(amount: Decimal) -> str:
    normalized = amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return format(normalized, "f")


def _build_upi_url(amount: Decimal, payee: str, payee_name: str, aid: str) -> str:
    amount_str = _format_upi_amount(amount)
    params = [
        ("pa", payee),
        ("pn", payee_name),
        ("am", amount_str),
        ("cu", DEFAULT_UPI_CURRENCY),
        ("aid", aid),
    ]
    return f"upi://pay?{urlencode(params, quote_via=quote)}"


def _extract_client_context(request: Request) -> dict[str, str | None]:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    client_ip = None
    if forwarded_for:
        client_ip = forwarded_for.split(",", maxsplit=1)[0].strip() or None
    elif request.client:
        client_ip = request.client.host

    return {
        "client_ip": client_ip,
        "user_agent": request.headers.get("user-agent"),
        "origin": request.headers.get("origin"),
        "referer": request.headers.get("referer"),
    }


def _write_declaration_with_audit(declaration_record: dict, audit_record: dict) -> None:
    declaration_ref = db.collection(DECLARATION_COLLECTION).document(declaration_record["declaration_id"])
    audit_ref = db.collection(DECLARATION_AUDIT_COLLECTION).document(audit_record["audit_id"])

    batch = db.batch()
    batch.set(declaration_ref, declaration_record, merge=True)
    batch.set(audit_ref, audit_record)
    batch.commit()


def _write_declaration_audit(audit_record: dict) -> None:
    db.collection(DECLARATION_AUDIT_COLLECTION).document(audit_record["audit_id"]).set(audit_record)


def _parse_optional_decimal(value: str | None) -> Decimal | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    try:
        return Decimal(text)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid numeric filter: {value}") from exc


def _parse_optional_date(value: str | None, end_of_day: bool = False) -> datetime | None:
    if value is None:
        return None
    text = value.strip()
    if not text:
        return None
    try:
        parsed = datetime.strptime(text, "%Y-%m-%d").date()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid date filter: {value}") from exc

    if end_of_day:
        return datetime.combine(parsed, time.max).replace(tzinfo=timezone.utc)
    return datetime.combine(parsed, time.min).replace(tzinfo=timezone.utc)


def _parse_record_datetime(record: dict) -> datetime | None:
    created_at = record.get("created_at")
    if not created_at:
        return None
    if isinstance(created_at, datetime):
        dt = created_at
    else:
        try:
            dt = datetime.fromisoformat(str(created_at).replace("Z", "+00:00"))
        except ValueError:
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _matches_declaration_filters(
    record: dict,
    search: str | None,
    status: str | None,
    residential_status: str | None,
    country: str | None,
    min_amount: Decimal | None,
    max_amount: Decimal | None,
    start_dt: datetime | None,
    end_dt: datetime | None,
) -> bool:
    if status and str(record.get("status") or "").strip().lower() != status:
        return False

    if residential_status and str(record.get("residential_status") or "").strip().lower() != residential_status:
        return False

    if country and country not in str(record.get("country") or "").strip().lower():
        return False

    record_amount = _parse_optional_decimal(str(record.get("amount") or ""))
    if min_amount is not None and (record_amount is None or record_amount < min_amount):
        return False
    if max_amount is not None and (record_amount is None or record_amount > max_amount):
        return False

    record_dt = _parse_record_datetime(record)
    if start_dt and (record_dt is None or record_dt < start_dt):
        return False
    if end_dt and (record_dt is None or record_dt > end_dt):
        return False

    if search:
        haystack = " ".join(
            [
                str(record.get("declaration_id") or ""),
                str(record.get("donor_name") or ""),
                str(record.get("email") or ""),
                str(record.get("country") or ""),
                str(record.get("details") or ""),
            ]
        ).lower()
        if search not in haystack:
            return False

    return True


def _query_declarations(
    *,
    search: str | None,
    status: str | None,
    residential_status: str | None,
    country: str | None,
    min_amount: Decimal | None,
    max_amount: Decimal | None,
    start_dt: datetime | None,
    end_dt: datetime | None,
) -> list[dict]:
    docs = (
        db.collection(DECLARATION_COLLECTION)
        .order_by("created_at", direction=Query.DESCENDING)
        .limit(5000)
        .stream()
    )

    items: list[dict] = []
    for snapshot in docs:
        data = snapshot.to_dict() or {}
        data.setdefault("declaration_id", snapshot.id)
        if _matches_declaration_filters(
            data,
            search=search,
            status=status,
            residential_status=residential_status,
            country=country,
            min_amount=min_amount,
            max_amount=max_amount,
            start_dt=start_dt,
            end_dt=end_dt,
        ):
            items.append(data)

    return items


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


@router.post("/upi/declaration-intent")
def create_upi_declaration_intent(payload: DonationDeclarationIntentCreate, request: Request):
    payee, payee_name, aid = _get_upi_config()
    amount = payload.amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    amount_str = _format_upi_amount(amount)
    upi_url = _build_upi_url(amount, payee, payee_name, aid)

    now = datetime.now(timezone.utc)
    created_at = now.isoformat()
    declaration_id = f"decl_{now.strftime('%Y%m%d%H%M%S%f')[:20]}"
    audit_id = f"audit_{now.strftime('%Y%m%d%H%M%S%f')[:20]}"
    client_context = _extract_client_context(request)

    declaration_record = {
        "declaration_id": declaration_id,
        "status": "declaration_submitted",
        "donor_name": payload.donor_name,
        "amount": amount_str,
        "currency": DEFAULT_UPI_CURRENCY,
        "residential_status": payload.residential_status.value,
        "country": payload.country,
        "email": str(payload.email),
        "details": payload.details,
        "declaration_date_local": payload.declaration_date_local,
        "client_timezone": payload.client_timezone,
        "confirm_legal_income": payload.confirm_legal_income,
        "confirm_voluntary": payload.confirm_voluntary,
        "confirm_charitable_use": payload.confirm_charitable_use,
        "acknowledge_fcra": payload.acknowledge_fcra,
        "upi_url": upi_url,
        "created_at": created_at,
        "updated_at": created_at,
        "provider": "upi",
        "payee_vpa": payee,
        "payee_name": payee_name,
        "aid": aid,
        "audit": {
            "last_event": "declaration_submitted",
            "last_event_at": created_at,
            **client_context,
        },
    }

    audit_record = {
        "audit_id": audit_id,
        "declaration_id": declaration_id,
        "event": "declaration_submitted",
        "amount": amount_str,
        "currency": DEFAULT_UPI_CURRENCY,
        "provider": "upi",
        "created_at": created_at,
        "client": client_context,
        "snapshot": {
            "donor_name": payload.donor_name,
            "email": str(payload.email),
            "country": payload.country,
            "residential_status": payload.residential_status.value,
            "details": payload.details,
            "declaration_date_local": payload.declaration_date_local,
            "client_timezone": payload.client_timezone,
            "confirm_legal_income": payload.confirm_legal_income,
            "confirm_voluntary": payload.confirm_voluntary,
            "confirm_charitable_use": payload.confirm_charitable_use,
            "acknowledge_fcra": payload.acknowledge_fcra,
            "upi_url": upi_url,
        },
    }

    try:
        _write_declaration_with_audit(declaration_record=declaration_record, audit_record=audit_record)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Could not persist donation declaration audit record",
        ) from exc

    return {
        "declaration_id": declaration_id,
        "upi_url": upi_url,
        "amount": amount_str,
        "currency": DEFAULT_UPI_CURRENCY,
        "payee_vpa": payee,
        "payee_name": payee_name,
        "aid": aid,
    }


@router.post("/upi/declaration-audit")
def create_upi_declaration_audit(payload: DonationDeclarationAuditCreate, request: Request):
    now = datetime.now(timezone.utc)
    created_at = now.isoformat()
    audit_id = f"audit_{now.strftime('%Y%m%d%H%M%S%f')[:20]}"
    client_context = _extract_client_context(request)

    declaration_ref = db.collection(DECLARATION_COLLECTION).document(payload.declaration_id)
    declaration_snapshot = declaration_ref.get()
    declaration_data = declaration_snapshot.to_dict() if declaration_snapshot else None
    if not declaration_data:
        raise HTTPException(status_code=404, detail="Declaration not found")

    amount_str = _format_upi_amount(payload.amount) if payload.amount is not None else None
    audit_record = {
        "audit_id": audit_id,
        "declaration_id": payload.declaration_id,
        "event": payload.event.value,
        "amount": amount_str,
        "currency": DEFAULT_UPI_CURRENCY if amount_str is not None else None,
        "provider": "upi",
        "created_at": created_at,
        "client": client_context,
        "declaration_date_local": payload.declaration_date_local,
        "client_timezone": payload.client_timezone,
        "notes": payload.notes,
    }

    update_doc = {
        "updated_at": created_at,
        "audit": {
            "last_event": payload.event.value,
            "last_event_at": created_at,
            "client_ip": client_context.get("client_ip"),
            "user_agent": client_context.get("user_agent"),
            "origin": client_context.get("origin"),
            "referer": client_context.get("referer"),
        },
    }
    if payload.event.value == "qr_displayed":
        update_doc["status"] = "qr_generated"
        update_doc["qr_generated_at"] = created_at

    try:
        _write_declaration_audit(audit_record)
        declaration_ref.set(update_doc, merge=True)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Could not persist donation audit event") from exc

    return {
        "audit_id": audit_id,
        "declaration_id": payload.declaration_id,
        "event": payload.event.value,
        "created_at": created_at,
    }


@router.get("/admin/declarations")
def list_admin_donation_declarations(
    limit: int = 25,
    page: int = 1,
    search: str | None = None,
    status: str | None = None,
    residential_status: str | None = None,
    country: str | None = None,
    min_amount: str | None = None,
    max_amount: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    _: dict = Depends(get_admin_user),
):
    safe_limit = min(max(limit, 1), 200)
    safe_page = max(page, 1)

    normalized_search = search.strip().lower() if search else None
    normalized_status = status.strip().lower() if status else None
    normalized_residential = residential_status.strip().lower() if residential_status else None
    normalized_country = country.strip().lower() if country else None

    min_amount_value = _parse_optional_decimal(min_amount)
    max_amount_value = _parse_optional_decimal(max_amount)
    if min_amount_value is not None and max_amount_value is not None and min_amount_value > max_amount_value:
        raise HTTPException(status_code=400, detail="min_amount cannot be greater than max_amount")

    start_dt = _parse_optional_date(start_date, end_of_day=False)
    end_dt = _parse_optional_date(end_date, end_of_day=True)
    if start_dt and end_dt and start_dt > end_dt:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date")

    items = _query_declarations(
        search=normalized_search,
        status=normalized_status,
        residential_status=normalized_residential,
        country=normalized_country,
        min_amount=min_amount_value,
        max_amount=max_amount_value,
        start_dt=start_dt,
        end_dt=end_dt,
    )

    total = len(items)
    total_pages = max(1, (total + safe_limit - 1) // safe_limit)
    offset = (safe_page - 1) * safe_limit
    paged_items = items[offset : offset + safe_limit]

    amount_values = []
    for item in items:
        value = _parse_optional_decimal(str(item.get("amount") or ""))
        if value is not None:
            amount_values.append(value)

    total_amount = sum(amount_values, start=Decimal("0.00"))
    min_value = min(amount_values) if amount_values else Decimal("0.00")
    max_value = max(amount_values) if amount_values else Decimal("0.00")

    return {
        "items": paged_items,
        "page": safe_page,
        "total": total,
        "total_pages": total_pages,
        "summary": {
            "records": total,
            "total_amount_inr": _format_upi_amount(total_amount),
            "min_amount_inr": _format_upi_amount(min_value),
            "max_amount_inr": _format_upi_amount(max_value),
        },
    }


@router.get("/admin/declarations/export")
def export_admin_donation_declarations(
    search: str | None = None,
    status: str | None = None,
    residential_status: str | None = None,
    country: str | None = None,
    min_amount: str | None = None,
    max_amount: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    _: dict = Depends(get_admin_user),
):
    normalized_search = search.strip().lower() if search else None
    normalized_status = status.strip().lower() if status else None
    normalized_residential = residential_status.strip().lower() if residential_status else None
    normalized_country = country.strip().lower() if country else None

    min_amount_value = _parse_optional_decimal(min_amount)
    max_amount_value = _parse_optional_decimal(max_amount)
    if min_amount_value is not None and max_amount_value is not None and min_amount_value > max_amount_value:
        raise HTTPException(status_code=400, detail="min_amount cannot be greater than max_amount")

    start_dt = _parse_optional_date(start_date, end_of_day=False)
    end_dt = _parse_optional_date(end_date, end_of_day=True)
    if start_dt and end_dt and start_dt > end_dt:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date")

    items = _query_declarations(
        search=normalized_search,
        status=normalized_status,
        residential_status=normalized_residential,
        country=normalized_country,
        min_amount=min_amount_value,
        max_amount=max_amount_value,
        start_dt=start_dt,
        end_dt=end_dt,
    )

    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "Declaration ID",
            "Created At",
            "Status",
            "Donor Name",
            "Email",
            "Residential Status",
            "Country",
            "Amount",
            "Currency",
            "Declaration Date Local",
            "Client Timezone",
            "Last Audit Event",
            "Last Audit At",
            "Payee VPA",
            "Details",
        ]
    )

    for item in items:
        audit = item.get("audit") or {}
        writer.writerow(
            [
                item.get("declaration_id", ""),
                item.get("created_at", ""),
                item.get("status", ""),
                item.get("donor_name", ""),
                item.get("email", ""),
                item.get("residential_status", ""),
                item.get("country", ""),
                item.get("amount", ""),
                item.get("currency", ""),
                item.get("declaration_date_local", ""),
                item.get("client_timezone", ""),
                audit.get("last_event", ""),
                audit.get("last_event_at", ""),
                item.get("payee_vpa", ""),
                item.get("details", ""),
            ]
        )

    csv_text = buffer.getvalue()
    buffer.close()

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"donation_declarations_{timestamp}.csv"
    return Response(
        content=csv_text,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


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
