import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes.blog import router as blog_router
from app.routes.gallery import router as gallery_router
from app.routes.booking import router as booking_router

load_dotenv()  # reads backend/.env

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()] or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Mount everything under /api
app.include_router(blog_router, prefix="/api")
app.include_router(gallery_router, prefix="/api")
app.include_router(booking_router, prefix="/api")
