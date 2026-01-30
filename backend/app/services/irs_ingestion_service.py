"""
IRS 990 Ingestion Service
- Uses ProPublica Nonprofit Explorer API (Option A)
- Fetches and persists raw 990 JSON
- Tracks provenance and job lifecycle
"""
import requests
import hashlib
from datetime import datetime
from sqlalchemy.orm import Session
from ..models import IngestionJob, SourceDocument
from ..config import APP_MODE

PROPUBLICA_API = "https://projects.propublica.org/nonprofits/api/v2/organizations/"

class IRSIngestionError(Exception):
    pass

def fetch_irs_990(ein: str, tax_year: int = None):
    url = f"{PROPUBLICA_API}{ein}.json"
    resp = requests.get(url, timeout=15)
    if resp.status_code == 404:
        raise IRSIngestionError("EIN not found in IRS/ProPublica dataset.")
    if resp.status_code != 200:
        raise IRSIngestionError(f"IRS/ProPublica API error: {resp.status_code}")
    data = resp.json()
    if not data.get("filings_with_data"):
        raise IRSIngestionError("No filings found for EIN.")
    filings = data["filings_with_data"]
    if tax_year:
        filings = [f for f in filings if f.get("tax_prd_yr") == tax_year]
        if not filings:
            raise IRSIngestionError("No filings for requested tax year.")
    filing = sorted(filings, key=lambda f: f["tax_prd_yr"], reverse=True)[0]
    return filing, url

def create_ingestion_job(db: Session, org_id: str, ein: str, tax_year: int = None):
    """
    Creates an initial ingestion job record in 'queued' state.
    Does NOT perform external API calls.
    """
    job = IngestionJob(
        org_id=org_id, 
        ein=ein, 
        tax_year=tax_year, 
        status="queued", 
        started_at=None,
        created_at=datetime.utcnow()
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

def process_ingestion_job(db: Session, job_id: int):
    """
    Executes the ingestion logic. Should be called by a background worker.
    """
    job = db.query(IngestionJob).filter(IngestionJob.id == job_id).first()
    if not job:
        return
    
    # Update status to running
    job.status = "running"
    job.started_at = datetime.utcnow()
    db.commit()
    
    try:
        filing, source_url = fetch_irs_990(job.ein, job.tax_year)
        raw_json = filing
        # Canonicalize JSON for hashing? Or just raw bytes?
        # Using sorted keys for consistency
        import json
        raw_bytes = json.dumps(raw_json, sort_keys=True).encode("utf-8")
        sha256 = hashlib.sha256(raw_bytes).hexdigest()
        
        doc = SourceDocument(
            ingestion_job_id=job.id,
            document_type=filing.get("formtype", "990"),
            tax_year=filing.get("tax_prd_yr"),
            source_url=source_url,
            source_hash=sha256,
            raw_payload=raw_json,
            fetched_at=datetime.utcnow(),
            ein=job.ein
        )
        db.add(doc)
        job.status = "succeeded"
        job.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(job)
        return job
        
    except IRSIngestionError as e:
        job.status = "failed"
        job.error_message = str(e)
        job.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(job)
        return job
    except Exception as e:
        job.status = "failed"
        job.error_message = f"Unexpected error: {e}"
        job.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(job)
        return job
