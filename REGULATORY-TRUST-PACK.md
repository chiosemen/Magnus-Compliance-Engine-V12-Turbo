# Magnus Compliance Engine: Regulatory & Trust Disclosure

## A. Regulator-Facing System Summary

**System Definition:**
The Magnus Compliance Engine ("the System") is a **passive evidence aggregation and audit ledger** designed to assist, but not replace, human compliance officers in the administration of Donor Advised Funds (DAFs). It functions as a deterministic state machine for ingestion, storage, and retrieval of compliance artifacts.

**Core Authorities:**
The System possesses **zero decision-making authority**. It cannot effectively approve grants, close cases, or issue legal determinations. Its architecture strictly separates **Evidence Ingestion** (Read-Only) from **Remediation Actions** (Human-Only).

**Trust Architecture:**

1. **Immutability:** All ingested evidence is hashed (SHA-256) upon arrival. These artifacts are stored in a Write-Once-Read-Many (WORM) state at the database level.
2. **Auditability:** Every system state change is recorded in a cryptographically serialized audit log. Writing to the log requires a row-level lock on the tenant entity, guaranteeing a linear, unforkable history.
3. **Fail-Closed Design:** In the event of configuration errors, missing secrets, or upstream API failures, the System halts operations immediately (`SystemExit`), preventing partial or unverified state processing.
4. **Identity Strictness:** All operations are authenticated via strict JWT ownership checks. Cross-organization data access is architecturally impossible at the query level.

---

## B. Control Mapping Table

| Control Category | Control ID | Control Description | Implementation Evidence |
| :--- | :--- | :--- | :--- |
| **Identity & Access** | IAM-01 | **Strict Org Scoping:** API endpoints enforce `user.org_id == resource.org_id` before execution. | `routers/ingestion.py` (Line 15); `auth.py` |
| **Integration Integrity** | INT-01 | **Read-Only Adapters:** External connectors are forbidden from write operations. | Abstract Base Class `fetch_evidence` only. |
| **Audit & Accountability** | AUD-01 | **Linear Serialization:** Audit writes use row-locking to prevent race conditions. | `services/audit_service.py` (`with_for_update`) |
| **Data Integrity** | DAT-01 | **Canonical Hashing:** JSON payloads are sorted/canonicalized before hashing. | `services/audit_service.py` (`canonical_json`) |
| **Availability** | AVL-01 | **Asynchronous Decoupling:** Long-running tasks are offloaded to queues. | `routers/ingestion.py` (Celery integration) |
| **Configuration** | CFG-01 | **Fail-Closed Startup:** App crashes if PRODUCTION secrets are missing. | `config.py` (Strict validation block) |

---

## C. Non-Claims Appendix (The "Negative Scope")

To ensure clarity and prevent liability, Magnus makes the following **Negative Affirmations**:

1. **No Legal Advice:** The System does not provide legal counsel, tax advice, or regulatory determinations. All "Risk Detections" are improved search queries, not verdicts.
2. **No Autonomous Action:** The System will never autonomously report a violation to the IRS, freeze assets, or deny a grant. These are exclusively human capabilities.
3. **No Predictive Certainty:** "Risk Scores" are heuristic aggregations of metadata. They do not predict future regulatory audits with statistical certainty.
4. **No Deep-Scanning:** The System does not "hack back" or fetch data the user has not explicitly authorized via credentialed APIs.

---

## D. Incident Response Narrative

**Scenario: Detection of Integrity Failure (Hash Mismatch)**

1. **Identification:** A routine verification script detects that `SourceDocument:101`'s computed hash does not match its stored `source_hash`.
2. **Containment (Automated):** The System acts as a **Ledger**. It does not auto-correct. The corrupted artifact is flagged `STATUS=CORRUPTED`.
3. **Forensics:** The implementation of the immutable audit log allows reconstruction. We query the `audit_events` table for the exact timestamp and Actor ID responsible for the ingestion.
4. **Remediation:** A human administrator must re-ingest the document, creating a new `SourceDocument` version.
5. **Exculpation:** The audit chain proves that the corruption occurred *after* ingestion, protecting the fidelity of the original submission record.

---

## E. Buyer Due-Diligence FAQ

**Q: Can your AI close false-positive alerts automatically?**
**A:** No. The AI is read-only and advisory. It can summarize context, but only a logged-in human user can transition a case status to "Closed."

**Q: Where do you store my secrets?**
**A:** We do not store secrets in the repository or code. In production, they are injected strictly as environment variables. The application checks for their presence at startup and refuses to run if they are absent.

**Q: How do you prevent data bleeding between clients?**
**A:** Organization IDs are enforced at the database query level. The API router actively rejects any ID that does not match the authenticated user's token claims.

**Q: Is the system immutable?**
**A:** The *Evidence Artifact* layer is immutable (WORM). The *Audit Log* is append-only. Business objects (Cases) are mutable but versioned via the Audit Log.
