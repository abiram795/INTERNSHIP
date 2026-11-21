import logging
from datetime import datetime, timezone
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from backend.database import SessionLocal
from backend.models.models import ApplicationSetting
from backend.services.linkedin_service import run_linkedin_search
from backend.services.email_service import EmailService

logger = logging.getLogger("api_c2c.scheduler")

scheduler = BackgroundScheduler(daemon=True)
_is_running = False


def _scheduled_task():
    """Periodic job executed by the background scheduler."""
    logger.info("Executing periodic automated LinkedIn search task...")
    db = SessionLocal()
    try:
        # Check if automation is currently enabled in settings
        auto_setting = db.query(ApplicationSetting).filter(ApplicationSetting.key == "automation_enabled").first()
        is_enabled = (auto_setting.value.lower() == "true") if auto_setting else False

        if not is_enabled:
            logger.info("Automation is disabled in settings. Skipping scheduled run.")
            return

        # 1. Search posts & extract recruiters
        search_res = run_linkedin_search(db)
        logger.info(f"Scheduled search finished: {search_res['total_posts_saved']} new posts, {search_res['total_recruiters_found']} recruiters.")

        # 2. Automatically generate drafts in PENDING_APPROVAL status (STRICTLY NO AUTO-SENDING without admin approval!)
        drafts_res = EmailService.generate_all_pending_drafts(db)
        logger.info(f"Generated {drafts_res['drafts_created']} email drafts awaiting admin review.")

    except Exception as e:
        logger.error(f"Error in scheduled task: {e}")
    finally:
        db.close()


class SchedulerService:

    @staticmethod
    def start():
        global _is_running
        if not _is_running:
            db = SessionLocal()
            try:
                freq_setting = db.query(ApplicationSetting).filter(ApplicationSetting.key == "search_frequency_minutes").first()
                frequency = int(freq_setting.value) if (freq_setting and freq_setting.value.isdigit()) else 60

                scheduler.add_job(
                    _scheduled_task,
                    trigger=IntervalTrigger(minutes=max(frequency, 5)),
                    id="linkedin_c2c_search_job",
                    replace_existing=True,
                    next_run_time=None  # Don't run immediately on start; wait for interval or manual trigger
                )
                scheduler.start()
                _is_running = True
                logger.info(f"Background scheduler started with interval {frequency} minutes.")
            except Exception as e:
                logger.error(f"Failed to start scheduler: {e}")
            finally:
                db.close()

    @staticmethod
    def stop():
        global _is_running
        if _is_running:
            try:
                scheduler.shutdown(wait=False)
                _is_running = False
                logger.info("Background scheduler stopped.")
            except Exception as e:
                logger.error(f"Error stopping scheduler: {e}")

    @staticmethod
    def update_interval(frequency_minutes: int):
        global _is_running
        if _is_running:
            try:
                scheduler.reschedule_job(
                    "linkedin_c2c_search_job",
                    trigger=IntervalTrigger(minutes=max(frequency_minutes, 5))
                )
                logger.info(f"Scheduler interval updated to {frequency_minutes} minutes.")
            except Exception as e:
                logger.error(f"Failed to reschedule job: {e}")

    @staticmethod
    def trigger_immediate():
        """Triggers the search pipeline immediately in background or synchronously."""
        _scheduled_task()

    @staticmethod
    def get_status() -> dict:
        global _is_running
        job = scheduler.get_job("linkedin_c2c_search_job") if _is_running else None
        return {
            "scheduler_running": _is_running,
            "job_exists": job is not None,
            "next_run_time": job.next_run_time.isoformat() if (job and job.next_run_time) else None
        }

