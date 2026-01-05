cat <<'EOF' > docs/architecture/DOMAIN-MODEL.md
# Domain Model Overview

This document defines the core domain objects used by the Magnus Compliance Engine.

The purpose is to ensure:
- Consistent interpretation of data
- Stable regulatory meaning
- Audit-safe evolution over time

## Core Domains

- Organization
- ComplianceAssessment
- RiskSignal
- EvidenceArtifact
- AuditEvent
- UserRole

Each domain object represents a **fact or observation**, not a legal conclusion.

## Design Principle

No domain object represents a regulatory determination.
All determinations require human review and approval.
EOF


