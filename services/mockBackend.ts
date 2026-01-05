import { AssessmentResult, RiskLevel, User, DashboardData } from "../types";

// ============================================================================
// MAGNUS TIER 1 API CLIENT
// Connects to Python FastAPI Backend at /api/v1
// ============================================================================

const API_BASE = '/api/v1';

export const analyzeOrganization = async (ein: string): Promise<AssessmentResult> => {
  console.log(`[Magnus Engine] Initiating analysis for EIN: ${ein}`);
  
  try {
    // 1. Attempt connection to Real Tier 1 Backend
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ein })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return mapBackendResponse(data);

  } catch (error) {
    console.warn("[Magnus Engine] Backend unreachable (Demo Mode Active). Falling back to simulation.", error);
    return simulateAnalysis(ein);
  }
};

// Adapter to map Python Snake_Case to Frontend CamelCase
const mapBackendResponse = (data: any): AssessmentResult => {
  return {
    organization: {
      name: data.organization_name,
      ein: data.ein,
      fiscalYear: data.fiscal_year || 2023,
      revenue: data.revenue,
      assets: data.assets,
    },
    overallRiskScore: data.risk_score,
    generatedAt: new Date().toISOString(),
    factors: data.factors.map((f: any) => ({
      category: f.category,
      score: f.score || 50,
      finding: f.description,
      severity: f.severity as RiskLevel,
      details: f.description // Mapping description to details for now
    }))
  };
};

// ============================================================================
// FALLBACK SIMULATION (For Demo/Offline)
// ============================================================================

const simulateAnalysis = async (ein: string): Promise<AssessmentResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lastDigit = parseInt(ein.slice(-1)) || 0;
      const riskScore = 20 + (lastDigit * 7); 
      const isHighRisk = riskScore > 60;

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
          },
          {
            category: "Schedule B",
            score: 45,
            finding: "Incomplete contributor addresses",
            severity: RiskLevel.MEDIUM,
            details: "Several entries in Schedule B lack full zip codes."
          }
        ]
      });
    }, 2000);
  });
};

export const submitLeadGen = async (ein: string, email: string): Promise<void> => {
  // Placeholder for /api/v1/lead-gen
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[Backend] Lead Captured: ${email} for EIN: ${ein}`);
      resolve();
    }, 1000);
  });
};

export const login = async (email: string): Promise<User> => {
  // Placeholder for /api/v1/auth/login
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email.includes('@')) {
        resolve({
          id: 'u_123',
          name: 'Jane Smith',
          email: email,
          organization: 'Community Health Foundation',
          role: 'CFO'
        });
      } else {
        reject(new Error('Invalid email'));
      }
    }, 1500);
  });
};

export const getDashboardData = async (): Promise<DashboardData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
            id: 'u_123',
            name: 'Jane Smith',
            email: 'jane@example.org',
            organization: 'Community Health Foundation',
            role: 'CFO'
        },
        stats: {
          riskScore: 65,
          openFindings: 3,
          resolvedFindings: 12,
          nextDeadline: 'Nov 15, 2024'
        },
        alerts: [
          { id: 1, type: 'critical', message: 'Schedule B donor addresses incomplete', date: '2 hours ago' },
          { id: 2, type: 'warning', message: 'DAF contribution ratio exceeded 20%', date: '1 day ago' },
          { id: 3, type: 'info', message: 'Q3 Financials imported successfully', date: '3 days ago' }
        ],
        findings: [
          { id: 101, category: 'Governance', description: 'Missing Conflict of Interest Policy', severity: RiskLevel.HIGH, status: 'Open' },
          { id: 102, category: 'Public Support', description: 'Unusual Grant from Single Source', severity: RiskLevel.MEDIUM, status: 'In Progress' },
          { id: 103, category: 'Reporting', description: 'Program Service Accomplishments Vague', severity: RiskLevel.LOW, status: 'Resolved' }
        ],
        reports: [
          { id: 501, name: 'FY2023 Compliance Audit.pdf', date: 'Oct 15, 2024', type: 'Audit', size: '2.4 MB' },
          { id: 502, name: 'Board Governance Review.pdf', date: 'Sep 01, 2024', type: 'Advisory', size: '1.1 MB' },
          { id: 503, name: 'Risk Assessment Matrix.xlsx', date: 'Aug 20, 2024', type: 'Data', size: '450 KB' }
        ]
      });
    }, 1000);
  });
};
