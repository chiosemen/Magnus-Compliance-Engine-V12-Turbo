from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import AnalysisRequest, AnalysisResult
from ..schemas import AnalysisRequestCreate, AnalysisResultOut
from ..auth import require_user
from ..config import APP_MODE
from ..services.analysis_service import perform_analysis

router = APIRouter(prefix="/analysis")

@router.post("/quickcheck", response_model=AnalysisResultOut)
def quickcheck(req: AnalysisRequestCreate, db: Session = Depends(get_db), user=Depends(require_user)):
    if APP_MODE == "demo":
        result = perform_analysis(req.ein, req.org_id, simulated=True)
    else:
        result = perform_analysis(req.ein, req.org_id, simulated=False)
    # Persist request/result in REAL mode
    if APP_MODE == "real":
        ar = AnalysisRequest(org_id=req.org_id, ein=req.ein, requested_by=user.id)
        db.add(ar)
        db.commit()
        db.refresh(ar)
        res = AnalysisResult(request_id=ar.id, risk_score=result["risk_score"], factors=str(result["factors"]),
                             provenance=str(result["provenance"]), simulated=False)
        db.add(res)
        db.commit()
        db.refresh(res)
        result["id"] = res.id
        result["computed_at"] = res.computed_at
        result["version"] = res.version
    else:
        result["id"] = 0
        result["computed_at"] = None
        result["version"] = "demo"
    return result
