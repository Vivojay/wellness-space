from datetime import datetime
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator, model_validator


class RazorpayOrderCreate(BaseModel):
    amount: int
    currency: str = "INR"
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value):
        if value is None:
            return None
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("name", "phone", mode="before")
    @classmethod
    def normalize_text(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value


class RazorpayVerifyPayment(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    @field_validator("email", mode="before")
    @classmethod
    def normalize_verify_email(cls, value):
        if value is None:
            return None
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("name", "phone", mode="before")
    @classmethod
    def normalize_verify_text(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value


class ResidentialStatus(str, Enum):
    indian_resident = "indian_resident"
    nri = "nri"
    foreign_national = "foreign_national"


class DonationAuditEventType(str, Enum):
    declaration_submitted = "declaration_submitted"
    qr_displayed = "qr_displayed"
    qr_refresh_requested = "qr_refresh_requested"


class DonationDeclarationIntentCreate(BaseModel):
    donor_name: str
    amount: Decimal
    residential_status: ResidentialStatus
    country: str
    email: EmailStr
    details: str
    declaration_date_local: Optional[str] = None
    client_timezone: Optional[str] = None
    confirm_legal_income: bool
    confirm_voluntary: bool
    confirm_charitable_use: bool
    acknowledge_fcra: bool

    @field_validator("donor_name", "country", "details", mode="before")
    @classmethod
    def normalize_required_text(cls, value):
        if isinstance(value, str):
            value = value.strip()
        if not value:
            raise ValueError("This field is required")
        return value

    @field_validator("declaration_date_local", "client_timezone", mode="before")
    @classmethod
    def normalize_optional_text(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value

    @field_validator("declaration_date_local")
    @classmethod
    def validate_declaration_date_local(cls, value):
        if value is None:
            return None
        try:
            datetime.strptime(value, "%d/%m/%Y")
        except ValueError as exc:
            raise ValueError("Declaration date must be in DD/MM/YYYY format") from exc
        return value

    @field_validator("amount", mode="before")
    @classmethod
    def normalize_amount(cls, value):
        if value is None:
            raise ValueError("Amount is required")
        if isinstance(value, str):
            value = value.strip().replace(",", "")
            if not value:
                raise ValueError("Amount is required")
        try:
            return Decimal(str(value))
        except (InvalidOperation, ValueError, TypeError) as exc:
            raise ValueError("Amount must be a valid number") from exc

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, value: Decimal):
        if value <= Decimal("0"):
            raise ValueError("Amount must be greater than zero")
        if value > Decimal("10000000"):
            raise ValueError("Amount is too large")
        return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @model_validator(mode="after")
    def validate_confirmations(self):
        checks = {
            "confirm_legal_income": self.confirm_legal_income,
            "confirm_voluntary": self.confirm_voluntary,
            "confirm_charitable_use": self.confirm_charitable_use,
            "acknowledge_fcra": self.acknowledge_fcra,
        }
        missing = [field for field, checked in checks.items() if not checked]
        if missing:
            joined = ", ".join(missing)
            raise ValueError(f"Required declaration checkboxes missing: {joined}")
        return self


class DonationDeclarationAuditCreate(BaseModel):
    declaration_id: str
    event: DonationAuditEventType
    amount: Optional[Decimal] = None
    declaration_date_local: Optional[str] = None
    client_timezone: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("declaration_id", mode="before")
    @classmethod
    def normalize_declaration_id(cls, value):
        if isinstance(value, str):
            value = value.strip()
        if not value:
            raise ValueError("Declaration ID is required")
        return value

    @field_validator("amount", mode="before")
    @classmethod
    def normalize_optional_amount(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            value = value.strip().replace(",", "")
            if not value:
                return None
        try:
            parsed = Decimal(str(value))
        except (InvalidOperation, ValueError, TypeError) as exc:
            raise ValueError("Amount must be a valid number") from exc
        if parsed <= Decimal("0"):
            raise ValueError("Amount must be greater than zero")
        return parsed.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @field_validator("declaration_date_local", "client_timezone", "notes", mode="before")
    @classmethod
    def normalize_optional_audit_text(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value

    @field_validator("declaration_date_local")
    @classmethod
    def validate_declaration_date_local(cls, value):
        if value is None:
            return None
        try:
            datetime.strptime(value, "%d/%m/%Y")
        except ValueError as exc:
            raise ValueError("Declaration date must be in DD/MM/YYYY format") from exc
        return value
