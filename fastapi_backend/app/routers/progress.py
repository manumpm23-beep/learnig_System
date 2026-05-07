from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, VideoProgress, Subject, Section, Video, Enrollment, Certificate, Notification
from ..auth import get_current_user
from ..schemas import VideoProgressUpdate
import uuid

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
        if progress_in.lastPositionSeconds is not None:
            progress.lastPositionSeconds = progress_in.lastPositionSeconds
        if progress_in.isCompleted and not progress.isCompleted:
            progress.isCompleted = True
            progress.completedAt = datetime.utcnow()
    else:
        progress = VideoProgress(
            userId=current_user.id,
            videoId=videoId,
            lastPositionSeconds=progress_in.lastPositionSeconds or 0,
            isCompleted=bool(progress_in.isCompleted),
            completedAt=datetime.utcnow() if progress_in.isCompleted else None
        )
        db.add(progress)
        
    db.commit()
    db.refresh(progress)

    # Certificate Logic
    if progress_in.isCompleted:
        # Find subject of the video
        video = db.query(Video).filter(Video.id == videoId).first()
        if video:
            section = db.query(Section).filter(Section.id == video.sectionId).first()
            if section:
                subject_id = section.subjectId
                
                total_videos = db.query(func.count(Video.id)).join(Section).filter(Section.subjectId == subject_id).scalar()
                completed_videos = db.query(func.count(VideoProgress.id)).join(Video).join(Section).filter(
                    VideoProgress.userId == current_user.id,
                    Section.subjectId == subject_id,
                    VideoProgress.isCompleted == True
                ).scalar()

                if total_videos > 0 and completed_videos >= total_videos:
                    # Check if certificate exists
                    existing_cert = db.query(Certificate).filter(
                        Certificate.userId == current_user.id,
                        Certificate.subjectId == subject_id
                    ).first()
                    
                    if not existing_cert:
                        # Create certificate
                        count_certs = db.query(func.count(Certificate.id)).scalar() or 0
                        cert_code = f"LP-{datetime.utcnow().year}-{(count_certs + 1):04d}"
                        
                        cert = Certificate(
                            userId=current_user.id,
                            subjectId=subject_id,
                            certificateCode=cert_code
                        )
                        db.add(cert)
                        
                        subject = db.query(Subject).filter(Subject.id == subject_id).first()
                        subj_title = subject.title if subject else "a course"
                        
                        notif = Notification(
                            userId=current_user.id,
                            type="achievement_unlocked",
                            message=f"Congratulations! You've earned a certificate for {subj_title}."
                        )
                        db.add(notif)
                        
                        db.commit()

    return {"message": "Progress updated successfully"}
