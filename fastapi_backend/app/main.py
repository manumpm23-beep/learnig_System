import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import users, courses, videos, progress, dashboard, comments, ratings, notifications, certificates, admin, payments
from dotenv import load_dotenv

load_dotenv()

# We only create tables if they don't exist.
from sqlalchemy import text
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Alter User table to add role if not exists
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE User ADD COLUMN role VARCHAR(50) DEFAULT 'student' NOT NULL;"))
    except Exception:
        pass # Probably already exists
        
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE Subject ADD COLUMN price INT DEFAULT 0 NOT NULL;"))
    except Exception:
        pass

    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE Subject MODIFY thumbnailUrl LONGTEXT;"))
    except Exception:
        pass
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="LMS API Migration", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://learnig-system-frontend.vercel.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*",
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

# Notifications
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])

# Certificates
app.include_router(certificates.router, prefix="/api/certificates", tags=["certificates"])

# Admin
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

# Payments
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Server is running"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the LMS API! Go to /docs for the API documentation."}
