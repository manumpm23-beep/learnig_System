import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, BigInteger, Boolean, DateTime, ForeignKey, Text, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "User"

    id = Column(String(191), primary_key=True, default=generate_uuid)
    email = Column(String(191), unique=True, nullable=False)
    password_hash = Column(String(191), nullable=False)
    name = Column(String(191), nullable=False)
    phone = Column(String(191), nullable=True)
    dateOfBirth = Column(DateTime, nullable=True)
    location = Column(String(191), nullable=True)
    bio = Column(String(300), nullable=True)
    currentStudying = Column(String(191), nullable=True)
    pastStudy = Column(String(191), nullable=True)
    linkedinUrl = Column(String(191), nullable=True)
    githubUrl = Column(String(191), nullable=True)
    profilePhoto = Column(String(191), nullable=True)
    role = Column(String(50), default="student", nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    enrollments = relationship("Enrollment", back_populates="user")
    videoProgress = relationship("VideoProgress", back_populates="user")
    refreshTokens = relationship("RefreshToken", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    commentUpvotes = relationship("CommentUpvote", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")
    purchases = relationship("Purchase", back_populates="user")

class Subject(Base):
    __tablename__ = "Subject"

    id = Column(String(191), primary_key=True, default=generate_uuid)
    title = Column(String(191), nullable=False)
    slug = Column(String(191), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    thumbnailUrl = Column(String(191), nullable=True)
    instructorName = Column(String(191), nullable=True)
    instructorPhoto = Column(String(191), nullable=True)
    category = Column(String(191), nullable=True)
    whatYouWillLearn = Column(Text, nullable=True)
    isPublished = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    sections = relationship("Section", back_populates="subject")
    enrollments = relationship("Enrollment", back_populates="subject")
    reviews = relationship("Review", back_populates="subject")
    certificates = relationship("Certificate", back_populates="subject")
    purchases = relationship("Purchase", back_populates="subject")
    price = Column(Integer, default=0, nullable=False)

class Section(Base):
    __tablename__ = "Section"

    id = Column(String(191), primary_key=True, default=generate_uuid)
    subjectId = Column(String(191), ForeignKey("Subject.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(191), nullable=False)
    orderIndex = Column(Integer, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    subject = relationship("Subject", back_populates="sections")
    videos = relationship("Video", back_populates="section")

    __table_args__ = (UniqueConstraint('subjectId', 'orderIndex', name='Section_subjectId_orderIndex_key'),)

class Video(Base):
    __tablename__ = "Video"

    id = Column(String(191), primary_key=True, default=generate_uuid)
    sectionId = Column(String(191), ForeignKey("Section.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(191), nullable=False)
    description = Column(Text, nullable=True)
    youtubeUrl = Column(String(191), nullable=False)
    orderIndex = Column(Integer, nullable=False)
    durationSeconds = Column(Integer, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    section = relationship("Section", back_populates="videos")
    videoProgress = relationship("VideoProgress", back_populates="video")
    comments = relationship("Comment", back_populates="video")

    __table_args__ = (UniqueConstraint('sectionId', 'orderIndex', name='Video_sectionId_orderIndex_key'),)

class Enrollment(Base):
    __tablename__ = "Enrollment"

    id = Column(String(191), primary_key=True, default=generate_uuid)
    userId = Column(String(191), ForeignKey("User.id", ondelete="RESTRICT"), nullable=False)
    subjectId = Column(String(191), ForeignKey("Subject.id", ondelete="RESTRICT"), nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="enrollments")
    subject = relationship("Subject", back_populates="enrollments")

    __table_args__ = (UniqueConstraint('userId', 'subjectId', name='Enrollment_userId_subjectId_key'),)

class VideoProgress(Base):
    __tablename__ = "VideoProgress"

    id = Column(String(191), primary_key=True, default=generate_uuid)
    userId = Column(String(191), ForeignKey("User.id", ondelete="RESTRICT"), nullable=False)
    videoId = Column(String(191), ForeignKey("Video.id", ondelete="RESTRICT"), nullable=False)
    lastPositionSeconds = Column(Integer, default=0, nullable=False)
    isCompleted = Column(Boolean, default=False, nullable=False)
    completedAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="videoProgress")
    video = relationship("Video", back_populates="videoProgress")

    __table_args__ = (UniqueConstraint('userId', 'videoId', name='VideoProgress_userId_videoId_key'),)

class RefreshToken(Base):
    __tablename__ = "RefreshToken"

    id = Column(String(191), primary_key=True, default=generate_uuid)
    userId = Column(String(191), ForeignKey("User.id", ondelete="RESTRICT"), nullable=False)
    tokenHash = Column(String(191), nullable=False)
    expiresAt = Column(DateTime, nullable=False)
    revokedAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="refreshTokens")

    __table_args__ = (Index('RefreshToken_userId_tokenHash_idx', 'userId', 'tokenHash'),)

class Comment(Base):
    __tablename__ = "Comment"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    videoId = Column(String(191), ForeignKey("Video.id", ondelete="CASCADE"), nullable=False)
    userId = Column(String(191), ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    parentId = Column(BigInteger, ForeignKey("Comment.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    isPinned = Column(Boolean, default=False, nullable=False)
    isEdited = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="comments")
    video = relationship("Video", back_populates="comments")
    parent = relationship("Comment", back_populates="replies", remote_side=[id])
    replies = relationship("Comment", back_populates="parent")
    upvotes = relationship("CommentUpvote", back_populates="comment", cascade="all, delete-orphan")

class CommentUpvote(Base):
    __tablename__ = "CommentUpvote"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    commentId = Column(BigInteger, ForeignKey("Comment.id", ondelete="CASCADE"), nullable=False)
    userId = Column(String(191), ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    comment = relationship("Comment", back_populates="upvotes")
    user = relationship("User", back_populates="commentUpvotes")

    __table_args__ = (UniqueConstraint('commentId', 'userId', name='CommentUpvote_commentId_userId_key'),)

class Review(Base):
    __tablename__ = "Review"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    subjectId = Column(String(191), ForeignKey("Subject.id", ondelete="CASCADE"), nullable=False)
    userId = Column(String(191), ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    review = Column(String(1000), nullable=True)
    isEdited = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="reviews")
    subject = relationship("Subject", back_populates="reviews")

    __table_args__ = (UniqueConstraint('subjectId', 'userId', name='Review_subjectId_userId_key'),)

class Notification(Base):
    __tablename__ = "Notification"

    id = Column(String(191), primary_key=True, default=generate_uuid)
    userId = Column(String(191), ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)
    message = Column(String(300), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")

class Certificate(Base):
    __tablename__ = "Certificate"

    id = Column(String(191), primary_key=True, default=generate_uuid)
    userId = Column(String(191), ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    subjectId = Column(String(191), ForeignKey("Subject.id", ondelete="CASCADE"), nullable=False)
    issuedAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    certificateCode = Column(String(191), nullable=False)

    user = relationship("User", back_populates="certificates")
    subject = relationship("Subject", back_populates="certificates")

class Purchase(Base):
    __tablename__ = "Purchase"

    id = Column(String(191), primary_key=True, default=generate_uuid)
    userId = Column(String(191), ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    subjectId = Column(String(191), ForeignKey("Subject.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)
    razorpayOrderId = Column(String(191), nullable=True)
    razorpayPaymentId = Column(String(191), nullable=True)
    razorpaySignature = Column(String(191), nullable=True)
    status = Column(String(50), default="pending", nullable=False)
    purchasedAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="purchases")
    subject = relationship("Subject", back_populates="purchases")
