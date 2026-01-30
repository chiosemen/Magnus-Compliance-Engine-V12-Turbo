from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import require_user
from ..schemas import RiskScoreOut
from ..models import RiskScore, RiskScoreComponent
from ..services.risk_engine import compute_risk_score

router = APIRouter(prefix="/risk")

@router.post("/compute", response_model=RiskScoreOut)
def compute(org_id: int, db: Session = Depends(get_db), user=Depends(require_user)):
    score, components = compute_risk_score(db, org_id, user.id)
    out = {
        "id": score.id,
        "org_id": score.org_id,
        "score_total": score.score_total,
        "methodology_version": score.methodology_version,
        "computed_at": score.computed_at,
        "computed_by": score.computed_by,
        "simulated": score.simulated,
        "status": score.status,
        "components": [
            {
                "factor_code": c.factor_code,
                "factor_score": c.factor_score,
                "evidence_refs": c.evidence_refs,
                "explanation_text": c.explanation_text
            } for c in components
        ]
    }
    return out

@router.get("/latest", response_model=RiskScoreOut)
def latest(org_id: int, db: Session = Depends(get_db), user=Depends(require_user)):
    score = db.query(RiskScore).filter(RiskScore.org_id == org_id).order_by(RiskScore.computed_at.desc()).first()
    if not score:
        raise HTTPException(status_code=404, detail="No score found")
    components = db.query(RiskScoreComponent).filter(RiskScoreComponent.risk_score_id == score.id).all()
    out = {
        "id": score.id,
        "org_id": score.org_id,
        "score_total": score.score_total,
        "methodology_version": score.methodology_version,
        "computed_at": score.computed_at,
        "computed_by": score.computed_by,
        "simulated": score.simulated,
        "status": score.status,
        "components": [
            {
                "factor_code": c.factor_code,
                "factor_score": c.factor_score,
                "evidence_refs": c.evidence_refs,
                "explanation_text": c.explanation_text
            } for c in components
        ]
    }
    return out
