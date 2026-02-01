from fastapi import APIRouter
from app.services.instagram import fetch_instagram_feed
from app.services.youtube import fetch_youtube_feed

router = APIRouter(
    prefix="/gallery",
    tags=["Gallery"]
)

@router.get("/instagram")
def instagram_feed():
    return fetch_instagram_feed()

@router.get("/youtube")
def youtube_feed():
    return fetch_youtube_feed()

@router.get("/facebook")
def facebook_feed():
    return []  # placeholder (legal API not wired yet)

@router.get("/x")
def x_feed():
    return []  # placeholder
