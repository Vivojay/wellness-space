from pydantic import BaseModel, EmailStr
from typing import Optional


class DodoCheckoutCreate(BaseModel):
    amount: int
    currency: str = "INR"
    name: Optional[str] = ""
    email: Optional[EmailStr] = None
    phone: Optional[str] = ""
