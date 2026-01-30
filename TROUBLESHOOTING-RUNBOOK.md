# Magnus CaaS Platform - Troubleshooting Runbook

> **Quick Reference Guide for Common Production Issues**  
> For On-Call Engineers & System Administrators

---

## 🚨 Emergency Contacts

- **On-Call Engineer**: [Your Phone]
- **DevOps Lead**: [Your Phone]
- **Product Manager**: [Your Phone]
- **CEO/Founder**: [Your Phone]

---

## 🔴 Critical Issues (P0)

### Issue: Service is Down (Health Check Failing)

**Symptoms**:

- `/api/health` returns 500 or times out
- All API endpoints unavailable
- Dashboard not loading

**Diagnosis**:

```bash
# Check pod status
kubectl get pods -n caas-production

# Check for crashlooping pods
kubectl get pods -n caas-production | grep -E "CrashLoopBackOff|Error"

# View recent events
kubectl get events -n caas-production --sort-by='.lastTimestamp' | tail -20

# Check backend logs
BACKEND_POD=$(kubectl get pod -l app=caas-backend -n caas-production -o jsonpath="{.items[0].metadata.name}")
kubectl logs $BACKEND_POD -n caas-production --tail=100
```

**Root Causes & Solutions**:

#### 1. Database Connection Failure

```bash
# Verify database pod
kubectl get pods -l app=postgres -n caas-production

# If postgres pod is down:
kubectl rollout restart statefulset/postgres -n caas-production

# Wait for it to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n caas-production --timeout=300s

# Restart backend to reconnect
kubectl rollout restart deployment/caas-backend -n caas-production
```

#### 2. Out of Memory (OOM)

```bash
# Check memory usage
kubectl top pods -n caas-production

# If backend pods are at limit:
kubectl scale deployment caas-backend --replicas=0 -n caas-production
sleep 10
kubectl scale deployment caas-backend --replicas=3 -n caas-production

# Increase memory limits (edit deployment)
kubectl edit deployment caas-backend -n caas-production
# Change: limits.memory: "2Gi" (from "1Gi")
```

#### 3. Secret Missing

```bash
# Verify secrets exist
kubectl get secrets -n caas-production

# If caas-secrets is missing, recreate:
kubectl create secret generic caas-secrets \
  --from-literal=DATABASE_PASSWORD='REPLACE_WITH_BACKUP' \
  --from-literal=SECRET_KEY='REPLACE_WITH_BACKUP' \
  --from-literal=OPENAI_API_KEY='REPLACE_WITH_BACKUP' \
  -n caas-production

# Restart backend
kubectl rollout restart deployment/caas-backend -n caas-production
```

**Escalation**: If issue persists after 15 minutes, page DevOps Lead.

---

### Issue: Database Not Accepting Connections

**Symptoms**:

- Backend logs show `OperationalError: could not connect to server`
- Health check fails with database errors

**Diagnosis**:

```bash
# Check postgres pod
kubectl get pods -l app=postgres -n caas-production

# View postgres logs
kubectl logs -f statefulset/postgres -n caas-production --tail=100

# Check persistent volume
kubectl get pvc -n caas-production

# Try manual connection
kubectl exec -it postgres-0 -n caas-production -- psql -U caas_user -d caas_production -c "SELECT 1;"
```

**Solutions**:

#### 1. PostgreSQL Pod Crashed

```bash
# Restart postgres
kubectl delete pod postgres-0 -n caas-production

# Wait for recreation (this may take 2-5 minutes)
kubectl wait --for=condition=ready pod postgres-0 -n caas-production --timeout=300s
```

#### 2. Disk Full

```bash
# Check disk usage
kubectl exec -it postgres-0 -n caas-production -- df -h

# If /var/lib/postgresql/data is at 100%:
# Option A: Clean up old data (RISKY - backup first!)
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production -c "VACUUM FULL;"

# Option B: Increase PVC size
kubectl edit pvc postgres-pvc -n caas-production
# Change: storage: "100Gi" (from "50Gi")
```

#### 3. Corrupted Database

```bash
# Restore from latest backup
# Step 1: Stop backend to prevent writes
kubectl scale deployment caas-backend --replicas=0 -n caas-production

# Step 2: Restore backup (example using pg_restore)
kubectl exec -it postgres-0 -n caas-production -- bash
pg_restore -U caas_user -d caas_production -c /backups/latest.dump

# Step 3: Restart backend
kubectl scale deployment caas-backend --replicas=3 -n caas-production
```

**Escalation**: If database is corrupted and backups are missing, IMMEDIATELY page CEO.

---

### Issue: High Error Rate (>5%)

**Symptoms**:

