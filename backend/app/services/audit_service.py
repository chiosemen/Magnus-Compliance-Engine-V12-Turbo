import json
import hashlib
from sqlalchemy.orm import Session
from ..models import AuditEvent, LitigationHold, Client
from ..config import APP_MODE
from ..utils.time_utils import now_utc

# Canonical JSON for hash

def canonical_json(data):
    return json.dumps(data, sort_keys=True, separators=(",", ":"))

def compute_event_hash(prev_event_hash, event_type, actor_id, entity_type, entity_id, event_payload, created_at):
    payload_str = canonical_json(event_payload)
    hash_input = (
        (prev_event_hash or "") +
        (event_type or "") +
        (str(actor_id) if actor_id else "") +
        (entity_type or "") +
        (str(entity_id) if entity_id else "") +
        payload_str +
        created_at.isoformat()
    )
    return hashlib.sha256(hash_input.encode("utf-8")).hexdigest()

# Append-only audit log

def append_audit_event(db: Session, *, event_type, actor_id, org_id, entity_type, entity_id, event_payload):
    # LOCKING: Serialize audit writes for this Org to prevent hash forks
    # We lock the Client row. If Client doesn't exist, we can't audit, which is correct fail-closed.
    if org_id:
        db.query(Client).filter(Client.client_id == org_id).with_for_update().first()
        
    # Get last event hash for org
    last_event = db.query(AuditEvent).filter(AuditEvent.org_id == org_id).order_by(AuditEvent.created_at.desc()).first()
    prev_hash = last_event.event_hash if last_event else None
    now = now_utc()
    event_hash = compute_event_hash(
        prev_hash, event_type, actor_id, entity_type, entity_id, event_payload, now
    )
    event = AuditEvent(
        event_type=event_type,
        actor_id=str(actor_id) if actor_id else None,
        org_id=str(org_id) if org_id else None,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else None,
        event_payload=canonical_json(event_payload),
        created_at=now,
        prev_event_hash=prev_hash,
        event_hash=event_hash
    )
    db.add(event)
    try:
        db.commit()
        db.refresh(event)
    except Exception as e:
        db.rollback()
        raise RuntimeError(f"Audit log failure: {e}")
    return event

# Litigation hold enforcement

def check_litigation_hold(db: Session, org_id: str):
    hold = db.query(LitigationHold).filter(LitigationHold.org_id == org_id, LitigationHold.active == True).first()
    return bool(hold)

# Chain verification

def verify_audit_chain(db: Session, org_id: int):
    events = db.query(AuditEvent).filter(AuditEvent.org_id == org_id).order_by(AuditEvent.created_at).all()
    prev_hash = None
    for event in events:
        expected_hash = compute_event_hash(
            prev_hash,
            event.event_type,
            event.actor_id,
            event.entity_type,
            event.entity_id,
            json.loads(event.event_payload),
            event.created_at
        )
        if event.event_hash != expected_hash:
            return {"valid": False, "first_invalid_event_id": event.id}
        prev_hash = event.event_hash
    return {"valid": True}
