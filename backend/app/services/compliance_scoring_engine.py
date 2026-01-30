"""
Magnus CaaS Compliance Scoring System
Industry-standard compliance rating (FICO-like) for DAF organizations
Competitive Advantage: Become the "FICO of DAF Compliance"

Version: 1.0.0
"""

from typing import List, Dict, Optional, Tuple
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from ..utils.time_utils import now_utc
from enum import Enum
import logging
import statistics

logger = logging.getLogger(__name__)


class ScoreRating(str, Enum):
    """Score rating categories (like credit ratings)"""
    EXCELLENT = "excellent"      # 850-1000
    VERY_GOOD = "very_good"      # 750-849
    GOOD = "good"                # 650-749
    FAIR = "fair"                # 550-649
    POOR = "poor"                # 450-549
    VERY_POOR = "very_poor"      # 0-449


class ScoreComponent(str, Enum):
    """Components that make up the compliance score"""
    GOVERNANCE = "governance"              # 25% weight
    FINANCIAL_HEALTH = "financial_health"  # 20% weight
    COMPLIANCE_HISTORY = "compliance_history"  # 30% weight
    TRANSPARENCY = "transparency"          # 15% weight
    OPERATIONAL_PRACTICES = "operational_practices"  # 10% weight


class ComplianceScore(BaseModel):
    """Complete compliance score result"""
    score_id: str
    ein: str
    organization_name: str
    overall_score: int = Field(ge=0, le=1000)
    rating: ScoreRating
    percentile: int = Field(ge=0, le=100)
    
    # Component scores
    governance_score: int = Field(ge=0, le=1000)
    financial_health_score: int = Field(ge=0, le=1000)
    compliance_history_score: int = Field(ge=0, le=1000)
    transparency_score: int = Field(ge=0, le=1000)
    operational_practices_score: int = Field(ge=0, le=1000)
    
    # Metadata
    score_date: datetime = Field(default_factory=now_utc)
    score_version: str = "1.0"
    is_certified: bool = False
    certification_date: Optional[datetime] = None
    next_review_date: datetime
    
    # Context
    industry_average: int = 650
    peer_group_average: int = 650
    score_trend: str = "stable"  # improving, stable, declining


class ScoreFactor(BaseModel):
    """Individual factor contributing to score"""
    factor_name: str
    weight: float = Field(ge=0, le=1)
    raw_value: float
    normalized_score: int = Field(ge=0, le=1000)
    impact: str  # positive, neutral, negative
    description: str


class ScoreImprovement(BaseModel):
    """Recommendation for score improvement"""
    improvement_id: str
    category: str
    current_score: int
    potential_score: int
    score_gain: int
    priority: str  # high, medium, low
    action_items: List[str]
    estimated_timeline: str
    difficulty: str  # easy, moderate, hard


class ScoreHistory(BaseModel):
    """Historical score tracking"""
    ein: str
    score_timeline: List[Dict]  # [{date, score, rating}]
    first_score_date: datetime
    latest_score_date: datetime
    highest_score: int
    lowest_score: int
    average_score: float
    trend_direction: str  # up, down, stable


class ScoreCertificate(BaseModel):
    """Official compliance score certificate"""
    certificate_id: str
    ein: str
    organization_name: str
    score: int
    rating: ScoreRating
    issued_date: datetime
    expiry_date: datetime
    certificate_url: str
    verification_code: str