- Monitoring shows error rate spike
- Users reporting 500 errors
- Logs filled with exceptions

**Diagnosis**:

```bash
# Check error rate in logs
kubectl logs deployment/caas-backend -n caas-production --tail=500 | grep -i error | wc -l

# View specific errors
kubectl logs deployment/caas-backend -n caas-production --tail=500 | grep -i "error\|exception"

# Check API endpoint status
curl -s https://api.caas-platform.com/api/health | jq

# Monitor in real-time
kubectl logs -f deployment/caas-backend -n caas-production | grep -i error
```

**Solutions**:

#### 1. External API Failure (Gemini/OpenAI)

```bash
# Check if AI service is down
curl -I https://api.openai.com/v1/models

# If down, enable fallback mode (edit backend config)
kubectl set env deployment/caas-backend AI_FALLBACK_MODE=true -n caas-production
```

#### 2. Rate Limiting Overload

```bash
# Check request rate
kubectl logs deployment/caas-backend -n caas-production --tail=1000 | grep "429"

# Increase rate limits temporarily
kubectl edit configmap caas-config -n caas-production
# Change: RATE_LIMIT: "200" (from "100")

# Restart backend
kubectl rollout restart deployment/caas-backend -n caas-production
```

#### 3. Code Bug Introduced

```bash
# Rollback to previous version
kubectl rollout history deployment/caas-backend -n caas-production
kubectl rollout undo deployment/caas-backend -n caas-production

# Verify rollback succeeded
kubectl rollout status deployment/caas-backend -n caas-production
```

---

## 🟠 High Priority Issues (P1)

### Issue: Slow API Response Time (>5s)

**Symptoms**:

- Users complaining about slow dashboard
- API latency alerts firing
- Timeouts in frontend

**Diagnosis**:

```bash
# Check pod CPU/memory
kubectl top pods -n caas-production

# Check HPA status
kubectl get hpa -n caas-production

# Run load test
k6 run /path/to/load-test.js --duration 30s --vus 10
```

**Solutions**:

#### 1. High CPU Usage

```bash
# Scale up immediately
kubectl scale deployment caas-backend --replicas=7 -n caas-production

# Verify scaling
kubectl get pods -l app=caas-backend -n caas-production
```

#### 2. Database Slow Queries

```bash
# Check slow query log
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production -c "SELECT * FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '5 seconds';"

# Terminate long-running queries
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '60 seconds';"

# Add missing indexes
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production -c "CREATE INDEX CONCURRENTLY idx_findings_client ON risk_findings(client_id);"
```

#### 3. Redis Unavailable

```bash
# Check Redis pod
kubectl get pods -l app=redis -n caas-production

# Restart if needed
kubectl delete pod -l app=redis -n caas-production
```

---

### Issue: Scheduled Jobs Not Running

**Symptoms**:

- Daily reports not being generated
- Scans not executing
- Background tasks not processing

**Diagnosis**:

```bash
# Check Celery worker status (if implemented)
kubectl get pods -l app=celery-worker -n caas-production

# View worker logs
kubectl logs -f deployment/celery-worker -n caas-production --tail=100

# Check Celery beat (scheduler)
kubectl get pods -l app=celery-beat -n caas-production
kubectl logs deployment/celery-beat -n caas-production --tail=100
```

**Solutions**:

```bash
# Restart workers
kubectl rollout restart deployment/celery-worker -n caas-production

# Restart scheduler
kubectl rollout restart deployment/celery-beat -n caas-production

# Verify tasks are processing
kubectl logs -f deployment/celery-worker -n caas-production | grep "Task"
```

---

## 🟡 Medium Priority Issues (P2)

### Issue: SSL Certificate Expired

**Symptoms**:

- Browser shows "Certificate expired" warning
- API calls fail with SSL errors

**Diagnosis**:

```bash
# Check certificate expiration
kubectl describe certificate caas-tls-secret -n caas-production

# View cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager --tail=100
```

**Solutions**:

```bash
# Force certificate renewal
kubectl delete secret caas-tls-secret -n caas-production

# cert-manager will automatically recreate it
# Wait for renewal (5-10 minutes)
kubectl get certificate caas-tls-secret -n caas-production -w

# Verify new cert
curl -vI https://api.caas-platform.com 2>&1 | grep "expire date"
```

---

### Issue: High Storage Usage

**Symptoms**:

- Disk usage alerts
- Database writes failing
- Logs mentioning "no space left on device"

**Diagnosis**:

```bash
# Check PVC usage
kubectl exec -it postgres-0 -n caas-production -- df -h

# Check database size
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production -c "SELECT pg_size_pretty(pg_database_size('caas_production'));"

# Check log sizes
kubectl exec -it $BACKEND_POD -n caas-production -- du -sh /var/log
```

