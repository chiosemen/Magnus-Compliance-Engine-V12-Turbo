from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from ..services.risk_engine import RiskAnalysisEngine, Transaction, RiskDetection
from ..auth import require_user

router = APIRouter(prefix="/caas/analysis", tags=["caas_analysis"])

engine = RiskAnalysisEngine()

@router.post("/transaction", response_model=List[RiskDetection])
async def analyze_transaction(transaction: Transaction, user=Depends(require_user)):
    """
    Analyze a single transaction for DAF compliance risks
    """
    try:
        risks = engine.analyze_transaction(transaction)
        return risks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch", response_model=Dict[str, List[RiskDetection]])
async def batch_analyze(transactions: List[Transaction], user=Depends(require_user)):
    """
    Analyze multiple transactions in batch
    """
    try:
        results = engine.batch_analyze(transactions)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
