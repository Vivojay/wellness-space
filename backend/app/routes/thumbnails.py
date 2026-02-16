import hashlib
import importlib
import os
from pathlib import Path
from urllib.parse import urlparse

import requests
from requests.exceptions import SSLError
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response


router = APIRouter(prefix="/thumbnails", tags=["Thumbnails"])


def _get_cache_dir() -> Path:
    base = os.getenv("THUMBNAIL_CACHE_DIR")
    if base:
        path = Path(base)
    else:
        path = Path(__file__).resolve().parents[2] / ".cache" / "pdf_thumbs"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _is_allowed_host(url: str) -> bool:
    allowed = os.getenv("ALLOWED_PDF_HOSTS", "sreeshaktipatashram.com")
    allowed_hosts = {h.strip().lower() for h in allowed.split(",") if h.strip()}
    if not allowed_hosts:
        return True
    host = urlparse(url).hostname or ""
    return host.lower() in allowed_hosts


@router.get("/pdf")
def pdf_thumbnail(url: str = Query(..., min_length=8)):
    if not _is_allowed_host(url):
        raise HTTPException(status_code=400, detail="PDF host not allowed")

    cache_dir = _get_cache_dir()
    cache_key = hashlib.sha256(url.encode("utf-8")).hexdigest()
    cache_file = cache_dir / f"{cache_key}.png"

    if cache_file.exists():
        return Response(
            content=cache_file.read_bytes(),
            media_type="image/png",
            headers={"Cache-Control": "public, max-age=86400"},
        )

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
        "Accept": "application/pdf,application/octet-stream;q=0.9,*/*;q=0.8",
        "Referer": "https://sreeshaktipatashram.com/",
    }

    verify_ssl = os.getenv("PDF_SSL_VERIFY", "true").lower() not in {"0", "false", "no"}

    try:
        res = requests.get(
            url,
            headers=headers,
            timeout=40,
            allow_redirects=True,
            verify=verify_ssl,
        )
        res.raise_for_status()
    except SSLError:
        res = requests.get(
            url,
            headers=headers,
            timeout=40,
            allow_redirects=True,
            verify=False,
        )
        res.raise_for_status()
    except requests.RequestException as exc:
        detail = f"Failed to fetch PDF (status: {getattr(exc.response, 'status_code', 'n/a')})"
        raise HTTPException(status_code=502, detail=detail) from exc

    try:
        fitz = importlib.import_module("fitz")
    except Exception as exc:
        raise HTTPException(status_code=500, detail="PyMuPDF is not installed") from exc

    doc = None
    try:
        doc = fitz.open(stream=res.content, filetype="pdf")
        page = doc.load_page(0)
        zoom = 0.8
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        image_bytes = pix.tobytes("png")
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to render PDF") from exc
    finally:
        try:
            if doc is not None:
                doc.close()
        except Exception:
            pass

    try:
        cache_file.write_bytes(image_bytes)
    except Exception:
        pass

    return Response(
        content=image_bytes,
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=86400"},
    )
