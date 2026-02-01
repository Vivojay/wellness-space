def normalize_instagram(item):
    media = []
    media_type = item["media_type"]

    if media_type == "CAROUSEL_ALBUM":
        media = [
            c["media_url"]
            for c in item.get("children", {}).get("data", [])
        ]
        type_ = "carousel"

    elif media_type == "VIDEO":
        media = [item.get("media_url") or item.get("thumbnail_url")]
        type_ = "video"

    else:  # IMAGE
        media = [item.get("media_url")]
        type_ = "image"

    return {
        "type": type_,
        "media": media,
        "caption": item.get("caption", ""),
        "platform": "instagram",
        "externalUrl": item.get("permalink"),
    }
