import json
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.models import ApplicationSetting
from backend.models.schemas import SettingUpdate
from backend.services.scheduler_service import SchedulerService

router = APIRouter(prefix="/api/settings", tags=["Application Settings"])


@router.get("")
def get_settings(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Retrieves all application configuration settings as a key-value dictionary."""
    records = db.query(ApplicationSetting).all()
    result = {}
    for r in records:
        try:
            # Parse JSON if possible (for keywords list, etc.)
            val = json.loads(r.value)
        except Exception:
            val = r.value
        result[r.key] = val
    return result


@router.put("")
def update_settings(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Updates application configuration settings.
    Dynamically adjusts background scheduler parameters when frequency or automation toggles change.
    """
    settings_dict = payload.get("settings", payload)

    updated_keys = []
    frequency_changed = False
    new_frequency = None

    for key, val in settings_dict.items():
        existing = db.query(ApplicationSetting).filter(ApplicationSetting.key == key).first()
        val_str = json.dumps(val) if isinstance(val, (list, dict)) else str(val)

        if existing:
            existing.value = val_str
            existing.updated_at = datetime.now(timezone.utc)
        else:
            new_setting = ApplicationSetting(
                key=key,
                value=val_str,
                description=f"Setting for {key}",
                updated_at=datetime.now(timezone.utc)
            )
            db.add(new_setting)

        updated_keys.append(key)

        if key == "search_frequency_minutes":
            try:
                new_frequency = int(val)
                frequency_changed = True
            except (ValueError, TypeError):
                pass

    db.commit()

    # Reconfigure Scheduler if needed
    if frequency_changed and new_frequency:
        SchedulerService.update_interval(new_frequency)

    return {
        "status": "SUCCESS",
        "message": f"Updated {len(updated_keys)} settings successfully.",
        "updated_keys": updated_keys
    }

