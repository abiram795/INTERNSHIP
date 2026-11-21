from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.models import Recruiter
from backend.models.schemas import RecruiterRead

router = APIRouter(prefix="/api/recruiters", tags=["Recruiters"])


@router.get("", response_model=List[RecruiterRead])
def get_recruiters(
    validation_status: Optional[str] = None,
    keyword: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Fetches extracted recruiters with optional filters:
    - validation_status (VALID, RISKY, INVALID)
    - keyword
    - search (matches name, email, company, job_title)
    """
    query = db.query(Recruiter)

    if validation_status and validation_status.upper() != "ALL":
        query = query.filter(Recruiter.email_validation_status == validation_status.upper())

    if keyword and keyword.lower() != "all":
        query = query.filter(Recruiter.matched_keyword == keyword)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Recruiter.name.ilike(search_fmt)) |
            (Recruiter.email.ilike(search_fmt)) |
            (Recruiter.company.ilike(search_fmt)) |
            (Recruiter.job_title.ilike(search_fmt)) |
            (Recruiter.location.ilike(search_fmt))
        )

    recruiters = query.order_by(Recruiter.created_at.desc()).offset(offset).limit(limit).all()
    return recruiters


@router.get("/{id}", response_model=RecruiterRead)
def get_recruiter_by_id(id: int, db: Session = Depends(get_db)):
    """Retrieves detailed profile and validation details for a single recruiter."""
    recruiter = db.query(Recruiter).filter(Recruiter.id == id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return recruiter

