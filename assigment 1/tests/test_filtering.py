from datetime import datetime, timezone, timedelta
from backend.services.post_filter_service import PostFilterService


def test_24_hours_filter_positive():
    """Posts created 2 hours ago must pass 24h filter."""
    now = datetime.now(timezone.utc)
    recent = now - timedelta(hours=2)
    assert PostFilterService.is_within_24_hours(recent, reference_time=now) is True


def test_24_hours_filter_negative():
    """Posts created 26 hours ago must be excluded by 24h filter."""
    now = datetime.now(timezone.utc)
    older = now - timedelta(hours=26)
    assert PostFilterService.is_within_24_hours(older, reference_time=now) is False


def test_location_filter_us_states():
    """Verifies US state recognition (Texas, California, New York, New Jersey, etc.)."""
    is_us, loc = PostFilterService.filter_location("Senior Java Engineer opening in Dallas, TX for 12 months.")
    assert is_us is True
    assert "TX" in loc or "Texas" in loc

    is_us_ca, loc_ca = PostFilterService.filter_location("Lead Developer required in California for direct client.")
    assert is_us_ca is True
    assert "California" in loc_ca

    is_us_nj, loc_nj = PostFilterService.filter_location("Hybrid role in Edison, NJ. Must be on C2C.")
    assert is_us_nj is True
    assert "NJ" in loc_nj or "New Jersey" in loc_nj


def test_location_filter_us_remote():
    """Verifies US Remote and National terms."""
    is_us, loc = PostFilterService.filter_location("100% US Remote role for W2 candidates with US Citizenship.")
    assert is_us is True
    assert "United States" in loc or "Remote" in loc


def test_location_filter_non_us_exclusion():
    """Posts in London, Bangalore, etc. without US location must be rejected."""
    is_us_uk, _ = PostFilterService.filter_location("Java opening in Central London, UK. UK work visa required.")
    assert is_us_uk is False

    is_us_in, _ = PostFilterService.filter_location("Urgent hiring for Java Backend in Bangalore, India.")
    assert is_us_in is False


def test_location_filter_insufficient_evidence():
    """Generic text with no location markers must NOT be assumed to be US-based."""
    is_us, loc = PostFilterService.filter_location("Looking for Java developers with 5 years experience.")
    assert is_us is False
    assert loc is None


def test_keyword_matching():
    """Verifies case-insensitive matching across all 6 specified keywords."""
    keywords = [
        ("Java Developer C2C", "We have a requirement for java developer c2c in Austin."),
        ("Bench", "Available on bench: 3 senior AWS developers."),
        ("Sales", "Hiring experienced IT Bench Sales recruiter."),
        ("W2", "Senior engineer position on w2 only."),
        ("Full-Time", "Immediate Full-Time direct hire role in Chicago."),
        ("Hotlist", "Fresh consultant hotlist for November.")
    ]

    for expected_kw, sample_text in keywords:
        matched, detected = PostFilterService.match_keyword(sample_text, expected_kw)
        assert matched is True
        assert detected == expected_kw

