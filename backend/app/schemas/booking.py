from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class BookingCreate(BaseModel):
    fullName: str
    age: str
    gender: str
    city: str
    email: EmailStr
    education: Optional[str] = ""
    religion: Optional[str] = ""
    maritalStatus: Optional[str] = ""
    childrenCount: Optional[str] = ""
    phone: str
    whyJoin: Optional[str] = ""
    meds: Optional[str] = ""
    healthIssues: Optional[str] = ""
    initiatedBefore: str
    lineageDetails: Optional[str] = ""
    subscribe: bool = False

class BookingOut(BookingCreate):
    created_at: datetime
