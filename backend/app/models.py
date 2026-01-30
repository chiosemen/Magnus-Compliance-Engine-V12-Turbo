from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Numeric, JSON
import uuid
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

# --- Core Identity & Assets ---

class Client(Base):
    __tablename__ = "clients"
    client_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    tier = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, default="trial")
    monthly_scan_limit = Column(Integer, nullable=False)
    scans_used = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    subscription_start = Column(DateTime(timezone=True), default=datetime.utcnow)
    subscription_end = Column(DateTime(timezone=True), nullable=True)
    trial_ends_at = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(JSON, name="metadata", default={})

class DAF(Base):
    __tablename__ = "dafs"
    daf_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("clients.client_id", ondelete="CASCADE"), nullable=False, index=True)
    daf_external_id = Column(String(100))
    sponsor_organization = Column(String(200), nullable=False, index=True)
    advisor_id = Column(String(100))
    total_assets = Column(Numeric(15, 2))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata_json = Column(JSON, name="metadata", default={})

class Transaction(Base):
    __tablename__ = "transactions"
    transaction_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    daf_id = Column(String(36), ForeignKey("dafs.daf_id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("clients.client_id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(15, 2), nullable=False)
    transaction_type = Column(String(50), nullable=False)
    vendor_id = Column(String(100))
    advisor_id = Column(String(100))
    beneficiary_id = Column(String(100))
    transaction_date = Column(DateTime(timezone=True), nullable=False, index=True)
    description = Column(Text)
    metadata_json = Column(JSON, name="metadata", default={})
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

# --- Risk & Compliance ---

class RiskDetection(Base):
    __tablename__ = "risk_detections"
    detection_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(String(36), ForeignKey("transactions.transaction_id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("clients.client_id", ondelete="CASCADE"), nullable=False, index=True)
    violation_type = Column(String(50), nullable=False)
    risk_level = Column(String(20), nullable=False, index=True)
    confidence_score = Column(Numeric(3, 2))
    description = Column(Text, nullable=False)
    evidence = Column(JSON, default=[])
    remediation_cost_estimate = Column(Numeric(10, 2))
    bounty_potential = Column(Numeric(10, 2))
    status = Column(String(20), nullable=False, default="new", index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(String(36), ForeignKey("clients.client_id"), nullable=True)

class RemediationCase(Base):
    __tablename__ = "remediation_cases"
    case_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("clients.client_id", ondelete="CASCADE"), nullable=False, index=True)
    detection_id = Column(String(36), ForeignKey("risk_detections.detection_id"), nullable=True)
    violation_type = Column(String(50), nullable=False)
    risk_level = Column(String(20), nullable=False)
    violation_amount = Column(Numeric(15, 2), nullable=False)
    tier = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, default="pending", index=True)
    assigned_analyst = Column(String(36), nullable=True)
    estimated_cost = Column(Numeric(10, 2), nullable=False)
    actual_cost = Column(Numeric(10, 2))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(JSON, name="metadata", default={})

class Scan(Base):
    __tablename__ = "scans"
    scan_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("clients.client_id", ondelete="CASCADE"), nullable=False, index=True)
    daf_id = Column(String(36), ForeignKey("dafs.daf_id"), nullable=True, index=True)
    scan_type = Column(String(50), nullable=False, default="comprehensive")
    priority = Column(String(20), default="normal")
    risks_detected = Column(Integer, default=0)
    critical_risks = Column(Integer, default=0)
    high_risks = Column(Integer, default=0)
    medium_risks = Column(Integer, default=0)
    low_risks = Column(Integer, default=0)
    status = Column(String(20), nullable=False, default="pending", index=True)
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    report_url = Column(Text)
    metadata_json = Column(JSON, name="metadata", default={})

class WhistleblowerReport(Base):
    __tablename__ = "whistleblower_reports"
    report_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("clients.client_id", ondelete="CASCADE"), nullable=False, index=True)
    case_id = Column(String(36), ForeignKey("remediation_cases.case_id"), nullable=True)
    violation_amount = Column(Numeric(15, 2), nullable=False)
    estimated_bounty = Column(Numeric(15, 2))
    irs_form_211_data = Column(JSON, nullable=False)
    submission_status = Column(String(20), nullable=False, default="draft", index=True)
    submission_date = Column(DateTime(timezone=True), nullable=True)
    award_amount = Column(Numeric(15, 2))
    agency_share_percentage = Column(Numeric(3, 2), default=0.15)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata_json = Column(JSON, name="metadata", default={})

