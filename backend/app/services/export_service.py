import os
import json
import hashlib
import zipfile
from datetime import datetime
from sqlalchemy.orm import Session
from ..models import SourceDocument, RiskScore, RiskScoreComponent, AuditEvent, ExportRecord
from ..services.audit_service import verify_audit_chain, append_audit_event
from ..config import APP_MODE

EXPORT_BASE = "regulatory_exports"
EXPORT_TOOL_VERSION = "1.0.0"

os.makedirs(EXPORT_BASE, exist_ok=True)

def compute_file_hash(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()

def export_regulatory_package(db: Session, org_id: int, date_range: str, actor_id: int, environment: str = "real"):
    if APP_MODE == "demo":
        raise Exception("Export unavailable in demo mode")
    now = datetime.utcnow()
    export_dir = os.path.join(EXPORT_BASE, f"org_{org_id}_{now.strftime('%Y%m%d%H%M%S')}")
    os.makedirs(export_dir, exist_ok=True)
    # 1. Source Documents
    src_dir = os.path.join(export_dir, "source_documents")
    os.makedirs(src_dir, exist_ok=True)
    docs = db.query(SourceDocument).filter(SourceDocument.ein == org_id).all()
    doc_hashes = {}
    for doc in docs:
        fname = f"{doc.id}_990_{doc.tax_year}.json"
        fpath = os.path.join(src_dir, fname)
        with open(fpath, "w") as f:
            f.write(doc.raw_payload if isinstance(doc.raw_payload, str) else json.dumps(doc.raw_payload))
        doc_hashes[fname] = compute_file_hash(fpath)
    # 2. Risk Scores
    risk_dir = os.path.join(export_dir, "risk_scores")
    os.makedirs(risk_dir, exist_ok=True)
    score = db.query(RiskScore).filter(RiskScore.org_id == org_id).order_by(RiskScore.computed_at.desc()).first()
    components = db.query(RiskScoreComponent).filter(RiskScoreComponent.risk_score_id == score.id).all() if score else []
    with open(os.path.join(risk_dir, "risk_score.json"), "w") as f:
        json.dump({
            "id": score.id,
            "org_id": score.org_id,
            "score_total": score.score_total,
            "methodology_version": score.methodology_version,
            "computed_at": score.computed_at.isoformat(),
            "computed_by": score.computed_by,
            "simulated": score.simulated,
            "status": score.status
        }, f, indent=2)
    with open(os.path.join(risk_dir, "component_breakdown.json"), "w") as f:
        json.dump([
            {
                "factor_code": c.factor_code,
                "factor_score": c.factor_score,
                "evidence_refs": c.evidence_refs,
                "explanation_text": c.explanation_text
            } for c in components
        ], f, indent=2)
    # 3. Audit Log
    audit_dir = os.path.join(export_dir, "audit_log")
    os.makedirs(audit_dir, exist_ok=True)
    events = db.query(AuditEvent).filter(AuditEvent.org_id == org_id).order_by(AuditEvent.created_at).all()
    with open(os.path.join(audit_dir, "audit_events.json"), "w") as f:
        json.dump([
            {
                "id": e.id,
                "event_type": e.event_type,
                "actor_id": e.actor_id,
                "entity_type": e.entity_type,
                "entity_id": e.entity_id,
                "event_payload": e.event_payload,
                "created_at": e.created_at.isoformat(),
                "prev_event_hash": e.prev_event_hash,
                "event_hash": e.event_hash
            } for e in events
        ], f, indent=2)
    chain_result = verify_audit_chain(db, org_id)
    with open(os.path.join(audit_dir, "hash_chain_verification.json"), "w") as f:
        json.dump(chain_result, f, indent=2)
    # 4. Metadata
    meta_dir = os.path.join(export_dir, "metadata")
    os.makedirs(meta_dir, exist_ok=True)
    with open(os.path.join(meta_dir, "system_version.json"), "w") as f:
        json.dump({"system_version": EXPORT_TOOL_VERSION}, f)
    with open(os.path.join(meta_dir, "environment.json"), "w") as f:
        json.dump({"environment": environment}, f)
    # 5. Manifest
    manifest = {
        "org_id": org_id,
        "export_generated_at": now.isoformat(),
        "scope": date_range,
        "methodology_versions": list(set([score.methodology_version] if score else [])),
        "hash_algorithm": "SHA256",
        "package_hash": None
    }
    # Compute package hash (hash of all file hashes)
    all_hashes = list(doc_hashes.values())
    for subdir in [risk_dir, audit_dir, meta_dir]:
        for fname in os.listdir(subdir):
            fpath = os.path.join(subdir, fname)
            all_hashes.append(compute_file_hash(fpath))
    package_hash = hashlib.sha256("".join(sorted(all_hashes)).encode("utf-8")).hexdigest()
    manifest["package_hash"] = package_hash
    with open(os.path.join(export_dir, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    # 6. Zip
    zip_name = f"org_{org_id}_{now.strftime('%Y%m%d%H%M%S')}.zip"
    zip_path = os.path.join(EXPORT_BASE, zip_name)
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(export_dir):
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, export_dir)
                zipf.write(full_path, arcname)
    # 7. Persist export record
    record = ExportRecord(
        org_id=org_id,
        export_generated_at=now,
        scope=date_range,
        methodology_versions=",".join(manifest["methodology_versions"]),
        hash_algorithm="SHA256",
        package_hash=package_hash,
        download_url=zip_path
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    append_audit_event(db,
        event_type="EXPORT_CREATED",
        actor_id=actor_id,
        org_id=org_id,
        entity_type="export_record",
        entity_id=record.id,
        event_payload={"download_url": zip_path, "package_hash": package_hash, "included_entities": [d.id for d in docs]}
    )
    return {"download_url": zip_path, "package_hash": package_hash}
