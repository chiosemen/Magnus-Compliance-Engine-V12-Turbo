"""
CaaS API Gateway - FastAPI Implementation
Handles subscription tiers, authentication, and service routing
Version: 1.0.0
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from enum import Enum
import logging
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Client as DBClient
from ..auth import get_current_user, get_password_hash

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1",
    tags=["clients"]
)

# ==================== Models ====================

class SubscriptionTier(str, Enum):
    """Subscription tier levels"""
    FOUNDATION = "foundation"
    DIAGNOSTIC = "diagnostic"
    CONTINUOUS = "continuous"


class SubscriptionStatus(str, Enum):
    """Subscription status"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"
    TRIAL = "trial"


class ClientResponse(BaseModel):
    """Client account model"""
    model_config = ConfigDict(from_attributes=True)
    
    client_id: str
    organization_name: str
    email: EmailStr
    tier: SubscriptionTier
    status: SubscriptionStatus
    created_at: datetime
    subscription_start: datetime
    subscription_end: Optional[datetime] = None
    monthly_scan_limit: int
    scans_used: int = 0
    metadata: Dict = Field(default_factory=dict, alias="metadata_json")


class ClientCreate(BaseModel):
    """Client registration payload"""
    organization_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    tier: SubscriptionTier
    password: str = Field(..., min_length=8)


class ClientUpdate(BaseModel):
    """Client update payload"""
    organization_name: Optional[str] = None
    tier: Optional[SubscriptionTier] = None
    status: Optional[SubscriptionStatus] = None


class ScanRequest(BaseModel):
    """Risk scan request"""
    daf_id: str
    scan_type: str = "comprehensive"
    priority: str = "normal"


class ScanResult(BaseModel):
    """Scan result response"""
    scan_id: str
    client_id: str
    daf_id: str
    risks_detected: int
    critical_risks: int
    high_risks: int
    medium_risks: int
    low_risks: int
    completed_at: datetime
    report_url: Optional[str] = None


class UsageMetrics(BaseModel):
    """Client usage metrics"""
    client_id: str
    period: str
    scans_completed: int
    scans_remaining: int
    remediation_cases: int
    abuse_reports_generated: int
    total_cost: float


# ==================== Service Layer ====================

class TierLimits:
    """Define limits for each subscription tier"""
    
    LIMITS = {
        SubscriptionTier.FOUNDATION: {
            "monthly_scans": 50,
            "features": ["documents", "templates"],
            "support": "email",
            "price_monthly": 49.0
        },
        SubscriptionTier.DIAGNOSTIC: {
            "monthly_scans": 200,
            "features": [
                "documents", "templates", "diagnostics", "roadmap", "trends"
            ],
            "support": "email_priority",
            "price_monthly": 99.0
        },
        SubscriptionTier.CONTINUOUS: {
            "monthly_scans": 1000,
            "features": [
                "documents", "templates", "diagnostics", "roadmap", "trends",
                "workflows", "exports"
            ],
            "support": "dedicated_analyst",
            "price_monthly": 199.0
        }
    }
    
    @classmethod
    def get_limits(cls, tier: SubscriptionTier) -> Dict:
        """Get limits for specific tier"""
        return cls.LIMITS.get(tier, cls.LIMITS[SubscriptionTier.FOUNDATION])
    
    @classmethod
    def validate_feature_access(cls, tier: SubscriptionTier, feature: str) -> bool:
        """Check if tier has access to feature"""
        limits = cls.get_limits(tier)
        return feature in limits["features"]


