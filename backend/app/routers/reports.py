from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Report, AnalysisResult
from ..schemas import ReportCreate, ReportOut
from ..auth import require_user
from ..services.report_service import generate_pdf_report

router = APIRouter(prefix="/reports")

@router.post("", response_model=ReportOut)
def create_report(report_in: ReportCreate, db: Session = Depends(get_db), user=Depends(require_user)):
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == report_in.analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    file_path = generate_pdf_report(analysis.id, analysis.risk_score, analysis.factors, analysis.provenance)
    report = Report(analysis_id=analysis.id, file_path=file_path)
    db.add(report)
    db.commit()
    db.refresh(report)
    return {"id": report.id, "download_url": f"/api/reports/{report.id}/download"}

@router.get("/{report_id}/download")
def download_report(report_id: int, db: Session = Depends(get_db), user=Depends(require_user)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    with open(report.file_path, "rb") as f:
        pdf_bytes = f.read()
    return Response(content=pdf_bytes, media_type="application/pdf")
