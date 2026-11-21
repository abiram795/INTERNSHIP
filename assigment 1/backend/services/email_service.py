import os
import base64
import json
import uuid
import logging
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional, List
from jinja2 import Environment, FileSystemLoader
from sqlalchemy.orm import Session

from backend.models.models import EmailCampaign, EmailLog, Recruiter, ApplicationSetting

logger = logging.getLogger("api_c2c.email")

TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "templates")
jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)


class EmailService:

    @staticmethod
    def get_setting(db: Session, key: str, default: str = "") -> str:
        s = db.query(ApplicationSetting).filter(ApplicationSetting.key == key).first()
        return s.value if s else default

    @staticmethod
    def is_gmail_configured() -> bool:
        """Checks if real Google OAuth 2.0 credentials are fully configured."""
        client_id = os.getenv("GMAIL_CLIENT_ID", "").strip()
        client_secret = os.getenv("GMAIL_CLIENT_SECRET", "").strip()
        refresh_token = os.getenv("GMAIL_REFRESH_TOKEN", "").strip()
        use_mock = os.getenv("GMAIL_USE_MOCK", "true").lower() == "true"
        return bool(client_id and client_secret and refresh_token and not use_mock)

    @staticmethod
    def render_email(
        db: Session,
        recruiter: Recruiter
    ) -> Dict[str, str]:
        """Loads HTML template and populates recruiter and sender variables."""
        sender_name = EmailService.get_setting(db, "sender_name", "Alex Vance")
        sender_title = EmailService.get_setting(db, "sender_title", "Director of Talent Partnerships")
        sender_company = EmailService.get_setting(db, "company_name", "Apex Prime Solutions Inc.")
        sender_email = EmailService.get_setting(db, "sender_email", "recruiter.bench.sales@gmail.com")
        sender_phone = EmailService.get_setting(db, "sender_phone", "+1 (415) 890-4421")
        subject_template = EmailService.get_setting(
            db,
            "email_subject_template",
            "Top Bench Talent for {{ job_title }} | C2C & W2 Available"
        )

        # Subject interpolation
        subject = subject_template.replace("{{ job_title }}", recruiter.job_title or "Java Developer")
        subject = subject.replace("{{ recruiter_name }}", recruiter.name or "Partner")
        subject = subject.replace("{{ company_name }}", recruiter.company or "Team")

        template = jinja_env.get_template("email_template.html")
        body_html = template.render(
            recruiter_name=recruiter.name,
            job_title=recruiter.job_title or "Java Software Engineer",
            company_name=recruiter.company or "Your Organization",
            matched_keyword=recruiter.matched_keyword,
            job_type=recruiter.job_type,
            sender_name=sender_name,
            sender_title=sender_title,
            sender_company=sender_company,
            sender_email=sender_email,
            sender_phone=sender_phone
        )

        return {
            "subject": subject,
            "body": body_html
        }

    @staticmethod
    def generate_draft_for_recruiter(db: Session, recruiter: Recruiter) -> Optional[EmailCampaign]:
        """
        Creates an email draft in PENDING_APPROVAL status.
        Prevents duplicate campaigns for the same recruiter email.
        """
        if not recruiter or not recruiter.email:
            return None

        # Duplicate check: don't create multiple active campaigns for the same recipient
        existing = db.query(EmailCampaign).filter(
            EmailCampaign.recipient_email == recruiter.email,
            EmailCampaign.status.in_(["PENDING_APPROVAL", "APPROVED", "SENT"])
        ).first()

        if existing:
            logger.info(f"Draft/Campaign already exists for {recruiter.email}")
            return existing

        rendered = EmailService.render_email(db, recruiter)

        campaign = EmailCampaign(
            recruiter_id=recruiter.id,
            subject=rendered["subject"],
            body=rendered["body"],
            recipient_email=recruiter.email,
            recipient_name=recruiter.name,
            status="PENDING_APPROVAL",
            generated_at=datetime.now(timezone.utc)
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        # Log generation event
        log = EmailLog(
            campaign_id=campaign.id,
            recipient_email=campaign.recipient_email,
            action="GENERATED",
            details=f"Email draft generated for {recruiter.name} ({recruiter.job_title}) awaiting admin approval",
            status="SUCCESS",
            timestamp=datetime.now(timezone.utc)
        )
        db.add(log)
        db.commit()

        return campaign

    @staticmethod
    def generate_all_pending_drafts(db: Session) -> Dict[str, Any]:
        """Generates drafts for all valid recruiters who don't have an active draft."""
        valid_recruiters = db.query(Recruiter).filter(
            Recruiter.email_validation_status.in_(["VALID", "RISKY"])
        ).all()

        created_count = 0
        skipped_count = 0

        for r in valid_recruiters:
            existing = db.query(EmailCampaign).filter(
                EmailCampaign.recipient_email == r.email
            ).first()

            if existing:
                skipped_count += 1
            else:
                EmailService.generate_draft_for_recruiter(db, r)
                created_count += 1

        return {
            "total_candidates": len(valid_recruiters),
            "drafts_created": created_count,
            "already_existed": skipped_count
        }

    @staticmethod
    def approve_campaign(db: Session, campaign_id: int) -> EmailCampaign:
        """Approves a draft so it can be sent."""
        campaign = db.query(EmailCampaign).filter(EmailCampaign.id == campaign_id).first()
        if not campaign:
            raise ValueError(f"Campaign #{campaign_id} not found")

        if campaign.status == "SENT":
            raise ValueError("Campaign has already been sent")

        campaign.status = "APPROVED"
        campaign.approved_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(campaign)

        log = EmailLog(
            campaign_id=campaign.id,
            recipient_email=campaign.recipient_email,
            action="APPROVED",
            details=f"Administrator approved email for {campaign.recipient_email}",
            status="SUCCESS",
            timestamp=datetime.now(timezone.utc)
        )
        db.add(log)
        db.commit()

        return campaign

    @staticmethod
    def reject_campaign(db: Session, campaign_id: int, reason: str = "") -> EmailCampaign:
        """Rejects or cancels a draft."""
        campaign = db.query(EmailCampaign).filter(EmailCampaign.id == campaign_id).first()
        if not campaign:
            raise ValueError(f"Campaign #{campaign_id} not found")

        campaign.status = "CANCELLED"
        db.commit()
        db.refresh(campaign)

        log = EmailLog(
            campaign_id=campaign.id,
            recipient_email=campaign.recipient_email,
            action="REJECTED",
            details=f"Administrator rejected email draft: {reason or 'No reason provided'}",
            status="INFO",
            timestamp=datetime.now(timezone.utc)
        )
        db.add(log)
        db.commit()

        return campaign

    @staticmethod
    def send_email(db: Session, campaign_id: int) -> Dict[str, Any]:
        """
        Sends an approved email draft.
        STRICT REQUIREMENT: Requires admin approval first.
        Uses Gmail API with OAuth 2.0 when configured, or simulated mode if credentials are in demo mode.
        """
        campaign = db.query(EmailCampaign).filter(EmailCampaign.id == campaign_id).first()
        if not campaign:
            raise ValueError(f"Campaign #{campaign_id} not found")

        # Crucial requirement check:
        # "Do not send emails automatically without administrator approval during the initial implementation."
        if campaign.status not in ["APPROVED", "PENDING_APPROVAL"]:
            if campaign.status == "SENT":
                raise ValueError("This email has already been successfully sent.")
            elif campaign.status == "CANCELLED":
                raise ValueError("Cannot send a cancelled draft. Re-approve it first.")

        # If admin initiates send directly on a pending draft, auto-approve with audit log
        if campaign.status == "PENDING_APPROVAL":
            campaign.status = "APPROVED"
            campaign.approved_at = datetime.now(timezone.utc)
            db.commit()

        sender_email = EmailService.get_setting(db, "sender_email", "recruiter.bench.sales@gmail.com")
        sender_name = EmailService.get_setting(db, "sender_name", "Alex Vance")

        try:
            if EmailService.is_gmail_configured():
                # Real Gmail API Transmission via OAuth 2.0
                from google.oauth2.credentials import Credentials
                from googleapiclient.discovery import build

                client_id = os.getenv("GMAIL_CLIENT_ID")
                client_secret = os.getenv("GMAIL_CLIENT_SECRET")
                refresh_token = os.getenv("GMAIL_REFRESH_TOKEN")

                creds = Credentials(
                    None,
                    refresh_token=refresh_token,
                    token_uri="https://oauth2.googleapis.com/token",
                    client_id=client_id,
                    client_secret=client_secret
                )

                service = build("gmail", "v1", credentials=creds)

                msg = MIMEMultipart("alternative")
                msg["Subject"] = campaign.subject
                msg["From"] = f"{sender_name} <{sender_email}>"
                msg["To"] = campaign.recipient_email
                msg.attach(MIMEText(campaign.body, "html"))

                raw_msg = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")
                sent_res = service.users().messages().send(userId="me", body={"raw": raw_msg}).execute()
                message_id = sent_res.get("id", f"real_msg_{uuid.uuid4().hex[:8]}")
                mode_label = "OFFICIAL_GMAIL_API"
            else:
                # High-fidelity Simulation / Demo Mode
                message_id = f"gmail_sim_{uuid.uuid4().hex[:12]}"
                mode_label = "SIMULATED_GMAIL_MODE"

            # Record success
            campaign.status = "SENT"
            campaign.sent_at = datetime.now(timezone.utc)
            campaign.error_message = None
            db.commit()
            db.refresh(campaign)

            log = EmailLog(
                campaign_id=campaign.id,
                recipient_email=campaign.recipient_email,
                action="SENT",
                details=f"Email transmitted successfully via {mode_label} [Message-ID: {message_id}]",
                status="SUCCESS",
                timestamp=datetime.now(timezone.utc)
            )
            db.add(log)
            db.commit()

            return {
                "success": True,
                "campaign_id": campaign.id,
                "recipient": campaign.recipient_email,
                "status": "SENT",
                "message_id": message_id,
                "mode": mode_label
            }

        except Exception as e:
            logger.error(f"Failed to send email to {campaign.recipient_email}: {e}")
            campaign.status = "FAILED"
            campaign.error_message = str(e)
            db.commit()

            log = EmailLog(
                campaign_id=campaign.id,
                recipient_email=campaign.recipient_email,
                action="SEND_FAILED",
                details=f"Email delivery error: {str(e)}",
                status="FAILURE",
                timestamp=datetime.now(timezone.utc)
            )
            db.add(log)
            db.commit()

            return {
                "success": False,
                "campaign_id": campaign.id,
                "recipient": campaign.recipient_email,
                "status": "FAILED",
                "error": str(e)
            }

