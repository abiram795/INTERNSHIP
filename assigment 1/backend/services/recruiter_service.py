import re
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.models.models import Recruiter, LinkedInPost
from backend.utils.validator import validate_email_address

EMAIL_PATTERN = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
)

# Common non-recruiter domains or noisy emails to ignore
IGNORED_EMAIL_DOMAINS = {
    "linkedin.com", "example.com", "domain.com", "email.com"
}

# Sign-off and contact name extraction patterns
NAME_SIGNATURE_PATTERNS = [
    re.compile(r"(?:Thanks\s*&\s*Regards|Regards|Best\s*Regards|Thanks|Sincerely|Cheers|Best)\s*,?\s*\n+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})", re.MULTILINE),
    re.compile(r"(?:Contact|Reach\s*(?:out\s*)?(?:to|at)|Send\s*(?:resume|profiles?)\s*to|Email\s*me\s*at)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})", re.IGNORECASE),
    re.compile(r"(?:Recruiter|Talent\s*Acquisition|Sourcer)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})", re.IGNORECASE)
]

JOB_TITLE_PATTERNS = [
    re.compile(r"(?:Role|Position|Job\s*Title|Requirement|Hiring\s*for|Looking\s*for)\s*:?\s*([A-Za-z0-9\s/+#.-]{4,45})", re.IGNORECASE),
    re.compile(r"\b(Senior\s+Java\s+Developer|Java\s+Full\s*Stack\s+Developer|Java\s+Backend\s+Engineer|Java\s+C2C\s+Lead|Java\s+Architect|Bench\s+Sales\s+Recruiter|Full\s*Stack\s+Java\s+Consultant|Java\s+Microservices\s+Developer)\b", re.IGNORECASE)
]


class RecruiterService:

    @staticmethod
    def extract_email(text: str) -> Optional[str]:
        """
        Extracts the most probable recruiter email address from text.
        Never invents or hallucinates emails.
        """
        if not text:
            return None

        matches = EMAIL_PATTERN.findall(text)
        for email in matches:
            email_lower = email.strip().lower()
            domain = email_lower.split("@")[-1]
            if domain not in IGNORED_EMAIL_DOMAINS:
                return email_lower

        return None

    @staticmethod
    def extract_name(text: str, author_name: Optional[str] = None) -> str:
        """
        Extracts recruiter name from post signatures or falls back to author name.
        """
        if text:
            for pat in NAME_SIGNATURE_PATTERNS:
                m = pat.search(text)
                if m:
                    extracted = m.group(1).strip()
                    # Verify extracted is not a title like "Bench Sales"
                    if len(extracted.split()) in (2, 3) and not re.search(r"\b(Sales|Team|Hiring|HR|Talent|Company|Corp)\b", extracted):
                        return extracted

        if author_name and author_name.strip():
            clean_author = author_name.strip()
            # Clean headline suffix if present, e.g. "John Doe | Tech Recruiter"
            clean_author = clean_author.split("|")[0].split("-")[0].strip()
            if len(clean_author.split()) >= 2:
                return clean_author

        return author_name or "Talent Acquisition Team"

    @staticmethod
    def extract_job_title(text: str, matched_keyword: str) -> str:
        """Extracts job title from text or uses matched keyword context."""
        if text:
            for pat in JOB_TITLE_PATTERNS:
                m = pat.search(text)
                if m:
                    title = m.group(1).strip()
                    # Strip leading or trailing punctuation
                    title = re.sub(r"^[:\s-]+|[:\s-]+$", "", title)
                    if 4 <= len(title) <= 50:
                        return title

        if "Java" in matched_keyword:
            return "Java Software Engineer"
        elif "Bench" in matched_keyword:
            return "Bench Talent Consultant"
        elif "Sales" in matched_keyword:
            return "IT Bench Sales Professional"
        elif "W2" in matched_keyword:
            return "W2 Technical Consultant"
        elif "Full-Time" in matched_keyword:
            return "Full-Time Software Specialist"
        elif "Hotlist" in matched_keyword:
            return "Hotlist Technical Candidate"

        return "IT Consultant"

    @staticmethod
    def determine_job_type(text: str, default_from_kw: str = "C2C") -> str:
        """Determines if the position is C2C, W2, or Full-Time."""
        text_lower = (text or "").lower()

        if re.search(r"\b(c2c|corp[- ]to[- ]corp|corp2corp)\b", text_lower):
            return "C2C"
        elif re.search(r"\b(w2|w-2)\b", text_lower):
            return "W2"
        elif re.search(r"\b(full[- ]time|direct\s*hire|fte|permanent)\b", text_lower):
            return "Full-Time"

        if "c2c" in default_from_kw.lower():
            return "C2C"
        elif "w2" in default_from_kw.lower():
            return "W2"
        elif "full-time" in default_from_kw.lower():
            return "Full-Time"

        return "C2C"

    @staticmethod
    def extract_and_save_recruiter(db: Session, post: LinkedInPost) -> Optional[Recruiter]:
        """
        Extracts recruiter information from an authorized LinkedIn post,
        validates the email, checks for duplicates, and persists if valid.
        """
        extracted_email = RecruiterService.extract_email(post.content)

        # Requirement: "Never invent email addresses or infer private contact information."
        if not extracted_email:
            return None

        # Check if email already exists in database
        existing = db.query(Recruiter).filter(Recruiter.email == extracted_email).first()
        if existing:
            # Update post link if existing
            existing.post_url = post.post_url
            db.commit()
            db.refresh(existing)
            return existing

        # Validate extracted email
        validation = validate_email_address(extracted_email)

        # Extract details
        name = RecruiterService.extract_name(post.content, post.author_name)
        job_title = RecruiterService.extract_job_title(post.content, post.keyword)
        job_type = RecruiterService.determine_job_type(post.content, post.keyword)
        company = post.company_name or "IT Consulting Group"

        recruiter = Recruiter(
            post_id=post.id,
            name=name,
            email=extracted_email,
            company=company,
            job_title=job_title,
            location=post.detected_location or "United States",
            job_type=job_type,
            matched_keyword=post.keyword,
            post_url=post.post_url,
            email_validation_status=validation.get("status", "VALID"),
            validation_details=json.dumps(validation),
            created_at=datetime.now()
        )

        db.add(recruiter)
        db.commit()
        db.refresh(recruiter)
        return recruiter

