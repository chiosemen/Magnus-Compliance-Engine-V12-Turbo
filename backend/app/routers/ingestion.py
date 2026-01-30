
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from ..db import get_db
from ..schemas import IngestionJobCreate, IngestionJobOut, SourceDocumentOut
from ..models import IngestionJob, SourceDocument, Client
from ..auth import require_user
from ..services.irs_ingestion_service import create_ingestion_job
from ..tasks import task_process_ingestion_job

router = APIRouter(prefix="/ingestion")

@router.post("/irs990", response_model=IngestionJobOut)
def irs990(job_in: IngestionJobCreate, db: Session = Depends(get_db), user: Client = Depends(require_user)):
    # IDOR / Auth Enforcement
    # If org_id is provided, it MUST match the authenticated user's ID.
    if job_in.org_id and job_in.org_id != user.client_id:
        raise HTTPException(status_code=403, detail="Not authorized to ingest for this organization.")
    
    # Validation
    if not job_in.ein or len(job_in.ein) < 9:
        raise HTTPException(status_code=400, detail="Invalid EIN")
        
    # Execute (Async)
    # We pass user.client_id as the org_id to ensure ownership
    job = create_ingestion_job(db, user.client_id, job_in.ein, job_in.tax_year)
    
    # Dispatch to queue
    task_process_ingestion_job.delay(job.id)
    
    return job

@router.get("/jobs/{job_id}", response_model=IngestionJobOut)
def get_job(job_id: int, db: Session = Depends(get_db), user=Depends(require_user)):
    job = db.query(IngestionJob).filter(IngestionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    # Access Control
    if str(job.org_id) != str(user.client_id):
         raise HTTPException(status_code=403, detail="Access denied")
    return job

@router.get("/documents", response_model=list[SourceDocumentOut])
def list_documents(org_id: Optional[int] = None, db: Session = Depends(get_db), user=Depends(require_user)):
    q = db.query(SourceDocument)
    if org_id:
        q = q.filter(SourceDocument.ein == org_id)
    return q.all()
