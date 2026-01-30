from .celery_app import celery_app
from .services.irs_ingestion_service import process_ingestion_job
from .db import SessionLocal
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3)
def task_process_ingestion_job(self, job_id: int):
    """
    Background task to process IRS 990 ingestion.
    """
    logger.info("Starting ingestion task for Job ID: %s", job_id)
    db = SessionLocal()
    try:
        process_ingestion_job(db, job_id)
    except Exception as e:
        logger.error("Task failed for Job ID %s: %s", job_id, str(e))
        # In a real scenario, we might retry based on exception type
        raise
    finally:
        db.close()
