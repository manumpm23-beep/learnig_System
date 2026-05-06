from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Notification, User
from ..auth import get_current_user
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class NotificationResponse(BaseModel):
    id: str
    type: str
    message: str
    is_read: bool
    createdAt: datetime

    class Config:
        orm_mode = True

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifications = db.query(Notification).filter(Notification.userId == current_user.id).order_by(Notification.createdAt.desc()).all()
    return notifications

@router.patch("/read-all")
def mark_all_as_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Notification).filter(
        Notification.userId == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
