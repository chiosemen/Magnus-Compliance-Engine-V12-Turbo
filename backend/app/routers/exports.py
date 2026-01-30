from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import require_admin
from ..services.export_service import export_regulatory_package
from ..models import ExportRecord
from ..config import APP_MODE

router = APIRouter(prefix="/exports")

@router.post("/regulatory")
def regulatory_export(org_id: int, date_range: str, db: Session = Depends(get_db), user=Depends(require_admin)):
    if APP_MODE == "demo":
        raise HTTPException(status_code=403, detail="Export unavailable in demo mode")
    result = export_regulatory_package(db, org_id, date_range, user.id, environment=APP_MODE)
    return result
