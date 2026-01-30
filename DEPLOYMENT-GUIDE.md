# Magnus CaaS Platform - Production Deployment Guide

> **Step-by-Step Guide for Deploying to Production**  
> Target Infrastructure: Kubernetes (GCP GKE / AWS EKS / Azure AKS)  
> Estimated Time: 2-4 hours

---

## 📋 Pre-Deployment Checklist

### Required Accounts & Access

- [ ] Cloud provider account (GCP / AWS / Azure)
- [ ] Kubernetes cluster created and accessible
- [ ] Container registry access (GHCR, Docker Hub, or cloud provider)
- [ ] Domain name registered (e.g., `caas-platform.com`)
- [ ] DNS management access
- [ ] SSL certificate provider (Let's Encrypt recommended)

### Required Tools

```bash
# Install on macOS
brew install kubectl
brew install helm
brew install docker
brew install git

# Verify installations
kubectl version --client
helm version
docker --version
git --version
```

### Required Secrets

- [ ] Database password (strong, generated)
- [ ] JWT secret key (32+ characters)
- [ ] OpenAI API key (for AI analysis)
- [ ] Email service credentials (for notifications)
- [ ] Stripe API keys (for payments)

---

## 🚀 Deployment Steps

### Step 1: Prepare Cloud Infrastructure

#### Option A: Google Cloud (GKE)

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Create Kubernetes cluster
gcloud container clusters create caas-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-2 \
  --enable-autorepair \
  --enable-autoupgrade \
  --enable-autoscaling \
  --min-nodes 3 \
  --max-nodes 10

# Get credentials
gcloud container clusters get-credentials caas-cluster --zone us-central1-a

# Verify connection
kubectl cluster-info
kubectl get nodes
```

Expected output:

```
NAME                                           STATUS   ROLES    AGE   VERSION
gke-caas-cluster-default-pool-xxx-xxx          Ready    <none>   1m    v1.27.x
gke-caas-cluster-default-pool-xxx-yyy          Ready    <none>   1m    v1.27.x
gke-caas-cluster-default-pool-xxx-zzz          Ready    <none>   1m    v1.27.x
```

#### Option B: AWS (EKS)

```bash
# Install eksctl
brew install eksctl

# Create cluster
eksctl create cluster \
  --name caas-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 10 \
  --managed

# Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name caas-cluster

# Verify
kubectl get nodes
```

#### Option C: Azure (AKS)

```bash
# Create resource group
az group create --name caas-resources --location eastus

# Create cluster
az aks create \
  --resource-group caas-resources \
  --name caas-cluster \
  --node-count 3 \
  --enable-cluster-autoscaler \
  --min-count 3 \
  --max-count 10 \
  --node-vm-size Standard_D2s_v3 \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group caas-resources --name caas-cluster

# Verify
kubectl get nodes
```

---

### Step 2: Install Required Add-ons

#### Install NGINX Ingress Controller

```bash
# Add Helm repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install NGINX Ingress
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

# Wait for external IP
kubectl --namespace ingress-nginx get services -o wide -w nginx-ingress-ingress-nginx-controller

# Get external IP (note it down)
export INGRESS_IP=$(kubectl get svc nginx-ingress-ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Ingress IP: $INGRESS_IP"
```

#### Install cert-manager (for SSL certificates)

```bash
# Add Helm repository
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Install cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true

# Verify installation
kubectl get pods --namespace cert-manager

# Create Let's Encrypt cluster issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@caas-platform.com  # CHANGE THIS
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

---

### Step 3: Configure DNS

```bash
# Point your domain to the ingress IP
# Create A record in your DNS provider:
# api.caas-platform.com -> $INGRESS_IP

# Verify DNS propagation (may take 5-60 minutes)
nslookup api.caas-platform.com

# Expected output:
# Name:   api.caas-platform.com
# Address: YOUR_INGRESS_IP
```

---

### Step 4: Build and Push Docker Images

```bash
# Navigate to project root
cd /Users/chinyeosemene/Magnus-Compliance-Engine-V12-Turbo/Magnus-Compliance-Engine-V12-Turbo

# Login to container registry
# GitHub Container Registry (recommended)
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# OR Docker Hub
docker login

# Build backend image
cd backend
docker build -t ghcr.io/YOUR_USERNAME/magnus-caas-backend:latest -t ghcr.io/YOUR_USERNAME/magnus-caas-backend:v1.0.0 .
docker push ghcr.io/YOUR_USERNAME/magnus-caas-backend:latest
docker push ghcr.io/YOUR_USERNAME/magnus-caas-backend:v1.0.0

# Build frontend image
cd ../Magnus-CaaS-Turbo
docker build -t ghcr.io/YOUR_USERNAME/magnus-caas-frontend:latest -t ghcr.io/YOUR_USERNAME/magnus-caas-frontend:v1.0.0 .
docker push ghcr.io/YOUR_USERNAME/magnus-caas-frontend:latest
docker push ghcr.io/YOUR_USERNAME/magnus-caas-frontend:v1.0.0

# Verify images
docker images | grep magnus-caas
```

---

### Step 5: Create Kubernetes Namespace and Secrets

```bash
# Create namespace
kubectl create namespace caas-production

# Generate strong secrets
export DB_PASSWORD=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 32)

# Create Kubernetes secrets
kubectl create secret generic caas-secrets \
  --from-literal=DATABASE_PASSWORD="$DB_PASSWORD" \
  --from-literal=SECRET_KEY="$JWT_SECRET" \
  --from-literal=OPENAI_API_KEY="sk-proj-YOUR_OPENAI_KEY_HERE" \
  -n caas-production

# Verify secrets
kubectl get secrets -n caas-production
kubectl describe secret caas-secrets -n caas-production
```

---

### Step 6: Update Kubernetes Deployment Manifest

```bash
# Navigate to Kubernetes config
cd Magnus-CaaS-Turbo/kubernetes

# Create a production-specific configuration
cp production-deployment.yaml production-deployment-live.yaml

# Update the following values in production-deployment-live.yaml:
# 1. Replace image URLs with your actual registry
# 2. Update domain name (api.caas-platform.com)
# 3. Verify secret references
```

**Critical Updates**:

```yaml
# Line 206: Update backend image
image: ghcr.io/YOUR_USERNAME/magnus-caas-backend:latest

# Line 304: Update domain name
spec:
  tls:
  - hosts:
    - api.YOUR_DOMAIN.com  # CHANGE THIS
    secretName: caas-tls-secret
  rules:
  - host: api.YOUR_DOMAIN.com  # CHANGE THIS
```

---

### Step 7: Deploy to Kubernetes

```bash
# Apply the deployment
kubectl apply -f production-deployment-live.yaml

# Monitor deployment progress
kubectl get pods -n caas-production -w

# Wait for all pods to be Running
# Expected output after 2-5 minutes:
# NAME                              READY   STATUS    RESTARTS   AGE
# postgres-0                        1/1     Running   0          3m
# redis-xxx                         1/1     Running   0          3m
# caas-backend-xxx                  1/1     Running   0          2m
# caas-backend-yyy                  1/1     Running   0          2m
# caas-backend-zzz                  1/1     Running   0          2m
```

---

### Step 8: Initialize Database

```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pod -l app=caas-backend -n caas-production -o jsonpath="{.items[0].metadata.name}")

# Create database tables (SQLAlchemy auto-migration)
kubectl exec -it $BACKEND_POD -n caas-production -- python -c "
from app.db import Base, engine
Base.metadata.create_all(bind=engine)
print('✅ Database tables created successfully')
"

# Verify tables
kubectl exec -it $BACKEND_POD -n caas-production -- python -c "
from app.db import engine
import sqlalchemy as sa
inspector = sa.inspect(engine)
tables = inspector.get_table_names()
print(f'✅ Found {len(tables)} tables: {tables}')
"

# Create initial admin user
kubectl exec -it $BACKEND_POD -n caas-production -- python -c "
from app.db import SessionLocal
from app.models import User
from app.auth import get_password_hash

db = SessionLocal()
existing = db.query(User).filter(User.email == 'admin@caas-platform.com').first()
if not existing:
    admin = User(
        email='admin@caas-platform.com',
        hashed_password=get_password_hash('CHANGE_THIS_PASSWORD')
    )
    db.add(admin)
    db.commit()
    print('✅ Admin user created: admin@caas-platform.com')
else:
    print('⚠️  Admin user already exists')
db.close()
"
```

**⚠️ IMPORTANT**: Change the admin password immediately after first login!

---

### Step 9: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n caas-production

# Check services
kubectl get svc -n caas-production

# Check ingress
kubectl get ingress -n caas-production

# View backend logs
kubectl logs -f deployment/caas-backend -n caas-production --tail=50

# Test health endpoint (local port-forward first)
kubectl port-forward svc/caas-backend-service 8000:8000 -n caas-production &
curl http://localhost:8000/api/health

# Expected response:
# {"status":"healthy","mode":"real","timestamp":"2026-01-22T...Z"}

# Kill port-forward
pkill -f "port-forward"
```

---

### Step 10: Test Production API

```bash
# Wait for DNS to propagate and SSL cert to be issued (5-60 minutes)
# Check SSL certificate status
kubectl describe certificate caas-tls-secret -n caas-production

# Test HTTPS health endpoint
curl https://api.YOUR_DOMAIN.com/api/health

# Expected response:
# {"status":"healthy","mode":"real","timestamp":"..."}

# Test authentication
curl -X POST https://api.YOUR_DOMAIN.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@caas-platform.com",
    "password": "CHANGE_THIS_PASSWORD"
  }'

# Expected response with access_token
```

---

### Step 11: Deploy Frontend (Optional if using separate hosting)

If you're hosting the frontend on the same Kubernetes cluster:

```yaml
# Add to production-deployment-live.yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: caas-frontend
  namespace: caas-production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: caas-frontend
  template:
    metadata:
      labels:
        app: caas-frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/YOUR_USERNAME/magnus-caas-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: VITE_API_URL
          value: "https://api.YOUR_DOMAIN.com"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: caas-frontend-service
  namespace: caas-production
spec:
  selector:
    app: caas-frontend
  ports:
  - port: 3000
    targetPort: 3000
---
# Update ingress to include frontend
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: caas-ingress
  namespace: caas-production
spec:
  tls:
  - hosts:
    - api.YOUR_DOMAIN.com
    - app.YOUR_DOMAIN.com
    secretName: caas-tls-secret
  rules:
  - host: api.YOUR_DOMAIN.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: caas-backend-service
            port:
              number: 8000
  - host: app.YOUR_DOMAIN.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: caas-frontend-service
            port:
              number: 3000
```

```bash
# Apply updated configuration
kubectl apply -f production-deployment-live.yaml

# Test frontend
curl https://app.YOUR_DOMAIN.com
```

**Alternative**: Deploy frontend to Vercel/Netlify for better CDN performance.

---

### Step 12: Enable Monitoring (Optional but Recommended)

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  --create-namespace \
  --set server.persistentVolume.size=50Gi

# Install Grafana
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana \
  --namespace monitoring \
  --set persistence.enabled=true \
  --set persistence.size=10Gi

# Get Grafana admin password
kubectl get secret --namespace monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

# Port-forward Grafana
kubectl port-forward --namespace monitoring svc/grafana 3000:80

# Access Grafana at http://localhost:3000
# Username: admin
# Password: (from above command)
```

---

## 🔧 Post-Deployment Configuration

### 1. Set Up Backup Strategy

```bash
# Install Velero for Kubernetes backups
kubectl apply -f https://github.com/vmware-tanzu/velero/releases/download/v1.12.0/velero-v1.12.0-linux-amd64.tar.gz

# Configure daily backups
velero schedule create daily-backup \
  --schedule="0 2 * * *" \
  --include-namespaces caas-production

# For database backups (run as cron job)
kubectl exec -it postgres-0 -n caas-production -- \
  pg_dump -U caas_user caas_production | gzip > backup-$(date +%Y%m%d).sql.gz
```

### 2. Configure Alerts

```yaml
# alertmanager-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: alertmanager-config
  namespace: monitoring
data:
  alertmanager.yml: |
    global:
      slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'
    route:
      receiver: 'slack-notifications'
    receivers:
    - name: 'slack-notifications'
      slack_configs:
      - channel: '#caas-alerts'
        title: 'CaaS Production Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
```

### 3. Enable Auto-Scaling

```bash
# Verify HPA is working
kubectl get hpa -n caas-production

# Monitor auto-scaling events
kubectl describe hpa caas-backend-hpa -n caas-production

# Test scaling by simulating load
kubectl run -it --rm load-generator --image=busybox -- /bin/sh
# Inside the pod:
while true; do wget -q -O- http://caas-backend-service.caas-production.svc.cluster.local:8000/api/health; done
```

### 4. Set Up Log Aggregation (Optional)

```bash
# Install Loki for log aggregation
helm repo add grafana https://grafana.github.io/helm-charts
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set grafana.enabled=false \
  --set prometheus.enabled=false

# View logs in Grafana
# Data Source: Loki (http://loki:3100)
```

---

## 🧪 Production Testing

### Smoke Tests

```bash
# 1. Health check
curl https://api.YOUR_DOMAIN.com/api/health

# 2. Authentication
curl -X POST https://api.YOUR_DOMAIN.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@caas-platform.com","password":"YOUR_PASSWORD"}'

# 3. Create test client
TOKEN="YOUR_JWT_TOKEN"
curl -X POST https://api.YOUR_DOMAIN.com/api/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_name": "Test Org",
    "email": "test@example.com",
    "tier": "tier_1",
    "status": "trial"
  }'

# 4. List clients
curl https://api.YOUR_DOMAIN.com/api/clients \
  -H "Authorization: Bearer $TOKEN"
```

### Load Testing

```bash
# Install k6
brew install k6

# Create load test script
cat > load-test.js <<'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up to 10 users
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
};

export default function () {
  let response = http.get('https://api.YOUR_DOMAIN.com/api/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
EOF

# Run load test
k6 run load-test.js

# Expected results:
# ✓ status is 200
# ✓ response time < 500ms
# http_req_duration..............: avg=150ms min=50ms med=120ms max=800ms p(95)=350ms
```

---

## 🚨 Rollback Procedure

If something goes wrong:

```bash
# 1. Check deployment history
kubectl rollout history deployment/caas-backend -n caas-production

# 2. Rollback to previous version
kubectl rollout undo deployment/caas-backend -n caas-production

# 3. Rollback to specific revision
kubectl rollout undo deployment/caas-backend -n caas-production --to-revision=2

# 4. Verify rollback
kubectl rollout status deployment/caas-backend -n caas-production

# 5. Check logs
kubectl logs -f deployment/caas-backend -n caas-production --tail=100
```

---

## 📊 Cost Optimization Tips

### 1. Use Spot/Preemptible Instances (saves 60-80%)

**GKE**:

```bash
gcloud container node-pools create spot-pool \
  --cluster=caas-cluster \
  --zone=us-central1-a \
  --spot \
  --num-nodes=2 \
  --machine-type=n1-standard-2
```

**EKS**:

```yaml
# Use EC2 Spot Instances in eksctl config
nodeGroups:
  - name: spot-workers
    instancesDistribution:
      instanceTypes: ["t3.medium", "t3a.medium"]
      onDemandBaseCapacity: 0
      onDemandPercentageAboveBaseCapacity: 0
      spotInstancePools: 2
```

### 2. Enable Cluster Autoscaler

```bash
# Already configured in HPA (see Step 7)
# Verify it's working:
kubectl get hpa -n caas-production -w
```

### 3. Use Resource Limits

All pods in `production-deployment.yaml` already have resource requests/limits configured. Monitor and adjust based on actual usage:

```bash
kubectl top pods -n caas-production
```

### 4. Database Optimization

```sql
-- Connect to PostgreSQL
kubectl exec -it postgres-0 -n caas-production -- psql -U caas_user -d caas_production

-- Add indexes for frequently queried columns
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_tier ON clients(tier);
CREATE INDEX idx_findings_client ON risk_findings(client_id);
CREATE INDEX idx_findings_status ON risk_findings(status);
CREATE INDEX idx_cases_client ON remediation_cases(client_id);
CREATE INDEX idx_cases_status ON remediation_cases(status);

-- Enable query logging for slow queries
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();
```

---

## ✅ Production Checklist

Before going live:

### Security

- [ ] All secrets rotated from defaults
- [ ] SSL/TLS certificates installed and valid
- [ ] Rate limiting enabled (100 req/min)
- [ ] CORS configured properly
- [ ] Database password is strong (32+ chars)
- [ ] JWT secret is strong (32+ chars)
- [ ] Admin password changed from default
- [ ] Network policies applied
- [ ] Pod security policies enabled

### Performance

- [ ] Load testing completed successfully
- [ ] Auto-scaling tested and working
- [ ] Database indexed properly
- [ ] Response times < 2s (p95)
- [ ] Resource limits configured

### Reliability

- [ ] Health checks returning 200
- [ ] Database backups scheduled
- [ ] Kubernetes backups configured (Velero)
- [ ] Monitoring dashboards set up
- [ ] Alerts configured (Slack/email)
- [ ] Rollback procedure tested

### Documentation

- [ ] API documentation accessible
- [ ] Runbooks created for common issues
- [ ] On-call rotation defined
- [ ] Incident response plan documented

### Business

- [ ] Domain DNS configured correctly
- [ ] Payment processing tested (Stripe)
- [ ] Email notifications working
- [ ] Legal pages deployed (Privacy, Terms)
- [ ] Support email configured

---

## 📞 Support

If you encounter issues during deployment:

1. **Check logs**: `kubectl logs -f deployment/caas-backend -n caas-production`
2. **Check events**: `kubectl get events -n caas-production --sort-by='.lastTimestamp'`
3. **Describe pod**: `kubectl describe pod POD_NAME -n caas-production`
4. **Check documentation**: Reference `COMPLETE-DOCUMENTATION.md`

---

**Deployment Complete! 🎉**

Your Magnus CaaS platform is now live in production.

Next steps:

1. Onboard beta customers
2. Monitor metrics in Grafana
3. Set up customer support
4. Begin marketing campaigns
5. Iterate based on user feedback

---

*Last Updated: 2026-01-22*  
*Version: 1.0.0*
