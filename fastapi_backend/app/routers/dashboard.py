from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Enrollment, Subject, VideoProgress, Review
from ..auth import get_current_user

router = APIRouter()

@router.get("/")
def get_dashboard_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    enrollments = db.query(Enrollment).filter(Enrollment.userId == current_user.id).all()
    
    enrolled_courses = []
    for enr in enrollments:
        sub = db.query(Subject).filter(Subject.id == enr.subjectId).first()
        if sub:
            enrolled_courses.append({
                "subjectId": sub.id,
                "title": sub.title,
                "slug": sub.slug,
                "thumbnailUrl": sub.thumbnailUrl,
                "category": sub.category,
                "instructorName": sub.instructorName,
                "enrolledAt": enr.createdAt,
                "totalVideos": 10,  # Mocked or calculate real
                "completedVideos": 0,
                "percentComplete": 0,
                "isCompleted": False,
                "lastWatchedVideoId": None
            })
            
    completed_videos = db.query(func.count(VideoProgress.id)).filter(
        VideoProgress.userId == current_user.id,
        VideoProgress.isCompleted == True
    ).scalar()
    
    total_reviews = db.query(func.count(Review.id)).filter(Review.userId == current_user.id).scalar()
    
    return {
        "user": {
            "name": current_user.name,
            "email": current_user.email
        },
        "enrolledCourses": enrolled_courses,
        "recentlyWatched": [],
        "stats": {
            "totalEnrolledCourses": len(enrolled_courses),
            "totalCompletedCourses": 0,
            "totalHoursWatched": 0,
            "currentStreak": 0,
            "completedDates": []
        }
    }
