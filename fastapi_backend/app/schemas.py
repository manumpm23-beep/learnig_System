from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserRegister(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    dateOfBirth: Optional[datetime] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    currentStudying: Optional[str] = None
    pastStudy: Optional[str] = None
    linkedinUrl: Optional[str] = None
    githubUrl: Optional[str] = None
    profilePhoto: Optional[str] = None

class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    user: UserResponse
    accessToken: str

class VideoSummarySchema(BaseModel):
    id: str
    title: str
    orderIndex: int
    isCompleted: Optional[bool] = False
    locked: Optional[bool] = False

class SectionTreeSchema(BaseModel):
    id: str
    title: str
    orderIndex: int
    videos: List[VideoSummarySchema] = []

class SubjectTreeSchema(BaseModel):
    id: str
    title: str
    sections: List[SectionTreeSchema] = []

class SubjectResponseSchema(BaseModel):
    id: str
    title: str
    slug: str
    description: Optional[str] = None
    thumbnailUrl: Optional[str] = None
    instructorName: Optional[str] = None
    instructorPhoto: Optional[str] = None
    category: Optional[str] = None
    whatYouWillLearn: Optional[str] = None
    enrollmentCount: int = 0
    averageRating: float = 0
    totalReviews: int = 0
    totalVideos: int = 0
    totalDuration: int = 0
    createdAt: datetime

class PaginatedSubjects(BaseModel):
    data: List[SubjectResponseSchema]
    totalCount: int
    currentPage: int
    totalPages: int

class SubjectDetailSchema(BaseModel):
    id: str
    title: str
    slug: str
    description: Optional[str] = None
    thumbnailUrl: Optional[str] = None
    instructorName: Optional[str] = None
    instructorPhoto: Optional[str] = None
    category: Optional[str] = None
    whatYouWillLearn: Optional[str] = None
    isPublished: bool
    createdAt: datetime
    updatedAt: datetime
    averageRating: float
    totalReviews: int
    ratingBreakdown: Dict[str, int]

class CommentCreate(BaseModel):
    content: str
    parentId: Optional[int] = None

class ReviewCreate(BaseModel):
    rating: int
    review: Optional[str] = None

class VideoProgressUpdate(BaseModel):
    lastPositionSeconds: int
    isCompleted: bool
