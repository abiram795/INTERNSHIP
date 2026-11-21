import os
import uuid
import json
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import requests
from sqlalchemy.orm import Session
from backend.models.models import LinkedInPost, SearchHistory, ApplicationSetting
from backend.services.post_filter_service import PostFilterService
from backend.services.recruiter_service import RecruiterService

logger = logging.getLogger("api_c2c.linkedin")

DEFAULT_KEYWORDS = [
    "Java Developer C2C",
    "Bench",
    "Sales",
    "W2",
    "Full-Time",
    "Hotlist"
]


class LinkedInDataProviderInterface(ABC):
    """
    Standard interface for LinkedIn Data Access.
    Ensures decoupled architecture between real authorized API and mock provider.
    """

    @abstractmethod
    def search_posts(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Searches and retrieves posts for a specific keyword."""
        pass


class OfficialLinkedInDataProvider(LinkedInDataProviderInterface):
    """
    Officially authorized LinkedIn API client.
    Complies strictly with LinkedIn Developer terms:
    - Uses OAuth 2.0 Bearer tokens
    - Never uses scrapers, headless browsers, or CAPTCHA bypasses
    """

    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token or os.getenv("LINKEDIN_ACCESS_TOKEN", "")
        self.base_url = "https://api.linkedin.com/v2"

    def search_posts(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        if not self.access_token:
            logger.warning("No LinkedIn OAuth access token configured. Fallback to authorized mock provider.")
            raise PermissionError("LinkedIn API Access Token not configured.")

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json"
        }

        # LinkedIn Marketing / UGC or Organization Posts Search Endpoint
        url = f"{self.base_url}/ugcPosts"
        params = {"q": "authors", "count": limit}

        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                results = []
                for item in data.get("elements", []):
                    # Map authorized LinkedIn schema to internal format
                    post_id = item.get("id", str(uuid.uuid4()))
                    text = item.get("specificContent", {}).get("com.linkedin.ugc.ShareContent", {}).get("text", {}).get("text", "")
                    author = item.get("author", "LinkedIn Member")
                    pub_timestamp = item.get("created", {}).get("time", 0) / 1000.0
                    pub_date = datetime.fromtimestamp(pub_timestamp, tz=timezone.utc) if pub_timestamp else datetime.now(timezone.utc)

                    results.append({
                        "post_id": post_id,
                        "post_url": f"https://www.linkedin.com/feed/update/{post_id}",
                        "content": text,
                        "author_name": author,
                        "company_name": "Verified LinkedIn Partner",
                        "publication_date": pub_date.isoformat(),
                        "keyword": keyword,
                        "location_declared": "United States"
                    })
                return results
            else:
                logger.error(f"LinkedIn API error {response.status_code}: {response.text}")
                raise RuntimeError(f"LinkedIn API returned status {response.status_code}")
        except Exception as e:
            logger.error(f"Failed to communicate with LinkedIn API: {e}")
            raise


class MockLinkedInDataProvider(LinkedInDataProviderInterface):
    """
    High-fidelity Mock Data Provider for demonstration and testing.
    Generates realistic, rich IT staffing and recruiter posts with varying:
    - Keywords
    - Timestamps (both within last 24h and older)
    - Locations (US states like CA, TX, NY, NJ, NC, IL and Non-US like UK, India)
    - Valid, disposable, and missing recruiter emails
    """

    def __init__(self):
        pass

    def search_posts(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        now = datetime.now(timezone.utc)

        # Diverse pool of realistic posts tailored for each keyword
        posts_pool = {
            "Java Developer C2C": [
                {
                    "author": "Marcus Sterling",
                    "company": "Apex Technology Partners",
                    "content": (
                        "🚀 Hot C2C Requirement! Looking for a Senior Java Developer with Spring Boot & Microservices "
                        "for a 12+ month contract in Austin, TX (Hybrid/Remote option available). "
                        "Must have 8+ years experience, AWS, Kafka, and Kubernetes. Corp-to-Corp (C2C) only. "
                        "Please send updated resumes to marcus.sterling@apextechpartners.com. Thanks & Regards,\nMarcus Sterling"
                    ),
                    "hours_ago": 2.5,
                    "location": "Austin, TX, USA",
                    "url_slug": "urn:li:share:719827364501"
                },
                {
                    "author": "Priya Sharma",
                    "company": "Vanguard Talent Solutions",
                    "content": (
                        "Urgent Need: Lead Java Full Stack Developer (Angular + Spring Boot) on C2C basis. "
                        "Location: San Jose, California (Remote US candidates welcome). "
                        "Rate: $85-$95/hr on C2C. Immediate interview slots for tomorrow. "
                        "Reach me at priya.sharma@vanguardtalentsolutions.com or DM me directly. Regards,\nPriya Sharma"
                    ),
                    "hours_ago": 5.0,
                    "location": "San Jose, CA, USA",
                    "url_slug": "urn:li:share:719827364502"
                },
                {
                    "author": "David Miller",
                    "company": "CloudEdge Systems",
                    "content": (
                        "Java Backend Developer role for our direct financial client in New York, NY. "
                        "We can sponsor or work on C2C / Corp-to-Corp. Java 17, Spring Cloud, PostgreSQL. "
                        "Direct client requirement. Send profiles to david.miller@cloudedgesystems.com. Best,\nDavid Miller"
                    ),
                    "hours_ago": 16.0,
                    "location": "New York, NY, USA",
                    "url_slug": "urn:li:share:719827364503"
                },
                {
                    "author": "Rajesh Kumar",
                    "company": "Infosys Global",
                    "content": (
                        "Immediate opening for Senior Java Developer in Bangalore, India. "
                        "Notice period: Immediate to 15 days. Location: Electronic City, Bengaluru. "
                        "Contact rajesh.k@infosysglobal.in. (India positions only)."
                    ),
                    "hours_ago": 3.0,
                    "location": "Bangalore, India",
                    "url_slug": "urn:li:share:719827364504"
                },
                {
                    "author": "Elena Rostova",
                    "company": "Synergy IT Inc",
                    "content": (
                        "Java C2C opening in Chicago, IL from last week. Project duration 6 months. "
                        "Please email elena@synergyit.org."
                    ),
                    "hours_ago": 32.0,  # Older than 24h
                    "location": "Chicago, IL, USA",
                    "url_slug": "urn:li:share:719827364505"
                }
            ],
            "Bench": [
                {
                    "author": "Kevin O'Connor",
                    "company": "NextGen Staffing USA",
                    "content": (
                        "🔥 Excellent Java & AWS Consultants available immediately on Bench! "
                        "We have 3 Senior Java Developers (10+ yrs exp, USC/GC) ready for C2C deployment across US timezones. "
                        "Location: Dallas, Texas / Remote US. "
                        "Contact our bench sales desk: kevin.oconnor@nextgenstaffingusa.com. Thanks & Regards,\nKevin O'Connor"
                    ),
                    "hours_ago": 4.0,
                    "location": "Dallas, TX, USA",
                    "url_slug": "urn:li:share:719827364511"
                },
                {
                    "author": "Sarah Jenkins",
                    "company": "Beacon Tech Resources",
                    "content": (
                        "Direct Client Requirement for our Bench: Senior Java Microservices Architect. "
                        "Location: Edison, NJ (Hybrid). US Citizens and Green Card holders on W2 or C2C preferred. "
                        "Please email updated CV to sarah.jenkins@beacontechresources.com. Regards,\nSarah Jenkins"
                    ),
                    "hours_ago": 8.0,
                    "location": "Edison, NJ, USA",
                    "url_slug": "urn:li:share:719827364512"
                },
                {
                    "author": "Amit Patel",
                    "company": "TechBench Inc",
                    "content": (
                        "On Bench: Java Full Stack Engineer with React, Python and GCP experience. "
                        "Looking for prime vendor C2C roles in Charlotte, NC or US Remote. "
                        "Email: amit.patel@techbenchpartners.com."
                    ),
                    "hours_ago": 42.0,  # Older than 24h
                    "location": "Charlotte, NC, USA",
                    "url_slug": "urn:li:share:719827364513"
                }
            ],
            "Sales": [
                {
                    "author": "Brandon Cole",
                    "company": "TalentBridge Consulting",
                    "content": (
                        "We are expanding our IT Bench Sales team in Atlanta, GA! Hiring an experienced Bench Sales Recruiter "
                        "with proven US IT staffing track record placing Java, DevOps, and Data candidates on C2C. "
                        "Reach out to brandon.cole@talentbridgeusa.com with your resume. Best,\nBrandon Cole"
                    ),
                    "hours_ago": 6.5,
                    "location": "Atlanta, GA, USA",
                    "url_slug": "urn:li:share:719827364521"
                },
                {
                    "author": "Michelle Zhao",
                    "company": "Apex Sales Network",
                    "content": (
                        "Looking for strong implementation partners and Tier-1 vendors for our Java and Cloud consultants. "
                        "Operating across East Coast and Central US. "
                        "Share your open C2C requirements with michelle.zhao@apexsalesnetwork.com."
                    ),
                    "hours_ago": 11.0,
                    "location": "Philadelphia, PA, USA",
                    "url_slug": "urn:li:share:719827364522"
                }
            ],
            "W2": [
                {
                    "author": "Robert Langdon",
                    "company": "CyberCore Solutions",
                    "content": (
                        "Direct Hire / W2 Only: Senior Enterprise Java Architect needed for healthcare leader in Boston, MA. "
                        "Must be on W2 (US Citizen or Green Card). No C2C or sub-contracting for this position. "
                        "Salary $160K - $180K + benefits. Send resume to robert.langdon@cybercoresolutions.com. Sincerely,\nRobert Langdon"
                    ),
                    "hours_ago": 1.5,
                    "location": "Boston, MA, USA",
                    "url_slug": "urn:li:share:719827364531"
                },
                {
                    "author": "Samantha Reed",
                    "company": "Evergreen Tech Partners",
                    "content": (
                        "Contract-to-hire on W2: Java Spring Boot Developer in Seattle, Washington (Remote US). "
                        "Rate: $70/hr on W2. Client interview next Tuesday. "
                        "Reach me at samantha.reed@evergreentechpartners.com."
                    ),
                    "hours_ago": 14.0,
                    "location": "Seattle, WA, USA",
                    "url_slug": "urn:li:share:719827364532"
                },
                {
                    "author": "Oliver Smith",
                    "company": "London Tech Recruiters",
                    "content": (
                        "Contract role for Java Developer in Canary Wharf, London, UK. "
                        "PAYE / Umbrella W2 equivalent. UK work authorization required. "
                        "Contact oliver.smith@londontechrecruiters.co.uk."
                    ),
                    "hours_ago": 7.0,
                    "location": "London, United Kingdom",
                    "url_slug": "urn:li:share:719827364533"
                }
            ],
            "Full-Time": [
                {
                    "author": "Daniel Kim",
                    "company": "Apex FinTech Systems",
                    "content": (
                        "Full-Time Permanent Opportunity: Staff Java Developer (Core Java, Low Latency, Multithreading) "
                        "in San Francisco, CA. Base salary $190k - $220k + Equity. "
                        "Apply directly: daniel.kim@apexfintechsystems.com. Best regards,\nDaniel Kim"
                    ),
                    "hours_ago": 3.5,
                    "location": "San Francisco, CA, USA",
                    "url_slug": "urn:li:share:719827364541"
                },
                {
                    "author": "Jessica Taylor",
                    "company": "Pinnacle Group",
                    "content": (
                        "Immediate Full-Time placement for Lead Java Spring Engineer in Denver, Colorado (Hybrid). "
                        "Relocation assistance provided within US. "
                        "Email jessica.taylor@pinnaclegroupconsulting.com. Regards,\nJessica Taylor"
                    ),
                    "hours_ago": 19.0,
                    "location": "Denver, CO, USA",
                    "url_slug": "urn:li:share:719827364542"
                }
            ],
            "Hotlist": [
                {
                    "author": "Alex Rivera",
                    "company": "Prime Talent Global",
                    "content": (
                        "🔥 FRESH BENCH HOTLIST! High caliber consultants available for C2C projects starting immediately:\n"
                        "1. Senior Java Full Stack Developer (10+ yrs) - Dallas, TX\n"
                        "2. Java Cloud Architect (12+ yrs, AWS/Azure) - New Jersey\n"
                        "3. Core Java Microservices Lead (9 yrs) - Remote US\n"
                        "Please send your open C2C requirements to alex.rivera@primetalentglobal.com. Thanks,\nAlex Rivera"
                    ),
                    "hours_ago": 2.0,
                    "location": "Dallas, TX, USA",
                    "url_slug": "urn:li:share:719827364551"
                },
                {
                    "author": "Vikram Sethi",
                    "company": "Consulting Hotlist Hub",
                    "content": (
                        "Hotlist of Available Consultants: Java, DevOps, Data Engineers available for C2C in Florida, FL. "
                        "Contact temp-recruiter@mailinator.com for rate confirmation."  # Demonstrates disposable email detection
                    ),
                    "hours_ago": 9.0,
                    "location": "Orlando, FL, USA",
                    "url_slug": "urn:li:share:719827364552"
                },
                {
                    "author": "Laura Martinez",
                    "company": "Apex Staffing Solutions",
                    "content": (
                        "Updated Hotlist for November. Java & Angular developers on bench ready for immediate C2C client projects. "
                        "Location: Phoenix, Arizona / Remote USA. "
                        "Contact laura.martinez@apexstaffingsolutions.com. Cheers,\nLaura Martinez"
                    ),
                    "hours_ago": 23.0,
                    "location": "Phoenix, AZ, USA",
                    "url_slug": "urn:li:share:719827364553"
                }
            ]
        }

        selected_posts = posts_pool.get(keyword, [])
        results = []

        for p in selected_posts:
            pub_date = now - timedelta(hours=p["hours_ago"])
            post_id = p["url_slug"]
            results.append({
                "post_id": post_id,
                "post_url": f"https://www.linkedin.com/feed/update/{post_id}",
                "content": p["content"],
                "author_name": p["author"],
                "company_name": p["company"],
                "publication_date": pub_date.isoformat(),
                "keyword": keyword,
                "location_declared": p["location"]
            })

        return results[:limit]


def get_data_provider(db: Session, force_mock: Optional[bool] = None) -> LinkedInDataProviderInterface:
    """Factory function returning the appropriate LinkedIn data provider."""
    if force_mock is True:
        return MockLinkedInDataProvider()

    # Check database application settings
    use_mock_setting = db.query(ApplicationSetting).filter(ApplicationSetting.key == "linkedin_use_mock").first()
    use_mock_val = (use_mock_setting.value.lower() == "true") if use_mock_setting else True

    if not use_mock_val and os.getenv("LINKEDIN_ACCESS_TOKEN"):
        try:
            return OfficialLinkedInDataProvider()
        except Exception:
            return MockLinkedInDataProvider()

    return MockLinkedInDataProvider()


def run_linkedin_search(
    db: Session,
    keywords: Optional[List[str]] = None,
    force_mock: Optional[bool] = None
) -> Dict[str, Any]:
    """
    Executes LinkedIn post search across keywords separately,
    applies 24h & location filters, prevents duplicate posts,
    extracts recruiters, and records search history.
    """
    if not keywords:
        kw_setting = db.query(ApplicationSetting).filter(ApplicationSetting.key == "search_keywords").first()
        if kw_setting and kw_setting.value:
            try:
                keywords = json.loads(kw_setting.value)
            except Exception:
                keywords = DEFAULT_KEYWORDS
        else:
            keywords = DEFAULT_KEYWORDS

    provider = get_data_provider(db, force_mock=force_mock)
    source_label = "MOCK_PROVIDER" if isinstance(provider, MockLinkedInDataProvider) else "AUTHORIZED_API"

    total_posts_found = 0
    total_posts_saved = 0
    total_recruiters_found = 0
    search_summaries = []

    for kw in keywords:
        kw_clean = kw.strip()
        if not kw_clean:
            continue

        try:
            raw_posts = provider.search_posts(keyword=kw_clean, limit=10)
            kw_posts_found = len(raw_posts)
            kw_posts_saved = 0
            kw_recruiters_found = 0

            for p in raw_posts:
                post_url = p["post_url"]
                post_id = p["post_id"]

                # Deduplication check
                existing = db.query(LinkedInPost).filter(
                    (LinkedInPost.post_url == post_url) | (LinkedInPost.post_id == post_id)
                ).first()

                # Parse publication date
                pub_date_str = p["publication_date"]
                if isinstance(pub_date_str, str):
                    pub_date = datetime.fromisoformat(pub_date_str)
                else:
                    pub_date = pub_date_str

                # Apply Filters
                is_within_24h = PostFilterService.is_within_24_hours(pub_date)
                is_us, detected_loc = PostFilterService.filter_location(
                    text=p["content"],
                    declared_location=p.get("location_declared")
                )

                if existing:
                    # Update filters if changed
                    existing.is_within_24h = is_within_24h
                    existing.is_us_based = is_us
                    existing.detected_location = detected_loc
                    db.commit()
                    post_obj = existing
                else:
                    post_obj = LinkedInPost(
                        post_id=post_id,
                        post_url=post_url,
                        content=p["content"],
                        author_name=p["author_name"],
                        company_name=p.get("company_name"),
                        publication_date=pub_date,
                        keyword=kw_clean,
                        is_us_based=is_us,
                        detected_location=detected_loc,
                        is_within_24h=is_within_24h,
                        raw_data=json.dumps(p)
                    )
                    db.add(post_obj)
                    db.commit()
                    db.refresh(post_obj)
                    kw_posts_saved += 1

                # If post is valid and within target criteria, extract recruiter
                if post_obj.is_within_24h and post_obj.is_us_based:
                    recruiter = RecruiterService.extract_and_save_recruiter(db, post_obj)
                    if recruiter:
                        kw_recruiters_found += 1

            # Log search history for this keyword
            history = SearchHistory(
                keyword=kw_clean,
                status="SUCCESS",
                posts_found=kw_posts_found,
                posts_saved=kw_posts_saved,
                recruiters_found=kw_recruiters_found,
                search_timestamp=datetime.now(timezone.utc),
                source=source_label,
                notes=f"Keyword '{kw_clean}' processed via {source_label}"
            )
            db.add(history)
            db.commit()

            total_posts_found += kw_posts_found
            total_posts_saved += kw_posts_saved
            total_recruiters_found += kw_recruiters_found

            search_summaries.append({
                "keyword": kw_clean,
                "posts_found": kw_posts_found,
                "posts_saved": kw_posts_saved,
                "recruiters_found": kw_recruiters_found
            })

        except Exception as e:
            logger.error(f"Error processing keyword '{kw_clean}': {e}")
            db.rollback()
            history = SearchHistory(
                keyword=kw_clean,
                status="FAILED",
                posts_found=0,
                posts_saved=0,
                recruiters_found=0,
                search_timestamp=datetime.now(timezone.utc),
                source=source_label,
                notes=str(e)
            )
            db.add(history)
            db.commit()

    return {
        "status": "COMPLETED",
        "provider": source_label,
        "keywords_searched": len(keywords),
        "total_posts_found": total_posts_found,
        "total_posts_saved": total_posts_saved,
        "total_recruiters_found": total_recruiters_found,
        "details": search_summaries
    }

