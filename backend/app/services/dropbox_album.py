import json
import os
import threading
from pathlib import Path, PurePosixPath
from typing import Any, Generator

import requests
from fastapi import HTTPException


DROPBOX_API_BASE = "https://api.dropboxapi.com/2"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".avif", ".heic", ".heif"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"}
SHARED_LINK_CACHE_PATH = Path(__file__).resolve().parents[2] / ".cache" / "dropbox_shared_links.json"
_CACHE_LOCK = threading.Lock()


def _get_dropbox_env() -> tuple[str, str]:
    token = os.getenv("DROPBOX_ACCESS_TOKEN", "").strip()
    root = os.getenv("DROPBOX_ROOT_PATH", "").strip()

    if not token:
        raise HTTPException(status_code=500, detail="Dropbox access token is not configured")
    if not root:
        raise HTTPException(status_code=500, detail="Dropbox root path is not configured")

    return token, _normalize_path(root)


def _normalize_path(path: str) -> str:
    normalized = str(PurePosixPath("/" + path.strip().strip("/")))
    return "" if normalized == "/" else normalized


def _join_path(base: str, child: str) -> str:
    combined = PurePosixPath(base or "/") / child.strip("/")
    return _normalize_path(str(combined))


def _ensure_within_root(root_path: str, candidate_path: str) -> str:
    normalized_root = _normalize_path(root_path)
    normalized_candidate = _normalize_path(candidate_path)
    root_parts = PurePosixPath(normalized_root).parts
    candidate_parts = PurePosixPath(normalized_candidate).parts

    if candidate_parts[: len(root_parts)] != root_parts:
        raise HTTPException(status_code=400, detail="Requested Dropbox path is outside the configured root")

    return normalized_candidate


def _dropbox_request(endpoint: str, *, token: str, json_body: dict[str, Any] | None = None) -> Any:
    response = requests.post(
        f"{DROPBOX_API_BASE}{endpoint}",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json=json_body or {},
        timeout=20,
    )

    if response.status_code >= 400:
        try:
            payload = response.json()
        except ValueError:
            payload = {"error_summary": response.text}
        message = payload.get("error_summary") or payload.get("error", {}).get(".tag") or "Dropbox request failed"
        raise HTTPException(status_code=502, detail=f"Dropbox API error: {message}")

    return response.json()


def _is_image(path_display: str) -> bool:
    return PurePosixPath(path_display).suffix.lower() in IMAGE_EXTENSIONS


def _is_video(path_display: str) -> bool:
    return PurePosixPath(path_display).suffix.lower() in VIDEO_EXTENSIONS


def _shared_link_to_raw(url: str) -> str:
    if "?dl=0" in url:
        return url.replace("?dl=0", "?raw=1")
    if "?dl=1" in url:
        return url.replace("?dl=1", "?raw=1")
    separator = "&" if "?" in url else "?"
    return f"{url}{separator}raw=1"


def _load_shared_link_cache() -> dict[str, dict[str, Any]]:
    with _CACHE_LOCK:
        if not SHARED_LINK_CACHE_PATH.exists():
            return {}
        try:
            return json.loads(SHARED_LINK_CACHE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}


def _save_shared_link_cache(cache: dict[str, dict[str, Any]]) -> None:
    with _CACHE_LOCK:
        SHARED_LINK_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
        temp_path = SHARED_LINK_CACHE_PATH.with_suffix(".tmp")
        temp_path.write_text(json.dumps(cache, ensure_ascii=True, separators=(",", ":")), encoding="utf-8")
        temp_path.replace(SHARED_LINK_CACHE_PATH)


def _get_cached_or_create_shared_link(
    token: str,
    entry: dict[str, Any],
    cache: dict[str, dict[str, Any]],
) -> str:
    path_lower = entry.get("path_lower")
    if not path_lower:
        raise HTTPException(status_code=500, detail="Dropbox entry missing path_lower")

    cache_key = path_lower
    cache_entry = cache.get(cache_key)
    cache_signature = {
        "id": entry.get("id"),
        "modified_at": entry.get("server_modified"),
        "size": entry.get("size"),
    }
    if cache_entry and all(cache_entry.get(k) == v for k, v in cache_signature.items()) and cache_entry.get("url"):
        return cache_entry["url"]

    settings = {
        "requested_visibility": "public",
        "audience": "public",
        "access": "viewer",
        "allow_download": True,
    }

    response = requests.post(
        f"{DROPBOX_API_BASE}/sharing/create_shared_link_with_settings",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={"path": path_lower, "settings": settings},
        timeout=20,
    )

    if response.ok:
        shared_url = response.json()["url"]
    else:
        try:
            payload = response.json()
        except ValueError:
            payload = {"error_summary": response.text}

        error_summary = payload.get("error_summary", "")
        if response.status_code == 409 and "shared_link_already_exists" in error_summary:
            existing = _dropbox_request(
                "/sharing/list_shared_links",
                token=token,
                json_body={"path": path_lower, "direct_only": True},
            )
            links = existing.get("links") or []
            if not links:
                raise HTTPException(status_code=502, detail="Dropbox shared link lookup returned no links")
            shared_url = links[0]["url"]
        else:
            message = error_summary or "Unable to create Dropbox shared link"
            raise HTTPException(status_code=502, detail=f"Dropbox API error: {message}")

    raw_url = _shared_link_to_raw(shared_url)
    cache[cache_key] = {
        **cache_signature,
        "url": raw_url,
    }
    return raw_url


