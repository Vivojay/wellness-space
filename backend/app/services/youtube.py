import os
import requests

API_KEY = os.getenv("YOUTUBE_API_KEY")
CHANNEL_ID = os.getenv("YOUTUBE_CHANNEL_ID")

def fetch_youtube_feed():
    if not API_KEY or not CHANNEL_ID:
        return []

    url = (
        "https://www.googleapis.com/youtube/v3/search"
        f"?key={API_KEY}&channelId={CHANNEL_ID}&part=snippet,id&order=date&maxResults=12"
    )

    res = requests.get(url, timeout=10).json()

    items = []
    for v in res.get("items", []):
        if v["id"]["kind"] != "youtube#video":
            continue

        video_id = v['id']['videoId']
        
        # ✅ Return proper embed URL that can be used directly in iframe
        items.append({
            "type": "video",  # Changed from "image" to "video"
            "media": [f"https://www.youtube.com/embed/{video_id}"],  # Direct embed URL
            "caption": v["snippet"]["title"],
            "platform": "youtube",
            "externalUrl": f"https://youtube.com/watch?v={video_id}"
        })

    return items