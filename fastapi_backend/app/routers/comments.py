from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Comment, CommentUpvote, Video
from ..auth import get_current_user
from ..schemas import CommentCreate

video_comments_router = APIRouter()
comments_router = APIRouter()

@video_comments_router.get("/")
def get_video_comments(videoId: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(
        Comment.videoId == videoId,
        Comment.parentId == None
    ).order_by(Comment.isPinned.desc(), Comment.createdAt.desc()).all()

    response_data = []
    for c in comments:
        upvotes_count = db.query(func.count(CommentUpvote.id)).filter(CommentUpvote.commentId == c.id).scalar()
        user_upvoted = db.query(CommentUpvote).filter(CommentUpvote.commentId == c.id, CommentUpvote.userId == current_user.id).first() is not None
        replies_count = db.query(func.count(Comment.id)).filter(Comment.parentId == c.id).scalar()
        
        response_data.append({
            "id": str(c.id),
            "content": c.content,
            "isPinned": c.isPinned,
            "isEdited": c.isEdited,
            "createdAt": c.createdAt,
            "user": {
                "id": c.user.id,
                "name": c.user.name,
                "profilePhoto": c.user.profilePhoto
            },
            "upvotesCount": upvotes_count,
            "hasUpvoted": user_upvoted,
            "repliesCount": replies_count
        })

    return {"data": response_data}

@video_comments_router.post("/")
def create_comment(videoId: str, comment_in: CommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == videoId).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    new_comment = Comment(
        videoId=videoId,
        userId=current_user.id,
        content=comment_in.content,
        parentId=comment_in.parentId
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "id": str(new_comment.id),
        "content": new_comment.content,
        "createdAt": new_comment.createdAt,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "profilePhoto": current_user.profilePhoto
        }
    }

@comments_router.put("/{commentId}")
def update_comment(commentId: int, comment_in: CommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Comment).filter(Comment.id == commentId).first()
    if not c:
        raise HTTPException(status_code=404, detail="Comment not found")
    if c.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    c.content = comment_in.content
    c.isEdited = True
    db.commit()

    return {"message": "Comment updated successfully"}

@comments_router.delete("/{commentId}")
def delete_comment(commentId: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Comment).filter(Comment.id == commentId).first()
    if not c:
        raise HTTPException(status_code=404, detail="Comment not found")
    if c.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(c)
    db.commit()
    return {"message": "Comment deleted successfully"}

@comments_router.post("/{commentId}/upvote")
def toggle_upvote(commentId: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Comment).filter(Comment.id == commentId).first()
    if not c:
        raise HTTPException(status_code=404, detail="Comment not found")

    existing = db.query(CommentUpvote).filter(CommentUpvote.commentId == commentId, CommentUpvote.userId == current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Upvote removed"}
    else:
        new_upvote = CommentUpvote(commentId=commentId, userId=current_user.id)
        db.add(new_upvote)
        db.commit()
        return {"message": "Upvote added"}

@comments_router.post("/{commentId}/pin")
def toggle_pin(commentId: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Comment).filter(Comment.id == commentId).first()
    if not c:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # In a real scenario, check if the current user is the course creator
    c.isPinned = not c.isPinned
    db.commit()
    return {"message": "Pin status toggled", "isPinned": c.isPinned}

@comments_router.get("/{commentId}/replies")
def get_comment_replies(commentId: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    replies = db.query(Comment).filter(Comment.parentId == commentId).order_by(Comment.createdAt.asc()).all()

    response_data = []
    for r in replies:
        upvotes_count = db.query(func.count(CommentUpvote.id)).filter(CommentUpvote.commentId == r.id).scalar()
        user_upvoted = db.query(CommentUpvote).filter(CommentUpvote.commentId == r.id, CommentUpvote.userId == current_user.id).first() is not None

        response_data.append({
            "id": str(r.id),
            "content": r.content,
            "isEdited": r.isEdited,
            "createdAt": r.createdAt,
            "user": {
                "id": r.user.id,
                "name": r.user.name,
                "profilePhoto": r.user.profilePhoto
            },
            "upvotesCount": upvotes_count,
            "hasUpvoted": user_upvoted
        })

    return {"data": response_data}
