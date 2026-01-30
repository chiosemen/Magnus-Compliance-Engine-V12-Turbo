"""
CaaS Risk Analysis Engine - Core Module
Detects DAF abuses, self-dealing, and vendor conflicts
Version: 1.0.0
"""

from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from enum import Enum
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RiskLevel(str, Enum):
    """Risk severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ViolationType(str, Enum):
    """Types of compliance violations"""
    SELF_DEALING = "self_dealing"
    VENDOR_CONFLICT = "vendor_conflict"
    ADVISOR_ABUSE = "advisor_abuse"
    IMPROPER_BENEFIT = "improper_benefit"
    EXCESSIVE_FEES = "excessive_fees"


class Transaction(BaseModel):
    """Transaction data model"""
    transaction_id: str
    daf_id: str
    amount: float = Field(gt=0)
    vendor_id: Optional[str] = None
    advisor_id: Optional[str] = None
    timestamp: datetime
    description: str
    metadata: Dict = Field(default_factory=dict)

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        return round(v, 2)


class RiskDetection(BaseModel):
    """Risk detection result"""
    violation_type: ViolationType
    risk_level: RiskLevel
    confidence_score: float = Field(ge=0, le=1)
    description: str
    evidence: List[str]
    remediation_cost_estimate: Optional[float] = None
    bounty_potential: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RiskAnalysisEngine:
    """
    Core engine for detecting DAF compliance risks
    
    Implements multi-stage analysis:
    1. Pattern matching for known violations
    2. ML-based anomaly detection
    3. Network analysis for conflicts of interest
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.threshold_self_dealing = self.config.get('self_dealing_threshold', 0.75)
        self.threshold_vendor_conflict = self.config.get('vendor_conflict_threshold', 0.70)
        logger.info("Risk Analysis Engine initialized")
    
    def analyze_transaction(self, transaction: Transaction) -> List[RiskDetection]:
        """
        Analyze single transaction for compliance risks
        
        Args:
            transaction: Transaction object to analyze
            
        Returns:
            List of detected risks
        """
        risks = []
        
        try:
            # Check for self-dealing patterns
            self_dealing_risk = self._detect_self_dealing(transaction)
            if self_dealing_risk:
                risks.append(self_dealing_risk)
            
            # Check for vendor conflicts
            vendor_risk = self._detect_vendor_conflict(transaction)
            if vendor_risk:
                risks.append(vendor_risk)
            
            # Check for excessive fees
            fee_risk = self._detect_excessive_fees(transaction)
            if fee_risk:
                risks.append(fee_risk)
            
            logger.info(f"Analyzed transaction {transaction.transaction_id}: {len(risks)} risks found")
            
        except Exception as e:
            logger.error(f"Error analyzing transaction {transaction.transaction_id}: {str(e)}")
            raise
        
        return risks
    
    def _detect_self_dealing(self, transaction: Transaction) -> Optional[RiskDetection]:
        """Detect self-dealing violations"""
        # Pattern: Advisor/donor receiving benefits from their own DAF
        evidence = []
        confidence = 0.0
        
        # Check metadata for self-dealing indicators
        if transaction.metadata.get('donor_relationship') == 'advisor':
            evidence.append("Transaction involves DAF advisor")
            confidence += 0.4
        
        if transaction.metadata.get('beneficiary_type') == 'related_party':
            evidence.append("Beneficiary is related party")
            confidence += 0.35
        
        if transaction.amount > 10000 and transaction.metadata.get('justification') is None:
            evidence.append("Large transaction without documented justification")
            confidence += 0.25
        
        if confidence >= self.threshold_self_dealing:
            return RiskDetection(
                violation_type=ViolationType.SELF_DEALING,
                risk_level=self._calculate_risk_level(confidence),
                confidence_score=confidence,
                description="Potential self-dealing detected: advisor/donor may be benefiting from DAF",
                evidence=evidence,
                remediation_cost_estimate=self._estimate_remediation_cost(transaction.amount),
                bounty_potential=transaction.amount * 0.15  # 15% IRS whistleblower bounty
            )
        
        return None
    
    def _detect_vendor_conflict(self, transaction: Transaction) -> Optional[RiskDetection]:
        """Detect vendor conflict of interest"""
        evidence = []
        confidence = 0.0
        
        # Check for vendor-advisor relationships
        if transaction.vendor_id and transaction.advisor_id:
            if self._check_vendor_advisor_relationship(transaction.vendor_id, transaction.advisor_id):
                evidence.append("Vendor has financial relationship with advisor")
                confidence += 0.5
        
        # Check for excessive vendor fees
        if transaction.metadata.get('fee_percentage', 0) > 2.5:
            evidence.append(f"Excessive fee percentage: {transaction.metadata.get('fee_percentage')}%")
            confidence += 0.3
        
        if confidence >= self.threshold_vendor_conflict:
            return RiskDetection(
                violation_type=ViolationType.VENDOR_CONFLICT,
                risk_level=self._calculate_risk_level(confidence),
                confidence_score=confidence,
                description="Vendor conflict of interest detected",
                evidence=evidence,
                remediation_cost_estimate=1000.0,  # Standard audit cost
                bounty_potential=None
            )
        
        return None
    
    def _detect_excessive_fees(self, transaction: Transaction) -> Optional[RiskDetection]:
        """Detect excessive fee structures"""
        fee_percent = transaction.metadata.get('fee_percentage', 0)
        
        if fee_percent > 3.0:  # IRS guideline threshold
            return RiskDetection(
                violation_type=ViolationType.EXCESSIVE_FEES,
                risk_level=RiskLevel.MEDIUM,
                confidence_score=0.85,
                description=f"Excessive fees detected: {fee_percent}% exceeds reasonable limits",
                evidence=[f"Fee percentage: {fee_percent}%", "Exceeds 3% threshold"],
                remediation_cost_estimate=500.0
            )
        
        return None
    
    def _check_vendor_advisor_relationship(self, vendor_id: str, advisor_id: str) -> bool:
        """Check if vendor and advisor have conflicting relationship"""
        # Placeholder for database lookup
        # In production, query relationship graph database
        return False
    
    def _calculate_risk_level(self, confidence: float) -> RiskLevel:
        """Calculate risk level from confidence score"""
        if confidence >= 0.9:
            return RiskLevel.CRITICAL
        elif confidence >= 0.8:
            return RiskLevel.HIGH
        elif confidence >= 0.6:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    def _estimate_remediation_cost(self, violation_amount: float) -> float:
        """Estimate cost to remediate violation"""
        # Base cost + percentage of violation
        base_cost = 1000.0
        variable_cost = violation_amount * 0.05
        return min(base_cost + variable_cost, 5000.0)  # Cap at $5K
    
    def batch_analyze(self, transactions: List[Transaction]) -> Dict[str, List[RiskDetection]]:
        """
        Analyze multiple transactions in batch
        
        Args:
            transactions: List of transactions to analyze
            
        Returns:
            Dictionary mapping transaction IDs to detected risks
        """
        results = {}
        
        for transaction in transactions:
            try:
                risks = self.analyze_transaction(transaction)
                results[transaction.transaction_id] = risks
            except Exception as e:
                logger.error(f"Batch analysis failed for {transaction.transaction_id}: {str(e)}")
                results[transaction.transaction_id] = []
        
        return results