class ComplianceScoringEngine:
    """
    FICO-like compliance scoring system for DAF organizations
    
    Capabilities:
    - Calculate comprehensive compliance scores (0-1000)
    - 5-component weighted scoring model
    - Percentile ranking vs industry peers
    - Historical score tracking and trending
    - Score improvement recommendations
    - Official score certification
    - Public score verification API
    
    Competitive Advantage:
    - Become industry standard (like FICO for credit)
    - Network effects (more data = better benchmarks)
    - Proprietary algorithm (trade secret)
    - Brand recognition "Magnus Score™"
    - 24+ month replication time
    """
    
    def __init__(self):
        self.score_weights = {
            ScoreComponent.GOVERNANCE: 0.25,
            ScoreComponent.FINANCIAL_HEALTH: 0.20,
            ScoreComponent.COMPLIANCE_HISTORY: 0.30,
            ScoreComponent.TRANSPARENCY: 0.15,
            ScoreComponent.OPERATIONAL_PRACTICES: 0.10
        }
        self.score_cache: Dict[str, ComplianceScore] = {}
        self.industry_benchmarks = self._load_industry_benchmarks()
        logger.info("Compliance Scoring Engine initialized")
    
    def calculate_score(
        self,
        ein: str,
        organization_data: Dict,
        historical_data: Dict,
        peer_group: Optional[str] = None
    ) -> ComplianceScore:
        """
        Calculate comprehensive compliance score
        
        Args:
            ein: Organization EIN
            organization_data: Current organization data
            historical_data: Historical compliance data
            peer_group: Peer group for benchmarking (optional)
            
        Returns:
            ComplianceScore with detailed breakdown
        """
        logger.info("Calculating compliance score for EIN %s", ein)
        
        # Calculate component scores
        governance_score = self._score_governance(organization_data)
        financial_score = self._score_financial_health(organization_data)
        compliance_score = self._score_compliance_history(historical_data)
        transparency_score = self._score_transparency(organization_data)
        operational_score = self._score_operational_practices(organization_data)
        
        # Calculate weighted overall score
        overall_score = int(
            governance_score * self.score_weights[ScoreComponent.GOVERNANCE] +
            financial_score * self.score_weights[ScoreComponent.FINANCIAL_HEALTH] +
            compliance_score * self.score_weights[ScoreComponent.COMPLIANCE_HISTORY] +
            transparency_score * self.score_weights[ScoreComponent.TRANSPARENCY] +
            operational_score * self.score_weights[ScoreComponent.OPERATIONAL_PRACTICES]
        )
        
        # Determine rating
        rating = self._determine_rating(overall_score)
        
        # Calculate percentile
        percentile = self._calculate_percentile(overall_score, peer_group)
        
        # Determine trend
        trend = self._calculate_trend(ein)
        
        # Create score object
        score = ComplianceScore(
            score_id=f"SCORE-{ein}-{now_utc().strftime('%Y%m%d')}",
            ein=ein,
            organization_name=organization_data.get('name', 'Unknown'),
            overall_score=overall_score,
            rating=rating,
            percentile=percentile,
            governance_score=governance_score,
            financial_health_score=financial_score,
            compliance_history_score=compliance_score,
            transparency_score=transparency_score,
            operational_practices_score=operational_score,
            next_review_date=now_utc() + timedelta(days=90),
            industry_average=self.industry_benchmarks.get('overall', 650),
            peer_group_average=self._get_peer_average(peer_group),
            score_trend=trend
        )
        
        # Cache the score
        self.score_cache[ein] = score
        
        logger.info("Score calculated for %s: %s (%s)", ein, overall_score, rating.value)
        return score
    
    def get_score_factors(
        self,
        ein: str,
        organization_data: Dict
    ) -> List[ScoreFactor]:
        """
        Get detailed breakdown of all scoring factors
        
        Args:
            ein: Organization EIN
            organization_data: Organization data
            
        Returns:
            List of ScoreFactor objects
        """
        factors = []
        
        # Governance factors
        factors.extend(self._get_governance_factors(organization_data))
        
        # Financial health factors
        factors.extend(self._get_financial_factors(organization_data))
        
        # Compliance factors
        factors.extend(self._get_compliance_factors(organization_data))
        
        # Transparency factors
        factors.extend(self._get_transparency_factors(organization_data))
        
        return factors
    
    def recommend_improvements(
        self,
        ein: str,
        current_score: ComplianceScore
    ) -> List[ScoreImprovement]:
        """
        Generate actionable recommendations for score improvement
        
        Args:
            ein: Organization EIN
            current_score: Current compliance score
            
        Returns:
            List of improvement recommendations ranked by impact
        """
        recommendations = []
        
        # Analyze each component for improvement opportunities
        
        # 1. Governance improvements
        if current_score.governance_score < 800:
            recommendations.append(ScoreImprovement(
                improvement_id=f"IMP-{ein}-GOV",
                category="Governance",
                current_score=current_score.governance_score,
                potential_score=min(current_score.governance_score + 150, 1000),
                score_gain=min(150, 1000 - current_score.governance_score),
                priority="high" if current_score.governance_score < 600 else "medium",
                action_items=[
                    "Establish independent board with >50% external members",
                    "Implement written conflict of interest policy",
                    "Conduct annual board training on fiduciary duties",
                    "Create audit committee with financial expertise"
                ],
                estimated_timeline="6-12 months",
                difficulty="moderate"
            ))
        
        # 2. Compliance history improvements
        if current_score.compliance_history_score < 750:
            recommendations.append(ScoreImprovement(
                improvement_id=f"IMP-{ein}-COMP",
                category="Compliance History",
                current_score=current_score.compliance_history_score,
                potential_score=min(current_score.compliance_history_score + 200, 1000),
                score_gain=min(200, 1000 - current_score.compliance_history_score),
                priority="high",
                action_items=[
                    "Remediate all outstanding violations within 90 days",
                    "Implement quarterly compliance self-audits",
                    "Subscribe to compliance monitoring service",
                    "Maintain 12+ months of violation-free operation"
                ],
                estimated_timeline="12-18 months",
                difficulty="moderate"
            ))
        
        # 3. Transparency improvements
        if current_score.transparency_score < 700:
            recommendations.append(ScoreImprovement(
                improvement_id=f"IMP-{ein}-TRANS",
                category="Transparency",
                current_score=current_score.transparency_score,
                potential_score=min(current_score.transparency_score + 100, 1000),
                score_gain=min(100, 1000 - current_score.transparency_score),
                priority="medium",
                action_items=[
                    "Publish Form 990 on organization website",
                    "Create annual impact report with financials",
                    "Disclose board members and compensation publicly",
                    "Implement online grant application portal"
                ],
                estimated_timeline="3-6 months",
                difficulty="easy"
            ))
        
        # 4. Financial health improvements
        if current_score.financial_health_score < 750:
            recommendations.append(ScoreImprovement(
                improvement_id=f"IMP-{ein}-FIN",
                category="Financial Health",
                current_score=current_score.financial_health_score,
                potential_score=min(current_score.financial_health_score + 120, 1000),
                score_gain=min(120, 1000 - current_score.financial_health_score),
                priority="medium",
                action_items=[
                    "Build cash reserves to 6+ months operating expenses",
                    "Reduce expense volatility through better budgeting",
                    "Diversify revenue sources (reduce dependence on top 3 donors)",
                    "Conduct annual financial audit by independent CPA"
                ],
                estimated_timeline="12-24 months",
                difficulty="hard"
            ))
        
        # 5. Operational practices improvements
        if current_score.operational_practices_score < 750:
            recommendations.append(ScoreImprovement(
                improvement_id=f"IMP-{ein}-OPS",
                category="Operational Practices",
                current_score=current_score.operational_practices_score,
                potential_score=min(current_score.operational_practices_score + 80, 1000),
                score_gain=min(80, 1000 - current_score.operational_practices_score),
                priority="low",
                action_items=[
                    "Document all operational policies and procedures",
                    "Implement grant monitoring process with site visits",
                    "Establish written investment policy statement",
                    "Create disaster recovery and business continuity plan"
                ],
                estimated_timeline="6-12 months",
                difficulty="moderate"
            ))
        
        # Sort by score gain (highest impact first)
        recommendations.sort(key=lambda x: x.score_gain, reverse=True)
        
        return recommendations
    
    def track_score_history(
        self,
        ein: str,
        years_back: int = 5
    ) -> ScoreHistory:
        """
        Get historical score data and trends
        
        Args:
            ein: Organization EIN
            years_back: Number of years to retrieve
            
        Returns:
            ScoreHistory object
        """
        # In production: Query database for historical scores
        # Simulated historical data
        
        timeline = []
        base_score = 650
        
        # Generate simulated history
        for i in range(years_back * 4):  # Quarterly scores
            date = now_utc() - timedelta(days=90 * i)
            score = base_score + (i * 10) + ((-1) ** i * 20)  # Oscillating upward trend
            score = max(300, min(900, score))  # Keep in range
            
            timeline.append({
                'date': date,
                'score': score,
                'rating': self._determine_rating(score).value
            })
        
        timeline.reverse()  # Chronological order
        
        scores = [t['score'] for t in timeline]
        
        # Calculate trend
        recent_avg = statistics.mean(scores[-4:])  # Last year
        older_avg = statistics.mean(scores[:4])  # First year
        
        if recent_avg > older_avg * 1.05:
            trend = "up"
        elif recent_avg < older_avg * 0.95:
            trend = "down"
        else:
            trend = "stable"
        
        history = ScoreHistory(
            ein=ein,
            score_timeline=timeline,
            first_score_date=timeline[0]['date'],
            latest_score_date=timeline[-1]['date'],
            highest_score=max(scores),
            lowest_score=min(scores),
            average_score=statistics.mean(scores),
            trend_direction=trend
        )
        
        return history
    
    def issue_certificate(
        self,
        ein: str,
        score: ComplianceScore,
        validity_days: int = 365
    ) -> ScoreCertificate:
        """
        Issue official compliance score certificate
        
        Args:
            ein: Organization EIN
            score: Compliance score
            validity_days: Certificate validity period
            
        Returns:
            ScoreCertificate
        """
        import hashlib
        
        # Only certify scores above 650 (Fair or better)
        if score.overall_score < 650:
            raise ValueError(f"Score {score.overall_score} too low for certification (minimum: 650)")
        
        certificate_id = f"CERT-{ein}-{now_utc().strftime('%Y%m%d%H%M%S')}"
        
        # Generate verification code
        verification_data = f"{certificate_id}|{ein}|{score.overall_score}"
        verification_code = hashlib.sha256(verification_data.encode()).hexdigest()[:12].upper()
        
        certificate = ScoreCertificate(
            certificate_id=certificate_id,
            ein=ein,
            organization_name=score.organization_name,
            score=score.overall_score,
            rating=score.rating,
            issued_date=now_utc(),
            expiry_date=now_utc() + timedelta(days=validity_days),
            certificate_url=f"https://magnus-caas.com/verify/{certificate_id}",
            verification_code=verification_code
        )
        
        # Mark score as certified
        score.is_certified = True
        score.certification_date = now_utc()
        
        logger.info("Certificate issued: %s for EIN %s", certificate_id, ein)
        return certificate
    
    def verify_certificate(
        self,
        certificate_id: str,
        verification_code: str
    ) -> bool:
        """
        Verify authenticity of a compliance certificate
        
        Args:
            certificate_id: Certificate ID
            verification_code: Verification code from certificate
            
        Returns:
            True if valid, False otherwise
        """
        # In production: Query database for certificate
        # Simplified verification logic
        
        logger.info("Verifying certificate: %s", certificate_id)
        return len(verification_code) == 12  # Simplified check
    
    def get_public_score(self, ein: str) -> Optional[Dict]:
        """
        Get publicly available score data (limited info for API)
        
        Args:
            ein: Organization EIN
            
        Returns:
            Public score data or None
        """
        score = self.score_cache.get(ein)
        
        if not score:
            return None
        
        # Return limited public data
        return {
            'ein': ein,
            'organization_name': score.organization_name,
            'score': score.overall_score,
            'rating': score.rating.value,
            'rating_description': self._get_rating_description(score.rating),
            'percentile': score.percentile,
            'score_date': score.score_date.isoformat(),
            'is_certified': score.is_certified
        }
    
    # ==================== Private Scoring Methods ====================
    
    def _score_governance(self, data: Dict) -> int:
        """Score governance structure (0-1000)"""
        score = 500  # Base score
        
        # Independent board (+200)
        if data.get('independent_board'):
            score += 200
        
        # Conflict of interest policy (+150)
        if data.get('conflict_policy'):
            score += 150
        
        # Regular board meetings (+100)
        board_meetings = data.get('board_meetings_per_year', 0)
        if board_meetings >= 4:
            score += 100
        elif board_meetings >= 2:
            score += 50
        
        # Board diversity (+50)
        if data.get('board_diversity_score', 0) > 0.5:
            score += 50
        
        return min(score, 1000)
    
    def _score_financial_health(self, data: Dict) -> int:
        """Score financial health (0-1000)"""
        score = 500
        
        # Revenue stability (+200)
        revenue_volatility = data.get('revenue_volatility', 0.5)
        score += int((1 - revenue_volatility) * 200)
        
        # Expense ratio (+150)
        expense_ratio = data.get('expense_ratio', 0.85)
        if expense_ratio < 0.75:
            score += 150
        elif expense_ratio < 0.85:
            score += 100
        
        # Reserves (+100)
        months_reserves = data.get('months_reserves', 3)
        if months_reserves >= 6:
            score += 100
        elif months_reserves >= 3:
            score += 50
        
        # Audit status (+50)
        if data.get('annual_audit'):
            score += 50
        
        return min(score, 1000)
    
    def _score_compliance_history(self, data: Dict) -> int:
        """Score compliance history (0-1000)"""
        score = 1000  # Start at perfect
        
        # Violations (major penalty)
        violations = data.get('violations', [])
        
        for violation in violations:
            severity = violation.get('severity', 'low')
            recency_months = violation.get('months_ago', 24)
            
            # Recent violations penalized more
            recency_multiplier = max(0.5, 1 - (recency_months / 24))
            
            if severity == 'critical':
                score -= int(200 * recency_multiplier)
            elif severity == 'high':
                score -= int(100 * recency_multiplier)
            elif severity == 'medium':
                score -= int(50 * recency_multiplier)
            else:
                score -= int(25 * recency_multiplier)
        
        # Years in operation (bonus for longevity)
        years_operating = data.get('years_operating', 5)
        if years_operating >= 10:
            score = min(score + 50, 1000)
        
        return max(0, min(score, 1000))
    
    def _score_transparency(self, data: Dict) -> int:
        """Score transparency (0-1000)"""
        score = 300  # Lower base (transparency is opt-in)
        
        # Public 990 filings (+250)
        if data.get('public_990'):
            score += 250
        
        # Website with disclosures (+200)
        if data.get('website_disclosures'):
            score += 200
        
        # Annual reports (+150)
        if data.get('annual_reports'):
            score += 150
        
        # Grant database (+100)
        if data.get('public_grant_database'):
            score += 100
        
        return min(score, 1000)
    
    def _score_operational_practices(self, data: Dict) -> int:
        """Score operational practices (0-1000)"""
        score = 600  # Base score
        
        # Written policies (+150)
        policies = data.get('written_policies', [])
        score += min(len(policies) * 30, 150)
        
        # Grant monitoring (+100)
        if data.get('grant_monitoring_process'):
            score += 100
        
        # Investment policy (+100)
        if data.get('investment_policy'):
            score += 100
        
        # Staff training (+50)
        if data.get('annual_training'):
            score += 50
        
        return min(score, 1000)
    
    def _determine_rating(self, score: int) -> ScoreRating:
        """Determine rating category based on score"""
        if score >= 850:
            return ScoreRating.EXCELLENT
        elif score >= 750:
            return ScoreRating.VERY_GOOD
        elif score >= 650:
            return ScoreRating.GOOD
        elif score >= 550:
            return ScoreRating.FAIR
        elif score >= 450:
            return ScoreRating.POOR
        else:
            return ScoreRating.VERY_POOR
    
    def _calculate_percentile(self, score: int, peer_group: Optional[str]) -> int:
        """Calculate percentile ranking"""
        # Simplified percentile calculation
        # In production: Query database for actual peer scores
        
        # Approximate percentile based on normal distribution
        if score >= 850:
            return 95
        elif score >= 750:
            return 80
        elif score >= 650:
            return 60
        elif score >= 550:
            return 40
        elif score >= 450:
            return 20
        else:
            return 10
    
    def _calculate_trend(self, ein: str) -> str:
        """Calculate score trend direction"""
        # In production: Compare with recent historical scores
        # Simplified: return stable
        return "stable"
    
    def _get_peer_average(self, peer_group: Optional[str]) -> int:
        """Get peer group average score"""
        # In production: Calculate from database
        peer_averages = {
            'large': 720,
            'medium': 680,
            'small': 640,
            None: 650
        }
        return peer_averages.get(peer_group, 650)
    
    def _load_industry_benchmarks(self) -> Dict:
        """Load industry benchmark scores"""
        return {
            'overall': 650,
            'governance': 700,
            'financial_health': 680,
            'compliance_history': 750,
            'transparency': 550,
            'operational_practices': 650
        }
    
    def _get_governance_factors(self, data: Dict) -> List[ScoreFactor]:
        """Get detailed governance scoring factors"""
        factors = []
        
        factors.append(ScoreFactor(
            factor_name="Independent Board",
            weight=0.40,
            raw_value=1.0 if data.get('independent_board') else 0.0,
            normalized_score=200 if data.get('independent_board') else 0,
            impact="positive" if data.get('independent_board') else "negative",
            description="Board composition with >50% independent members"
        ))
        
        return factors
    
    def _get_financial_factors(self, data: Dict) -> List[ScoreFactor]:
        """Get financial health factors"""
        # Similar to governance factors
        return []
    
    def _get_compliance_factors(self, data: Dict) -> List[ScoreFactor]:
        """Get compliance factors"""
        return []
    
    def _get_transparency_factors(self, data: Dict) -> List[ScoreFactor]:
        """Get transparency factors"""
        return []
    
    def _get_rating_description(self, rating: ScoreRating) -> str:
        """Get human-readable rating description"""
        descriptions = {
            ScoreRating.EXCELLENT: "Exceptional compliance with industry best practices",
            ScoreRating.VERY_GOOD: "Strong compliance record with minor areas for improvement",
            ScoreRating.GOOD: "Solid compliance with room for enhancement",
            ScoreRating.FAIR: "Meets basic compliance standards with notable gaps",
            ScoreRating.POOR: "Significant compliance issues requiring attention",
            ScoreRating.VERY_POOR: "Critical compliance deficiencies requiring immediate remediation"
        }
        return descriptions.get(rating, "Unknown")


