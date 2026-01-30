"""
CaaS Tax Form Generation Service
Automates the preparation of IRS Form 4720 for DAF excise tax reporting
Version: 1.0.0
"""

import os
import logging
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors

logger = logging.getLogger(__name__)

REPORTS_DIR = "generated_tax_forms"
os.makedirs(REPORTS_DIR, exist_ok=True)

class Form4720Data(BaseModel):
    organization_name: str
    ein: str
    tax_year: int
    transaction_amount: float
    violation_type: str # e.g., "self_dealing", "excess_business_holdings"
    disqualified_person_name: str
    tax_due: float
    description: str

class TaxFormService:
    """
    Service to generate preparer-ready IRS Form 4720 drafts
    """
    
    def __init__(self):
        logger.info("Tax Form Service initialized")

    def generate_form_4720_pdf(self, data: Form4720Data) -> str:
        """
        Generates a high-fidelity PDF draft of IRS Form 4720
        """
        filename = f"{REPORTS_DIR}/IRS_Form_4720_{data.ein}_{int(datetime.utcnow().timestamp())}.pdf"
        
        c = canvas.Canvas(filename, pagesize=LETTER)
        width, height = LETTER

        # Header
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 50, "Form 4720")
        c.setFont("Helvetica", 10)
        c.drawString(50, height - 65, "Return of Certain Excise Taxes Under Chapters 41 and 42 of the Internal Revenue Code")
        
        c.setLineWidth(1)
        c.line(50, height - 75, width - 50, height - 75)

        # Organization Info
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, height - 100, "Part I: General Information")
        
        c.setFont("Helvetica", 10)
        c.drawString(50, height - 120, f"Name of Organization: {data.organization_name}")
        c.drawString(50, height - 135, f"Employer Identification Number (EIN): {data.ein}")
        c.drawString(50, height - 150, f"Tax Year: {data.tax_year}")

        # Violation Details
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, height - 180, "Part II: Taxes on Self-Dealing (Section 4958/4967)")
        
        c.setFont("Helvetica", 10)
        c.drawString(50, height - 200, f"Type of Violation: {data.violation_type.replace('_', ' ').upper()}")
        c.drawString(50, height - 215, f"Disqualified Person: {data.disqualified_person_name}")
        c.drawString(50, height - 230, f"Transaction Amount: ${data.transaction_amount:,.2f}")
        
        # Narrative
        c.drawString(50, height - 260, "Description of Transaction:")
        text_obj = c.beginText(70, height - 275)
        text_obj.setFont("Helvetica-Oblique", 9)
        # Wrap text manually for demo purposes
        wrapped_text = self._wrap_text(data.description, 80)
        for line in wrapped_text:
            text_obj.textLine(line)
        c.drawText(text_obj)

        # Tax Calculation
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 400, "Part III: Tax Computation")
        c.setFont("Helvetica", 10)
        c.drawString(50, 380, f"1. Total amount of excise tax under Section 4958/4967: ${data.tax_due:,.2f}")
        c.drawString(50, 365, "2. Interest on late payment (if applicable): $0.00")
        c.setFont("Helvetica-Bold", 10)
        c.drawString(50, 340, f"TOTAL TAX DUE: ${data.tax_due:,.2f}")

        # Footer / Warning
        c.setStrokeColor(colors.red)
        c.setLineWidth(2)
        c.rect(50, 50, width - 100, 100)
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(colors.red)
        c.drawCentredString(width/2, 120, "DRAFT FOR REVIEW ONLY")
        c.setFont("Helvetica", 8)
        c.drawCentredString(width/2, 100, "This document is an AI-prepared draft based on audit findings.")
        c.drawCentredString(width/2, 90, "It must be reviewed and signed by a qualified Tax Professional (CPA/LEGAL)")
        c.drawCentredString(width/2, 80, "before submission to the Internal Revenue Service.")

        c.save()
        logger.info(f"Generated IRS Form 4720 PDF: {filename}")
        return filename

    def _wrap_text(self, text: str, width: int) -> List[str]:
        words = text.split()
        lines = []
        current_line = []
        current_length = 0
        
        for word in words:
            if current_length + len(word) + 1 <= width:
                current_line.append(word)
                current_length += len(word) + 1
            else:
                lines.append(" ".join(current_line))
                current_line = [word]
                current_length = len(word)
        lines.append(" ".join(current_line))
        return lines

if __name__ == "__main__":
    service = TaxFormService()
    test_data = Form4720Data(
        organization_name="Magnus Global Foundation",
        ein="12-3456789",
        tax_year=2024,
        transaction_amount=25000.00,
        violation_type="self_dealing",
        disqualified_person_name="John Doe (Advisor)",
        tax_due=2500.00, # 10% example
        description="Advisor John Doe authorized a DAF grant to a private school where his spouse is a board member, providing a prohibited personal benefit and violating Section 4967."
    )
    service.generate_form_4720_pdf(test_data)
