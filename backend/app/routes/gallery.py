from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.services.instagram import fetch_instagram_feed
from app.services.youtube import fetch_youtube_feed
from app.services.dropbox_album import fetch_album_media, stream_album_media_lines

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


@router.get("/album")
def album_feed():
    return fetch_album_media()


@router.get("/album/stream")
def album_feed_stream():
    return StreamingResponse(stream_album_media_lines(), media_type="application/x-ndjson")
