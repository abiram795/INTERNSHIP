from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.models import EmailCampaign, EmailLog, Recruiter
from backend.models.schemas import (
    EmailCampaignRead,
    EmailCampaignUpdate,
    EmailLogRead
)
from backend.services.email_service import EmailService

router = APIRouter(prefix="/api/emails", tags=["Email Automation & Approval"])


@router.post("/generate")
def generate_drafts(
    recruiter_id: Optional[int] = Body(None, embed=True),
    db: Session = Depends(get_db)
):
    """
    Generates tailored email drafts in PENDING_APPROVAL status.
    If recruiter_id is passed, generates for that specific recruiter.
    Otherwise, generates drafts for all eligible recruiters.
    """
    if recruiter_id:
        recruiter = db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()
        if not recruiter:
            raise HTTPException(status_code=404, detail="Recruiter not found")
        campaign = EmailService.generate_draft_for_recruiter(db, recruiter)
        return {
            "status": "SUCCESS",
            "message": f"Draft generated for {recruiter.name}",
            "campaign_id": campaign.id if campaign else None
        }

    result = EmailService.generate_all_pending_drafts(db)
    return {
        "status": "SUCCESS",
        "message": f"Generated {result['drafts_created']} new drafts",
        "details": result
    }


@router.get("/pending", response_model=List[EmailCampaignRead])
def get_pending_emails(db: Session = Depends(get_db)):
    """Retrieves all email drafts waiting for administrator review and approval."""
    campaigns = db.query(EmailCampaign).filter(
        EmailCampaign.status == "PENDING_APPROVAL"
    ).order_by(EmailCampaign.generated_at.desc()).all()
    return campaigns


@router.get("/campaigns", response_model=List[EmailCampaignRead])
def get_all_campaigns(
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Lists email campaigns across all lifecycle states."""
    query = db.query(EmailCampaign)
    if status and status.upper() != "ALL":
        query = query.filter(EmailCampaign.status == status.upper())

    campaigns = query.order_by(EmailCampaign.generated_at.desc()).offset(offset).limit(limit).all()
    return campaigns


@router.get("/history", response_model=List[EmailCampaignRead])
def get_email_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieves all sent and completed email communications."""
    campaigns = db.query(EmailCampaign).filter(
        EmailCampaign.status == "SENT"
    ).order_by(EmailCampaign.sent_at.desc()).offset(offset).limit(limit).all()
    return campaigns


@router.get("/logs", response_model=List[EmailLogRead])
def get_email_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Returns the immutable audit log of email system events."""
    logs = db.query(EmailLog).order_by(EmailLog.timestamp.desc()).offset(offset).limit(limit).all()
    return logs


@router.get("/{id}", response_model=EmailCampaignRead)
def get_campaign_by_id(id: int, db: Session = Depends(get_db)):
    """Fetches a specific email campaign by primary key."""
    campaign = db.query(EmailCampaign).filter(EmailCampaign.id == id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Email campaign not found")
    return campaign


@router.put("/{id}", response_model=EmailCampaignRead)
def update_email_draft(
    id: int,
    update_data: EmailCampaignUpdate,
    db: Session = Depends(get_db)
):
    """Allows administrator to edit subject, recipient, or body before sending."""
    campaign = db.query(EmailCampaign).filter(EmailCampaign.id == id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Email campaign not found")

    if campaign.status == "SENT":
        raise HTTPException(status_code=400, detail="Cannot edit an email that has already been sent.")

    if update_data.subject is not None:
        campaign.subject = update_data.subject
    if update_data.body is not None:
        campaign.body = update_data.body
    if update_data.recipient_email is not None:
        campaign.recipient_email = update_data.recipient_email
    if update_data.recipient_name is not None:
        campaign.recipient_name = update_data.recipient_name

    db.commit()
    db.refresh(campaign)
    return campaign


@router.post("/{id}/approve", response_model=EmailCampaignRead)
def approve_email(id: int, db: Session = Depends(get_db)):
    """
    Administrator approves a pending email draft.
    Marks status as APPROVED and prepares it for transmission.
    """
    try:
        return EmailService.approve_campaign(db, id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{id}/reject", response_model=EmailCampaignRead)
def reject_email(
    id: int,
    reason: Optional[str] = Body("", embed=True),
    db: Session = Depends(get_db)
):
    """Administrator cancels or rejects a pending email draft."""
    try:
        return EmailService.reject_campaign(db, id, reason or "")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{id}/send")
def send_email(id: int, db: Session = Depends(get_db)):
    """
    Transmits an approved email via Gmail API OAuth 2.0 (or simulated mode in demo).
    STRICT REQUIREMENT: Requires admin approval.
    """
    try:
        result = EmailService.send_email(db, id)
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Email sending failed"))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal transmission error: {e}")

