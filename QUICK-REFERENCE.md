# Magnus CaaS Platform - Quick Reference Guide

> **Cheat Sheet for Common Operations**  
> Quick commands for developers, DevOps, and operators

---

## 🚀 Quick Start

### Run Locally

```bash
# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Frontend (new terminal)
cd Magnus-CaaS-Turbo
npm run dev

# Access
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Run Tests

```bash
# Backend
cd backend
pytest --cov=app

# Stress test
cd Magnus-CaaS-Turbo
python3 stress_test.py 15
```

---

## 🔐 Authentication

### Get Access Token

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Save token
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Use token
curl http://localhost:8000/api/clients \
  -H "Authorization: Bearer $TOKEN"
```

### Create User

```bash
# Via API
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"password123"}'

# Via database (production)
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production -c "
  INSERT INTO users (email, hashed_password, is_active)
  VALUES ('admin@caas.com', 'bcrypt_hash_here', true);
  "
```

---

## 📦 Kubernetes Operations

### Deploy

```bash
# Apply deployment
kubectl apply -f Magnus-CaaS-Turbo/kubernetes/production-deployment.yaml

# Watch progress
kubectl get pods -n caas-production -w

# Check status
kubectl get all -n caas-production
```

### Scale

```bash
# Manual scaling
kubectl scale deployment caas-backend --replicas=5 -n caas-production

# Auto-scaling status
kubectl get hpa -n caas-production

# Describe HPA
kubectl describe hpa caas-backend-hpa -n caas-production
```

### Logs

```bash
# View logs
kubectl logs deployment/caas-backend -n caas-production --tail=100

# Follow logs
kubectl logs -f deployment/caas-backend -n caas-production

# All containers
kubectl logs deployment/caas-backend -n caas-production --all-containers=true

# Specific pod
POD=$(kubectl get pod -l app=caas-backend -n caas-production -o jsonpath="{.items[0].metadata.name}")
kubectl logs $POD -n caas-production
```

### Restart

```bash
# Restart deployment
kubectl rollout restart deployment/caas-backend -n caas-production

# Restart specific pod
kubectl delete pod POD_NAME -n caas-production

# Restart all
kubectl rollout restart deployment -n caas-production
```

### Exec into Pod

```bash
# Backend
BACKEND_POD=$(kubectl get pod -l app=caas-backend -n caas-production -o jsonpath="{.items[0].metadata.name}")
kubectl exec -it $BACKEND_POD -n caas-production -- bash

# Database
kubectl exec -it postgres-0 -n caas-production -- psql -U caas_user -d caas_production

# Redis
kubectl exec -it $(kubectl get pod -l app=redis -n caas-production -o jsonpath="{.items[0].metadata.name}") -n caas-production -- redis-cli
```

---

## 🗄️ Database Operations

### Connect to Database

```bash
# Local (SQLite)
cd backend
sqlite3 db.sqlite3

# Production (PostgreSQL)
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production
```

### Common Queries

```sql
-- List all tables
\dt

-- Count users
SELECT COUNT(*) FROM users;

-- List clients
SELECT client_id, organization_name, tier, status FROM clients LIMIT 10;

-- Find high-risk findings
SELECT id, violation_type, risk_level, confidence_score 
FROM risk_findings 
WHERE risk_level = 'high' 
ORDER BY created_at DESC 
LIMIT 20;

-- Check remediation cases
SELECT case_id, status, created_at 
FROM remediation_cases 
WHERE status = 'in_progress';

-- Usage stats
SELECT tier, COUNT(*) as count, SUM(scans_used) as total_scans
FROM clients
GROUP BY tier;
```

### Database Backup

```bash
# Backup
kubectl exec -it postgres-0 -n caas-production -- \
  pg_dump -U caas_user caas_production | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Restore
gunzip < backup-20260122-180000.sql.gz | \
  kubectl exec -i postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production

# Auto-backup script (run as cron job)
0 2 * * * /path/to/backup-script.sh
```

### Add Indexes

```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_clients_email ON clients(email);
CREATE INDEX CONCURRENTLY idx_clients_tier ON clients(tier);
CREATE INDEX CONCURRENTLY idx_findings_client ON risk_findings(client_id);
CREATE INDEX CONCURRENTLY idx_findings_status ON risk_findings(status);
CREATE INDEX CONCURRENTLY idx_cases_client ON remediation_cases(client_id);
CREATE INDEX CONCURRENTLY idx_cases_status ON remediation_cases(status);

-- Verify indexes
\di
```