class AbuseReport(Base):
    __tablename__ = "abuse_reports"
    abuse_report_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("clients.client_id", ondelete="CASCADE"), nullable=False, index=True)
    daf_id = Column(String(36), ForeignKey("dafs.daf_id"), nullable=True, index=True)
    report_type = Column(String(50), nullable=False)
    abuse_patterns = Column(JSON, nullable=False)
    total_abuse_amount = Column(Numeric(15, 2))
    report_price = Column(Numeric(10, 2), default=500.00)
    generated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    report_url = Column(Text)
    metadata_json = Column(JSON, name="metadata", default={})

class RevenueEvent(Base):
    __tablename__ = "revenue_events"
    event_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("clients.client_id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    related_id = Column(String(36))
    payment_method = Column(String(50))
    transaction_date = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    metadata_json = Column(JSON, name="metadata", default={})

# --- AI & Ingestion (Unified IDs) ---

class AIInterpretation(Base):
    __tablename__ = "ai_interpretations"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String(36), ForeignKey("clients.client_id"), nullable=False)
    interpretation_type = Column(String, nullable=False)
    input_refs = Column(Text, nullable=False)
    ai_output_text = Column(Text, nullable=False)
    ai_model_version = Column(String, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    advisory_disclaimer = Column(String, default="Advisory AI Interpretation — Not a Compliance Determination")
    revoked = Column(Boolean, default=False)
    revoked_at = Column(DateTime, nullable=True)

class ExportRecord(Base):
    __tablename__ = "export_records"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String(36), ForeignKey("clients.client_id"), nullable=False)
    export_generated_at = Column(DateTime, default=datetime.utcnow)
    scope = Column(String, nullable=True)
    methodology_versions = Column(String, nullable=True)
    hash_algorithm = Column(String, default="SHA256")
    package_hash = Column(String, nullable=False)
    download_url = Column(String, nullable=False)

class RiskScore(Base):
    __tablename__ = "risk_scores"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String(36), ForeignKey("clients.client_id"), nullable=False)
    score_total = Column(Integer, nullable=True)
    methodology_version = Column(String, nullable=False)
    computed_at = Column(DateTime, default=datetime.utcnow)
    computed_by = Column(String, nullable=False)
    simulated = Column(Boolean, default=False)
    status = Column(String, default="ok")

class AuditEvent(Base):
    __tablename__ = "audit_events"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    event_type = Column(String, nullable=False)
    actor_id = Column(String, nullable=True)
    org_id = Column(String(36), ForeignKey("clients.client_id"), nullable=True)
    entity_type = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)
    event_payload = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    prev_event_hash = Column(String, nullable=True)
    event_hash = Column(String, nullable=False)

class LitigationHold(Base):
    __tablename__ = "litigation_holds"
    org_id = Column(String(36), primary_key=True)
    active = Column(Boolean, default=False)
    activated_at = Column(DateTime, nullable=True)
    activated_by = Column(String, nullable=True)

class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String(36), ForeignKey("clients.client_id"))
    ein = Column(String)
    tax_year = Column(Integer, nullable=True)
    status = Column(String, default="queued")
    error_message = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SourceDocument(Base):
    __tablename__ = "source_documents"
    id = Column(Integer, primary_key=True, index=True)
    ingestion_job_id = Column(Integer, ForeignKey("ingestion_jobs.id"))
    document_type = Column(String)
    tax_year = Column(Integer)
    source_url = Column(String)
    source_hash = Column(String)
    raw_payload = Column(JSON)
    fetched_at = Column(DateTime, default=datetime.utcnow)
    ein = Column(String)
