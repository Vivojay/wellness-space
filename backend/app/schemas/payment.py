from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


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
