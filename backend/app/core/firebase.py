import os
import firebase_admin
from firebase_admin import credentials, firestore


def _get_cred_path() -> str:
    base = os.path.dirname(__file__)
    default = os.path.join(base, "..", "..", "serviceAccountKey.json")
    # Prefer env var; fallback to backend/serviceAccountKey.json (but you .gitignore it)
    # In prod, you should set FIREBASE_CREDENTIALS to an absolute path or mounted secret.
    return os.getenv("FIREBASE_CREDENTIALS", default)

if not firebase_admin._apps:
    cred = credentials.Certificate(_get_cred_path())
    firebase_admin.initialize_app(cred)

db = firestore.client()