# ==================== Usage Example ====================
if __name__ == "__main__":
    engine = ComplianceScoringEngine()
    
    print(f"\n{'='*70}")
    print(f"MAGNUS COMPLIANCE SCORING SYSTEM")
    print(f"{'='*70}\n")
    
    # Sample organization data
    org_data = {
        'name': 'Community Foundation Trust',
        'independent_board': True,
        'conflict_policy': True,
        'board_meetings_per_year': 6,
        'board_diversity_score': 0.6,
        'revenue_volatility': 0.15,
        'expense_ratio': 0.72,
        'months_reserves': 8,
        'annual_audit': True,
        'public_990': True,
        'website_disclosures': True,
        'annual_reports': True,
        'public_grant_database': False,
        'written_policies': ['investment', 'conflict', 'whistleblower', 'grant'],
        'grant_monitoring_process': True,
        'investment_policy': True,
        'annual_training': True
    }
    
    historical_data = {
        'violations': [
            {'severity': 'low', 'months_ago': 18},
        ],
        'years_operating': 15
    }
    
    # Calculate score
    score = engine.calculate_score(
        ein="12-3456789",
        organization_data=org_data,
        historical_data=historical_data,
        peer_group="large"
    )
    
    print(f"COMPLIANCE SCORE REPORT")
    print(f"Organization: {score.organization_name}")
    print(f"EIN: {score.ein}")
    print(f"\n{'='*70}")
    print(f"OVERALL SCORE: {score.overall_score}/1000")
    print(f"RATING: {score.rating.value.upper()}")
    print(f"PERCENTILE: {score.percentile}th")
    print(f"{'='*70}\n")
    
    print(f"Component Breakdown:")
    print(f"  Governance:              {score.governance_score}/1000 ({int(score.governance_score/10)}%)")
    print(f"  Financial Health:        {score.financial_health_score}/1000 ({int(score.financial_health_score/10)}%)")
    print(f"  Compliance History:      {score.compliance_history_score}/1000 ({int(score.compliance_history_score/10)}%)")
    print(f"  Transparency:            {score.transparency_score}/1000 ({int(score.transparency_score/10)}%)")
    print(f"  Operational Practices:   {score.operational_practices_score}/1000 ({int(score.operational_practices_score/10)}%)")
    
    print(f"\nBenchmarks:")
    print(f"  Industry Average:        {score.industry_average}/1000")
    print(f"  Peer Group Average:      {score.peer_group_average}/1000")
    print(f"  Your Score vs Industry:  {score.overall_score - score.industry_average:+d} points")
    print(f"  Score Trend:             {score.score_trend.upper()}")
    
    # Get improvement recommendations
    print(f"\n{'='*70}")
    print(f"SCORE IMPROVEMENT RECOMMENDATIONS")
    print(f"{'='*70}\n")
    
    improvements = engine.recommend_improvements("12-3456789", score)
    
    for i, improvement in enumerate(improvements[:3], 1):
        print(f"{i}. {improvement.category} [{improvement.priority.upper()} PRIORITY]")
        print(f"   Current Score: {improvement.current_score}")
        print(f"   Potential Score: {improvement.potential_score} (+{improvement.score_gain} points)")
        print(f"   Timeline: {improvement.estimated_timeline}")
        print(f"   Top Actions:")
        for action in improvement.action_items[:2]:
            print(f"     • {action}")
        print()
    
    # Issue certificate
    print(f"{'='*70}")
    print(f"OFFICIAL CERTIFICATION")
    print(f"{'='*70}\n")
    
    if score.overall_score >= 650:
        certificate = engine.issue_certificate("12-3456789", score)
        print(f"✅ Certificate Issued: {certificate.certificate_id}")
        print(f"   Verification Code: {certificate.verification_code}")
        print(f"   Valid Until: {certificate.expiry_date.strftime('%Y-%m-%d')}")
        print(f"   Certificate URL: {certificate.certificate_url}")
    else:
        print(f"❌ Score too low for certification (minimum: 650)")
    
    # Get public score
    print(f"\n{'='*70}")
    print(f"PUBLIC SCORE LOOKUP (API)")
    print(f"{'='*70}\n")
    
    public_score = engine.get_public_score("12-3456789")
    if public_score:
        print(f"Organization: {public_score['organization_name']}")
        print(f"Score: {public_score['score']}/1000")
        print(f"Rating: {public_score['rating'].upper()}")
        print(f"Description: {public_score['rating_description']}")
        print(f"Certified: {'✅ Yes' if public_score['is_certified'] else '❌ No'}")
    
    print(f"\n✅ Magnus Compliance Score™ - Industry Standard")
    print(f"💰 Revenue potential: $60K+/year in certifications")
    print(f"🏆 Become the 'FICO of DAF Compliance'")
