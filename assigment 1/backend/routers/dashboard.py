import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models.models import (
    LinkedInPost,
    Recruiter,
    EmailCampaign,
    SearchHistory,
    ApplicationSetting
)
from backend.models.schemas import DashboardStats, SystemStatus
from backend.services.scheduler_service import SchedulerService
from backend.services.email_service import EmailService

router = APIRouter(prefix="/api", tags=["Dashboard & System"])


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Computes and returns core operational metrics for the overview dashboard."""
    total_posts = db.query(func.count(LinkedInPost.id)).scalar() or 0
    posts_24h = db.query(func.count(LinkedInPost.id)).filter(LinkedInPost.is_within_24h == True).scalar() or 0
    us_posts = db.query(func.count(LinkedInPost.id)).filter(LinkedInPost.is_us_based == True).scalar() or 0
    
    total_recruiters = db.query(func.count(Recruiter.id)).scalar() or 0
    valid_emails = db.query(func.count(Recruiter.id)).filter(
        Recruiter.email_validation_status == "VALID"
    ).scalar() or 0
    
    pending_approval = db.query(func.count(EmailCampaign.id)).filter(
        EmailCampaign.status == "PENDING_APPROVAL"
    ).scalar() or 0
    
    sent_emails = db.query(func.count(EmailCampaign.id)).filter(
        EmailCampaign.status == "SENT"
    ).scalar() or 0

    conversion_rates = {
        "us_filter_rate": round((us_posts / total_posts * 100), 1) if total_posts > 0 else 0.0,
        "email_discovery_rate": round((total_recruiters / total_posts * 100), 1) if total_posts > 0 else 0.0,
        "email_validation_rate": round((valid_emails / total_recruiters * 100), 1) if total_recruiters > 0 else 0.0,
    }

    return DashboardStats(
        total_posts=total_posts,
        posts_24h=posts_24h,
        us_posts=us_posts,
        total_recruiters=total_recruiters,
        valid_emails=valid_emails,
        pending_approval=pending_approval,
        sent_emails=sent_emails,
        conversion_rates=conversion_rates
    )


@router.get("/system/status", response_model=SystemStatus)
def get_system_status(db: Session = Depends(get_db)):
    """Returns runtime connectivity and health status across services."""
    sched_info = SchedulerService.get_status()
    
    total_records = {
        "posts": db.query(func.count(LinkedInPost.id)).scalar() or 0,
        "recruiters": db.query(func.count(Recruiter.id)).scalar() or 0,
        "campaigns": db.query(func.count(EmailCampaign.id)).scalar() or 0,
        "searches": db.query(func.count(SearchHistory.id)).scalar() or 0,
    }

    li_mock = db.query(ApplicationSetting).filter(ApplicationSetting.key == "linkedin_use_mock").first()
    li_mode = "Authorized Mock Provider" if (not li_mock or li_mock.value.lower() == "true") else "Live LinkedIn API"

    gmail_mode = "Official Gmail API (OAuth 2.0)" if EmailService.is_gmail_configured() else "Simulated Sandbox Mode"

    return SystemStatus(
        app_env=os.getenv("APP_ENV", "development"),
        database_status="Healthy (Connected)",
        linkedin_mode=li_mode,
        gmail_mode=gmail_mode,
        scheduler_running=sched_info.get("scheduler_running", False),
        total_records=total_records
    )

