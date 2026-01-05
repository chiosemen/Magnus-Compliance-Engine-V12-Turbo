
import { AssessmentResult, RiskLevel, User, DashboardData, LitigationHold, AuditEvent, OrganizationEntity, ReportArtifact, ReportStatus, Finding } from "../types";

// ============================================================================
// MAGNUS COMPLIANCE ENGINE - SIMULATION KERNEL (V12 TURBO)
// ============================================================================

// --- IDENTITY & STATE STORE ---

const MOCK_USER: User = {
  id: 'u_123',
  name: 'Jane Smith',
  email: 'jane@magnus.client',
  role: 'Chief Compliance Officer',
  avatarUrl: 'JS'
};

const ORG_1: OrganizationEntity = {
  id: 'org_001',
  name: 'Community Health Foundation',
  ein: '12-3456789',
  riskScore: 65,
  lastAssessmentDate: '2024-10-15',
  status: 'Active',
  memberCount: 12
};

const ORG_2: OrganizationEntity = {
  id: 'org_002',
  name: 'Global Education Initiative',
  ein: '98-7654321',
  riskScore: 24,
  lastAssessmentDate: '2024-10-20',
  status: 'Active',
  memberCount: 5
};

let activeOrgId = ORG_1.id;

// Data Isolation: Reports Store keyed by Org ID
const REPORTS_STORE: Record<string, ReportArtifact[]> = {
  [ORG_1.id]: [
    { id: '501', name: 'FY2023 Compliance Audit.pdf', status: ReportStatus.COMPLETED, generatedAt: '2024-10-15T10:00:00Z', type: 'Audit', size: '2.4 MB', hash: 'SHA256-8A...' },
    { id: '502', name: 'Board Governance Review.pdf', status: ReportStatus.COMPLETED, generatedAt: '2024-09-01T14:30:00Z', type: 'Advisory', size: '1.1 MB', hash: 'SHA256-3F...' },
    { id: '503', name: 'Independent Opinion Memo.pdf', status: ReportStatus.COMPLETED, generatedAt: '2024-10-01T09:00:00Z', type: 'Regulatory', size: '0.8 MB', hash: 'SHA256-OP...' }
  ],
  [ORG_2.id]: [
    { id: '601', name: 'International Grant Equivalency.pdf', status: ReportStatus.COMPLETED, generatedAt: '2024-10-18T09:15:00Z', type: 'Forensic', size: '3.8 MB', hash: 'SHA256-9C...' }
  ]
};

// --- FINDINGS STORE (Mutable for verification) ---
const FINDINGS_STORE: Record<string, Finding[]> = {
    [ORG_1.id]: [
        { id: 101, category: 'Governance', description: 'Missing Conflict of Interest Policy', severity: RiskLevel.HIGH, status: 'Open', verificationStatus: 'AI_GENERATED' },
        { id: 102, category: 'Public Support', description: 'Unusual Grant from Single Source', severity: RiskLevel.MEDIUM, status: 'In Progress', verificationStatus: 'HUMAN_VERIFIED', verifiedBy: 'Jane Smith', verifiedAt: '2024-10-16T14:20:00Z' },
    ],
    [ORG_2.id]: [
        { id: 201, category: 'Foreign Expenditures', description: 'Schedule F Part II Incomplete', severity: RiskLevel.LOW, status: 'Open', verificationStatus: 'AI_GENERATED' }
    ]
};

// --- AUDIT SUBSYSTEM ---
let currentLitigationHold: LitigationHold | undefined = undefined;
let auditLog: AuditEvent[] = [
  {
    id: 'evt_init',
    action: 'SYSTEM_BOOT',
    actor: 'SYSTEM',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    metadata: { version: '12.0.0-Turbo', integrityCheck: 'PASSED' },
    hash: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  }
];

const logAudit = (action: string, actor: string, metadata: any) => {
    const event: AuditEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        action,
        actor,
        timestamp: new Date().toISOString(),
        metadata,
        hash: `sha256_sim_${Math.random().toString(36).substring(7)}`
    };
    auditLog.unshift(event);
    return event;
};

// --- PUBLIC FACING API ---

