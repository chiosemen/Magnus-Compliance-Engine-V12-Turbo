from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from ..services.remediation_service import RemediationService, RemediationCase, RemediationTier, RemediationTemplate
from ..auth import require_user

router = APIRouter(prefix="/caas/remediation", tags=["caas_remediation"])

service = RemediationService()

@router.post("/cases", response_model=RemediationCase)
async def create_case(
    client_id: str,
    violation_type: str,
    risk_level: str,
    violation_amount: float,
    tier: RemediationTier,
    user=Depends(require_user)
):
    """
    Create a new remediation case
    """
    try:
        case = service.create_case(client_id, violation_type, risk_level, violation_amount, tier)
        return case
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cases/{case_id}/template", response_model=RemediationTemplate)
async def get_template(case_id: str, user=Depends(require_user)):
    """
    Generate a correction template for a case
    (Mocked: in production, fetch case from DB first)
    """
    # For demo purposes, we'll create a dummy case
    dummy_case = RemediationCase(
        case_id=case_id,
        client_id="demo",
        violation_type="self_dealing",
        risk_level="high",
        violation_amount=10000.0,
        tier=RemediationTier.STANDARD,
        estimated_cost=2500.0
    )
    return service.generate_correction_template(dummy_case)

@router.get("/cases/{case_id}/progress")
async def get_progress(case_id: str, user=Depends(require_user)):
    """
    Track remediation case progress
    """
    return service.track_progress(case_id)
