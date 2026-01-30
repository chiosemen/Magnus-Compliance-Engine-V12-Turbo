
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from ..db import get_db
from ..auth import require_user
from ..models import AuditEvent, LitigationHold
from ..schemas import AuditEventOut
from ..services.audit_service import verify_audit_chain

router = APIRouter(prefix="/audit")

@router.get("/events", response_model=list[AuditEventOut])
def get_events(org_id: Optional[int] = None, db: Session = Depends(get_db), user=Depends(require_user)):
    # TODO: check user role for elevated access
    q = db.query(AuditEvent)
    if org_id:
        q = q.filter(AuditEvent.org_id == org_id)
    return q.order_by(AuditEvent.created_at).all()

@router.get("/verify-chain")
def verify_chain(org_id: int, db: Session = Depends(get_db), user=Depends(require_user)):
    # TODO: check user role for elevated access
    result = verify_audit_chain(db, org_id)
    return result
