from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.routes.blog import router as blog_router
from app.routes.gallery import router as gallery_router

from dotenv import load_dotenv
load_dotenv()  # this reads backend/.env

import os

IG_TOKEN = os.getenv("IG_ACCESS_TOKEN")
IG_USER_ID = os.getenv("IG_USER_ID")

print(IG_USER_ID, IG_TOKEN)  # should print actual values now


app = FastAPI()
router = APIRouter(prefix="/gallery", tags=["Gallery"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(blog_router)
app.include_router(gallery_router)

