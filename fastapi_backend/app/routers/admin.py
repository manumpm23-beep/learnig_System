from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Subject, Enrollment, Purchase, generate_uuid
from ..auth import get_current_user
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    total_courses = db.query(func.count(Subject.id)).scalar() or 0
    total_students = db.query(func.count(User.id)).filter(User.role == "student").scalar() or 0
    
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year
    
    revenue_this_month = db.query(func.sum(Purchase.amount)).filter(
        Purchase.status == "completed",
        func.extract('month', Purchase.purchasedAt) == current_month,
        func.extract('year', Purchase.purchasedAt) == current_year
    ).scalar() or 0
    
    return {
        "total_courses": total_courses,
        "total_students": total_students,
        "revenue_this_month": revenue_this_month,
        "completion_rate": 85 # Mocked for now
    }

from typing import List

class VideoCreate(BaseModel):
    title: str
    youtube_url: str

class CourseCreate(BaseModel):
    title: str
    description: str = ""
    subject: str = "Frontend"
    difficulty: str = "Beginner"
    price: int = 0
    thumbnail_url: str = ""
    videos: List[VideoCreate] = []

@router.get("/courses")
def get_courses(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    courses = db.query(Subject).all()
    res = []
    for c in courses:
        students = db.query(func.count(Enrollment.id)).filter(Enrollment.subjectId == c.id).scalar() or 0
        res.append({
            "id": c.id,
            "title": c.title,
            "students": students,
            "price": c.price,
            "status": "published" if c.isPublished else "draft"
        })
    return res

@router.post("/courses")
def create_course(course: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    import re
    slug = re.sub(r'[^a-z0-9]+', '-', course.title.lower()).strip('-')
    # ensure unique slug
    base_slug = slug
    counter = 1
    while db.query(Subject).filter(Subject.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    new_course = Subject(
        title=course.title,
        slug=slug,
        description=course.description,
        thumbnailUrl=course.thumbnail_url,
        category=course.subject,
        isPublished=False,
        price=course.price
    )
    db.add(new_course)
    db.flush() # flush to get new_course.id

    if len(course.videos) > 0:
        from ..models import Section, Video
        # Create a default section
        new_section = Section(
            subjectId=new_course.id,
            title="Course Videos",
            orderIndex=1
        )
        db.add(new_section)
        db.flush()

        # Create multiple videos
        for i, vid in enumerate(course.videos):
            new_video = Video(
                sectionId=new_section.id,
                title=vid.title,
                youtubeUrl=vid.youtube_url,
                orderIndex=i + 1
            )
            db.add(new_video)

    db.commit()
    db.refresh(new_course)
    return new_course

@router.get("/courses/{id}")
def get_course(id: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    course = db.query(Subject).filter(Subject.id == id).first()
    if not course:
        raise HTTPException(404, "Course not found")
        
    from ..models import Section, Video
    videos_res = []
    sections = db.query(Section).filter(Section.subjectId == id).all()
    for s in sections:
        videos = db.query(Video).filter(Video.sectionId == s.id).order_by(Video.orderIndex).all()
        for v in videos:
            videos_res.append({"title": v.title, "youtube_url": v.youtubeUrl})
            
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "subject": course.category,
        "difficulty": "Beginner", 
        "price": course.price,
        "thumbnail_url": course.thumbnailUrl,
        "videos": videos_res if len(videos_res) > 0 else [{"title": "", "youtube_url": ""}]
    }

@router.put("/courses/{id}")
def update_course(id: str, course_data: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    course = db.query(Subject).filter(Subject.id == id).first()
    if not course:
        raise HTTPException(404, "Course not found")
        
    course.title = course_data.title
    course.description = course_data.description
    course.category = course_data.subject
    course.price = course_data.price
    if course_data.thumbnail_url:
        course.thumbnailUrl = course_data.thumbnail_url
        
    from ..models import Section, Video, VideoProgress, Comment, CommentUpvote
    
    sections = db.query(Section).filter(Section.subjectId == id).all()
    for s in sections:
        videos = db.query(Video).filter(Video.sectionId == s.id).all()
        for v in videos:
            db.query(VideoProgress).filter(VideoProgress.videoId == v.id).delete(synchronize_session=False)
            comments = db.query(Comment).filter(Comment.videoId == v.id).all()
            comment_ids = [c.id for c in comments]
            if comment_ids:
                db.query(CommentUpvote).filter(CommentUpvote.commentId.in_(comment_ids)).delete(synchronize_session=False)
                db.query(Comment).filter(Comment.videoId == v.id).update({"parentId": None}, synchronize_session=False)
                db.query(Comment).filter(Comment.videoId == v.id).delete(synchronize_session=False)
            db.delete(v)
        db.delete(s)
        
    if len(course_data.videos) > 0:
        new_section = Section(
            subjectId=course.id,
            title="Course Videos",
            orderIndex=1
        )
        db.add(new_section)
        db.flush()
        
        for i, vid in enumerate(course_data.videos):
            new_video = Video(
                sectionId=new_section.id,
                title=vid.title,
                youtubeUrl=vid.youtube_url,
                orderIndex=i + 1
            )
            db.add(new_video)
            
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error during update: {str(e)}")
        
    return {"message": "Course updated"}

class CourseStatusUpdate(BaseModel):
    status: str

@router.patch("/courses/{id}/status")
def update_course_status(id: str, status_data: CourseStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    course = db.query(Subject).filter(Subject.id == id).first()
    if not course:
        raise HTTPException(404, "Course not found")
    course.isPublished = (status_data.status == "published")
    db.commit()
    return {"message": "Status updated"}

@router.delete("/courses/{id}")
def delete_course(id: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    course = db.query(Subject).filter(Subject.id == id).first()
    if not course:
        raise HTTPException(404, "Course not found")
        
    from ..models import Section, Video, Enrollment, Purchase, Certificate, Review, VideoProgress, Comment, CommentUpvote
    
    db.query(Enrollment).filter(Enrollment.subjectId == id).delete(synchronize_session=False)
    db.query(Purchase).filter(Purchase.subjectId == id).delete(synchronize_session=False)
    db.query(Certificate).filter(Certificate.subjectId == id).delete(synchronize_session=False)
    db.query(Review).filter(Review.subjectId == id).delete(synchronize_session=False)
    
    sections = db.query(Section).filter(Section.subjectId == id).all()
    for section in sections:
        videos = db.query(Video).filter(Video.sectionId == section.id).all()
        for video in videos:
            db.query(VideoProgress).filter(VideoProgress.videoId == video.id).delete(synchronize_session=False)
            comments = db.query(Comment).filter(Comment.videoId == video.id).all()
            comment_ids = [c.id for c in comments]
            if comment_ids:
                db.query(CommentUpvote).filter(CommentUpvote.commentId.in_(comment_ids)).delete(synchronize_session=False)
                db.query(Comment).filter(Comment.videoId == video.id).update({"parentId": None}, synchronize_session=False)
                db.query(Comment).filter(Comment.videoId == video.id).delete(synchronize_session=False)
            db.delete(video)
        db.delete(section)
        
    try:
        db.delete(course)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error during deletion: {str(e)}")
        
    return {"message": "Course deleted"}

@router.get("/students")
def get_students(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    students = db.query(User).filter(User.role == "student").all()
    res = []
    for s in students:
        enrolled_count = db.query(func.count(Enrollment.id)).filter(Enrollment.userId == s.id).scalar() or 0
        res.append({
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "enrolled_count": enrolled_count,
            "joined_at": s.createdAt
        })
    return res

@router.get("/payments")
def get_payments(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    purchases = db.query(Purchase).all()
    res = []
    for p in purchases:
        user = db.query(User).filter(User.id == p.userId).first()
        subject = db.query(Subject).filter(Subject.id == p.subjectId).first()
        res.append({
            "id": p.id,
            "student_name": user.name if user else "Unknown",
            "course_title": subject.title if subject else "Unknown",
            "amount": p.amount,
            "purchased_at": p.purchasedAt,
            "status": p.status
        })
    return res
