from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any, Dict
from datetime import datetime

class RiskScoreComponentOut(BaseModel):
    factor_code: str
    factor_score: int | None
    evidence_refs: str
    explanation_text: str

class RiskScoreOut(BaseModel):
    id: int
    org_id: str
    score_total: int | None
    methodology_version: str
    computed_at: datetime
    computed_by: str
    simulated: bool
    status: str
    components: list[RiskScoreComponentOut]

class AuditEventOut(BaseModel):
    id: str
    event_type: str
    actor_id: str | None
    org_id: str | None
    entity_type: str | None
    entity_id: str | None
    event_payload: str
    created_at: datetime
    prev_event_hash: str | None
    event_hash: str

class LitigationHoldOut(BaseModel):
    org_id: str
    active: bool
    activated_at: datetime | None
    activated_by: str | None

class Token(BaseModel):
    access_token: str
    token_type: str

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    class Config:
        orm_mode = True

class OrgBase(BaseModel):
    name: str

class OrgCreate(OrgBase):
    pass

class Org(OrgBase):
    id: str
    created_at: datetime
    class Config:
        orm_mode = True

class Membership(BaseModel):
    user_id: str
    org_id: str
    role: str

class AnalysisRequestCreate(BaseModel):
    org_id: str
    ein: str

class AnalysisResultOut(BaseModel):
    id: int
    risk_score: int
    factors: Any
    provenance: Any
    simulated: bool
    computed_at: datetime
    version: str

class ReportCreate(BaseModel):
    analysis_id: int

class ReportOut(BaseModel):
    id: int
    download_url: str

class IngestionJobCreate(BaseModel):
    org_id: Optional[str] = None # Optional now, we can infer from user
    ein: str
    tax_year: Optional[int] = None

class IngestionJobOut(BaseModel):
    id: int
    org_id: str
    ein: str
    tax_year: Optional[int]
    status: str
    error_message: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

class SourceDocumentOut(BaseModel):
    id: int
    ingestion_job_id: int
    document_type: str
    tax_year: int
    source_url: str
    source_hash: str
    raw_payload: Dict | Any
    fetched_at: datetime
    ein: str
