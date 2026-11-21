import os
import json
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./c2c_automation.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from backend.models.models import (
        LinkedInPost,
        Recruiter,
        EmailCampaign,
        EmailLog,
        SearchHistory,
        ApplicationSetting,
    )
    Base.metadata.create_all(bind=engine)

    # Seed default application settings if empty
    db = SessionLocal()
    try:
        defaults = {
            "search_keywords": json.dumps([
                "Java Developer C2C",
                "Bench",
                "Sales",
                "W2",
                "Full-Time",
                "Hotlist"
            ]),
            "search_frequency_minutes": "60",
            "automation_enabled": "false",
            "company_name": "Apex Prime Solutions Inc.",
            "sender_name": "Alex Vance",
            "sender_title": "Director of Talent Partnerships & Bench Sales",
            "sender_email": os.getenv("GMAIL_SENDER_EMAIL", "alex.vance.benchsales@gmail.com"),
            "sender_phone": "+1 (415) 890-4421",
            "email_subject_template": "Top Bench Talent for {{ job_title }} | C2C & W2 Available",
            "linkedin_use_mock": os.getenv("LINKEDIN_USE_MOCK", "true"),
            "gmail_use_mock": os.getenv("GMAIL_USE_MOCK", "true"),
        }

        for key, val in defaults.items():
            existing = db.query(ApplicationSetting).filter(ApplicationSetting.key == key).first()
            if not existing:
                setting = ApplicationSetting(
                    key=key,
                    value=val,
                    description=f"Configuration for {key.replace('_', ' ')}",
                    updated_at=datetime.now(timezone.utc)
                )
                db.add(setting)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding default settings: {e}")
    finally:
        db.close()

