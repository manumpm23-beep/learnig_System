from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Video, Section, Subject, User, VideoProgress
from ..auth import get_current_user
from ..ordering import get_global_video_sequence

router = APIRouter()

@router.get("/{videoId}")
def get_video_by_id(videoId: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == videoId).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    section = db.query(Section).filter(Section.id == video.sectionId).first()
    subject = db.query(Subject).filter(Subject.id == section.subjectId).first()
    all_sections = db.query(Section).filter(Section.subjectId == subject.id).all()

    progress_records = db.query(VideoProgress).join(Video).join(Section).filter(
        VideoProgress.userId == current_user.id,
        Section.subjectId == subject.id
    ).all()
    progress_map = {p.videoId: p.isCompleted for p in progress_records}

    seq = get_global_video_sequence(all_sections, progress_map)

    current_index = -1
    for i, v in enumerate(seq):
        if v["id"] == videoId:
            current_index = i
            break
            
    if current_index == -1:
        raise HTTPException(status_code=404, detail="Video sequence anomaly")

    current_video = seq[current_index]

    previous_video_id = seq[current_index - 1]["id"] if current_index > 0 else None
    next_video_id = seq[current_index + 1]["id"] if current_index < len(seq) - 1 else None

    unlock_reason = None
    if current_video["locked"]:
        unlock_reason = "Previous video must be completed to unlock this content."

    return {
        "id": current_video["id"],
        "title": current_video["title"],
        "description": current_video["description"],
        "youtubeUrl": current_video["youtubeUrl"],
        "orderIndex": current_video["orderIndex"],
        "durationSeconds": current_video["durationSeconds"],
        "sectionId": section.id,
        "sectionTitle": section.title,
        "subjectId": subject.id,
        "subjectTitle": subject.title,
        "previousVideoId": previous_video_id,
        "nextVideoId": next_video_id,
        "locked": current_video["locked"],
        "unlockReason": unlock_reason
    }
