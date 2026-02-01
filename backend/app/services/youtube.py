import requests

API_KEY = "YOUTUBE_API_KEY"
CHANNEL_ID = "CHANNEL_ID"

def fetch_youtube_feed():
    url = (
        "https://www.googleapis.com/youtube/v3/search"
        f"?key={API_KEY}&channelId={CHANNEL_ID}&part=snippet,id&order=date&maxResults=12"
    )

    res = requests.get(url).json()

    items = []
    for v in res.get("items", []):
        if v["id"]["kind"] != "youtube#video":
            continue

        items.append({
            "type": "image",
            "media": [v["snippet"]["thumbnails"]["high"]["url"]],
            "caption": v["snippet"]["title"],
            "platform": "youtube",
            "externalUrl": f"https://youtube.com/watch?v={v['id']['videoId']}"
        })

    return items