---

## 🔧 Configuration

### Environment Variables

**Backend** (`.env` or Kubernetes ConfigMap):

```bash
APP_MODE=real                              # "demo" or "real"
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-secret-key-32-chars-min
GEMINI_API_KEY=your-api-key
OPENAI_API_KEY=your-openai-key
LOG_LEVEL=INFO                            # DEBUG, INFO, WARNING, ERROR
```

**Frontend** (`.env`):

```bash
VITE_API_URL=http://localhost:8000        # or https://api.your-domain.com
GEMINI_API_KEY=your-api-key
```

### Update Secrets (Production)

```bash
# Delete old secret
kubectl delete secret caas-secrets -n caas-production

# Create new secret
kubectl create secret generic caas-secrets \
  --from-literal=DATABASE_PASSWORD='NEW_PASSWORD' \
  --from-literal=SECRET_KEY='NEW_SECRET' \
  --from-literal=OPENAI_API_KEY='NEW_KEY' \
  -n caas-production

# Restart backend to pick up new secrets
kubectl rollout restart deployment/caas-backend -n caas-production
```

---

## 📊 Monitoring

### Health Check

```bash
# API health
curl http://localhost:8000/api/health

# Expected response
{"status":"healthy","mode":"real","timestamp":"2026-01-22T..."}

# Production
curl https://api.caas-platform.com/api/health
```

### Resource Usage

```bash
# Pod resources
kubectl top pods -n caas-production

# Node resources
kubectl top nodes

# Specific deployment
kubectl top pods -l app=caas-backend -n caas-production
```

### Events

```bash
# Recent events
kubectl get events -n caas-production --sort-by='.lastTimestamp'

# Watch events
kubectl get events -n caas-production -w

# Events for specific pod
kubectl describe pod POD_NAME -n caas-production
```

---

## 🚨 Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n caas-production

# Describe pod
kubectl describe pod POD_NAME -n caas-production

# View logs
kubectl logs POD_NAME -n caas-production

# Check events
kubectl get events -n caas-production | grep POD_NAME
```

### API Returning 500 Errors

```bash
# Check backend logs
kubectl logs deployment/caas-backend -n caas-production --tail=100 | grep error

# Check database connection
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production -c "SELECT 1;"

# Restart backend
kubectl rollout restart deployment/caas-backend -n caas-production
```

### High Memory Usage

```bash
# Check memory
kubectl top pods -n caas-production

# Increase limits
kubectl edit deployment caas-backend -n caas-production
# Change: limits.memory: "2Gi"

# Restart with new limits
kubectl rollout restart deployment/caas-backend -n caas-production
```

---

## 🔄 Rollback

### Application Rollback

```bash
# View history
kubectl rollout history deployment/caas-backend -n caas-production

# Rollback to previous
kubectl rollout undo deployment/caas-backend -n caas-production

# Rollback to specific revision
kubectl rollout undo deployment/caas-backend -n caas-production --to-revision=3

# Check status
kubectl rollout status deployment/caas-backend -n caas-production
```

---

## 🔐 Security

### Rotate Secrets

```bash
# Generate new password
NEW_PASSWORD=$(openssl rand -base64 32)

# Update database password
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d postgres -c "ALTER USER caas_user WITH PASSWORD '$NEW_PASSWORD';"

# Update secret
kubectl create secret generic caas-secrets \
  --from-literal=DATABASE_PASSWORD="$NEW_PASSWORD" \
  --from-literal=SECRET_KEY="$(openssl rand -base64 32)" \
  --from-literal=OPENAI_API_KEY="$OPENAI_KEY" \
  -n caas-production --dry-run=client -o yaml | kubectl apply -f -

# Restart backend
kubectl rollout restart deployment/caas-backend -n caas-production
```

### View Audit Logs

```sql
-- Recent audit events
SELECT * FROM audit_events ORDER BY created_at DESC LIMIT 50;

-- By user
SELECT * FROM audit_events WHERE user_id = 1 ORDER BY created_at DESC;

