from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


# ===================== LinkedIn Post Schemas =====================
class LinkedInPostBase(BaseModel):
    post_url: str
    content: str
    author_name: str
    author_profile_url: Optional[str] = None
    company_name: Optional[str] = None
    publication_date: datetime
    keyword: str
    is_us_based: bool = False
    detected_location: Optional[str] = None
    is_within_24h: bool = False


class LinkedInPostCreate(LinkedInPostBase):
    post_id: Optional[str] = None
    raw_data: Optional[str] = None


class LinkedInPostRead(LinkedInPostBase):
    id: int
    post_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ===================== Recruiter Schemas =====================
class RecruiterBase(BaseModel):
    name: str
    email: str
    company: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    job_type: str = "C2C"
    matched_keyword: str
    post_url: str
    email_validation_status: str = "VALID"
    validation_details: Optional[str] = None


class RecruiterCreate(RecruiterBase):
    post_id: Optional[int] = None


class RecruiterRead(RecruiterBase):
    id: int
    post_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ===================== Email Campaign Schemas =====================
class EmailCampaignBase(BaseModel):
    subject: str
    body: str
    recipient_email: str
    recipient_name: str
    status: str = "PENDING_APPROVAL"


class EmailCampaignCreate(EmailCampaignBase):
    recruiter_id: int


class EmailCampaignUpdate(BaseModel):
    subject: Optional[str] = None
    body: Optional[str] = None
    recipient_email: Optional[str] = None
    recipient_name: Optional[str] = None
    status: Optional[str] = None


class EmailCampaignRead(EmailCampaignBase):
    id: int
    recruiter_id: int
    generated_at: datetime
    approved_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ===================== Email Log Schemas =====================
class EmailLogRead(BaseModel):
    id: int
    campaign_id: Optional[int] = None
    recipient_email: str
    action: str
    details: str
    status: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# ===================== Search History Schemas =====================
class SearchHistoryRead(BaseModel):
    id: int
    keyword: str
    status: str
    posts_found: int
    posts_saved: int
    recruiters_found: int
    search_timestamp: datetime
    source: str
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SearchTriggerRequest(BaseModel):
    keywords: Optional[List[str]] = None
    force_refresh: bool = False


# ===================== Setting Schemas =====================
class SettingRead(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SettingUpdate(BaseModel):
    settings: Dict[str, Any]


# ===================== Dashboard & System Schemas =====================
class DashboardStats(BaseModel):
    total_posts: int
    posts_24h: int
    us_posts: int
    total_recruiters: int
    valid_emails: int
    pending_approval: int
    sent_emails: int
    conversion_rates: Dict[str, float]


class SystemStatus(BaseModel):
    app_env: str
    database_status: str
    linkedin_mode: str
    gmail_mode: str
    scheduler_running: bool
    total_records: Dict[str, int]
