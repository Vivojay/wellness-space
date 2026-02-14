from pydantic import BaseModel


class FeedCreate(BaseModel):
    category: str
    text: str
    published: bool = True
