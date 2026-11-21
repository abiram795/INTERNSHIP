from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db

client = TestClient(app)


def test_complete_end_to_end_automation_workflow():
    """
    Demonstrates and validates the entire internship requirement workflow:
    1. Search Keywords
    2. Retrieve Posts
    3. Filter Last 24 Hours
    4. Filter US Jobs
    5. Extract Recruiter Details
    6. Validate Emails
    7. Generate Email Drafts
    8. Admin Approval
    9. Send Email (via Gmail API / Simulation)
    """
    init_db()

    # Step 1 & 2: Search Keywords & Retrieve Posts
    keywords = ["Java Developer C2C", "Bench"]
    search_res = client.post("/api/search/start", json={"keywords": keywords})
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["status"] == "SUCCESS"

    summary = search_data["search_summary"]
    assert summary["total_posts_found"] >= 2
    assert summary["total_posts_saved"] >= 1

    # Step 3 & 4: Verify 24 Hours and US Filters applied
    posts_res = client.get("/api/posts?is_within_24h=true&is_us_based=true")
    assert posts_res.status_code == 200
    filtered_posts = posts_res.json()
    assert len(filtered_posts) > 0
    for p in filtered_posts:
        assert p["is_within_24h"] is True
        assert p["is_us_based"] is True

    # Step 5 & 6: Extract Recruiter Details & Validate Emails
    recruiters_res = client.get("/api/recruiters?validation_status=VALID")
    assert recruiters_res.status_code == 200
    valid_recruiters = recruiters_res.json()
    assert len(valid_recruiters) > 0
    recruiter = valid_recruiters[0]
    assert "@" in recruiter["email"]
    assert recruiter["email_validation_status"] == "VALID"

    # Step 7: Generate Email Drafts
    draft_res = client.post("/api/emails/generate", json={"recruiter_id": recruiter["id"]})
    assert draft_res.status_code == 200

    pending_res = client.get("/api/emails/pending")
    assert pending_res.status_code == 200
    pending_drafts = pending_res.json()
    assert len(pending_drafts) > 0

    target_draft = None
    for d in pending_drafts:
        if d["recruiter_id"] == recruiter["id"]:
            target_draft = d
            break
    assert target_draft is not None
    assert target_draft["status"] == "PENDING_APPROVAL"

    # Step 8: Admin Approval
    campaign_id = target_draft["id"]
    approve_res = client.post(f"/api/emails/{campaign_id}/approve")
    assert approve_res.status_code == 200
    approved_campaign = approve_res.json()
    assert approved_campaign["status"] == "APPROVED"
    assert approved_campaign["approved_at"] is not None

    # Step 9: Send Email
    send_res = client.post(f"/api/emails/{campaign_id}/send")
    assert send_res.status_code == 200
    send_data = send_res.json()
    assert send_data["success"] is True
    assert send_data["status"] == "SENT"
    assert "message_id" in send_data

    # Verify campaign is now in Sent History
    history_res = client.get("/api/emails/history")
    assert history_res.status_code == 200
    sent_list = history_res.json()
    assert any(c["id"] == campaign_id for c in sent_list)