class ClientService:
    """Service for managing client accounts using DB"""
    
    def __init__(self):
        logger.info("ClientService initialized (DB-backed)")
    
    def create_client(self, db: Session, client_data: ClientCreate) -> DBClient:
        """
        Create new client account in DB
        """
        # Check if email exists
        existing = db.query(DBClient).filter(DBClient.email == client_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        tier_limits = TierLimits.get_limits(client_data.tier)
        
        client = DBClient(
            organization_name=client_data.organization_name,
            email=client_data.email,
            password_hash=get_password_hash(client_data.password),
            tier=client_data.tier,
            status=SubscriptionStatus.TRIAL,
            monthly_scan_limit=tier_limits["monthly_scans"],
            subscription_start=datetime.utcnow(),
            trial_ends_at=datetime.utcnow() + timedelta(days=30),
            metadata_json={
                "signup_source": "web"
            }
        )
        
        db.add(client)
        db.commit()
        db.refresh(client)
        
        logger.info(f"Created client {client.client_id}: {client.organization_name}")
        return client
    
    def get_client(self, db: Session, client_id: str) -> Optional[DBClient]:
        """Retrieve client by ID"""
        return db.query(DBClient).filter(DBClient.client_id == client_id).first()
    
    def update_client(self, db: Session, client_id: str, updates: ClientUpdate) -> DBClient:
        """Update client account"""
        client = self.get_client(db, client_id)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        if updates.tier and updates.tier != client.tier:
            # Tier change - update limits
            new_limits = TierLimits.get_limits(updates.tier)
            client.tier = updates.tier
            client.monthly_scan_limit = new_limits["monthly_scans"]
            logger.info(f"Client {client_id} upgraded to {updates.tier}")
        
        if updates.status:
            client.status = updates.status
        
        if updates.organization_name:
            client.organization_name = updates.organization_name
            
        db.commit()
        db.refresh(client)
        return client
    
    def check_scan_quota(self, db: Session, client_id: str) -> bool:
        """Check if client has remaining scan quota"""
        client = self.get_client(db, client_id)
        if not client:
            return False
        return client.scans_used < client.monthly_scan_limit
    
    def increment_scan_usage(self, db: Session, client_id: str):
        """Increment scan usage counter"""
        client = self.get_client(db, client_id)
        if client:
            client.scans_used += 1
            db.commit()
    
    def get_usage_metrics(self, db: Session, client_id: str, period: str = "current_month") -> UsageMetrics:
        """Get client usage metrics"""
        client = self.get_client(db, client_id)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        tier_limits = TierLimits.get_limits(SubscriptionTier(client.tier))
        
        return UsageMetrics(
            client_id=client_id,
            period=period,
            scans_completed=client.scans_used,
            scans_remaining=client.monthly_scan_limit - client.scans_used,
            remediation_cases=0,  # Placeholder: Implement real DB count
            abuse_reports_generated=0,  # Placeholder: Implement real DB count
            total_cost=tier_limits["price_monthly"]
        )


# Initialize services
client_service = ClientService()


# ==================== API Endpoints ====================

@router.post("/clients/register", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def register_client(client_data: ClientCreate, db: Session = Depends(get_db)):
    """
    Register new client account
    Starts with 30-day trial period
    """
    try:
        client = client_service.create_client(db, client_data)
        return client
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Client registration failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")


@router.get("/clients/me", response_model=ClientResponse)
async def get_current_client_info(current_client: DBClient = Depends(get_current_user)):
    """Get current authenticated client details"""
    return current_client


@router.patch("/clients/me", response_model=ClientResponse)
async def update_client_account(
    updates: ClientUpdate,
    db: Session = Depends(get_db),
    current_client: DBClient = Depends(get_current_user)
):
    """Update client account settings"""
    return client_service.update_client(db, current_client.client_id, updates)


@router.post("/scans", response_model=ScanResult)
async def request_risk_scan(
    scan_request: ScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_client: DBClient = Depends(get_current_user)
):
    """
    Request DAF risk analysis scan
    Checks tier limits and quota before processing
    """
    # Validate feature access
    if not TierLimits.validate_feature_access(SubscriptionTier(current_client.tier), "basic_detection"):
        raise HTTPException(
            status_code=403,
            detail="Tier does not support risk scanning"
        )
    
    # Check quota
    if not client_service.check_scan_quota(db, current_client.client_id):
        raise HTTPException(
            status_code=429,
            detail=f"Monthly scan limit reached ({current_client.monthly_scan_limit})"
        )
    
    # Process scan asynchronously
    scan_id = f"SCAN-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Increment usage
    client_service.increment_scan_usage(db, current_client.client_id)
    
    # Mock scan result (integrate with RiskAnalysisEngine in production)
    result = ScanResult(
        scan_id=scan_id,
        client_id=current_client.client_id,
        daf_id=scan_request.daf_id,
        risks_detected=3,
        critical_risks=1, high_risks=1, medium_risks=1, low_risks=0,
        completed_at=datetime.utcnow(),
        report_url=f"https://api.caas.com/reports/{scan_id}"
    )
    
    logger.info(f"Scan {scan_id} completed for client {current_client.client_id}")
    return result


@router.get("/usage", response_model=UsageMetrics)
async def get_usage(
    db: Session = Depends(get_db),
    current_client: DBClient = Depends(get_current_user)
):
    """Get current month usage metrics"""
    return client_service.get_usage_metrics(db, current_client.client_id)


@router.get("/tiers", response_model=Dict)
async def get_tier_information():
    """Get information about all subscription tiers"""
    return {
        "tiers": TierLimits.LIMITS
    }


@router.get("/health")
async def health_check():
    """API health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }
