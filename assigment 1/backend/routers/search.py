from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.models import SearchHistory
from backend.models.schemas import SearchHistoryRead, SearchTriggerRequest
from backend.services.linkedin_service import run_linkedin_search
from backend.services.email_service import EmailService

router = APIRouter(prefix="/api/search", tags=["LinkedIn Search"])


@router.post("/start")
def start_search(
    req: Optional[SearchTriggerRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Triggers an on-demand LinkedIn search across target keywords.
    Fetches posts, applies 24h & US location filters, extracts recruiters,
    and stages email drafts in PENDING_APPROVAL status.
    """
    keywords = req.keywords if req else None

    # Run LinkedIn post search & recruiter extraction
    search_result = run_linkedin_search(db=db, keywords=keywords)

    # Automatically prepare email drafts for any new valid recruiters
    drafts_result = EmailService.generate_all_pending_drafts(db)

    return {
        "status": "SUCCESS",
        "message": "Search and extraction pipeline completed successfully.",
        "search_summary": search_result,
        "drafts_summary": drafts_result
    }


@router.get("/history", response_model=List[SearchHistoryRead])
def get_search_history(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Retrieves audit trail of past automated and manual LinkedIn keyword searches."""
    history = db.query(SearchHistory).order_by(
        SearchHistory.search_timestamp.desc()
    ).offset(offset).limit(limit).all()
    return history

