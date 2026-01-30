from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from ..services.tax_form_service import TaxFormService, Form4720Data
from ..auth import require_user
import os

router = APIRouter(prefix="/tax-forms", tags=["tax-forms"])
tax_form_service = TaxFormService()

class Form4720Request(Form4720Data):
    pass

@router.post("/4720")
async def generate_4720(request: Form4720Request, user=Depends(require_user)):
    """
    Generate IRS Form 4720 PDF draft
    """
    try:
        file_path = tax_form_service.generate_form_4720_pdf(request)
        # In a real app, we'd return a metadata object with a download link
        # For simplicity, returning the filename/id
        return {"status": "success", "file_path": file_path, "download_url": f"/api/tax-forms/download?path={os.path.basename(file_path)}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download")
async def download_tax_form(path: str, user=Depends(require_user)):
    """
    Download a generated tax form
    """
    safe_path = os.path.join("generated_tax_forms", os.path.basename(path))
    if not os.path.exists(safe_path):
        raise HTTPException(status_code=404, detail="Form not found")
    
    with open(safe_path, "rb") as f:
        content = f.read()
        
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={os.path.basename(path)}"}
    )
