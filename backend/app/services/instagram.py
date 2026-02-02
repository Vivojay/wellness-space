import os
import requests
from app.services.normalize import normalize_instagram

def fetch_instagram_feed(limit: int = 12):
    IG_TOKEN = os.getenv("IG_ACCESS_TOKEN")
    IG_USER_ID = os.getenv("IG_USER_ID")
    BASE_URL = "https://graph.facebook.com/v19.0"

    if not IG_TOKEN or not IG_USER_ID:
        return []

    url = f"{BASE_URL}/{IG_USER_ID}/media"
    params = {
        "fields": (
            "id,caption,media_type,media_url,"
            "permalink,thumbnail_url,children{media_type,media_url}"
        ),
        "limit": limit,
        "access_token": IG_TOKEN,
    }

    res = requests.get(url, params=params, timeout=10)
    res.raise_for_status()
    data = res.json().get("data", [])
    return [normalize_instagram(item) for item in data]
