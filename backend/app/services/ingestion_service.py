def enqueue_ingestion_job(db, org_id, ein, year_range):
    # In phase 1, just create a job row with status "not_implemented"
    from ..models import IngestionJob
    job = IngestionJob(org_id=org_id, ein=ein, year_range=year_range, status="not_implemented")
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
