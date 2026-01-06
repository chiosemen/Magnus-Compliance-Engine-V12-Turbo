-- Magnus Compliance Engine — Authoritative Schema
-- Purpose: Evidence, auditability, tenant isolation
-- NOTE: No regulatory determinations are stored in this database.

CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  event_type TEXT NOT NULL,
  event_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evidence_artifacts (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  artifact_type TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  immutable BOOLEAN NOT NULL DEFAULT TRUE
);

-- Advisory data only; no determinations
