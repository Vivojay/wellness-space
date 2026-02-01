from app.services.normalize import normalize_instagram
import requests

def fetch_instagram_feed(limit: int = 12):
    import os
    IG_TOKEN = os.getenv("IG_ACCESS_TOKEN")
    IG_USER_ID = os.getenv("IG_USER_ID")
    BASE_URL = "https://graph.facebook.com/v19.0"

    url = f"{BASE_URL}/{IG_USER_ID}/media"
    params = {
        "fields": (
            "id,caption,media_type,media_url,"
            "permalink,thumbnail_url,children{media_type,media_url}"
        ),
        "limit": limit,
        "access_token": IG_TOKEN,
    }

    res = requests.get(url, params=params)
    res.raise_for_status()
    data = res.json().get("data", [])
    return [normalize_instagram(item) for item in data]
