import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.models import LinkedInPost
from backend.models.schemas import LinkedInPostRead, LinkedInPostCreate
from backend.services.post_filter_service import PostFilterService
from backend.services.recruiter_service import RecruiterService

router = APIRouter(prefix="/api/posts", tags=["LinkedIn Posts"])


@router.get("", response_model=List[LinkedInPostRead])
def get_posts(
    keyword: Optional[str] = None,
    is_us_based: Optional[bool] = None,
    is_within_24h: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Fetches collected LinkedIn posts with multi-parameter filtering:
    - By Keyword
    - By 24h publication window
    - By US geographic location
    - By full-text query
    """
    query = db.query(LinkedInPost)

    if keyword and keyword.lower() != "all":
        query = query.filter(LinkedInPost.keyword == keyword)

    if is_us_based is not None:
        query = query.filter(LinkedInPost.is_us_based == is_us_based)

    if is_within_24h is not None:
        query = query.filter(LinkedInPost.is_within_24h == is_within_24h)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (LinkedInPost.content.ilike(search_fmt)) |
            (LinkedInPost.author_name.ilike(search_fmt)) |
            (LinkedInPost.company_name.ilike(search_fmt))
        )

    posts = query.order_by(LinkedInPost.publication_date.desc()).offset(offset).limit(limit).all()
    return posts


@router.get("/{id}", response_model=LinkedInPostRead)
def get_post_by_id(id: int, db: Session = Depends(get_db)):
    """Retrieves a single LinkedIn post record by primary key."""
    post = db.query(LinkedInPost).filter(LinkedInPost.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("", response_model=LinkedInPostRead)
def create_custom_post(post_data: LinkedInPostCreate, db: Session = Depends(get_db)):
    """
    Manually injects or tests an authorized LinkedIn post.
    Automatically applies 24h & US location filters and triggers recruiter extraction.
    """
    # Check duplicate URL
    existing = db.query(LinkedInPost).filter(LinkedInPost.post_url == post_data.post_url).first()
    if existing:
        raise HTTPException(status_code=400, detail="A post with this URL already exists.")

    post_id = post_data.post_id or f"custom_{uuid.uuid4().hex[:10]}"
    pub_date = post_data.publication_date or datetime.now(timezone.utc)

    # Apply Filters
    is_within_24h = PostFilterService.is_within_24_hours(pub_date)
    is_us, detected_loc = PostFilterService.filter_location(
        text=post_data.content,
        declared_location=post_data.detected_location
    )

    new_post = LinkedInPost(
        post_id=post_id,
        post_url=post_data.post_url,
        content=post_data.content,
        author_name=post_data.author_name,
        author_profile_url=post_data.author_profile_url,
        company_name=post_data.company_name,
        publication_date=pub_date,
        keyword=post_data.keyword,
        is_us_based=is_us,
        detected_location=detected_loc,
        is_within_24h=is_within_24h,
        raw_data=post_data.raw_data
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    # Recruiter extraction
    if new_post.is_within_24h and new_post.is_us_based:
        RecruiterService.extract_and_save_recruiter(db, new_post)

    return new_post

