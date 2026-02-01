from pydantic import BaseModel
from datetime import datetime

class BlogBase(BaseModel):
    title: str
    excerpt: str
    slug: str
    published: bool

class BlogCreate(BlogBase):
    content: str

class BlogOut(BlogBase):
    content: str
    created_at: datetime
