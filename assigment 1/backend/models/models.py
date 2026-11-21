from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Index
)
from sqlalchemy.orm import relationship
from backend.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class LinkedInPost(Base):
    __tablename__ = "linkedin_posts"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(String(128), unique=True, index=True, nullable=False)
    post_url = Column(String(512), unique=True, index=True, nullable=False)
    content = Column(Text, nullable=False)
    author_name = Column(String(256), nullable=False)
    author_profile_url = Column(String(512), nullable=True)
    company_name = Column(String(256), nullable=True)
    publication_date = Column(DateTime(timezone=True), index=True, nullable=False)
    keyword = Column(String(128), index=True, nullable=False)
    is_us_based = Column(Boolean, default=False, index=True)
    detected_location = Column(String(256), nullable=True)
    is_within_24h = Column(Boolean, default=False, index=True)
    raw_data = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    recruiters = relationship("Recruiter", back_populates="post", cascade="all, delete-orphan")


class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("linkedin_posts.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(256), nullable=False)
    email = Column(String(256), unique=True, index=True, nullable=False)
    company = Column(String(256), nullable=True)
    job_title = Column(String(256), nullable=True)
    location = Column(String(256), nullable=True)
    job_type = Column(String(64), default="C2C", nullable=False)  # C2C, W2, Full-Time
    matched_keyword = Column(String(128), nullable=False)
    post_url = Column(String(512), nullable=False)
    email_validation_status = Column(String(32), default="VALID", index=True)  # VALID, RISKY, INVALID
    validation_details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    post = relationship("LinkedInPost", back_populates="recruiters")
    campaigns = relationship("EmailCampaign", back_populates="recruiter", cascade="all, delete-orphan")


class EmailCampaign(Base):
    __tablename__ = "email_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(512), nullable=False)
    body = Column(Text, nullable=False)
    recipient_email = Column(String(256), nullable=False, index=True)
    recipient_name = Column(String(256), nullable=False)
    # Status: DRAFT, PENDING_APPROVAL, APPROVED, SENT, FAILED, CANCELLED
    status = Column(String(32), default="PENDING_APPROVAL", index=True, nullable=False)
    generated_at = Column(DateTime(timezone=True), default=utcnow)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)

    # Relationships
    recruiter = relationship("Recruiter", back_populates="campaigns")
    logs = relationship("EmailLog", back_populates="campaign", cascade="all, delete-orphan")


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("email_campaigns.id", ondelete="SET NULL"), nullable=True)
    recipient_email = Column(String(256), nullable=False, index=True)
    action = Column(String(64), nullable=False)  # GENERATED, APPROVED, SENT, SEND_FAILED, REJECTED
    details = Column(Text, nullable=False)
    status = Column(String(32), default="SUCCESS")  # SUCCESS, FAILURE, INFO
    timestamp = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    campaign = relationship("EmailCampaign", back_populates="logs")


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String(128), index=True, nullable=False)
    status = Column(String(32), default="SUCCESS")  # SUCCESS, FAILED
    posts_found = Column(Integer, default=0)
    posts_saved = Column(Integer, default=0)
    recruiters_found = Column(Integer, default=0)
    search_timestamp = Column(DateTime(timezone=True), default=utcnow)
    source = Column(String(64), default="MOCK_PROVIDER")  # API, MOCK_PROVIDER, MANUAL, SCHEDULED
    notes = Column(Text, nullable=True)


class ApplicationSetting(Base):
    __tablename__ = "application_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(128), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String(512), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


# Compound Index
Index("idx_posts_filter", LinkedInPost.is_within_24h, LinkedInPost.is_us_based)

