from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, VideoProgress, Subject, Section, Video, Enrollment
from ..auth import get_current_user
from ..schemas import VideoProgressUpdate

router = APIRouter()

@router.get("/subjects/{subjectId}")
def get_subject_progress(subjectId: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subject = db.query(Subject).filter(Subject.id == subjectId).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    total_videos = db.query(func.count(Video.id)).join(Section).filter(Section.subjectId == subjectId).scalar()
    
    completed_videos = db.query(func.count(VideoProgress.id)).join(Video).join(Section).filter(
        VideoProgress.userId == current_user.id,
        Section.subjectId == subjectId,
        VideoProgress.isCompleted == True
    ).scalar()

    percentage = round((completed_videos / total_videos) * 100) if total_videos > 0 else 0

    return {
        "subjectId": subjectId,
        "totalVideos": total_videos,
        "completedVideos": completed_videos,
        "percentage": percentage
    }

@router.get("/videos/{videoId}")
def get_video_progress(videoId: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress = db.query(VideoProgress).filter(
        VideoProgress.userId == current_user.id,
        VideoProgress.videoId == videoId
    ).first()
    
    if not progress:
        return {"lastPositionSeconds": 0, "isCompleted": False}

    return {
        "lastPositionSeconds": progress.lastPositionSeconds,
        "isCompleted": progress.isCompleted
    }

@router.post("/videos/{videoId}")
def upsert_video_progress(videoId: str, progress_in: VideoProgressUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from datetime import datetime
    
    progress = db.query(VideoProgress).filter(
        VideoProgress.userId == current_user.id,
        VideoProgress.videoId == videoId
    ).first()
    
    if progress:
        progress.lastPositionSeconds = progress_in.lastPositionSeconds
        if progress_in.isCompleted and not progress.isCompleted:
            progress.isCompleted = True
            progress.completedAt = datetime.utcnow()
    else:
        progress = VideoProgress(
            userId=current_user.id,
            videoId=videoId,
            lastPositionSeconds=progress_in.lastPositionSeconds,
            isCompleted=progress_in.isCompleted,
            completedAt=datetime.utcnow() if progress_in.isCompleted else None
        )
        db.add(progress)
        
    db.commit()
    db.refresh(progress)

    return {"message": "Progress updated successfully"}
