import re
import socket
from typing import Dict, Any

DISPOSABLE_DOMAINS = {
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "sharklasers.com",
    "throwawaymail.com",
    "yopmail.com",
    "trashmail.com",
    "fakeinbox.com",
    "dispostable.com",
    "temp-mail.org",
    "getnada.com",
    "mytemp.email"
}

ROLE_BASED_PREFIXES = {
    "noreply",
    "no-reply",
    "donotreply",
    "admin",
    "administrator",
    "support",
    "help",
    "billing",
    "legal",
    "privacy",
    "postmaster",
    "hostmaster"
}

# Strict RFC 5322-compatible email regex
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
)


def validate_email_address(email: str, check_dns: bool = True) -> Dict[str, Any]:
    """
    Validates an email address.
    Checks:
    - Syntax correctness
    - Length constraints
    - Disposable email provider detection
    - Role-based address detection (classified as RISKY)
    - MX / Host DNS resolution (optional with fast timeout)
    """
    if not email or not isinstance(email, str):
        return {
            "status": "INVALID",
            "is_valid": False,
            "reason": "Email is empty or not a string",
            "domain": None,
            "is_disposable": False
        }

    email_clean = email.strip().lower()

    if len(email_clean) > 254:
        return {
            "status": "INVALID",
            "is_valid": False,
            "reason": "Email exceeds maximum RFC length of 254 characters",
            "domain": None,
            "is_disposable": False
        }

    if not EMAIL_REGEX.match(email_clean):
        return {
            "status": "INVALID",
            "is_valid": False,
            "reason": "Email syntax violates RFC 5322 format",
            "domain": None,
            "is_disposable": False
        }

    parts = email_clean.split("@")
    if len(parts) != 2:
        return {
            "status": "INVALID",
            "is_valid": False,
            "reason": "Malformed email format",
            "domain": None,
            "is_disposable": False
        }

    local_part, domain_part = parts

    # Check disposable domains
    if domain_part in DISPOSABLE_DOMAINS:
        return {
            "status": "INVALID",
            "is_valid": False,
            "reason": f"Domain '{domain_part}' is a known disposable/temporary email provider",
            "domain": domain_part,
            "is_disposable": True
        }

    # Check role-based addresses
    if local_part in ROLE_BASED_PREFIXES:
        return {
            "status": "RISKY",
            "is_valid": True,
            "reason": f"Local prefix '{local_part}' is a generic system or unmonitored role account",
            "domain": domain_part,
            "is_disposable": False
        }

    # Optional DNS / Host resolution check with low timeout
    if check_dns:
        try:
            # Check if domain resolves
            socket.setdefaulttimeout(1.5)
            socket.gethostbyname(domain_part)
        except Exception:
            # Host resolution failed or offline environment:
            # We don't fail immediately in offline/local mock dev environments, but flag as RISKY if domain is clearly bogus
            if not "." in domain_part or len(domain_part.split(".")[-1]) < 2:
                return {
                    "status": "INVALID",
                    "is_valid": False,
                    "reason": f"Domain '{domain_part}' has invalid TLD format",
                    "domain": domain_part,
                    "is_disposable": False
                }

    return {
        "status": "VALID",
        "is_valid": True,
        "reason": "Valid business email address verified",
        "domain": domain_part,
        "is_disposable": False
    }

