from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Certificate, Subject, VideoProgress, Video, Section
from ..auth import get_current_user
import os
from tempfile import NamedTemporaryFile

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import landscape, letter
    from reportlab.lib.units import inch
except ImportError:
    pass # Tell user to install reportlab

router = APIRouter()

@router.get("/")
def get_certificates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    certs = db.query(Certificate).filter(Certificate.userId == current_user.id).all()
    res = []
    for cert in certs:
        subject = db.query(Subject).filter(Subject.id == cert.subjectId).first()
        
        total_videos = db.query(func.count(Video.id)).join(Section).filter(Section.subjectId == cert.subjectId).scalar() or 0
        completed_videos = db.query(func.count(VideoProgress.id)).join(Video).join(Section).filter(
            VideoProgress.userId == current_user.id,
            Section.subjectId == cert.subjectId,
            VideoProgress.isCompleted == True
        ).scalar() or 0
        
        res.append({
            "id": cert.id,
            "course_id": cert.subjectId,
            "course_title": subject.title if subject else "Unknown",
            "issued_at": cert.issuedAt,
            "certificate_code": cert.certificateCode,
            "total_lessons": total_videos,
            "completed_lessons": completed_videos
        })
    return res

@router.get("/{course_id}/download")
def download_certificate(course_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cert = db.query(Certificate).filter(
        Certificate.userId == current_user.id,
        Certificate.subjectId == course_id
    ).first()

    if not cert:
        raise HTTPException(status_code=403, detail="Course not completed or certificate not found")

    subject = db.query(Subject).filter(Subject.id == course_id).first()
    title = subject.title if subject else "Unknown Course"

    try:
        tmp = NamedTemporaryFile(delete=False, suffix=".pdf")
        tmp.close()
        
        c = canvas.Canvas(tmp.name, pagesize=landscape(letter))
        c.setFont("Helvetica-Bold", 36)
        c.drawCentredString(letter[1]/2.0, 500, "Learning Platform")
        
        c.setFont("Helvetica-Bold", 28)
        c.drawCentredString(letter[1]/2.0, 420, "Certificate of Completion")
        
        c.setFont("Helvetica", 18)
        c.drawCentredString(letter[1]/2.0, 360, f"This certifies that {current_user.name} has successfully completed")
        
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(letter[1]/2.0, 300, title)
        
        c.setFont("Helvetica", 14)
        c.drawCentredString(letter[1]/2.0, 200, f"Issue Date: {cert.issuedAt.strftime('%B %d, %Y')}")
        c.drawCentredString(letter[1]/2.0, 170, f"Certificate Code: {cert.certificateCode}")
        
        c.save()
        
        return FileResponse(tmp.name, media_type="application/pdf", filename=f"Certificate_{course_id}.pdf")
    except NameError:
        raise HTTPException(status_code=500, detail="reportlab not installed. Please pip install reportlab")
