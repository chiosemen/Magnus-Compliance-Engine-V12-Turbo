# Magnus CaaS Platform - API Reference

> **Complete REST API Documentation**  
> Base URL: `https://api.caas-platform.com` (production) | `http://localhost:8000` (development)  
> Version: 1.0.0

---

## 🔐 Authentication

All protected endpoints require a JWT (JSON Web Token) in the `Authorization` header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Obtain Access Token

**Endpoint**: `POST /api/auth/login`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response** (200 OK):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

---

## 📌 API Endpoints

### Health & Status

#### GET /api/health

**Description**: Check API health status

**Authentication**: None required

**Response** (200 OK):

```json
{
  "status": "healthy",
  "mode": "real",
  "timestamp": "2026-01-22T18:00:00Z"
}
```

**cURL Example**:

```bash
curl http://localhost:8000/api/health
```

---

### Authentication Endpoints

#### POST /api/auth/register

**Description**: Register a new user account

**Authentication**: None required

**Request Body**:

```json
{
  "email": "newuser@example.com",
  "password": "secure_password_123"
}
```

**Response** (200 OK):

```json
{
  "id": 2,
  "email": "newuser@example.com",
  "created_at": "2026-01-22T18:00:00Z"
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "secure_password_123"
  }'
```

---

#### GET /api/auth/me

**Description**: Get current authenticated user details

**Authentication**: Required (JWT)

**Response** (200 OK):

```json
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2026-01-15T10:00:00Z",
  "is_active": true
}
```

**cURL Example**:

```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Client Management Endpoints

#### POST /api/clients

**Description**: Create a new client subscription

**Authentication**: Required (JWT)

**Request Body**:

```json
{
  "organization_name": "Acme Foundation",
  "email": "admin@acme.org",
  "tier": "tier_2",
  "status": "active"
}
```

**Valid Tiers**:

- `tier_1`: Basic ($199/mo, 50 scans)
- `tier_2`: Standard ($599/mo, 200 scans)
- `tier_3`: Premium ($1,499/mo, 1,000 scans)

**Valid Statuses**:

- `trial`: 14-day trial period
- `active`: Active subscription
- `suspended`: Temporarily suspended
- `cancelled`: Subscription cancelled

**Response** (200 OK):

```json
{
  "client_id": "CLIENT-a1b2c3d4",
  "organization_name": "Acme Foundation",
  "email": "admin@acme.org",
  "tier": "tier_2",
  "status": "active",
  "created_at": "2026-01-22T18:00:00Z",
  "subscription_start": "2026-01-22T18:00:00Z",
  "monthly_scan_limit": 200,
  "scans_used": 0,
  "metadata": {}
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:8000/api/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_name": "Acme Foundation",
    "email": "admin@acme.org",
    "tier": "tier_2",
    "status": "active"
  }'
