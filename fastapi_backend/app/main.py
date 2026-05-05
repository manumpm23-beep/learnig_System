import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import users, courses, videos, progress, dashboard, comments, ratings
from dotenv import load_dotenv

load_dotenv()

# We only create tables if they don't exist.
# However, you already have the existing MySQL tables created by Prisma.
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="LMS API Migration")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/auth", tags=["auth"])
app.include_router(courses.router, prefix="/api/subjects", tags=["subjects"])
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

# Comments are split into video comments and general comments
app.include_router(comments.video_comments_router, prefix="/api/videos/{videoId}/comments", tags=["comments"])
app.include_router(comments.comments_router, prefix="/api/comments", tags=["comments"])

# Reviews
app.include_router(ratings.router, prefix="/api/subjects/{subjectId}/reviews", tags=["reviews"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Server is running"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the LMS API! Go to /docs for the API documentation."}
