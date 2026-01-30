from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import require_user
from ..services.ai_interpretation_service import generate_ai_interpretation, revoke_ai_interpretation, get_ai_interpretations
from ..models import AIInterpretation

router = APIRouter()

@router.post("/ai/interpret")
def interpret(org_id: int, interpretation_type: str, referenced_entities: dict, db: Session = Depends(get_db), user=Depends(require_user)):
    interp = generate_ai_interpretation(db, org_id, interpretation_type, referenced_entities, user.id)
    return {
        "id": interp.id,
        "org_id": interp.org_id,
        "interpretation_type": interp.interpretation_type,
        "input_refs": interp.input_refs,
        "ai_output_text": interp.ai_output_text,
        "ai_model_version": interp.ai_model_version,
        "generated_at": interp.generated_at,
        "advisory_disclaimer": interp.advisory_disclaimer,
        "revoked": interp.revoked,
        "revoked_at": interp.revoked_at
    }

@router.post("/ai/revoke/{interpretation_id}")
def revoke(interpretation_id: int, db: Session = Depends(get_db), user=Depends(require_user)):
    interp = revoke_ai_interpretation(db, interpretation_id, user.id)
    if not interp:
        raise HTTPException(status_code=404, detail="Interpretation not found or already revoked")
    return {"status": "revoked", "id": interp.id, "revoked_at": interp.revoked_at}

@router.get("/ai/interpretations")
def list_interpretations(org_id: int, db: Session = Depends(get_db), user=Depends(require_user)):
    interps = get_ai_interpretations(db, org_id)
    return [
        {
            "id": i.id,
            "org_id": i.org_id,
            "interpretation_type": i.interpretation_type,
            "input_refs": i.input_refs,
            "ai_output_text": i.ai_output_text,
            "ai_model_version": i.ai_model_version,
            "generated_at": i.generated_at,
            "advisory_disclaimer": i.advisory_disclaimer,
            "revoked": i.revoked,
            "revoked_at": i.revoked_at
        } for i in interps
    ]
from fastapi import APIRouter, Depends, HTTPException
from ..auth import require_user
from ..services.gemini_proxy import gemini_summary

router = APIRouter(prefix="/ai/gemini")

@router.post("/summary")
def summary(prompt: str, user=Depends(require_user)):
    return gemini_summary(prompt)
