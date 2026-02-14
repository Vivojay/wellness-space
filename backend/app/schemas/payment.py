from pydantic import BaseModel, EmailStr
from typing import Optional


class DonationOrderCreate(BaseModel):
    amount: int
    currency: str = "INR"
    name: Optional[str] = ""
    email: Optional[EmailStr] = None
    phone: Optional[str] = ""


class DonationVerify(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    amount: int
    currency: str = "INR"
    name: Optional[str] = ""
    email: Optional[EmailStr] = None
    phone: Optional[str] = ""
