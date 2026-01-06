# Security Posture Overview

This document outlines the baseline security principles for the Magnus Compliance Engine.

## Principles
- Least privilege access
- Organization-scoped data isolation
- Server-side authority for audit and evidence
- No secrets committed to source control

## Authentication & Authorization
- Role-based access control (Analyst, CCO, Board, Regulator)
- Regulator access is read-only and time-bound

## Secrets Management
- Secrets are injected via environment variables
- No secrets are exposed to client-side code
- Key rotation is required in production

## Incident Response
- Security incidents are logged as audit events
- Evidence preservation takes precedence over remediation

This document evolves with the system.
