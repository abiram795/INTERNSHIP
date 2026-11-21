import re
import logging

logger = logging.getLogger("api_c2c.security")


def mask_sensitive_token(token: str) -> str:
    """Masks secret tokens or keys for safe display in logs and settings."""
    if not token or len(token) < 8:
        return "******"
    return f"{token[:3]}...{token[-4:]}"


def sanitize_input(text: str) -> str:
    """Removes potentially dangerous control characters while preserving formatting."""
    if not text:
        return ""
    # Strip null bytes and normalize line endings
    clean = text.replace("\x00", "").replace("\r\n", "\n")
    return clean.strip()

