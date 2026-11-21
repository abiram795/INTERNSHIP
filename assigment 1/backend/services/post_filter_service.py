import re
from datetime import datetime, timezone, timedelta
from typing import Tuple, Optional, List, Dict, Any

# US States mapping: 2-letter code to full state name
US_STATES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
    "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri",
    "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
    "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
    "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont",
    "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
}

# Major US Metropolitan Hubs
US_METROS = [
    "New York", "NYC", "San Francisco", "Bay Area", "Silicon Valley", "San Jose",
    "Austin", "Dallas", "Houston", "Chicago", "Atlanta", "Charlotte", "Raleigh",
    "Seattle", "Boston", "Denver", "Phoenix", "Philadelphia", "Edison", "Princeton",
    "Plano", "Irving", "Tampa", "Miami", "Minneapolis", "Detroit", "Columbus",
    "Indianapolis", "San Antonio", "San Diego", "Nashville", "Salt Lake City"
]

# Explicit US National Identifiers
US_NATIONAL_TERMS = [
    r"\bUSA\b", r"\bU\.S\.A\b", r"\bU\.S\b", r"\bUnited States\b",
    r"\bUS Remote\b", r"\bRemote - US\b", r"\bRemote \(US\)\b", r"\bRemote \(USA\)\b",
    r"\bUS Only\b", r"\bUS Citizens?\b", r"\bGreen Card\b", r"\bGC/EAD\b",
    r"\bUS Timezones?\b", r"\bEST\b", r"\bCST\b", r"\bPST\b", r"\bMST\b"
]

# Non-US Global Exclusions
NON_US_TERMS = [
    r"\bIndia\b", r"\bBangalore\b", r"\bBengaluru\b", r"\bHyderabad\b", r"\bPune\b",
    r"\bChennai\b", r"\bDelhi\b", r"\bGurgaon\b", r"\bGurugram\b", r"\bNoida\b",
    r"\bMumbai\b", r"\bUnited Kingdom\b", r"\bUK\b", r"\bLondon\b", r"\bManchester\b",
    r"\bCanada\b", r"\bToronto\b", r"\bVancouver\b", r"\bMontreal\b",
    r"\bAustralia\b", r"\bSydney\b", r"\bMelbourne\b",
    r"\bGermany\b", r"\bBerlin\b", r"\bEurope\b", r"\bSingapore\b", r"\bPhilippines\b"
]

# The 6 Target Keywords with variations
TARGET_KEYWORDS = {
    "Java Developer C2C": [
        r"java\s+developer.*c2c",
        r"c2c.*java\s+developer",
        r"java.*corp[- ]to[- ]corp",
        r"java\s+developer",
        r"java\s+full\s*stack"
    ],
    "Bench": [
        r"\bbench\b",
        r"\bbench\s+sales\b",
        r"\bon\s+bench\b",
        r"\bbench\s+consultants?\b",
        r"\bcandidate\s+bench\b"
    ],
    "Sales": [
        r"\bbench\s+sales\b",
        r"\bit\s+sales\b",
        r"\bsales\s+recruiter\b",
        r"\btalent\s+sales\b"
    ],
    "W2": [
        r"\bon\s+w2\b",
        r"\bw2\s+only\b",
        r"\bw2\s+contract\b",
        r"\bw[- /]?2\b"
    ],
    "Full-Time": [
        r"\bfull[- ]time\b",
        r"\bdirect\s+hire\b",
        r"\bfte\b",
        r"\bpermanent\b"
    ],
    "Hotlist": [
        r"\bhotlist\b",
        r"\bhot\s+list\b",
        r"\bconsultant\s+hotlist\b",
        r"\bbench\s+hotlist\b"
    ]
}


