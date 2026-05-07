from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from ..database import get_db
from ..models import User, Enrollment, Subject, VideoProgress, Review, Video, Section
from ..auth import get_current_user

router = APIRouter()

@router.get("/")
def get_dashboard_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from datetime import datetime, timedelta

    enrollments = (
        db.query(Enrollment)
        .filter(Enrollment.userId == current_user.id)
        .order_by(desc(Enrollment.createdAt))
        .all()
    )

    enrolled_courses = []
    total_completed_courses = 0
    total_watched_seconds = 0

    for enr in enrollments:
        sub = db.query(Subject).filter(Subject.id == enr.subjectId).first()
        if not sub:
            continue

        total_videos = (
            db.query(func.count(Video.id))
            .join(Section, Section.id == Video.sectionId)
            .filter(Section.subjectId == sub.id)
            .scalar()
        ) or 0

        completed_videos = (
            db.query(func.count(VideoProgress.id))
            .join(Video, Video.id == VideoProgress.videoId)
            .join(Section, Section.id == Video.sectionId)
            .filter(
                VideoProgress.userId == current_user.id,
                Section.subjectId == sub.id,
                VideoProgress.isCompleted == True,
            )
            .scalar()
        ) or 0

        percent_complete = round((completed_videos / total_videos) * 100) if total_videos > 0 else 0
        is_completed = total_videos > 0 and completed_videos >= total_videos

        if is_completed:
            total_completed_courses += 1

        # last watched video in this subject (by latest progress update)
        last_progress = (
            db.query(VideoProgress)
            .join(Video, Video.id == VideoProgress.videoId)
            .join(Section, Section.id == Video.sectionId)
            .filter(VideoProgress.userId == current_user.id, Section.subjectId == sub.id)
            .order_by(desc(VideoProgress.updatedAt))
            .first()
        )
        last_watched_video_id = last_progress.videoId if last_progress else None

        # watched time approximation: sum duration of completed videos
        watched_seconds_for_subject = (
            db.query(func.coalesce(func.sum(Video.durationSeconds), 0))
            .join(VideoProgress, VideoProgress.videoId == Video.id)
            .join(Section, Section.id == Video.sectionId)
            .filter(
                VideoProgress.userId == current_user.id,
                Section.subjectId == sub.id,
                VideoProgress.isCompleted == True,
            )
            .scalar()
        ) or 0
        total_watched_seconds += int(watched_seconds_for_subject or 0)

        enrolled_courses.append(
            {
                "subjectId": sub.id,
                "title": sub.title,
                "slug": sub.slug,
                "thumbnailUrl": sub.thumbnailUrl,
                "category": sub.category,
                "instructorName": sub.instructorName,
                "enrolledAt": enr.createdAt,
                "totalVideos": total_videos,
                "completedVideos": completed_videos,
                "percentComplete": percent_complete,
                "isCompleted": is_completed,
                "lastWatchedVideoId": last_watched_video_id,
            }
        )

    # Completed dates (for streak calendar): dates of completed videos
    completed_rows = (
        db.query(VideoProgress.completedAt)
        .filter(
            VideoProgress.userId == current_user.id,
            VideoProgress.isCompleted == True,
            VideoProgress.completedAt != None,
        )
        .all()
    )
    completed_dates_set = set()
    for (dt,) in completed_rows:
        try:
            completed_dates_set.add(dt.date().isoformat())
        except Exception:
            pass
    completed_dates = sorted(list(completed_dates_set))

    # Current streak: consecutive active days ending today
    today = datetime.utcnow().date()
    streak = 0
    cursor = today
    while cursor.isoformat() in completed_dates_set:
        streak += 1
        cursor = cursor - timedelta(days=1)

    total_hours_watched = round(total_watched_seconds / 3600, 1) if total_watched_seconds > 0 else 0

    total_reviews = (
        db.query(func.count(Review.id))
        .filter(Review.userId == current_user.id)
        .scalar()
    ) or 0

    return {
        "user": {"name": current_user.name, "email": current_user.email},
        "enrolledCourses": enrolled_courses,
        "recentlyWatched": [],
        "stats": {
            "totalEnrolledCourses": len(enrolled_courses),
            "totalCompletedCourses": total_completed_courses,
            "totalHoursWatched": total_hours_watched,
            "currentStreak": streak,
            "completedDates": completed_dates,
            "totalReviews": total_reviews,
        },
    }