def _iter_dropbox_entries(token: str, root_path: str) -> Generator[dict[str, Any], None, None]:
    cursor: str | None = None

    while True:
        if cursor:
            payload = _dropbox_request("/files/list_folder/continue", token=token, json_body={"cursor": cursor})
        else:
            payload = _dropbox_request(
                "/files/list_folder",
                token=token,
                json_body={
                    "path": root_path,
                    "recursive": True,
                    "include_non_downloadable_files": False,
                },
            )

        for entry in payload.get("entries", []):
            yield entry

        if not payload.get("has_more"):
            break
        cursor = payload.get("cursor")


def _is_within_dir(path_lower: str, dir_path: str) -> bool:
    prefix = f"{dir_path.lower()}/" if dir_path else "/"
    return path_lower.startswith(prefix)


def _build_media_item(token: str, entry: dict[str, Any], cache: dict[str, dict[str, Any]], photos_path: str, videos_path: str) -> dict[str, Any] | None:
    if entry.get(".tag") != "file":
        return None

    path_display = entry.get("path_display") or ""
    path_lower = entry.get("path_lower") or path_display.lower()
    in_photos = _is_within_dir(path_lower, photos_path)
    in_videos = _is_within_dir(path_lower, videos_path)

    if not in_photos and not in_videos:
        return None
    if in_photos and not _is_image(path_display):
        return None
    if in_videos and not (_is_image(path_display) or _is_video(path_display)):
        return None

    return {
        "id": entry["id"],
        "name": entry["name"],
        "path": path_display,
        "url": _get_cached_or_create_shared_link(token, entry, cache),
        "size": entry.get("size"),
        "modified_at": entry.get("server_modified"),
        "type": "video" if _is_video(path_display) else "image",
        "bucket": "videos" if in_videos and _is_video(path_display) else "photos",
    }


def fetch_album_media() -> dict[str, Any]:
    token, root_path = _get_dropbox_env()
    photos_path = _ensure_within_root(root_path, _join_path(root_path, "photos"))
    videos_path = _ensure_within_root(root_path, _join_path(root_path, "videos"))
    cache = _load_shared_link_cache()

    photos: list[dict[str, Any]] = []
    videos: list[dict[str, Any]] = []

    for entry in _iter_dropbox_entries(token, root_path):
        item = _build_media_item(token, entry, cache, photos_path, videos_path)
        if not item:
            continue
        if item["bucket"] == "videos":
            videos.append(item)
        else:
            photos.append(item)

    _save_shared_link_cache(cache)
    photos.sort(key=lambda item: item.get("modified_at") or "", reverse=True)
    videos.sort(key=lambda item: item.get("modified_at") or "", reverse=True)

    return {
        "root_path": root_path,
        "photos_path": photos_path,
        "videos_path": videos_path,
        "photos": photos,
        "videos": videos,
        "total": len(photos) + len(videos),
    }


def stream_album_media_lines() -> Generator[str, None, None]:
    token, root_path = _get_dropbox_env()
    photos_path = _ensure_within_root(root_path, _join_path(root_path, "photos"))
    videos_path = _ensure_within_root(root_path, _join_path(root_path, "videos"))
    cache = _load_shared_link_cache()
    photos_count = 0
    videos_count = 0

    yield json.dumps(
        {
            "type": "meta",
            "root_path": root_path,
            "photos_path": photos_path,
            "videos_path": videos_path,
        },
        ensure_ascii=True,
    ) + "\n"

    try:
        for entry in _iter_dropbox_entries(token, root_path):
            item = _build_media_item(token, entry, cache, photos_path, videos_path)
            if not item:
                continue

            if item["bucket"] == "videos":
                videos_count += 1
            else:
                photos_count += 1

            yield json.dumps({"type": "item", "item": item}, ensure_ascii=True) + "\n"
    finally:
        _save_shared_link_cache(cache)

    yield json.dumps(
        {
            "type": "done",
            "counts": {
                "photos": photos_count,
                "videos": videos_count,
                "total": photos_count + videos_count,
            },
        },
        ensure_ascii=True,
    ) + "\n"