**Solutions**:

```bash
# Clean up old logs (if applicable)
kubectl exec -it $BACKEND_POD -n caas-production -- find /var/log -type f -name "*.log" -mtime +7 -delete

# Vacuum database
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production -c "VACUUM FULL;"

# Increase PVC size (requires restart)
kubectl edit pvc postgres-pvc -n caas-production
# Change: storage: "100Gi" (from "50Gi")

# Delete old backups
kubectl exec -it postgres-0 -n caas-production -- \
  find /backups -type f -mtime +30 -delete
```

---

### Issue: User Unable to Login

**Symptoms**:

- Specific user(s) cannot authenticate
- Login returns 401 Unauthorized
- JWT token issues

**Diagnosis**:

```bash
# Test login endpoint
curl -X POST https://api.caas-platform.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"test123"}'

# Check user exists in database
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production -c "SELECT id, email, is_active FROM users WHERE email='user@example.com';"

# Check backend logs for auth errors
kubectl logs deployment/caas-backend -n caas-production --tail=500 | grep "login\|auth"
```

**Solutions**:

```bash
# Reset user password
kubectl exec -it $BACKEND_POD -n caas-production -- python -c "
from app.db import SessionLocal
from app.models import User
from app.auth import get_password_hash

db = SessionLocal()
user = db.query(User).filter(User.email == 'user@example.com').first()
if user:
    user.hashed_password = get_password_hash('NewPassword123')
    db.commit()
    print(f'✅ Password reset for {user.email}')
else:
    print('❌ User not found')
db.close()
"

# If user is inactive, activate them
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production -c "UPDATE users SET is_active = true WHERE email='user@example.com';"
```

---

## 🟢 Low Priority Issues (P3)

### Issue: Dashboard Loading Slowly

**Symptoms**:

- Frontend takes >5s to load
- JavaScript bundle too large
- Poor user experience

**Solutions**:

```bash
# Option 1: Enable CDN caching
# (Implement via Cloudflare or similar)

# Option 2: Rebuild frontend with optimizations
cd Magnus-CaaS-Turbo
npm run build
# Deploy new build

# Option 3: Enable compression in Kubernetes ingress
kubectl annotate ingress caas-ingress -n caas-production \
  nginx.ingress.kubernetes.io/enable-compression="true" \
  nginx.ingress.kubernetes.io/compression-types="text/html,text/css,application/javascript"
```

---

### Issue: Email Notifications Not Sending

**Symptoms**:

- Users not receiving alerts
- Password reset emails not arriving

**Diagnosis**:

```bash
# Check email service configuration
kubectl get configmap caas-config -n caas-production -o yaml | grep EMAIL

# Test SMTP connection
kubectl exec -it $BACKEND_POD -n caas-production -- python -c "
import smtplib
try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login('user@gmail.com', 'password')
    print('✅ SMTP connection successful')
    server.quit()
except Exception as e:
    print(f'❌ SMTP error: {e}')
"
```

**Solutions**:

```bash
# Update email credentials in secrets
kubectl create secret generic email-secrets \
  --from-literal=SMTP_USERNAME='new_user' \
  --from-literal=SMTP_PASSWORD='new_password' \
  -n caas-production --dry-run=client -o yaml | kubectl apply -f -

# Restart backend
kubectl rollout restart deployment/caas-backend -n caas-production
```

---

## 📊 Monitoring Commands

### Check Overall System Health

```bash
#!/bin/bash
# health-check.sh

echo "=== Magnus CaaS Health Check ==="
echo ""

# 1. Pod Status
echo "📦 Pod Status:"
kubectl get pods -n caas-production | grep -v "Running" | grep -v "NAME" || echo "✅ All pods running"
echo ""

# 2. Resource Usage
echo "💻 Resource Usage:"
kubectl top pods -n caas-production
echo ""

# 3. API Health
echo "🌐 API Health:"
curl -s https://api.caas-platform.com/api/health | jq || echo "❌ API not responding"
echo ""

# 4. Database Connection
echo "🗄️  Database Connection:"
kubectl exec postgres-0 -n caas-production -- psql -U caas_user -d caas_production -c "SELECT 1;" > /dev/null 2>&1 && echo "✅ Database OK" || echo "❌ Database unreachable"
echo ""

# 5. HPA Status
echo "📈 Auto-Scaling Status:"
kubectl get hpa -n caas-production
echo ""

# 6. Recent Events
echo "📋 Recent Events (last 10):"
kubectl get events -n caas-production --sort-by='.lastTimestamp' | tail -10
echo ""

echo "=== Health Check Complete ==="
```