class PostFilterService:

    @staticmethod
    def is_within_24_hours(
        publication_date: datetime,
        reference_time: Optional[datetime] = None
    ) -> bool:
        """
        Verifies if the post was published strictly within the last 24 hours.
        Accounts for timezones and UTC conversion.
        """
        if not publication_date:
            return False

        if reference_time is None:
            reference_time = datetime.now(timezone.utc)
        elif reference_time.tzinfo is None:
            reference_time = reference_time.replace(tzinfo=timezone.utc)

        if publication_date.tzinfo is None:
            # Assume UTC if naive
            publication_date = publication_date.replace(tzinfo=timezone.utc)
        else:
            publication_date = publication_date.astimezone(timezone.utc)

        # Allow 15 minutes clock skew buffer into the future
        max_future = reference_time + timedelta(minutes=15)
        cutoff_24h = reference_time - timedelta(hours=24)

        return cutoff_24h <= publication_date <= max_future

    @staticmethod
    def filter_location(text: str, declared_location: Optional[str] = None) -> Tuple[bool, Optional[str]]:
        """
        Analyzes the post text and declared location to determine if it is a US-based job opportunity.
        Returns:
            Tuple of (is_us_based: bool, detected_location: Optional[str])
        """
        full_text = f"{declared_location or ''} {text or ''}"

        # 1. Check for explicit Non-US locations first
        has_non_us = False
        non_us_matched = []
        for pat in NON_US_TERMS:
            m = re.search(pat, full_text, re.IGNORECASE)
            if m:
                # If text says "US client" or "Remote for US company while in India", look closely
                non_us_matched.append(m.group(0))
                has_non_us = True

        detected_loc = None
        has_us_marker = False

        # 2. Check for explicit US States (Full names)
        for code, name in US_STATES.items():
            pattern = rf"\b{re.escape(name)}\b"
            if re.search(pattern, full_text, re.IGNORECASE):
                has_us_marker = True
                detected_loc = f"{name}, USA"
                break

        # 3. Check for 2-letter state codes with city or comma (e.g. "Austin, TX", "TX", "Edison, NJ")
        if not detected_loc:
            state_codes_pat = r"\b(?:[A-Z][a-zA-Z\s]+,\s*)?(" + "|".join(US_STATES.keys()) + r")\b"
            match = re.search(state_codes_pat, full_text)
            if match:
                st_code = match.group(1).upper()
                if st_code in US_STATES:
                    has_us_marker = True
                    detected_loc = f"{match.group(0).strip()} ({US_STATES[st_code]})"

        # 4. Check for US Metros
        if not detected_loc:
            for metro in US_METROS:
                if re.search(rf"\b{re.escape(metro)}\b", full_text, re.IGNORECASE):
                    has_us_marker = True
                    detected_loc = f"{metro}, USA"
                    break

        # 5. Check for National US terms (Remote US, USA, etc.)
        if not detected_loc:
            for term in US_NATIONAL_TERMS:
                m = re.search(term, full_text, re.IGNORECASE)
                if m:
                    has_us_marker = True
                    detected_loc = f"{m.group(0).strip()} (United States)"
                    break

        # Decision logic:
        # If non-US terms are detected and no strong US job location exists, reject
        if has_non_us and not has_us_marker:
            return False, f"Non-US Location Detected ({', '.join(non_us_matched)})"

        # If both present, prioritize explicit US job location, e.g. "Dallas, TX (Client)" vs candidate origin
        if has_us_marker and has_non_us:
            # Check if US state was explicitly declared
            if any(st in (detected_loc or "") for st in ["USA", "United States"] + list(US_STATES.keys()) + list(US_STATES.values())):
                return True, detected_loc
            return False, f"Ambiguous Location ({', '.join(non_us_matched)})"

        if has_us_marker:
            return True, detected_loc

        # Insufficient evidence to assume US
        return False, None

    @staticmethod
    def match_keyword(text: str, target_keyword: Optional[str] = None) -> Tuple[bool, str]:
        """
        Matches text against the specified keyword or all 6 supported keywords.
        Returns:
            Tuple of (matched: bool, matched_keyword_name: str)
        """
        if not text:
            return False, ""

        if target_keyword and target_keyword in TARGET_KEYWORDS:
            patterns = TARGET_KEYWORDS[target_keyword]
            for pat in patterns:
                if re.search(pat, text, re.IGNORECASE):
                    return True, target_keyword
            return False, ""

        # Check all keywords in priority order
        for kw, patterns in TARGET_KEYWORDS.items():
            for pat in patterns:
                if re.search(pat, text, re.IGNORECASE):
                    return True, kw

        return False, ""