-- By event type
SELECT * FROM audit_events WHERE event_type = 'login_failed' ORDER BY created_at DESC;

-- By IP address
SELECT * FROM audit_events WHERE ip_address = '1.2.3.4' ORDER BY created_at DESC;
```

---

## 🎯 Common Tasks

### Create Client Subscription

```bash
TOKEN="your-jwt-token"

curl -X POST http://localhost:8000/api/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_name": "Acme Foundation",
    "email": "admin@acme.org",
    "tier": "tier_2",
    "status": "active"
  }'
```

### Initiate Risk Scan

```bash
curl -X POST http://localhost:8000/api/risk/scan \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CLIENT-xxx",
    "daf_id": "DAF-12345",
    "scan_type": "comprehensive"
  }'
```

### Create Remediation Case

```bash
curl -X POST http://localhost:8000/api/remediation/cases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CLIENT-xxx",
    "violation_type": "self_dealing",
    "risk_level": "high",
    "violation_amount": 50000.00,
    "tier": "standard"
  }'
```

### Generate Report

```bash
# Create report
REPORT_ID=$(curl -X POST http://localhost:8000/api/reports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CLIENT-xxx",
    "report_type": "quarterly_compliance",
    "period_start": "2026-01-01",
    "period_end": "2026-03-31"
  }' | jq -r '.report_id')

# Download report
curl http://localhost:8000/api/reports/$REPORT_ID/download \
  -H "Authorization: Bearer $TOKEN" \
  -o report.pdf
```

---

## 📈 Performance Optimization

### Database Optimization

```sql
-- Vacuum database (reclaim space)
VACUUM FULL;

-- Analyze tables (update statistics)
ANALYZE;

-- Reindex
REINDEX DATABASE caas_production;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Find slow queries
SELECT 
  pid,
  now() - query_start AS duration,
  query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 seconds';
```

### Cache Management

```bash
# Connect to Redis
kubectl exec -it $(kubectl get pod -l app=redis -n caas-production -o jsonpath="{.items[0].metadata.name}") -n caas-production -- redis-cli

# Check memory usage
INFO memory

# Clear cache
FLUSHDB

# Monitor commands
MONITOR
```

---

## 🧪 Testing

### Manual API Testing

```bash
# Set variables
API_URL="http://localhost:8000"
TOKEN="your-jwt-token"

# Test health
curl $API_URL/api/health

# Test auth
curl -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test protected endpoint
curl $API_URL/api/clients \
  -H "Authorization: Bearer $TOKEN"
```

### Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run --vus 10 --duration 30s load-test.js

# Expected output:
# http_req_duration...: avg=150ms p(95)=350ms
# http_req_failed.....: 0.00%
```

---

## 🔗 Useful Aliases

Add to `.bashrc` or `.zshrc`:

```bash
# Kubernetes
alias k='kubectl'
alias kgp='kubectl get pods -n caas-production'
alias kgpa='kubectl get pods --all-namespaces'
alias kl='kubectl logs -f -n caas-production'
alias kex='kubectl exec -it -n caas-production'
alias kdesc='kubectl describe -n caas-production'

# Magnus CaaS specific
alias caas-health='curl -s https://api.caas-platform.com/api/health | jq'
alias caas-logs='kubectl logs -f deployment/caas-backend -n caas-production'
alias caas-restart='kubectl rollout restart deployment/caas-backend -n caas-production'
alias caas-pods='kubectl get pods -n caas-production'
alias caas-hpa='kubectl get hpa -n caas-production'
```

---

## 📞 Quick Reference Links

| Resource | Link |
|----------|------|
| **Full Documentation** | [COMPLETE-DOCUMENTATION.md](COMPLETE-DOCUMENTATION.md) |
| **Deployment Guide** | [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) |
| **API Reference** | [API-REFERENCE.md](API-REFERENCE.md) |
| **Troubleshooting** | [TROUBLESHOOTING-RUNBOOK.md](TROUBLESHOOTING-RUNBOOK.md) |
| **Local Frontend** | <http://localhost:5173> |
| **Local Backend** | <http://localhost:8000> |
| **API Docs (Swagger)** | <http://localhost:8000/docs> |

---

**Last Updated**: 2026-01-22  
**Version**: 1.0.0

**Print this page and keep it handy for quick reference!**
