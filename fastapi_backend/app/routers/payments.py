import os
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Subject, Purchase, Enrollment, Notification
from ..auth import get_current_user
from pydantic import BaseModel
import hmac
import hashlib

try:
    import razorpay
except ImportError:
    razorpay = None # Need user to install

router = APIRouter()

class OrderRequest(BaseModel):
    course_id: str

@router.post("/create-order")
def create_order(req: OrderRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Subject).filter(Subject.id == req.course_id).first()
    if not course:
        raise HTTPException(404, "Course not found")
        
    if course.price <= 0:
        raise HTTPException(400, "Course is free, cannot create payment order")
        
    existing_purchase = db.query(Purchase).filter(
        Purchase.userId == current_user.id,
        Purchase.subjectId == req.course_id,
        Purchase.status == "completed"
    ).first()
    if existing_purchase:
        raise HTTPException(400, "Already purchased")

    KEY_ID = os.getenv("RAZORPAY_KEY_ID")
    KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
    
    if not KEY_ID or not KEY_SECRET:
        raise HTTPException(500, "Razorpay keys not configured")
        
    if not razorpay:
        raise HTTPException(500, "razorpay module not installed")

    client = razorpay.Client(auth=(KEY_ID, KEY_SECRET))
    
    # Amount in paise
    amount = course.price * 100
    
    order = client.order.create({
        "amount": amount,
        "currency": "INR",
        "payment_capture": 1
    })
    
    # Save pending purchase
    purchase = Purchase(
        userId=current_user.id,
        subjectId=course.id,
        amount=course.price,
        razorpayOrderId=order["id"],
        status="pending"
    )
    db.add(purchase)
    db.commit()
    
    return {
        "order_id": order["id"],
        "amount": amount,
        "currency": "INR",
        "key": KEY_ID,
        "course_title": course.title,
        "student_name": current_user.name
    }

class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    course_id: str

@router.post("/verify")
def verify_payment(req: VerifyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
    if not KEY_SECRET:
        raise HTTPException(500, "Razorpay secret not configured")
        
    msg = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
    expected = hmac.new(KEY_SECRET.encode(), msg.encode(), hashlib.sha256).hexdigest()
    
    if expected != req.razorpay_signature:
        raise HTTPException(400, "Invalid payment signature")
        
    purchase = db.query(Purchase).filter(
        Purchase.razorpayOrderId == req.razorpay_order_id,
        Purchase.userId == current_user.id
    ).first()
    
    if not purchase:
        raise HTTPException(404, "Purchase record not found")
        
    purchase.status = "completed"
    purchase.razorpayPaymentId = req.razorpay_payment_id
    purchase.razorpaySignature = req.razorpay_signature
    
    # Enroll student
    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.userId == current_user.id,
        Enrollment.subjectId == req.course_id
    ).first()
    
    if not existing_enrollment:
        enrollment = Enrollment(userId=current_user.id, subjectId=req.course_id)
        db.add(enrollment)
        
    course = db.query(Subject).filter(Subject.id == req.course_id).first()
    
    notif = Notification(
        userId=current_user.id,
        type="new_offer",
        message=f"You successfully purchased {course.title if course else 'the course'}!"
    )
    db.add(notif)
    
    db.commit()
    return {"success": True, "course_id": req.course_id}

@router.get("/my-purchases")
def get_my_purchases(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    purchases = db.query(Purchase).filter(
        Purchase.userId == current_user.id,
        Purchase.status == "completed"
    ).all()
    
    res = []
    for p in purchases:
        course = db.query(Subject).filter(Subject.id == p.subjectId).first()
        res.append({
            "id": p.id,
            "course_id": p.subjectId,
            "course_name": course.title if course else "Unknown",
            "amount_paid": p.amount,
            "purchase_date": p.purchasedAt
        })
    return res
