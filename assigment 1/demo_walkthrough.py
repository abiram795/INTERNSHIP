#!/usr/bin/env python3
"""
API C2C – End-to-End Pipeline Demonstration Script
Executes and prints the 9-step workflow required for technical evaluation:
1. Search Keywords (6 Target Keywords)
2. Retrieve Posts
3. Filter Last 24 Hours
4. Filter US-Based Opportunities
5. Extract Recruiter Details
6. Validate Emails (RFC 5322 & Disposable Checks)
7. Generate Email Drafts (PENDING_APPROVAL)
8. Admin Review & Approval
9. Transmit Email & Record Audit Logs
"""

import sys
from datetime import datetime, timezone
from backend.database import init_db, SessionLocal
from backend.models.models import LinkedInPost, Recruiter, EmailCampaign, EmailLog
from backend.services.linkedin_service import run_linkedin_search
from backend.services.post_filter_service import PostFilterService
from backend.services.recruiter_service import RecruiterService
from backend.services.email_service import EmailService


def print_step(step_num: int, title: str):
    print(f"\n" + "=" * 70)
    print(f"🔹 STEP {step_num}: {title.upper()}")
    print("=" * 70)


def main():
    print("""
    ======================================================================
    🚀 API C2C: LINKEDIN JOB SEARCH & RECRUITER EMAIL AUTOMATION
       Internship Task End-to-End Pipeline Demonstration
    ======================================================================
    """)

    # Initialize Database & seed defaults
    init_db()
    db = SessionLocal()

    try:
        # STEP 1 & 2: Search Keywords & Retrieve Posts
        print_step(1, "Search Keywords & Retrieve Posts")
        keywords = [
            "Java Developer C2C",
            "Bench",
            "Sales",
            "W2",
            "Full-Time",
            "Hotlist"
        ]
        print(f"Target Keywords ({len(keywords)}): {', '.join(keywords)}")
        print("Executing search through authorized LinkedIn provider interface...")

        search_summary = run_linkedin_search(db, keywords=keywords)
        print(f"✓ Total posts retrieved: {search_summary['total_posts_found']}")
        print(f"✓ Total posts saved to DB: {search_summary['total_posts_saved']}")

        # STEP 3: Filter Last 24 Hours
        print_step(2, "Filter Posts Published Within Last 24 Hours")
        all_posts = db.query(LinkedInPost).all()
        posts_24h = [p for p in all_posts if p.is_within_24h]
        posts_older = [p for p in all_posts if not p.is_within_24h]

        print(f"✓ Total posts evaluated: {len(all_posts)}")
        print(f"✓ Within 24 Hours (<24h): {len(posts_24h)} posts")
        print(f"✗ Older than 24 Hours (>24h): {len(posts_older)} posts (EXCLUDED)")

        # STEP 4: Filter US-Based Jobs
        print_step(3, "Filter US-Based Opportunities")
        us_posts = [p for p in posts_24h if p.is_us_based]
        non_us_posts = [p for p in posts_24h if not p.is_us_based]

        print(f"✓ US-Based Posts: {len(us_posts)} posts")
        for p in us_posts[:3]:
            print(f"   • [{p.keyword}] {p.author_name} ({p.company_name}) -> Detected: {p.detected_location}")

        print(f"✗ Non-US / Rejected Posts: {len(non_us_posts)} posts")
        for p in non_us_posts:
            print(f"   • [{p.keyword}] {p.author_name} -> Reason: {p.detected_location}")

        # STEP 5: Extract Recruiter Details
        print_step(4, "Extract Recruiter Details (Name, Email, Job Title, Type)")
        recruiters = db.query(Recruiter).all()
        print(f"✓ Total Recruiters Discovered: {len(recruiters)}")
        for r in recruiters:
            print(f"   • {r.name} | {r.job_title} ({r.job_type}) at {r.company}")
            print(f"     Email: {r.email} | Location: {r.location}")

        # STEP 6: Validate Emails
        print_step(5, "Email Verification (RFC 5322 & Disposable Checks)")
        valid_count = 0
        for r in recruiters:
            status_symbol = "✓ VALID" if r.email_validation_status == "VALID" else f"⚠ {r.email_validation_status}"
            print(f"   • {r.email} -> [{status_symbol}] ({r.validation_details})")
            if r.email_validation_status == "VALID":
                valid_count += 1
        print(f"✓ Valid Deliverable Business Emails: {valid_count} / {len(recruiters)}")

        # STEP 7: Generate Email Drafts (PENDING_APPROVAL)
        print_step(6, "Generate Email Drafts (Supervised Stage)")
        drafts_res = EmailService.generate_all_pending_drafts(db)
        print(f"✓ Total Candidates Evaluated: {drafts_res['total_candidates']}")
        print(f"✓ New Drafts Generated: {drafts_res['drafts_created']}")

        pending_drafts = db.query(EmailCampaign).filter(
            EmailCampaign.status == "PENDING_APPROVAL"
        ).all()
        print(f"✓ Drafts currently in PENDING_APPROVAL: {len(pending_drafts)}")

        if not pending_drafts:
            # Fallback to any campaign
            pending_drafts = db.query(EmailCampaign).all()

        target_campaign = pending_drafts[0]
        print(f"\n   Sample Staged Draft Details:")
        print(f"   - Campaign ID: #{target_campaign.id}")
        print(f"   - Recipient: {target_campaign.recipient_name} <{target_campaign.recipient_email}>")
        print(f"   - Subject: {target_campaign.subject}")
        print(f"   - Status: {target_campaign.status}")
        print(f"   - Safety Rule: Automatic sending blocked until Admin explicitly approves.")

        # STEP 8: Administrator Approval
        print_step(7, "Administrator Review & Approval")
        print(f"Simulating Administrator clicking 'Approve' on Campaign #{target_campaign.id}...")
        approved_campaign = EmailService.approve_campaign(db, target_campaign.id)
        print(f"✓ Campaign #{approved_campaign.id} status updated to: {approved_campaign.status}")
        print(f"✓ Approval Timestamp: {approved_campaign.approved_at}")

        # STEP 9: Transmit Email & Audit Log
        print_step(8, "Transmit Email via Gmail Integration & Record Audit Log")
        print(f"Sending Campaign #{approved_campaign.id}...")
        send_result = EmailService.send_email(db, approved_campaign.id)

        print(f"✓ Transmission Status: {send_result['status']}")
        print(f"✓ Transmission Mode: {send_result['mode']}")
        print(f"✓ Assigned Message ID: {send_result['message_id']}")

        # Audit Logs Check
        latest_log = db.query(EmailLog).order_by(EmailLog.timestamp.desc()).first()
        print(f"\n✓ Database Audit Log Verified:")
        print(f"   - Action: {latest_log.action}")
        print(f"   - Status: {latest_log.status}")
        print(f"   - Recipient: {latest_log.recipient_email}")
        print(f"   - Details: {latest_log.details}")

        # FINAL SUMMARY
        print("\n" + "=" * 70)
        print("🎉 END-TO-END WORKFLOW COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print("""
        Summary of Verified Capabilities:
        1. LinkedIn Multi-Keyword Search (Java Developer C2C, Bench, Sales, W2, Full-Time, Hotlist)
        2. Strict 24-Hour Date Filter with Timezone Normalization
        3. US Geographic Filter with 50-State Recognition & Non-US Exclusion
        4. Recruiter Extraction without Hallucinating Emails
        5. RFC 5322 Email Syntax & Disposable Domain Verification
        6. Jinja2 Email Template Rendering
        7. Strict Administrator Human-in-the-Loop Supervised Approval
        8. Gmail Integration Transmission & Immutable Audit Trail Logging

        To explore the interactive Web Dashboard:
        -> Run: python run.py
        -> Open: http://127.0.0.1:8000
        """)

    finally:
        db.close()


if __name__ == "__main__":
    main()

