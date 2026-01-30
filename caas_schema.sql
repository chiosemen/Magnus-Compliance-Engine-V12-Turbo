-- CaaS Platform Database Schema
-- PostgreSQL 15+
-- Version: 1.0.0

-- ==================== Extensions ====================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== Core Tables ====================

-- Clients (Subscription Management)
CREATE TABLE clients (
    client_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('tier_1', 'tier_2', 'tier_3')),
    status VARCHAR(20) NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'suspended', 'cancelled')),
    monthly_scan_limit INTEGER NOT NULL,
    scans_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_end TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT valid_scan_usage CHECK (scans_used >= 0 AND scans_used <= monthly_scan_limit)
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_tier ON clients(tier);


-- DAF (Donor-Advised Funds) Registry
CREATE TABLE dafs (
    daf_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    daf_external_id VARCHAR(100),
    sponsor_organization VARCHAR(200) NOT NULL,
    advisor_id VARCHAR(100),
    total_assets NUMERIC(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    UNIQUE(client_id, daf_external_id)
);

CREATE INDEX idx_dafs_client ON dafs(client_id);
CREATE INDEX idx_dafs_sponsor ON dafs(sponsor_organization);


-- Transactions (For Risk Analysis)
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daf_id UUID NOT NULL REFERENCES dafs(daf_id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    transaction_type VARCHAR(50) NOT NULL,
    vendor_id VARCHAR(100),
    advisor_id VARCHAR(100),
    beneficiary_id VARCHAR(100),
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_daf ON transactions(daf_id);
CREATE INDEX idx_transactions_client ON transactions(client_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_amount ON transactions(amount);


-- Risk Detections (Output from RiskAnalysisEngine)
CREATE TABLE risk_detections (
    detection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    violation_type VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    confidence_score NUMERIC(3, 2) CHECK (confidence_score BETWEEN 0 AND 1),
    description TEXT NOT NULL,
    evidence JSONB DEFAULT '[]'::jsonb,
    remediation_cost_estimate NUMERIC(10, 2),
    bounty_potential NUMERIC(10, 2),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'remediated', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES clients(client_id)
);

CREATE INDEX idx_risk_detections_transaction ON risk_detections(transaction_id);
CREATE INDEX idx_risk_detections_client ON risk_detections(client_id);
CREATE INDEX idx_risk_detections_risk_level ON risk_detections(risk_level);
CREATE INDEX idx_risk_detections_status ON risk_detections(status);
CREATE INDEX idx_risk_detections_created ON risk_detections(created_at);


-- Remediation Cases
CREATE TABLE remediation_cases (
    case_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    detection_id UUID REFERENCES risk_detections(detection_id),
    violation_type VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    violation_amount NUMERIC(15, 2) NOT NULL,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('basic', 'standard', 'premium')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'escalated')),
    assigned_analyst UUID,
    estimated_cost NUMERIC(10, 2) NOT NULL,
    actual_cost NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_remediation_cases_client ON remediation_cases(client_id);
CREATE INDEX idx_remediation_cases_status ON remediation_cases(status);
CREATE INDEX idx_remediation_cases_created ON remediation_cases(created_at);


-- Scan History
CREATE TABLE scans (
    scan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    daf_id UUID REFERENCES dafs(daf_id),
    scan_type VARCHAR(50) NOT NULL DEFAULT 'comprehensive',
    priority VARCHAR(20) DEFAULT 'normal',
    risks_detected INTEGER DEFAULT 0,
    critical_risks INTEGER DEFAULT 0,
    high_risks INTEGER DEFAULT 0,
    medium_risks INTEGER DEFAULT 0,
    low_risks INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    report_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_scans_client ON scans(client_id);
CREATE INDEX idx_scans_daf ON scans(daf_id);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_started ON scans(started_at);


-- Whistleblower Reports (Form 211 Tracking)
CREATE TABLE whistleblower_reports (
    report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    case_id UUID REFERENCES remediation_cases(case_id),
    violation_amount NUMERIC(15, 2) NOT NULL,
    estimated_bounty NUMERIC(15, 2),
    irs_form_211_data JSONB NOT NULL,
    submission_status VARCHAR(20) DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted', 'under_review', 'awarded', 'denied')),
    submission_date TIMESTAMP WITH TIME ZONE,
    award_amount NUMERIC(15, 2),
    agency_share_percentage NUMERIC(3, 2) DEFAULT 0.15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_whistleblower_reports_client ON whistleblower_reports(client_id);
CREATE INDEX idx_whistleblower_reports_status ON whistleblower_reports(submission_status);


-- Abuse Reports (Premium Scans)
CREATE TABLE abuse_reports (
    abuse_report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    daf_id UUID REFERENCES dafs(daf_id),
    report_type VARCHAR(50) NOT NULL,
    abuse_patterns JSONB NOT NULL,
    total_abuse_amount NUMERIC(15, 2),
    report_price NUMERIC(10, 2) DEFAULT 500.00,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    report_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_abuse_reports_client ON abuse_reports(client_id);
CREATE INDEX idx_abuse_reports_daf ON abuse_reports(daf_id);


-- Revenue Tracking
CREATE TABLE revenue_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'subscription', 'remediation', 'abuse_report', 'bounty_share', 'referral'
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    related_id UUID, -- Reference to case_id, report_id, etc.
    payment_method VARCHAR(50),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_revenue_events_client ON revenue_events(client_id);
CREATE INDEX idx_revenue_events_type ON revenue_events(event_type);
CREATE INDEX idx_revenue_events_date ON revenue_events(transaction_date);


-- ==================== Views for Analytics ====================

-- Client Dashboard Summary
CREATE VIEW client_dashboard_summary AS
SELECT 
    c.client_id,
    c.organization_name,
    c.tier,
    c.status,
    c.scans_used,
    c.monthly_scan_limit,
    (c.monthly_scan_limit - c.scans_used) AS scans_remaining,
    COUNT(DISTINCT rd.detection_id) AS total_risks_detected,
    COUNT(DISTINCT CASE WHEN rd.risk_level = 'critical' THEN rd.detection_id END) AS critical_risks,
    COUNT(DISTINCT rc.case_id) AS active_remediation_cases,
    COALESCE(SUM(re.amount), 0) AS total_revenue,
    c.created_at AS member_since
FROM clients c
LEFT JOIN risk_detections rd ON c.client_id = rd.client_id AND rd.created_at >= DATE_TRUNC('month', NOW())
LEFT JOIN remediation_cases rc ON c.client_id = rc.client_id AND rc.status IN ('pending', 'in_progress')
LEFT JOIN revenue_events re ON c.client_id = re.client_id AND re.status = 'completed'
GROUP BY c.client_id;


-- Monthly Revenue Report
CREATE VIEW monthly_revenue_report AS
SELECT 
    DATE_TRUNC('month', transaction_date) AS month,
    event_type,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_revenue,
    AVG(amount) AS avg_transaction_value
FROM revenue_events
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', transaction_date), event_type
ORDER BY month DESC, total_revenue DESC;


-- ==================== Triggers ====================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dafs_updated_at BEFORE UPDATE ON dafs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remediation_cases_updated_at BEFORE UPDATE ON remediation_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Reset monthly scan usage (run via cron job)
CREATE OR REPLACE FUNCTION reset_monthly_scans()
RETURNS void AS $$
BEGIN
    UPDATE clients SET scans_used = 0 WHERE DATE_TRUNC('month', NOW()) > DATE_TRUNC('month', subscription_start);
END;
$$ LANGUAGE plpgsql;


-- ==================== Initial Data ====================

-- Insert sample tier configurations
INSERT INTO clients (organization_name, email, password_hash, tier, status, monthly_scan_limit, trial_ends_at)
VALUES 
    ('Demo Organization', 'demo@caas-platform.com', crypt('demo123', gen_salt('bf')), 'tier_1', 'trial', 50, NOW() + INTERVAL '30 days')
ON CONFLICT (email) DO NOTHING;


-- ==================== Security & Performance ====================

-- Row-level security policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE dafs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Partitioning for large tables (transactions by month)
-- (Implement if scaling beyond 10M transactions)

-- ==================== Comments ====================

COMMENT ON TABLE clients IS 'Client subscription accounts with tier limits';
COMMENT ON TABLE dafs IS 'Donor-Advised Funds being monitored';
COMMENT ON TABLE transactions IS 'Individual DAF transactions for risk analysis';
COMMENT ON TABLE risk_detections IS 'AI-detected compliance risks and violations';
COMMENT ON TABLE remediation_cases IS 'Active remediation workflows';
COMMENT ON TABLE whistleblower_reports IS 'IRS Form 211 whistleblower submissions';
COMMENT ON TABLE revenue_events IS 'All revenue transactions across monetization streams';