Save as `health-check.sh`, make executable: `chmod +x health-check.sh`

---

### View Real-Time Metrics

```bash
# Watch pod status
watch -n 5 kubectl get pods -n caas-production

# Monitor logs in real-time
kubectl logs -f deployment/caas-backend -n caas-production --all-containers=true

# Monitor resource usage
watch -n 10 kubectl top pods -n caas-production

# View API request rate (if using Prometheus)
# (Access Grafana dashboard)
kubectl port-forward -n monitoring svc/grafana 3000:80
# Open http://localhost:3000
```

---

## 🔄 Rollback Procedures

### Rollback Application Deployment

```bash
# 1. Check deployment history
kubectl rollout history deployment/caas-backend -n caas-production

# 2. Rollback to previous version
kubectl rollout undo deployment/caas-backend -n caas-production

# 3. Rollback to specific revision
kubectl rollout undo deployment/caas-backend -n caas-production --to-revision=5

# 4. Verify rollback
kubectl rollout status deployment/caas-backend -n caas-production
kubectl get pods -n caas-production

# 5. Test API
curl https://api.caas-platform.com/api/health
```

### Rollback Database Migration

```bash
# DANGER: Only do this if you have a backup!

# 1. Stop backend to prevent writes
kubectl scale deployment caas-backend --replicas=0 -n caas-production

# 2. Restore from backup
kubectl exec -it postgres-0 -n caas-production -- bash
pg_restore -U caas_user -d caas_production -c /backups/pre-migration.dump

# 3. Restart backend with old code
kubectl set image deployment/caas-backend backend=ghcr.io/your-org/magnus-caas-backend:v1.0.0 -n caas-production
kubectl scale deployment caas-backend --replicas=3 -n caas-production

# 4. Verify
curl https://api.caas-platform.com/api/health
```

---

## 📞 Escalation Matrix

| Severity | Response Time | Escalate To | Escalate After |
|----------|---------------|-------------|----------------|
| **P0 (Critical)** | Immediate | DevOps Lead | 15 minutes |
| **P1 (High)** | 30 minutes | DevOps Lead | 1 hour |
| **P2 (Medium)** | 2 hours | Product Manager | 4 hours |
| **P3 (Low)** | Next business day | - | - |

---

## 🔒 Security Incident Response

### Suspected Breach

```bash
# 1. IMMEDIATELY rotate all secrets
kubectl delete secret caas-secrets -n caas-production

kubectl create secret generic caas-secrets \
  --from-literal=DATABASE_PASSWORD='NEW_SECURE_PASSWORD' \
  --from-literal=SECRET_KEY='NEW_SECURE_SECRET' \
  --from-literal=OPENAI_API_KEY='NEW_API_KEY' \
  -n caas-production

# 2. Force all users to re-authenticate
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production -c "UPDATE users SET is_active = false;"

# 3. Review audit logs
kubectl exec -it postgres-0 -n caas-production -- \
  psql -U caas_user -d caas_production -c "SELECT * FROM audit_events ORDER BY created_at DESC LIMIT 100;"

# 4. Notify security team and CEO
```

### DDoS Attack

```bash
# 1. Enable aggressive rate limiting
kubectl annotate ingress caas-ingress -n caas-production \
  nginx.ingress.kubernetes.io/limit-rps="10" \
  nginx.ingress.kubernetes.io/limit-burst-multiplier="2"

# 2. Enable Cloudflare DDoS protection (if available)

# 3. Block malicious IPs
kubectl exec -it nginx-ingress-controller -- \
  echo "deny 1.2.3.4;" >> /etc/nginx/blocked-ips.conf
kubectl exec -it nginx-ingress-controller -- nginx -s reload
```

---

## 📝 Incident Template

When documenting an incident:

```markdown
## Incident Report: [Title]

**Date**: 2026-01-22
**Time**: 18:30 UTC
**Severity**: P0 / P1 / P2 / P3
**Duration**: X minutes
**Affected Users**: X% of users

### Summary
Brief description of what happened.

### Timeline
- 18:30 - Issue detected via monitoring alert
- 18:35 - On-call engineer investigated
- 18:45 - Root cause identified: [description]
- 19:00 - Fix deployed
- 19:10 - Service restored

### Root Cause
Detailed explanation of what caused the issue.

### Resolution
Steps taken to resolve the issue.

### Prevention
Action items to prevent recurrence:
- [ ] Add monitoring for X
- [ ] Implement auto-scaling for Y
- [ ] Update documentation

### Lessons Learned
What we learned from this incident.
```

---

**Last Updated**: 2026-01-22  
**Version**: 1.0.0
