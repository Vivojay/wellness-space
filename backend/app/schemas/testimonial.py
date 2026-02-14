from pydantic import BaseModel


class TestimonialCreate(BaseModel):
    author: str
    text: str
    role: str
    published: bool = True