```

---

#### GET /api/clients

**Description**: List all clients (paginated)

**Authentication**: Required (JWT)

**Query Parameters**:

- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20): Items per page
- `tier` (string, optional): Filter by tier
- `status` (string, optional): Filter by status

**Response** (200 OK):

```json
{
  "clients": [
    {
      "client_id": "CLIENT-a1b2c3d4",
      "organization_name": "Acme Foundation",
      "email": "admin@acme.org",
      "tier": "tier_2",
      "status": "active",
      "created_at": "2026-01-22T18:00:00Z",
      "scans_used": 45,
      "monthly_scan_limit": 200
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

**cURL Example**:

```bash
curl "http://localhost:8000/api/clients?page=1&limit=20&tier=tier_2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### GET /api/clients/{client_id}

**Description**: Get details for a specific client

**Authentication**: Required (JWT)

**Path Parameters**:

- `client_id` (string): Client identifier (e.g., "CLIENT-a1b2c3d4")

**Response** (200 OK):

```json
{
  "client_id": "CLIENT-a1b2c3d4",
  "organization_name": "Acme Foundation",
  "email": "admin@acme.org",
  "tier": "tier_2",
  "status": "active",
  "created_at": "2026-01-22T18:00:00Z",
  "subscription_start": "2026-01-22T18:00:00Z",
  "subscription_end": null,
  "monthly_scan_limit": 200,
  "scans_used": 45,
  "metadata": {
    "industry": "healthcare",
    "employee_count": 150
  }
}
```

**cURL Example**:

```bash
curl http://localhost:8000/api/clients/CLIENT-a1b2c3d4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### PATCH /api/clients/{client_id}

**Description**: Update client details

**Authentication**: Required (JWT)

**Path Parameters**:

- `client_id` (string): Client identifier

**Request Body** (all fields optional):

```json
{
  "tier": "tier_3",
  "status": "active",
  "organization_name": "Acme Foundation Inc.",
  "metadata": {
    "industry": "healthcare",
    "employee_count": 200
  }
}
```

**Response** (200 OK):

```json
{
  "client_id": "CLIENT-a1b2c3d4",
  "organization_name": "Acme Foundation Inc.",
  "tier": "tier_3",
  "status": "active",
  "monthly_scan_limit": 1000,
  "updated_at": "2026-01-23T10:00:00Z"
}
```

**cURL Example**:

```bash
curl -X PATCH http://localhost:8000/api/clients/CLIENT-a1b2c3d4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "tier_3"
  }'
```

---

#### GET /api/clients/{client_id}/usage

**Description**: Get usage metrics for a client

**Authentication**: Required (JWT)

**Path Parameters**:

- `client_id` (string): Client identifier

**Query Parameters**:

- `period` (string, default: "current_month"): Time period ("current_month", "last_month", "ytd")

**Response** (200 OK):

```json
{
  "client_id": "CLIENT-a1b2c3d4",
  "period": "2026-01",
  "scans_completed": 45,
  "scans_remaining": 155,
  "monthly_limit": 200,
  "remediation_cases": 3,
  "abuse_reports_generated": 1,
  "total_cost": 599.00,
  "overage_charges": 0.00
}
```

**cURL Example**:

```bash
curl "http://localhost:8000/api/clients/CLIENT-a1b2c3d4/usage?period=current_month" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### IRS Data Ingestion Endpoints

#### POST /api/ingestion/irs990

**Description**: Initiate IRS Form 990 data ingestion for an organization

**Authentication**: Required (JWT)

**Request Body**:

```json
{
  "org_id": 1,
  "ein": "521203300",
  "tax_year": 2022
}
```

**Response** (200 OK):

```json
{
  "job_id": "ING-xyz789",
  "org_id": 1,
  "ein": "521203300",
  "tax_year": 2022,
  "status": "pending",
  "created_at": "2026-01-22T18:00:00Z",
  "estimated_completion": "2026-01-22T18:05:00Z"
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:8000/api/ingestion/irs990 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": 1,
    "ein": "521203300",
    "tax_year": 2022
  }'
```

---

#### GET /api/ingestion/jobs/{job_id}

**Description**: Get status of an ingestion job

**Authentication**: Required (JWT)

**Path Parameters**:

- `job_id` (string): Job identifier

**Response** (200 OK):

```json
{
  "job_id": "ING-xyz789",
  "org_id": 1,
  "ein": "521203300",
  "tax_year": 2022,
  "status": "completed",
  "created_at": "2026-01-22T18:00:00Z",
  "completed_at": "2026-01-22T18:03:45Z",
  "result": {
    "success": true,
    "records_ingested": 1250,
    "total_revenue": 185000000.00,
    "total_expenses": 165000000.00
  }
}
```

**Statuses**:

- `pending`: Job queued
- `processing`: Data being fetched
- `completed`: Successfully completed
- `failed`: Job failed (check `error` field)

**cURL Example**:

```bash
curl http://localhost:8000/api/ingestion/jobs/ING-xyz789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Risk Analysis Endpoints

#### POST /api/risk/scan

**Description**: Initiate a comprehensive risk scan

**Authentication**: Required (JWT)

**Request Body**:

```json
{
  "client_id": "CLIENT-a1b2c3d4",
  "daf_id": "DAF-12345",
  "scan_type": "comprehensive",
  "priority": "high"
}
```

**Scan Types**:

- `quick`: Basic pattern matching (< 30s)
- `standard`: Full risk analysis (< 2 min)
- `comprehensive`: Deep analysis with AI (< 5 min)

**Response** (200 OK):

```json
{
  "scan_id": "SCAN-xyz789",
  "client_id": "CLIENT-a1b2c3d4",
  "daf_id": "DAF-12345",
  "status": "processing",
  "created_at": "2026-01-22T18:00:00Z",
  "estimated_completion": "2026-01-22T18:05:00Z"
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:8000/api/risk/scan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CLIENT-a1b2c3d4",
    "daf_id": "DAF-12345",
    "scan_type": "comprehensive"
  }'
```

---

#### GET /api/risk/findings

**Description**: List all risk findings (paginated)

**Authentication**: Required (JWT)

**Query Parameters**:

- `client_id` (string, optional): Filter by client
- `risk_level` (string, optional): Filter by risk level ("low", "medium", "high", "critical")
- `violation_type` (string, optional): Filter by violation type
- `status` (string, optional): Filter by status ("open", "in_progress", "resolved")
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20): Items per page

**Response** (200 OK):

```json
{
  "findings": [
    {
      "id": 1,
      "client_id": "CLIENT-a1b2c3d4",
      "transaction_id": "TXN-001",
      "violation_type": "self_dealing",
      "risk_level": "high",
      "confidence_score": 0.92,
      "description": "Advisor received consulting fees from DAF-owned entity exceeding $50,000",
      "evidence": [
        "Vendor ID (VEN-789) matches advisor's registered business (BUS-789)",
        "Transaction amount of $55,000 exceeds IRS threshold",
        "Payment made within 30 days of DAF grant approval"
      ],
      "remediation_cost": 2500.00,
      "bounty_potential": 8250.00,
      "status": "open",
      "created_at": "2026-01-22T17:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

**cURL Example**:

```bash
curl "http://localhost:8000/api/risk/findings?client_id=CLIENT-a1b2c3d4&risk_level=high" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### GET /api/risk/findings/{finding_id}

**Description**: Get detailed information about a specific finding

**Authentication**: Required (JWT)

**Path Parameters**:

- `finding_id` (integer): Finding ID

**Response** (200 OK):

```json
{
  "id": 1,
  "client_id": "CLIENT-a1b2c3d4",
  "transaction_id": "TXN-001",
  "daf_id": "DAF-12345",
  "violation_type": "self_dealing",
  "risk_level": "high",
  "confidence_score": 0.92,
  "description": "Advisor received consulting fees from DAF-owned entity exceeding $50,000",
  "evidence": [
    "Vendor ID (VEN-789) matches advisor's registered business (BUS-789)",
    "Transaction amount of $55,000 exceeds IRS threshold",
    "Payment made within 30 days of DAF grant approval"
  ],
  "remediation_cost": 2500.00,
  "bounty_potential": 8250.00,
  "status": "open",
  "created_at": "2026-01-22T17:30:00Z",
  "updated_at": "2026-01-22T17:30:00Z",
  "metadata": {
    "vendor_name": "Acme Consulting LLC",
    "advisor_name": "John Smith",
    "transaction_date": "2025-12-15"
  }
}
```

**cURL Example**:

```bash
curl http://localhost:8000/api/risk/findings/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Remediation Endpoints

#### POST /api/remediation/cases

**Description**: Create a new remediation case

**Authentication**: Required (JWT)

**Request Body**:

```json
{
  "client_id": "CLIENT-a1b2c3d4",
  "violation_type": "self_dealing",
  "risk_level": "high",
  "violation_amount": 55000.00,
  "tier": "standard"
}
```

**Tiers**:

- `basic`: Template-based correction ($1,000-$2,000)
- `standard`: Analyst-assisted remediation ($2,000-$3,500)
- `premium`: Full-service with dedicated analyst ($3,500-$5,000)

**Response** (200 OK):

```json
{
  "case_id": "REM-abc123",
  "client_id": "CLIENT-a1b2c3d4",
  "violation_type": "self_dealing",
  "risk_level": "high",
  "violation_amount": 55000.00,
  "tier": "standard",
  "status": "pending",
  "created_at": "2026-01-22T18:00:00Z",
  "estimated_cost": 2750.00,
  "estimated_timeline_days": 45,
  "assigned_analyst": null
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:8000/api/remediation/cases \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CLIENT-a1b2c3d4",
    "violation_type": "self_dealing",
    "risk_level": "high",
    "violation_amount": 55000.00,
    "tier": "standard"
  }'
```

---

#### GET /api/remediation/cases/{case_id}

**Description**: Get remediation case details

**Authentication**: Required (JWT)

**Path Parameters**:

- `case_id` (string): Case identifier

**Response** (200 OK):

```json
{
  "case_id": "REM-abc123",
  "client_id": "CLIENT-a1b2c3d4",
  "violation_type": "self_dealing",
  "risk_level": "high",
  "violation_amount": 55000.00,
  "tier": "standard",
  "status": "in_progress",
  "created_at": "2026-01-22T18:00:00Z",
  "updated_at": "2026-01-23T10:00:00Z",
  "completed_at": null,
  "assigned_analyst": "Jane Analyst",
  "estimated_cost": 2750.00,
  "actual_cost": null,
  "progress": {
    "steps_completed": 3,
    "steps_total": 8,
    "percentage": 37.5
  }
}
```

**cURL Example**:

```bash
curl http://localhost:8000/api/remediation/cases/REM-abc123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### POST /api/remediation/cases/{case_id}/template

**Description**: Generate correction template for a remediation case

**Authentication**: Required (JWT)

**Path Parameters**:

- `case_id` (string): Case identifier

**Response** (200 OK):

```json
{
  "template_id": "TMPL-xyz789",
  "case_id": "REM-abc123",
  "violation_type": "self_dealing",
  "title": "Self-Dealing Remediation Plan",
  "sections": [
    {
      "step": "1",
      "title": "Violation Assessment",
      "description": "Document the nature and extent of the self-dealing violation",
      "case_notes": "Consulting fees paid to advisor-owned entity totaling $55,000"
    },
    {
      "step": "2",
      "title": "Repayment Calculation",
      "description": "Calculate full repayment amount including interest",
      "case_notes": "Principal: $55,000 + Interest (5% APR): $2,750 = Total: $57,750"
    },
    {
      "step": "3",
      "title": "Board Resolution",
      "description": "Prepare and approve board resolution acknowledging violation",
      "case_notes": null
    }
  ],
  "irs_forms_required": ["Form 211", "Schedule O"],
  "estimated_timeline_days": 45,
  "success_rate": 0.89,
  "generated_at": "2026-01-22T18:05:00Z"
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:8000/api/remediation/cases/REM-abc123/template \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Whistleblower Endpoints

#### POST /api/whistleblower/reports

**Description**: Create a new whistleblower report (IRS Form 211 preparation)

**Authentication**: Required (JWT)

**Request Body**:

```json
{
  "client_id": "CLIENT-a1b2c3d4",
  "case_id": "REM-abc123",
  "violation_amount": 100000.00,
  "whistleblower_name": "John Doe",
  "whistleblower_email": "john@example.com",
  "whistleblower_anonymous": false
}
```

**Response** (200 OK):

```json
{
  "report_id": "WB-xyz789",
  "client_id": "CLIENT-a1b2c3d4",
  "case_id": "REM-abc123",
  "violation_amount": 100000.00,
  "estimated_bounty": 15000.00,
  "agency_share_percentage": 15.0,
  "submission_status": "draft",
  "created_at": "2026-01-22T18:10:00Z",
  "metadata": {
    "whistleblower_name": "John Doe",
    "whistleblower_email": "john@example.com"
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:8000/api/whistleblower/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CLIENT-a1b2c3d4",
    "case_id": "REM-abc123",
    "violation_amount": 100000.00,
    "whistleblower_name": "John Doe",
    "whistleblower_email": "john@example.com"
  }'
```

---

#### GET /api/whistleblower/reports/{report_id}

**Description**: Get whistleblower report status

**Authentication**: Required (JWT)

**Path Parameters**:

- `report_id` (string): Report identifier

**Response** (200 OK):

```json
{
  "report_id": "WB-xyz789",
  "client_id": "CLIENT-a1b2c3d4",
  "case_id": "REM-abc123",
  "violation_amount": 100000.00,
  "estimated_bounty": 15000.00,
  "agency_share_percentage": 15.0,
  "submission_status": "submitted",
  "submission_date": "2026-01-25T14:30:00Z",
  "award_amount": null,
  "created_at": "2026-01-22T18:10:00Z",
  "updated_at": "2026-01-25T14:30:00Z"
}
```

**Submission Statuses**:

- `draft`: Report being prepared
- `submitted`: Submitted to IRS
- `under_review`: IRS reviewing case
- `awarded`: Bounty awarded
- `denied`: Claim denied

**cURL Example**:

```bash
curl http://localhost:8000/api/whistleblower/reports/WB-xyz789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### POST /api/whistleblower/reports/{report_id}/form211

**Description**: Generate IRS Form 211 PDF document

**Authentication**: Required (JWT)

**Path Parameters**:

- `report_id` (string): Report identifier

**Response** (200 OK):

```json
{
  "report_id": "WB-xyz789",
  "form_211_url": "https://storage.caas-platform.com/forms/WB-xyz789-form211.pdf",
  "generated_at": "2026-01-22T18:15:00Z",
  "expires_at": "2026-01-29T18:15:00Z"
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:8000/api/whistleblower/reports/WB-xyz789/form211 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Report Generation Endpoints

#### POST /api/reports

**Description**: Generate a PDF compliance report

**Authentication**: Required (JWT)

**Request Body**:

```json
{
  "client_id": "CLIENT-a1b2c3d4",
  "report_type": "quarterly_compliance",
  "period_start": "2026-01-01",
  "period_end": "2026-03-31",
  "include_findings": true,
  "include_remediation": true
}
```

**Report Types**:

- `monthly_summary`: Monthly overview
- `quarterly_compliance`: Quarterly compliance report
- `annual_audit`: Annual audit report
- `custom`: Custom date range

**Response** (200 OK):

```json
{
  "report_id": "RPT-abc123",
  "client_id": "CLIENT-a1b2c3d4",
  "report_type": "quarterly_compliance",
  "status": "generating",
  "created_at": "2026-01-22T18:20:00Z",
  "estimated_completion": "2026-01-22T18:25:00Z"
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:8000/api/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CLIENT-a1b2c3d4",
    "report_type": "quarterly_compliance",
    "period_start": "2026-01-01",
    "period_end": "2026-03-31"
  }'
```

---

#### GET /api/reports/{report_id}/download

**Description**: Download generated PDF report

**Authentication**: Required (JWT)

**Path Parameters**:

- `report_id` (string): Report identifier

**Response** (200 OK):
Returns PDF binary data with headers:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="compliance-report-abc123.pdf"
```

**cURL Example**:

```bash
curl http://localhost:8000/api/reports/RPT-abc123/download \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o report.pdf
```

---

## 🔧 Error Responses

All endpoints return standard HTTP status codes:

### 200 OK

Request successful, data returned

### 201 Created

Resource successfully created

### 400 Bad Request

Invalid request body or parameters

**Example**:

```json
{
  "detail": "Invalid email format",
  "field": "email"
}
```

### 401 Unauthorized

Missing or invalid authentication token

**Example**:

```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden

Insufficient permissions

**Example**:

```json
{
  "detail": "Insufficient permissions to access this resource"
}
```

### 404 Not Found

Resource not found

**Example**:

```json
{
  "detail": "Client not found",
  "client_id": "CLIENT-invalid"
}
```

### 429 Too Many Requests

Rate limit exceeded

**Example**:

```json
{
  "detail": "Rate limit exceeded. Try again in 60 seconds.",
  "retry_after": 60
}
```

### 500 Internal Server Error

Server-side error

**Example**:

```json
{
  "detail": "Internal server error. Please contact support.",
  "error_id": "ERR-xyz789"
}
```

---

## 🚀 Rate Limits

- **Authenticated endpoints**: 100 requests per minute
- **Unauthenticated endpoints**: 20 requests per minute
- **Scan endpoints**: 10 requests per minute (resource-intensive)

Rate limit headers included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706125200
```

---

## 📊 Pagination

List endpoints support pagination with standard parameters:

**Query Parameters**:

- `page` (integer, default: 1): Page number (1-indexed)
- `limit` (integer, default: 20, max: 100): Items per page

**Response Format**:

```json
{
  "items": [...],
  "total": 150,
  "page": 2,
  "limit": 20,
  "pages": 8
}
```

---

## 🧪 Testing

### Interactive API Documentation

Visit `http://localhost:8000/docs` for Swagger UI with interactive testing.

### Example Workflow

```bash
# 1. Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 2. Login
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  | jq -r '.access_token')

# 3. Create client
curl -X POST http://localhost:8000/api/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_name": "Test Org",
    "email": "org@example.com",
    "tier": "tier_1",
    "status": "trial"
  }'

# 4. Initiate risk scan
curl -X POST http://localhost:8000/api/risk/scan \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CLIENT-xxx",
    "daf_id": "DAF-12345",
    "scan_type": "comprehensive"
  }'

# 5. View findings
curl http://localhost:8000/api/risk/findings \
  -H "Authorization: Bearer $TOKEN"
```

---

**API Version**: 1.0.0  
**Last Updated**: 2026-01-22  
**Support**: <support@caas-platform.com>
