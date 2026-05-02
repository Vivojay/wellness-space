import os
from pathlib import PurePosixPath
from typing import Any

import requests
from fastapi import HTTPException


DROPBOX_API_BASE = "https://api.dropboxapi.com/2"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".avif", ".heic", ".heif"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"}


def _get_dropbox_env() -> tuple[str, str]:
    token = os.getenv("DROPBOX_ACCESS_TOKEN", "").strip()
    root = os.getenv("DROPBOX_ROOT_PATH", "").strip()

    if not token:
        raise HTTPException(status_code=500, detail="Dropbox access token is not configured")
    if not root:
        raise HTTPException(status_code=500, detail="Dropbox root path is not configured")

    normalized_root = _normalize_path(root)
    return token, normalized_root


def _normalize_path(path: str) -> str:
    if not path:
        return "/"

    normalized = str(PurePosixPath("/" + path.strip().strip("/")))
    return normalized if normalized != "." else "/"


def _join_path(base: str, child: str) -> str:
    combined = PurePosixPath(base) / child.strip("/")
    return _normalize_path(str(combined))


def _ensure_within_root(root_path: str, candidate_path: str) -> str:
    normalized_root = _normalize_path(root_path)
    normalized_candidate = _normalize_path(candidate_path)
    root_parts = PurePosixPath(normalized_root).parts
    candidate_parts = PurePosixPath(normalized_candidate).parts

    if candidate_parts[: len(root_parts)] != root_parts:
        raise HTTPException(status_code=400, detail="Requested Dropbox path is outside the configured root")

    return normalized_candidate


def _dropbox_request(
    endpoint: str,
    *,
    token: str,
    json: dict[str, Any] | None = None,
    base_url: str = DROPBOX_API_BASE,
) -> Any:
    response = requests.post(
        f"{base_url}{endpoint}",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json=json or {},
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


def _get_shared_link(token: str, path: str) -> str:
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
        json={"path": path, "settings": settings},
        timeout=20,
    )

    if response.ok:
        return response.json()["url"]

    try:
        payload = response.json()
    except ValueError:
        payload = {"error_summary": response.text}

    error_summary = payload.get("error_summary", "")
    if response.status_code == 409 and "shared_link_already_exists" in error_summary:
        existing = _dropbox_request(
            "/sharing/list_shared_links",
            token=token,
            json={"path": path, "direct_only": True},
        )
        links = existing.get("links") or []
        if links:
            return links[0]["url"]

    message = error_summary or "Unable to create Dropbox shared link"
    raise HTTPException(status_code=502, detail=f"Dropbox API error: {message}")


def _shared_link_to_raw(url: str) -> str:
    if "?dl=0" in url:
        return url.replace("?dl=0", "?raw=1")
    if "?dl=1" in url:
        return url.replace("?dl=1", "?raw=1")
    separator = "&" if "?" in url else "?"
    return f"{url}{separator}raw=1"


def fetch_album_media() -> dict[str, Any]:
    token, root_path = _get_dropbox_env()
    photos_path = _ensure_within_root(root_path, _join_path(root_path, "photos"))
    videos_path = _ensure_within_root(root_path, _join_path(root_path, "videos"))

    entries: list[dict[str, Any]] = []
    cursor: str | None = None

    while True:
        if cursor:
            payload = _dropbox_request("/files/list_folder/continue", token=token, json={"cursor": cursor})
        else:
            payload = _dropbox_request(
                "/files/list_folder",
                token=token,
                json={
                    "path": root_path,
                    "recursive": True,
                    "include_non_downloadable_files": False,
                },
            )

        entries.extend(payload.get("entries", []))
        if not payload.get("has_more"):
            break
        cursor = payload.get("cursor")

    photos: list[dict[str, Any]] = []
    videos: list[dict[str, Any]] = []

    for entry in entries:
        if entry.get(".tag") != "file":
            continue

        path_display = entry.get("path_display") or ""
        lower_path = path_display.lower()
        in_photos = lower_path.startswith(f"{photos_path.lower()}/")
        in_videos = lower_path.startswith(f"{videos_path.lower()}/")

        if not in_photos and not in_videos:
            continue

        if in_photos and not _is_image(path_display):
            continue

        if in_videos and not (_is_image(path_display) or _is_video(path_display)):
            continue

        shared_url = _get_shared_link(token, entry["path_lower"])
        media = {
            "id": entry["id"],
            "name": entry["name"],
            "path": path_display,
            "url": _shared_link_to_raw(shared_url),
            "size": entry.get("size"),
            "modified_at": entry.get("server_modified"),
            "type": "video" if _is_video(path_display) else "image",
        }

        if in_photos:
            photos.append(media)
        elif in_videos:
            videos.append(media)

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
