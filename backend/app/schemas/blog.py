from pydantic import BaseModel
from datetime import datetime

class BlogCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    slug: str
    published: bool = False

class BlogOut(BlogCreate):
    created_at: datetime
