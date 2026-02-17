from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BlogCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    slug: str
    image_url: Optional[str] = None
    published: bool = False

class BlogOut(BlogCreate):
    created_at: datetime
