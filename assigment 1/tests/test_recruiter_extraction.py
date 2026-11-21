from backend.services.recruiter_service import RecruiterService
from backend.utils.validator import validate_email_address


def test_recruiter_email_extraction():
    """Extracts valid email from post body and ignores noisy domains."""
    text = (
        "Urgent C2C Java Developer role! Send resume to recruiter.david@apextechconsulting.com "
        "or visit https://linkedin.com. Thanks & Regards,\nDavid Lee"
    )
    email = RecruiterService.extract_email(text)
    assert email == "recruiter.david@apextechconsulting.com"


def test_recruiter_email_extraction_empty():
    """Returns None when no email exists (never invents emails)."""
    text = "Great opportunity for Java Developers. DM me on LinkedIn for details!"
    email = RecruiterService.extract_email(text)
    assert email is None


def test_recruiter_name_extraction():
    """Extracts recruiter name from signature block or author."""
    text = (
        "Looking for Java engineers in CA. Send profiles.\n\n"
        "Thanks & Regards,\nMarcus Sterling\nTalent Partner"
    )
    name = RecruiterService.extract_name(text, author_name="Marcus S.")
    assert "Marcus Sterling" in name or "Marcus" in name


def test_job_type_detection():
    """Detects C2C, W2, and Full-Time accurately."""
    assert RecruiterService.determine_job_type("Looking for candidates on C2C basis") == "C2C"
    assert RecruiterService.determine_job_type("Position is Corp-to-Corp") == "C2C"
    assert RecruiterService.determine_job_type("Strictly on W2 contract") == "W2"
    assert RecruiterService.determine_job_type("Direct hire Full-Time permanent position") == "Full-Time"


def test_email_validation():
    """Tests RFC compliance, disposable detection, and role accounts."""
    # 1. Valid business email
    res1 = validate_email_address("alex.smith@consultingpartners.com", check_dns=False)
    assert res1["status"] == "VALID"
    assert res1["is_valid"] is True

    # 2. Disposable / Throwaway email
    res2 = validate_email_address("fake.user@mailinator.com", check_dns=False)
    assert res2["status"] == "INVALID"
    assert res2["is_disposable"] is True

    # 3. Syntax error
    res3 = validate_email_address("invalid-email-at-domain", check_dns=False)
    assert res3["status"] == "INVALID"
    assert res3["is_valid"] is False

    # 4. Role account
    res4 = validate_email_address("support@techcorp.com", check_dns=False)
    assert res4["status"] == "RISKY"