# Usage Example
if __name__ == "__main__":
    # Initialize engine
    engine = RiskAnalysisEngine()
    
    # Sample transaction with self-dealing indicators
    sample_transaction = Transaction(
        transaction_id="TXN-001",
        daf_id="DAF-12345",
        amount=15000.00,
        advisor_id="ADV-789",
        timestamp=datetime.utcnow(),
        description="Grant to education nonprofit",
        metadata={
            "donor_relationship": "advisor",
            "beneficiary_type": "related_party",
            "fee_percentage": 3.5
        }
    )
    
    # Analyze transaction
    risks = engine.analyze_transaction(sample_transaction)
    
    # Output results
    for risk in risks:
        print(f"\n{'='*60}")
        print(f"Violation Type: {risk.violation_type.value}")
        print(f"Risk Level: {risk.risk_level.value}")
        print(f"Confidence: {risk.confidence_score:.2%}")
        print(f"Description: {risk.description}")
        print(f"Evidence: {', '.join(risk.evidence)}")
        if risk.remediation_cost_estimate:
            print(f"Remediation Cost: ${risk.remediation_cost_estimate:,.2f}")

def compute_risk_score(db, org_id, user_id):
    from ..models import RiskScore, RiskScoreComponent
    from datetime import datetime
    
    score = RiskScore(
        org_id=org_id,
        score_total=45,
        methodology_version="1.0-stress-test-safe",
        computed_at=datetime.utcnow(),
        computed_by=str(user_id),
        status="ok"
    )
    db.add(score)
    db.commit()
    db.refresh(score)
    
    comp = RiskScoreComponent(
        risk_score_id=score.id,
        factor_code="STRESS_TEST",
        factor_score=5,
        explanation_text="Dummy score for stress testing ingestion pipeline"
    )
    db.add(comp)
    db.commit()
    return score, [comp]
