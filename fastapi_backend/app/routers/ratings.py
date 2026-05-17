from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Review, Subject
from ..auth import get_current_user
from ..schemas import ReviewCreate

router = APIRouter()

@router.get("/")
def get_subject_reviews(subjectId: str, page: int = Query(1), limit: int = Query(5), db: Session = Depends(get_db)):
    query = db.query(Review).filter(Review.subjectId == subjectId)
    total_count = query.count()
    
    reviews = query.order_by(Review.createdAt.desc()).offset((page - 1) * limit).limit(limit).all()

    response_data = []
    for r in reviews:
        response_data.append({
            "id": str(r.id),
            "rating": r.rating,
            "review": r.review,
            "isEdited": r.isEdited,
            "createdAt": r.createdAt,
            "user": {
                "id": r.user.id,
                "name": r.user.name,
                "profilePhoto": r.user.profilePhoto
            }
        })

    all_reviews = query.all()
    sum_rating = 0
    rating_breakdown = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
    
    for r in all_reviews:
        sum_rating += r.rating
        key = str(r.rating)
        if key in rating_breakdown:
            rating_breakdown[key] += 1
            
    average_rating = round(sum_rating / total_count, 1) if total_count > 0 else 0

    import math
    return {
        "reviews": response_data,
        "averageRating": average_rating,
        "totalReviews": total_count,
        "ratingBreakdown": rating_breakdown,
        "currentPage": page,
        "totalPages": math.ceil(total_count / limit) if limit > 0 else 0
    }

@router.get("/my-review")
def get_my_review(subjectId: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.subjectId == subjectId, Review.userId == current_user.id).first()
    if not review:
        return None
    return {
        "id": str(review.id),
        "rating": review.rating,
        "review": review.review,
        "isEdited": review.isEdited,
        "createdAt": review.createdAt
    }

@router.post("/")
def create_review(subjectId: str, review_in: ReviewCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(Subject).filter(Subject.id == subjectId).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")

    existing = db.query(Review).filter(Review.subjectId == subjectId, Review.userId == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already exists")

    new_review = Review(
        subjectId=subjectId,
        userId=current_user.id,
        rating=review_in.rating,
        review=review_in.review
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {"message": "Review created successfully"}

@router.put("/")
def update_review(subjectId: str, review_in: ReviewCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    r = db.query(Review).filter(Review.subjectId == subjectId, Review.userId == current_user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Review not found")

    r.rating = review_in.rating
    r.review = review_in.review
    r.isEdited = True
    db.commit()

    return {"message": "Review updated successfully"}

@router.delete("/")
def delete_review(subjectId: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    r = db.query(Review).filter(Review.subjectId == subjectId, Review.userId == current_user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Review not found")

    db.delete(r)
    db.commit()

    return {"message": "Review deleted successfully"}