export const analyzeOrganization = async (ein: string, dma?: string): Promise<AssessmentResult> => {
  console.log(`[Magnus Engine] Initiating analysis for EIN: ${ein}`);
  logAudit('REPORT_GENERATION_INITIATED', 'PUBLIC_USER', { ein, dma });
  return simulateAnalysis(ein);
};

export const submitLeadGen = async (ein: string, email: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[Backend] Lead Captured: ${email} for EIN: ${ein}`);
      logAudit('LEAD_CAPTURED', 'PUBLIC_WEB_FORM', { ein, email });
      resolve();
    }, 1000);
  });
};

export const login = async (email: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email.includes('@')) {
        logAudit('LOGIN_SUCCESS', email, { role: 'CCO' });
        resolve(MOCK_USER);
      } else {
        logAudit('LOGIN_FAILED', email, { reason: 'Invalid Email' });
        reject(new Error('Invalid email'));
      }
    }, 1000);
  });
};

// --- ENTERPRISE MANAGEMENT API ---

export const switchOrganization = async (orgId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (orgId === ORG_1.id || orgId === ORG_2.id) {
        activeOrgId = orgId;
        logAudit('ORG_CONTEXT_SWITCH', MOCK_USER.name, { targetOrg: orgId });
        resolve();
      }
    }, 400);
  });
};

export const createOrganization = async (name: string, ein: string): Promise<OrganizationEntity> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            logAudit('ORG_CREATE', MOCK_USER.name, { name, ein });
            resolve({
                id: `org_${Date.now()}`,
                name,
                ein,
                riskScore: 50,
                lastAssessmentDate: new Date().toISOString(),
                status: 'Active',
                memberCount: 1
            });
        }, 1000);
    });
};

export const triggerReportGeneration = async (type: ReportArtifact['type']): Promise<ReportArtifact> => {
    return new Promise((resolve) => {
        const newReport: ReportArtifact = {
            id: `rpt_${Date.now()}`,
            name: `${type} Report - ${new Date().toISOString().split('T')[0]}.pdf`,
            type,
            status: ReportStatus.QUEUED,
            generatedAt: new Date().toISOString(),
            size: 'Calculating...',
            hash: 'PENDING'
        };
        
        // Optimistically add to store for the active organization
        if (!REPORTS_STORE[activeOrgId]) REPORTS_STORE[activeOrgId] = [];
        REPORTS_STORE[activeOrgId].unshift(newReport);

        // Simulation lifecycle: QUEUED -> PROCESSING -> COMPLETED
        setTimeout(() => {
            newReport.status = ReportStatus.PROCESSING;
        }, 1000);
        
        setTimeout(() => {
            newReport.status = ReportStatus.COMPLETED;
            newReport.size = '1.8 MB';
            newReport.url = '#'; 
            newReport.hash = `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        }, 3500);

        logAudit('REPORT_GENERATED', MOCK_USER.name, { reportId: newReport.id, type });
        resolve(newReport);
    });
};

export const verifyFinding = async (findingId: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const findings = FINDINGS_STORE[activeOrgId];
            const finding = findings.find(f => f.id === findingId);
            if (finding) {
                finding.verificationStatus = 'HUMAN_VERIFIED';
                finding.verifiedBy = MOCK_USER.name;
                finding.verifiedAt = new Date().toISOString();
                logAudit('FINDING_VERIFIED', MOCK_USER.name, { findingId });
            }
            resolve();
        }, 500);
    });
};

// --- DATA AGGREGATION LAYER ---

