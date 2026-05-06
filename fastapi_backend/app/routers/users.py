from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, RefreshToken
from ..schemas import UserRegister, UserLogin, AuthResponse, UserResponse
from ..auth import get_password_hash, verify_password, create_access_token, generate_refresh_token_string, hash_refresh_token, get_current_user
from datetime import datetime, timedelta
from ..models import Notification

router = APIRouter()

@router.post("/register")
def register(user_in: UserRegister, response: Response, db: Session = Depends(get_db)):
    if not user_in.email or not user_in.password or not user_in.name:
        raise HTTPException(status_code=400, detail="Email, password, and name are required")
    
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(email=user_in.email, password_hash=hashed_pwd, name=user_in.name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    welcome_notification = Notification(
        userId=new_user.id,
        type="welcome",
        message="Welcome to the Learning Platform! Start exploring courses today."
    )
    db.add(welcome_notification)
    db.commit()

    access_token = create_access_token(user_id=new_user.id)
    refresh_token_raw = generate_refresh_token_string()
    refresh_token_hashed = hash_refresh_token(refresh_token_raw)
    
    expires_at = datetime.utcnow() + timedelta(days=30)
    rt = RefreshToken(userId=new_user.id, tokenHash=refresh_token_hashed, expiresAt=expires_at)
    db.add(rt)
    db.commit()

    response.set_cookie(
        key="refreshToken",
        value=refresh_token_raw,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=30 * 24 * 60 * 60
    )

    return {
        "user": {"id": new_user.id, "email": new_user.email, "name": new_user.name, "role": new_user.role},
        "accessToken": access_token
    }

@router.post("/login")
def login(user_in: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    access_token = create_access_token(user_id=user.id)
    refresh_token_raw = generate_refresh_token_string()
    refresh_token_hashed = hash_refresh_token(refresh_token_raw)

    expires_at = datetime.utcnow() + timedelta(days=30)
    rt = RefreshToken(userId=user.id, tokenHash=refresh_token_hashed, expiresAt=expires_at)
    db.add(rt)
    db.commit()

    response.set_cookie(
        key="refreshToken",
        value=refresh_token_raw,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=30 * 24 * 60 * 60
    )

    return {
        "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role},
        "accessToken": access_token
    }

@router.post("/refresh")
def refresh(request: Request, db: Session = Depends(get_db)):
    refresh_token_raw = request.cookies.get("refreshToken")
    if not refresh_token_raw:
        raise HTTPException(status_code=401, detail="No refresh token provided in cookies")
    
    token_hash = hash_refresh_token(refresh_token_raw)
    stored_token = db.query(RefreshToken).filter(
        RefreshToken.tokenHash == token_hash,
        RefreshToken.revokedAt == None,
        RefreshToken.expiresAt > datetime.utcnow()
    ).first()

    if not stored_token:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
    access_token = create_access_token(user_id=stored_token.userId)
    return {"accessToken": access_token}

@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token_raw = request.cookies.get("refreshToken")
    if refresh_token_raw:
        token_hash = hash_refresh_token(refresh_token_raw)
        db.query(RefreshToken).filter(RefreshToken.tokenHash == token_hash).update({"revokedAt": datetime.utcnow()})
        db.commit()
    
    response.delete_cookie("refreshToken")
    return {"message": "Logged out successfully"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "phone": current_user.phone,
        "dateOfBirth": current_user.dateOfBirth,
        "location": current_user.location,
        "bio": current_user.bio,
        "currentStudying": current_user.currentStudying,
        "pastStudy": current_user.pastStudy,
        "linkedinUrl": current_user.linkedinUrl,
        "githubUrl": current_user.githubUrl,
        "profilePhoto": current_user.profilePhoto,
        "role": current_user.role,
        "createdAt": current_user.createdAt,
        "updatedAt": current_user.updatedAt,
    }
    return {"user": user_data}
