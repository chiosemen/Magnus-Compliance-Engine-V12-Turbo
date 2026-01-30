from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Optional
from ..services.whistleblower_module import WhistleblowerModule, WhistleblowerReport, SubmissionStatus
from ..auth import require_user

router = APIRouter(prefix="/caas/whistleblower", tags=["caas_whistleblower"])

module = WhistleblowerModule()

@router.post("/reports", response_model=WhistleblowerReport)
async def create_report(
    client_id: str,
    violation_amount: float,
    case_id: Optional[str] = None,
    user=Depends(require_user)
):
    """
    Create a new whistleblower report draft
    """
    try:
        report = module.create_report(client_id, violation_amount, case_id)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/reports/{report_id}/status", response_model=WhistleblowerReport)
async def update_status(
    report_id: str,
    new_status: SubmissionStatus,
    award_amount: Optional[float] = None,
    user=Depends(require_user)
):
    """
    Update the status of an IRS claim
    """
    # Mocked: in production, fetch report from DB
    report = module.create_report("demo", 100000.0) 
    report.report_id = report_id
    
    return module.update_status(report, new_status, award_amount)

@router.post("/reports/{report_id}/package")
async def get_package(report_id: str, irs_data: Dict, user=Depends(require_user)):
    """
    Finalize the submission package
    """
    # Mocked: in production, fetch report from DB
    report = module.create_report("demo", 100000.0)
    report.report_id = report_id
    
    return module.get_submission_package(report, irs_data)