export const getDashboardData = async (): Promise<DashboardData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isOrg1 = activeOrgId === ORG_1.id;
      const currentOrg = isOrg1 ? ORG_1 : ORG_2;

      // Mock data tailored to the specific organization context
      resolve({
        context: {
          currentUser: MOCK_USER,
          currentOrganization: currentOrg,
          availableOrganizations: [ORG_1, ORG_2]
        },
        stats: {
          riskScore: currentOrg.riskScore,
          openFindings: isOrg1 ? 3 : 1,
          resolvedFindings: isOrg1 ? 12 : 24,
          nextDeadline: isOrg1 ? 'Nov 15, 2024' : 'Dec 31, 2024'
        },
        alerts: isOrg1 ? [
          { id: 1, type: 'critical', message: 'Schedule B donor addresses incomplete', date: '2 hours ago' },
          { id: 2, type: 'warning', message: 'DAF contribution ratio exceeded 20%', date: '1 day ago' },
        ] : [
            { id: 3, type: 'info', message: 'International grant equivalency review complete', date: '5 hours ago' }
        ],
        findings: FINDINGS_STORE[activeOrgId] || [],
        reports: REPORTS_STORE[activeOrgId] || [],
        
        // Extensions
        litigationHold: currentLitigationHold,
        auditLog: auditLog.slice(0, 10),
        benchmark: {
            myScore: currentOrg.riskScore,
            sectorMedian: 42,
            sectorP75: 60,
            sectorP90: 78,
            percentile: isOrg1 ? 82 : 20,
            position: 'HIGH_RISK_QUARTILE'
        },
        donorConcentration: isOrg1 ? [
            { name: 'Top Donor (DAF)', value: 45, color: '#0EA5E9' }, 
            { name: 'Other Major', value: 30, color: '#64748B' },    
            { name: 'Long Tail', value: 25, color: '#E2E8F0' }       
        ] : [
            { name: 'Government Grants', value: 60, color: '#0EA5E9' },
            { name: 'Private Foundation', value: 25, color: '#64748B' },
            { name: 'Individual', value: 15, color: '#E2E8F0' }
        ],
        aiGovernance: {
            modelId: 'gemini-3-flash-preview',
            modelVersion: '2024-10-V2-RC1',
            lastAudit: '2024-10-01T00:00:00Z'
        }
      });
    }, 600); // Latency simulation
  });
};

export const activateLitigationHold = async (reason: string): Promise<void> => {
    currentLitigationHold = {
        id: `HOLD-${Date.now()}`,
        isActive: true,
        reason,
        scope: 'GLOBAL',
        activatedBy: MOCK_USER.name,
        activatedAt: new Date().toISOString()
    };
    logAudit('LITIGATION_HOLD_ACTIVATED', MOCK_USER.name, { reason });
};

export const liftLitigationHold = async (): Promise<void> => {
    if (currentLitigationHold) {
        logAudit('LITIGATION_HOLD_LIFTED', MOCK_USER.name, { holdId: currentLitigationHold.id });
        currentLitigationHold = undefined;
    }
};

// --- ANALYSIS LOGIC ---

const simulateAnalysis = async (ein: string): Promise<AssessmentResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lastDigit = parseInt(ein.slice(-1)) || 0;
      const riskScore = 20 + (lastDigit * 7); 
      const isHighRisk = riskScore > 60;

      // Entropy Logic
      const entropyScore = isHighRisk ? 0.32 : 0.75; // Mock values

      resolve({
        organization: {
          name: isHighRisk ? "Global Outreach Initiative (Simulation)" : "Community Health Foundation (Simulation)",
          ein: ein,
          fiscalYear: 2023,
          revenue: 1450000 + (lastDigit * 100000),
          assets: 3200000,
        },
        overallRiskScore: riskScore,
        generatedAt: new Date().toISOString(),
        factors: [
          {
            category: "DAF Reliance",
            score: isHighRisk ? 85 : 15,
            finding: isHighRisk ? "63% of contributions from DAFs" : "Diversified revenue stream",
            severity: isHighRisk ? RiskLevel.HIGH : RiskLevel.LOW,
            details: "High reliance on Donor Advised Funds can mask public support requirements."
          },
          {
            category: "Governance",
            score: isHighRisk ? 70 : 10,
            finding: isHighRisk ? "No independent audit committee" : "Audit committee present",
            severity: isHighRisk ? RiskLevel.MEDIUM : RiskLevel.LOW,
            details: "Schedule O indicates lack of documented committee charter."
          }
        ],
        entropyScore: {
            raw: 0, 
            normalized: entropyScore,
            year: 2023
        },
        aiGovernance: {
            model: 'gemini-3-flash-preview',
            version: '2024-10-V2',
            traceId: `trace_${Date.now()}`,
            disclaimer: 'AI insights are probabilistic. Final determination requires legal counsel.'
        }
      });
    }, 2000);
  });
};
