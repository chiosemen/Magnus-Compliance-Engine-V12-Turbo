
import React from 'react';
import { 
  LayoutDashboard, AlertTriangle, FileText, Settings, LogOut, 
  Shield, CheckCircle, Clock, Search, Lock, Scale, 
  Download, ChevronRight, Bell, Upload, CreditCard,
  Plus, Building, ChevronDown, Loader2, RefreshCw, X, History,
  FileCheck, Gavel, BookOpen, Share2, ClipboardList, Siren, FileWarning,
  MessageSquare, Swords, GitFork, AlertOctagon, UserX, Eye,
  Briefcase, Fingerprint, Scroll, Umbrella, Mic2, Megaphone, BarChart2,
  Cpu, UserCheck, EyeOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { 
    getDashboardData, login, activateLitigationHold, 
    liftLitigationHold, switchOrganization, triggerReportGeneration, verifyFinding 
} from '../services/mockBackend';
import { DashboardData, RiskLevel, ReportArtifact, ReportStatus, OrganizationEntity } from '../types';

// --- UTILS ---
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- SUB-COMPONENTS ---

const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  title?: string; 
  action?: React.ReactNode 
}> = ({ children, className, title, action }) => (
  <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm p-6", className)}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-6">
        {title && <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

const Metric: React.FC<{ 
  label: string; 
  value: string | number; 
  subValue?: string; 
  status?: 'good' | 'warning' | 'critical';
}> = ({ label, value, subValue, status }) => (
  <div className="flex flex-col">
    <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{label}</dt>
    <dd className="flex items-baseline gap-2">
      <span className={cn(
          "text-3xl font-bold tracking-tight",
          status === 'critical' ? 'text-red-700' : 
          status === 'warning' ? 'text-amber-600' : 
          'text-gray-900'
        )}
      >
        {value}
      </span>
      {subValue && <span className="text-sm text-gray-500 font-medium">{subValue}</span>}
    </dd>
  </div>
);

const ReportRow: React.FC<{ report: ReportArtifact }> = ({ report }) => (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
        <div className="flex items-center gap-4">
            <div className={cn(
                "p-2 rounded-lg",
                report.status === ReportStatus.COMPLETED ? "bg-blue-50 text-blue-600" :
                report.status === ReportStatus.FAILED ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"
            )}>
                <FileText className="h-5 w-5" />
            </div>
            <div>
                <h4 className="font-bold text-gray-900 text-sm group-hover:text-magnus-primary transition-colors">{report.name}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{report.type}</span>
                    {report.size && (
                        <>
                            <span>•</span>
                            <span className="font-mono">{report.size}</span>
                        </>
                    )}
                     {report.hash && (
                        <>
                            <span>•</span>
                            <span className="font-mono text-[10px] bg-gray-100 px-1 rounded text-gray-400" title={report.hash}>
                                {report.hash.substring(0, 12)}...
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
        <div>
            {report.status === ReportStatus.COMPLETED ? (
                <button className="p-2 text-gray-400 hover:text-magnus-primary transition-colors">
                    <Download className="h-4 w-4" />
                </button>
            ) : (
                <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-500 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> {report.status}
                </span>
            )}
        </div>
    </div>
);

// --- MAIN DASHBOARD ---

const Dashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  
  // Data State
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'orgs' | 'reports' | 'regulatory' | 'findings' | 'audit'>('overview');
  const [regulatoryDoc, setRegulatoryDoc] = useState<
    'opinion' | 'walkthrough' | 'defense' | 'scorecard' | 'playbook' | 'qna' | 'tabletop' | 'escalation' | 'liability' | 
    'onboarding' | 'evidence' | 'enforcement' | 'insurance' | 'certification' | 'interview' | 'crisis' | 'maturity'
  >('opinion');
  
  // UI State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [isRegulatorMode, setIsRegulatorMode] = useState(false);

  // --- ACTIONS ---

  const refreshData = async () => {
    const dashboardData = await getDashboardData();
    setData(dashboardData);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGlobalLoading(true);
    try {
      await login(email);
      await refreshData();
      setIsAuthenticated(true);
    } catch (error) {
      alert('Login failed.');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const handleOrgSwitch = async (orgId: string) => {
      setOrgMenuOpen(false);
      setIsGlobalLoading(true);
      await switchOrganization(orgId);
      await refreshData();
      setIsGlobalLoading(false);
  };

  const handleGenerateReport = async (type: ReportArtifact['type']) => {
      setGeneratingReport(type);
      try {
        await triggerReportGeneration(type);
        await refreshData(); 
      } finally {
        setTimeout(() => setGeneratingReport(null), 1000);
      }
  };

  const handleVerifyFinding = async (findingId: number) => {
      setIsGlobalLoading(true);
      await verifyFinding(findingId);
      await refreshData();
      setIsGlobalLoading(false);
  }

  const filteredFindings = data?.findings.filter(f => 
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- AUTH VIEW ---
  if (!isAuthenticated || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto h-16 w-16 bg-magnus-light rounded-full flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-magnus-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Magnus Compliance Platform</h2>
          <p className="text-gray-600 mb-8">Secure Audit Trail & Risk Analysis Portal</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-magnus-secondary outline-none"
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-magnus-secondary outline-none"
              required
            />
            <button 
              type="submit"
              disabled={isGlobalLoading}
              className="w-full bg-magnus-primary text-white py-3 rounded-lg font-bold hover:bg-magnus-dark transition-colors flex items-center justify-center"
            >
              {isGlobalLoading ? <Loader2 className="animate-spin h-5 w-5"/> : 'Secure Entry'}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400 font-mono">
             IMMUTABLE AUDIT LOGGING ENABLED (V12.0 Turbo)
          </div>
        </div>
      </div>
    );
  }

  // --- APP VIEW ---
  const { currentOrganization, availableOrganizations, currentUser } = data.context;

  return (
    <div className="min-h-screen font-sans flex text-sm bg-gray-50">
      
      {/* SIDEBAR */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-magnus-dark border-r border-white/5 text-white transition-colors duration-500">
        
        {/* Org Switcher */}
        <div className="h-20 flex items-center px-4 border-b border-white/10 relative">
           <button 
             onClick={() => setOrgMenuOpen(!orgMenuOpen)}
             disabled={isRegulatorMode}
             className="w-full flex items-center justify-between hover:bg-white/5 p-2 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-8 w-8 rounded bg-gradient-to-br from-magnus-secondary to-blue-600 flex items-center justify-center font-bold text-white shrink-0">
                    {currentOrganization.name.charAt(0)}
                </div>
                <div className="text-left overflow-hidden">
                    <div className="font-bold text-sm truncate w-32">{currentOrganization.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">EIN: {currentOrganization.ein}</div>
                </div>
             </div>
             {!isRegulatorMode && <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-white" />}
           </button>

           {/* Org Dropdown */}
           {orgMenuOpen && !isRegulatorMode && (
               <div className="absolute top-16 left-4 right-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 overflow-hidden">
                   <div className="p-2 border-b border-gray-700">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-wide px-2">Switch Organization</span>
                   </div>
                   {availableOrganizations.map(org => (
                       <button 
                        key={org.id}
                        onClick={() => handleOrgSwitch(org.id)}
                        className={cn(
                            "w-full text-left px-4 py-3 text-sm hover:bg-white/5 flex items-center gap-2",
                            org.id === currentOrganization.id ? "text-magnus-secondary font-bold" : "text-gray-300"
                        )}
                       >
                           <Building className="h-4 w-4 opacity-50" />
                           {org.name}
                       </button>
                   ))}
                   <button className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white border-t border-gray-700 flex items-center gap-2">
                       <Plus className="h-4 w-4" /> Add Organization
                   </button>
               </div>
           )}
        </div>
        
        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
           {[
             { id: 'overview', icon: LayoutDashboard, label: 'Risk Desk' },
             { id: 'findings', icon: AlertTriangle, label: 'Control Findings' },
             { id: 'orgs', icon: Building, label: 'Organization Settings' },
             { id: 'reports', icon: FileText, label: 'Artifacts & Reports' },
             { id: 'regulatory', icon: Scale, label: 'Regulatory Defense' },
             { id: 'audit', icon: History, label: 'Audit Log' }
           ].map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id as any)}
               className={cn(
                 "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                 activeTab === item.id 
                   ? "bg-magnus-secondary text-white shadow-lg" 
                   : "text-gray-400 hover:text-white hover:bg-white/5"
               )}
             >
               <item.icon className="h-4 w-4" />
               {item.label}
             </button>
           ))}
        </nav>

        {/* Regulator Mode Toggle */}
        <div className="px-4 py-3 border-t border-white/10">
            <button 
                onClick={() => setIsRegulatorMode(!isRegulatorMode)}
                className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all",
                    isRegulatorMode 
                        ? "bg-white text-magnus-dark border-transparent" 
                        : "bg-transparent text-gray-400 border-gray-700 hover:border-gray-500"
                )}
            >
                <span className="flex items-center gap-2">
                    {isRegulatorMode ? <Eye className="h-4 w-4"/> : <EyeOff className="h-4 w-4"/>}
                    Regulator View
                </span>
                <div className={cn("w-2 h-2 rounded-full", isRegulatorMode ? "bg-red-500 animate-pulse" : "bg-gray-600")} />
            </button>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                    {currentUser.avatarUrl}
                </div>
                <div className="overflow-hidden">
                    <div className="text-sm font-medium text-white truncate">{currentUser.name}</div>
                    <div className="text-xs text-gray-500 truncate">{currentUser.role}</div>
                </div>
            </div>
            <button 
                onClick={() => setIsAuthenticated(false)} 
                className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wide px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
            >
                <LogOut className="h-4 w-4" /> Sign Out
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {isGlobalLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-magnus-secondary animate-spin" />
            </div>
        )}

        {/* Regulator Banner */}
        {isRegulatorMode && (
            <div className="bg-red-600 text-white px-6 py-2 shadow-md flex justify-center items-center gap-3 sticky top-0 z-40">
                <Shield className="h-5 w-5" />
                <span className="font-bold text-sm uppercase tracking-widest">Regulator Access Mode Active — Read Only — Audit Trail Enabled</span>
            </div>
        )}

        <div className="max-w-7xl mx-auto p-8 space-y-8 flex-1">
          
          {/* HEADER & SEARCH */}
          <div className="flex justify-between items-center">
             <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {activeTab === 'overview' ? 'Compliance Intelligence' : 
                   activeTab === 'reports' ? 'Artifact Repository' : 
                   activeTab === 'orgs' ? 'Organization Management' : 
                   activeTab === 'findings' ? 'Control Findings & Exceptions' :
                   activeTab === 'regulatory' ? 'Regulatory Defense & Assurance' : 'System Overview'}
                </h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                   <Clock className="h-3 w-3" /> Updated: {new Date().toLocaleTimeString()}
                </p>
             </div>
             
             {!isRegulatorMode && (
                 <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search compliance data..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none text-sm transition-all"
                        />
                    </div>
                    <button className="relative p-2 text-gray-400 hover:text-magnus-primary transition-colors bg-white border border-gray-200 rounded-lg">
                        <Bell className="h-5 w-5" />
                        {data.alerts.some(a => a.type === 'critical') && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>
                 </div>
             )}
          </div>

          {/* GLOBAL STATUS BANNER */}
          {data.litigationHold?.isActive && (
            <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5" />
                  <div>
                      <span className="font-bold uppercase tracking-wide text-xs block">Litigation Hold Active</span>
                      <span className="text-sm">{data.litigationHold.reason}</span>
                  </div>
              </div>
              {!isRegulatorMode && (
                  <button onClick={liftLitigationHold} className="text-xs bg-white border border-red-200 px-3 py-1 rounded hover:bg-red-50 font-bold">
                      Request Lift
                  </button>
              )}
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <Metric 
                        label="Risk Score" 
                        value={data.stats.riskScore} 
                        subValue="/ 100" 
                        status={data.stats.riskScore > 50 ? 'warning' : 'good'} 
                    />
                </Card>
                <Card>
                    <Metric 
                        label="Open Findings" 
                        value={data.stats.openFindings} 
                        status={data.stats.openFindings > 0 ? 'warning' : 'good'} 
                    />
                </Card>
                <Card>
                    <Metric label="Reports Generated" value={data.reports.length} />
                </Card>
                <Card className="bg-gradient-to-br from-magnus-primary to-magnus-dark text-white border-none relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-magnus-secondary" />
                            <span className="text-xs font-bold uppercase tracking-wide opacity-80">AI Governance</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed opacity-90 mb-2">
                            {data.stats.riskScore > 50 
                                ? "Elevated risk detected in Schedule B due to donor concentration." 
                                : "Governance indicators are strong. Next filing deadline is approaching."}
                        </p>
                        <div className="text-[10px] opacity-50 font-mono border-t border-white/10 pt-2 mt-2">
                            Model: {data.aiGovernance.modelId} | Ver: {data.aiGovernance.modelVersion}
                        </div>
                    </div>
                </Card>
             </div>
            </div>
          )}

          {/* TAB: FINDINGS (Hardened) */}
          {activeTab === 'findings' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-fade-in">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-bold text-gray-700">Control Exceptions & Risk Factors</h3>
                      <div className="text-xs text-gray-500">
                          {data.findings.filter(f => f.verificationStatus === 'HUMAN_VERIFIED').length} / {data.findings.length} Verified
                      </div>
                  </div>
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
                          <tr>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3">Severity</th>
                              <th className="px-6 py-3">Finding Description</th>
                              <th className="px-6 py-3">Source / Verification</th>
                              {!isRegulatorMode && <th className="px-6 py-3 text-right">Actions</th>}
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                          {data.findings.map(finding => (
                              <tr key={finding.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4">
                                      <span className={cn("px-2 py-1 rounded-full text-xs font-bold", 
                                          finding.status === 'Open' ? "bg-red-100 text-red-700" : 
                                          finding.status === 'Resolved' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                      )}>
                                          {finding.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 font-bold text-gray-700">{finding.severity}</td>
                                  <td className="px-6 py-4">
                                      <div className="font-medium text-gray-900">{finding.category}</div>
                                      <div className="text-gray-500 text-xs">{finding.description}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                      {finding.verificationStatus === 'HUMAN_VERIFIED' ? (
                                          <div className="flex items-center gap-2 text-green-700">
                                              <UserCheck className="h-4 w-4" />
                                              <div className="text-xs">
                                                  <div className="font-bold">Verified</div>
                                                  <div className="opacity-80">by {finding.verifiedBy}</div>
                                              </div>
                                          </div>
                                      ) : (
                                          <div className="flex items-center gap-2 text-gray-400">
                                              <Cpu className="h-4 w-4" />
                                              <span className="text-xs italic">AI Generated</span>
                                          </div>
                                      )}
                                  </td>
                                  {!isRegulatorMode && (
                                      <td className="px-6 py-4 text-right">
                                          {finding.verificationStatus !== 'HUMAN_VERIFIED' && (
                                              <button 
                                                onClick={() => handleVerifyFinding(finding.id)}
                                                className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 font-medium text-gray-700"
                                              >
                                                  Verify Finding
                                              </button>
                                          )}
                                      </td>
                                  )}
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}

          {/* TAB: REGULATORY DEFENSE (NEW) */}
          {activeTab === 'regulatory' && (
              <div className="grid grid-cols-12 gap-8 animate-fade-in h-[calc(100vh-200px)]">
                  {/* Defense Nav */}
                  <div className="col-span-3 space-y-2 h-full overflow-y-auto pr-2">
                      <div className="px-4 pb-2 pt-1">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Governance Strategy</h4>
                      </div>
                      <button 
                        onClick={() => setRegulatoryDoc('opinion')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'opinion' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <FileCheck className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'opinion' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Independent Opinion</div>
                              <div className="text-xs text-gray-500 mt-1">Audit Committee Assurance</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('onboarding')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'onboarding' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <Briefcase className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'onboarding' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Director Onboarding</div>
                              <div className="text-xs text-gray-500 mt-1">Compliance Briefing</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('scorecard')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'scorecard' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <ClipboardList className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'scorecard' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Readiness Scorecard</div>
                              <div className="text-xs text-gray-500 mt-1">Pre-Enforcement Assessment</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('maturity')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'maturity' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <BarChart2 className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'maturity' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Maturity Scorecard</div>
                              <div className="text-xs text-gray-500 mt-1">Multi-Year Governance</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('certification')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'certification' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <Scroll className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'certification' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Certification</div>
                              <div className="text-xs text-gray-500 mt-1">Director Attestation</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('defense')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'defense' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <Gavel className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'defense' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Defensive Narrative</div>
                              <div className="text-xs text-gray-500 mt-1">Adversarial Inquiry Framework</div>
                          </div>
                      </button>

                      <div className="px-4 pb-2 pt-6">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Operations & Evidence</h4>
                      </div>
                      <button 
                        onClick={() => setRegulatoryDoc('walkthrough')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'walkthrough' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <BookOpen className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'walkthrough' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Examination SOP</div>
                              <div className="text-xs text-gray-500 mt-1">Regulatory Walkthrough</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('evidence')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'evidence' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <Fingerprint className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'evidence' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Evidence Index</div>
                              <div className="text-xs text-gray-500 mt-1">Regulator-Facing Map</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('playbook')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'playbook' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <Siren className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'playbook' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Litigation Playbook</div>
                              <div className="text-xs text-gray-500 mt-1">Emergency Operations</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('enforcement')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'enforcement' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <FileWarning className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'enforcement' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Enforcement Notice</div>
                              <div className="text-xs text-gray-500 mt-1">Mock Response Pack</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('crisis')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'crisis' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <Megaphone className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'crisis' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Crisis Protocol</div>
                              <div className="text-xs text-gray-500 mt-1">Communications Plan</div>
                          </div>
                      </button>
                      
                      <div className="px-4 pb-2 pt-6">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Board Wargaming</h4>
                      </div>
                      <button 
                        onClick={() => setRegulatoryDoc('liability')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'liability' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <AlertOctagon className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'liability' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Director Liability Map</div>
                              <div className="text-xs text-gray-500 mt-1">Personal Exposure Analysis</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('insurance')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'insurance' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <Umbrella className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'insurance' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">D&O Insurance</div>
                              <div className="text-xs text-gray-500 mt-1">Alignment Analysis</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('escalation')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'escalation' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <GitFork className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'escalation' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Escalation Tree</div>
                              <div className="text-xs text-gray-500 mt-1">Decision Logic Framework</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('qna')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'qna' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <MessageSquare className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'qna' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Cross-Exam Simulator</div>
                              <div className="text-xs text-gray-500 mt-1">Hostile Inquiry Drill</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('interview')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'interview' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <Mic2 className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'interview' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Interview Rehearsal</div>
                              <div className="text-xs text-gray-500 mt-1">Regulatory Script</div>
                          </div>
                      </button>
                      <button 
                        onClick={() => setRegulatoryDoc('tabletop')}
                        className={cn("w-full text-left p-4 rounded-lg flex items-start gap-3 transition-colors border", regulatoryDoc === 'tabletop' ? "bg-white border-magnus-secondary shadow-md" : "hover:bg-white border-transparent")}
                      >
                          <Swords className={cn("h-5 w-5 mt-0.5", regulatoryDoc === 'tabletop' ? "text-magnus-secondary" : "text-gray-400")} />
                          <div>
                              <div className="font-bold text-gray-900">Tabletop Exercise</div>
                              <div className="text-xs text-gray-500 mt-1">Incident Response Scenario</div>
                          </div>
                      </button>
                  </div>

                  {/* Document Viewer */}
                  <div className="col-span-9 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
                      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-mono font-bold">READ ONLY</span>
                              <span className="text-gray-400 text-xs">|</span>
                              <span className="text-sm font-bold text-gray-700">
                                  {regulatoryDoc === 'opinion' && "MEMORANDUM: Independent Compliance Opinion"}
                                  {regulatoryDoc === 'walkthrough' && "PROCEDURE: Regulatory Examination Walkthrough"}
                                  {regulatoryDoc === 'defense' && "PRIVILEGED: Hostile Inquiry Defense Strategy"}
                                  {regulatoryDoc === 'scorecard' && "ASSESSMENT: Pre-Enforcement Readiness Scorecard"}
                                  {regulatoryDoc === 'playbook' && "OPERATIONAL: Litigation-Hold Playbook"}
                                  {regulatoryDoc === 'liability' && "GOVERNANCE: Personal Liability Exposure Map"}
                                  {regulatoryDoc === 'escalation' && "FRAMEWORK: Board Escalation Decision Tree"}
                                  {regulatoryDoc === 'qna' && "SIMULATION: Cross-Examination Q&A"}
                                  {regulatoryDoc === 'tabletop' && "SCENARIO: Regulatory Incident Tabletop"}
                                  {regulatoryDoc === 'onboarding' && "BRIEFING: Director Compliance Onboarding"}
                                  {regulatoryDoc === 'evidence' && "INDEX: Regulator-Facing Evidence Map"}
                                  {regulatoryDoc === 'enforcement' && "EXERCISE: Mock Enforcement Notice & Response"}
                                  {regulatoryDoc === 'insurance' && "ANALYSIS: D&O Insurance Alignment"}
                                  {regulatoryDoc === 'certification' && "FRAMEWORK: Director Certification & Attestation"}
                                  {regulatoryDoc === 'interview' && "SCRIPT: Regulatory Interview Rehearsal"}
                                  {regulatoryDoc === 'crisis' && "PROTOCOL: Compliance Crisis Communications"}
                                  {regulatoryDoc === 'maturity' && "SCORECARD: Governance Maturity Model"}
                              </span>
                          </div>
                          <div className="flex gap-2">
                             <button className="p-2 hover:bg-gray-200 rounded text-gray-500"><Download className="h-4 w-4"/></button>
                             <button className="p-2 hover:bg-gray-200 rounded text-gray-500"><Share2 className="h-4 w-4"/></button>
                          </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-8 prose prose-sm max-w-none bg-white">
                          
                          {/* INDEPENDENT OPINION MEMO CONTENT */}
                          {regulatoryDoc === 'opinion' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Independent Opinion Memorandum</h1>
                                      <p className="text-gray-500"><strong>To:</strong> Audit Committee, Board of Directors</p>
                                      <p className="text-gray-500"><strong>Subject:</strong> Assessment of Magnus Compliance Platform (MCC) Maturity & Control Integrity</p>
                                      <p className="text-gray-500"><strong>Date:</strong> October 12, 2024</p>
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-900">1. Scope & Engagement Context</h3>
                                  <p>We were retained to assess the design intent and operational capability of the Magnus Compliance Platform (MCC) regarding its suitability as a system of record for regulatory compliance. Our review focused on data determinism, evidence immutability, and governance workflows. We did not audit the underlying financial data of client entities.</p>

                                  <h3 className="text-lg font-bold text-gray-900">2. Summary Opinion</h3>
                                  <p>In our professional opinion, MCC demonstrates the characteristics of a <strong>Enterprise Compliance System of Record</strong> rather than a passive reporting tool. Its architecture prioritizes control enforcement over simple visibility, making it suitable for regulated environments requiring defensible audit trails.</p>

                                  <h3 className="text-lg font-bold text-gray-900">3. Design Alignment Assessment</h3>
                                  <ul className="list-disc pl-5 space-y-2">
                                      <li><strong>IRS Oversight:</strong> The system enforces distinct logic for Public Support Tests, mitigating "tipping" risks via automated DAF concentration monitoring.</li>
                                      <li><strong>SOC 2 Alignment:</strong> The event-driven architecture supports non-repudiation (CC2.2) and logical access isolation (CC6.1) by design.</li>
                                  </ul>

                                  <h3 className="text-lg font-bold text-gray-900">4. Conclusion</h3>
                                  <p>The platform is reasonably positioned to support the Board's fiduciary duty of oversight, provided that management adheres to the prescribed exception handling workflows.</p>
                              </div>
                          )}

                          {/* WALKTHROUGH CONTENT */}
                          {regulatoryDoc === 'walkthrough' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Regulatory Examination SOP</h1>
                                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-800 text-xs font-bold">
                                          INTERNAL USE ONLY - EXAM READINESS DRILL
                                      </div>
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-900">Phase 1: Examination Initiation</h3>
                                  <p>Upon notification of a regulatory inquiry (IRS, State AG, or Independent Audit), the CCO shall activate <strong>"Regulator Mode"</strong> within MCC. This restricts the examiner's view to the specific scope defined in the subpoena or engagement letter.</p>

                                  <h3 className="text-lg font-bold text-gray-900">Phase 2: Evidence Production</h3>
                                  <p>The examiner will likely request "Governance Policies" and "Risk Assessments".</p>
                                  <p><strong>Action:</strong> Navigate to the <em>Artifact Repository</em>. Filter by "Finalized" status. The system will produce a cryptographically hashed PDF of the policy active <em>at the time of the transaction</em>, not the current policy, preserving temporal accuracy.</p>

                                  <h3 className="text-lg font-bold text-gray-900">Phase 3: Adverse Findings Scenario</h3>
                                  <p>If an examiner identifies a control failure:</p>
                                  <ul className="list-disc pl-5 space-y-2">
                                      <li>Do not attempt to explain away the data.</li>
                                      <li>Show the <strong>Remediation Ticket</strong> linked to the failure.</li>
                                      <li>Demonstrate that the system <em>detected</em> the failure and assigned it to the Audit Committee, proving functional oversight even in the absence of perfection.</li>
                                  </ul>
                              </div>
                          )}

                          {/* SCORECARD CONTENT */}
                          {regulatoryDoc === 'scorecard' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pre-Enforcement Readiness Scorecard</h1>
                                      <p className="text-gray-500"><strong>Evaluation Target:</strong> Community Health Foundation</p>
                                      <p className="text-gray-500"><strong>Assessment Date:</strong> November 02, 2024</p>
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-900">1. Executive Summary</h3>
                                  <p>This scorecard evaluates the organization's preparedness for a hostile regulatory inquiry. The assessment assumes a "pre-litigation" posture, prioritizing defensibility and evidence preservation over operational efficiency.</p>

                                  <div className="my-6">
                                      <h4 className="font-bold text-sm uppercase text-gray-500 mb-3">Readiness Domains</h4>
                                      <div className="space-y-4">
                                          {[
                                              { domain: "Governance & Oversight", score: "AMBER", rationale: "Board minutes reflect financial review but lack explicit discussion of Schedule B donor concentration risks." },
                                              { domain: "Control Design", score: "GREEN", rationale: "Magnus automated controls are effectively catching high-risk transactions." },
                                              { domain: "Evidence Integrity", score: "GREEN", rationale: "WORM storage logic confirmed for all finalized compliance artifacts." },
                                              { domain: "Role Separation", score: "AMBER", rationale: "Dual-custody required for lifting litigation holds; currently single-admin capable." },
                                              { domain: "Audit Trail Completeness", score: "GREEN", rationale: "System logs capture 100% of read/write events with non-repudiable hashes." }
                                          ].map((item, i) => (
                                              <div key={i} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
                                                  <div className={cn(
                                                      "w-20 px-2 py-1 text-center rounded text-xs font-bold",
                                                      item.score === 'GREEN' ? "bg-green-100 text-green-800" :
                                                      item.score === 'AMBER' ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                                                  )}>{item.score}</div>
                                                  <div>
                                                      <div className="font-bold text-gray-900 text-sm">{item.domain}</div>
                                                      <div className="text-gray-600 text-xs mt-1">{item.rationale}</div>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-900">2. Critical Exposure Indicators</h3>
                                  <p>We identified the following pre-enforcement signals that require immediate attention:</p>
                                  <ul className="list-disc pl-5 space-y-1 text-red-600">
                                      <li>Unresolved "High Severity" finding regarding DAF contributions open for &gt;45 days.</li>
                                      <li>Lack of documented justification for overriding the "Foreign Expenditure" alert on Oct 15th.</li>
                                  </ul>
                              </div>
                          )}

                          {/* PLAYBOOK CONTENT */}
                          {regulatoryDoc === 'playbook' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Litigation-Hold Playbook</h1>
                                      <div className="bg-red-50 border border-red-200 p-3 rounded text-red-800 text-xs font-bold flex items-center gap-2">
                                          <FileWarning className="h-4 w-4" />
                                          EMERGENCY OPERATIONS MANUAL - DO NOT DEVIATE
                                      </div>
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-900">1. Trigger Events</h3>
                                  <p>This protocol must be activated <strong>immediately</strong> (within 60 minutes) upon receipt of:</p>
                                  <ul className="list-disc pl-5 space-y-1">
                                      <li>Subpoena or Civil Investigative Demand (CID)</li>
                                      <li>Notice of Inquiry from the IRS or State Attorney General</li>
                                      <li>Credible whistleblower report regarding financial malfeasance</li>
                                  </ul>

                                  <h3 className="text-lg font-bold text-gray-900">2. Immediate Action Checklist (First 24 Hours)</h3>
                                  <div className="space-y-3 my-4">
                                      {[
                                          "Notify General Counsel and Chief Compliance Officer.",
                                          "Log into Magnus Console and toggle 'Litigation Hold' to ACTIVE.",
                                          "Verify that 'Delete' and 'Purge' buttons are disabled globally.",
                                          "Export current 'Risk Profile' as a timestamped PDF anchor.",
                                          "Suspend all automated document retention/destruction policies."
                                      ].map((step, i) => (
                                          <div key={i} className="flex items-center gap-3">
                                              <input type="checkbox" disabled className="h-4 w-4 text-magnus-secondary rounded border-gray-300" />
                                              <span className="text-gray-700">{step}</span>
                                          </div>
                                      ))}
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-900">3. System Behavior Under Hold</h3>
                                  <p>When the hold is active, the Magnus Platform enforces the following constraints:</p>
                                  <ul className="list-disc pl-5 space-y-2">
                                      <li><strong>Immutability:</strong> No historical data can be modified, even by Admins.</li>
                                      <li><strong>Uploads:</strong> New evidence can be added, but it is strictly additive (no version overwrites).</li>
                                      <li><strong>Logging:</strong> Audit log verbosity is increased to 'Trace' level, capturing every view action.</li>
                                  </ul>
                              </div>
                          )}

                          {/* LIABILITY MAP CONTENT */}
                          {regulatoryDoc === 'liability' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Personal Liability Exposure Map</h1>
                                      <div className="bg-orange-50 border border-orange-200 p-3 rounded text-orange-800 text-xs font-bold">
                                          CONFIDENTIAL - DIRECTOR TRAINING USE ONLY
                                      </div>
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-900">1. Overview</h3>
                                  <p>This document maps specific areas where Directors may face <strong>personal liability</strong> under the 'Caremark' standard for failure of oversight. It contrasts risky behaviors with the risk-mitigation evidence provided by the Magnus Platform.</p>

                                  <div className="mt-6 border rounded-lg overflow-hidden">
                                      <table className="w-full text-sm">
                                          <thead className="bg-gray-50 border-b border-gray-200">
                                              <tr>
                                                  <th className="px-4 py-3 text-left font-bold text-gray-700">Liability Category</th>
                                                  <th className="px-4 py-3 text-left font-bold text-gray-700">Risk Amplifier (Director Behavior)</th>
                                                  <th className="px-4 py-3 text-left font-bold text-gray-700">Magnus Mitigation Evidence</th>
                                              </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-200">
                                              <tr>
                                                  <td className="px-4 py-3 font-medium">Duty of Care</td>
                                                  <td className="px-4 py-3 text-red-600">Passive acceptance of management's "no risk" narratives without data.</td>
                                                  <td className="px-4 py-3 text-green-700">Automated "High Risk" alerts sent directly to Audit Chair email (System Log #404).</td>
                                              </tr>
                                              <tr>
                                                  <td className="px-4 py-3 font-medium">Duty of Loyalty</td>
                                                  <td className="px-4 py-3 text-red-600">Allowing conflicts of interest to go undiscussed in minutes.</td>
                                                  <td className="px-4 py-3 text-green-700">Mandatory annual conflict disclosure workflow with immutable timestamps.</td>
                                              </tr>
                                              <tr>
                                                  <td className="px-4 py-3 font-medium">Failure of Oversight</td>
                                                  <td className="px-4 py-3 text-red-600">Ignoring "red flags" raised by external auditors or whistleblowers.</td>
                                                  <td className="px-4 py-3 text-green-700">Platform forces "Acknowledgement" of critical findings before dashboard access is granted.</td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </div>
                                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                      <h4 className="font-bold text-gray-900 text-sm mb-2">What Magnus Cannot Protect Against</h4>
                                      <p className="text-gray-600 text-xs">
                                          The platform provides <em>evidence of notification</em>. It cannot compel Directors to act. If the system logs that you viewed a Critical Alert and took no action for 90 days, the system becomes evidence <em>against</em> you.
                                      </p>
                                  </div>
                              </div>
                          )}

                          {/* ESCALATION TREE CONTENT */}
                          {regulatoryDoc === 'escalation' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Board Escalation Decision Tree</h1>
                                      <p className="text-gray-500">Framework for determining when risk events require Board-level intervention.</p>
                                  </div>

                                  <div className="space-y-8 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200">
                                      {[
                                          { level: "Level 1: Management", trigger: "Operational anomalies, low-scoring findings.", action: "Document remediation plan in Magnus. No Board notification required." },
                                          { level: "Level 2: CCO / General Counsel", trigger: "Confirmed control failure, 'Medium' severity risk persisting > 30 days.", action: "Approve exception or resource allocation. Notify Audit Committee Chair in quarterly summary." },
                                          { level: "Level 3: Audit Committee", trigger: "Systemic failure, 'High' severity risk, or any Regulatory Inquiry (soft inquiry).", action: "Immediate convening. Review Magnus 'Forensic Report'. Direct independent investigation if needed." },
                                          { level: "Level 4: Full Board", trigger: "Subpoena, credible fraud allegation, solvency risk, or media exposure.", action: "Activate Litigation Hold. Retain outside counsel. Suspend standard deletion policies." }
                                      ].map((step, i) => (
                                          <div key={i} className="relative pl-16">
                                              <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-white border-2 border-magnus-secondary flex items-center justify-center font-bold text-magnus-secondary z-10">
                                                  {i + 1}
                                              </div>
                                              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                                  <h4 className="font-bold text-gray-900 text-lg mb-2">{step.level}</h4>
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                      <div>
                                                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Triggers</span>
                                                          <p className="text-gray-700 text-sm mt-1">{step.trigger}</p>
                                                      </div>
                                                      <div>
                                                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Required Action</span>
                                                          <p className="text-gray-700 text-sm mt-1">{step.action}</p>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {/* Q&A SIMULATOR CONTENT */}
                          {regulatoryDoc === 'qna' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Cross-Examination Simulator</h1>
                                      <div className="bg-red-50 border border-red-200 p-3 rounded text-red-800 text-xs font-bold">
                                          TRAINING EXERCISE: ADVERSARIAL QUESTIONS
                                      </div>
                                  </div>

                                  <div className="space-y-6">
                                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                          <div className="flex items-center gap-3 mb-4">
                                              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">Topic: Algorithmic Reliance</span>
                                          </div>
                                          <div className="space-y-4">
                                              <div>
                                                  <p className="font-bold text-red-700 text-lg mb-2">"Did you simply rely on the 'Green Light' from the software without independent verification?"</p>
                                                  <p className="text-gray-600 italic border-l-4 border-red-200 pl-4 py-2 bg-red-50/50">
                                                      Trap: Admitting "Yes" implies abdication of fiduciary duty.
                                                  </p>
                                              </div>
                                              <div>
                                                  <p className="font-bold text-green-700 text-sm uppercase tracking-wide mb-1">Defensive Response Framework:</p>
                                                  <p className="text-gray-800 bg-green-50 p-4 rounded-lg border border-green-100">
                                                      "No. The Magnus Platform is a <em>diagnostic tool</em> we use to surface potential anomalies. Every 'Green Light' represents a specific control test that was passed, but our Audit Committee reviews the underlying data quarterly. We treat the system as a signal, not a decision-maker."
                                                  </p>
                                              </div>
                                          </div>
                                      </div>

                                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                          <div className="flex items-center gap-3 mb-4">
                                              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">Topic: Willful Blindness</span>
                                          </div>
                                          <div className="space-y-4">
                                              <div>
                                                  <p className="font-bold text-red-700 text-lg mb-2">"The system flagged this transaction as 'High Risk' on Oct 12th. Why was it not remediated until Jan 5th?"</p>
                                                  <p className="text-gray-600 italic border-l-4 border-red-200 pl-4 py-2 bg-red-50/50">
                                                      Trap: Trying to invent a justification for delay.
                                                  </p>
                                              </div>
                                              <div>
                                                  <p className="font-bold text-green-700 text-sm uppercase tracking-wide mb-1">Defensive Response Framework:</p>
                                                  <p className="text-gray-800 bg-green-50 p-4 rounded-lg border border-green-100">
                                                      "The alert on Oct 12th triggered an automatic internal investigation workflow, as shown in the system audit log. That investigation required obtaining third-party vendor documentation, which arrived in late December. The remediation timeline reflects a thorough diligence process, not inaction."
                                                  </p>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* TABLETOP EXERCISE CONTENT */}
                          {regulatoryDoc === 'tabletop' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Regulatory Incident Tabletop Exercise</h1>
                                      <p className="text-gray-500"><strong>Scenario:</strong> Whistleblower Allegation of Misused Restricted Funds</p>
                                  </div>

                                  <div className="space-y-8">
                                      <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm rounded-r-xl">
                                          <h3 className="font-bold text-blue-900 mb-2">Phase 1: Detection (Day 0)</h3>
                                          <p className="text-gray-700 mb-4">An anonymous email is sent to the Board Chair alleging that a $500k grant for "Youth Education" was used to cover operational deficits.</p>
                                          <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                              <span className="text-xs font-bold text-gray-500 uppercase">Magnus Action Required:</span>
                                              <p className="text-sm font-medium mt-1">Check "Fund Accounting" module. Does the system show a restriction release mismatch?</p>
                                          </div>
                                      </div>

                                      <div className="bg-white border-l-4 border-yellow-500 p-6 shadow-sm rounded-r-xl">
                                          <h3 className="font-bold text-yellow-900 mb-2">Phase 2: Escalation (Day 2)</h3>
                                          <p className="text-gray-700 mb-4">Internal review confirms the funds were commingled in the general operating account. No clear "release" documentation exists.</p>
                                          <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                              <span className="text-xs font-bold text-gray-500 uppercase">Decision Point:</span>
                                              <p className="text-sm font-medium mt-1">Do you self-report to the donor immediately, or wait for legal counsel review?</p>
                                          </div>
                                      </div>

                                      <div className="bg-white border-l-4 border-red-500 p-6 shadow-sm rounded-r-xl">
                                          <h3 className="font-bold text-red-900 mb-2">Phase 3: Regulatory Inquiry (Day 14)</h3>
                                          <p className="text-gray-700 mb-4">The State Attorney General's Charities Bureau sends a letter requesting "all financial records related to restricted grants for FY2023."</p>
                                          <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                              <span className="text-xs font-bold text-gray-500 uppercase">Magnus Action Required:</span>
                                              <p className="text-sm font-medium mt-1"><strong>ACTIVATE LITIGATION HOLD.</strong> This freezes all logs. Generate "Forensic Audit Trail" report for the specific grant ID only (Scope Control).</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* DEFENSE NARRATIVE CONTENT */}
                          {regulatoryDoc === 'defense' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Defensive Regulatory Narrative</h1>
                                      <div className="bg-red-50 border border-red-200 p-3 rounded text-red-800 text-xs font-bold">
                                          PRIVILEGED & CONFIDENTIAL - ATTORNEY WORK PRODUCT
                                      </div>
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-900">1. Statement of System Intent</h3>
                                  <p>The Magnus Compliance Platform is designed to act as a <strong>deterministic control environment</strong>. It is not a predictive "black box" but a rules-based engine that enforces pre-defined governance policies. Any deviation from these rules generates an immutable log entry.</p>

                                  <h3 className="text-lg font-bold text-gray-900">2. Evidence Integrity Position</h3>
                                  <p>We reject any assertion that records have been altered. MCC utilizes WORM (Write-Once-Read-Many) storage logic for all finalized compliance artifacts. The chain of custody for the document in question is preserved in the <em>System Audit Log</em> (Exhibit A), showing creation, review, and finalization timestamps.</p>

                                  <h3 className="text-lg font-bold text-gray-900">3. Response to Allegations of "Willful Blindness"</h3>
                                  <p>The inquiry suggests the Board was unaware of the DAF concentration risk. The system evidence contradicts this. On [Date], a "High Severity" alert was generated. The Audit Committee Chair accessed this alert on [Date+1], as recorded in the access log. Management's decision to accept this risk was a documented governance decision, not an oversight.</p>
                              </div>
                          )}

                          {/* --- NEW MODULES --- */}

                          {/* ONBOARDING BRIEF */}
                          {regulatoryDoc === 'onboarding' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Director Onboarding: Compliance Briefing</h1>
                                      <p className="text-gray-500"><strong>Mandatory Reading for New Board Members</strong></p>
                                  </div>
                                  <h3 className="text-lg font-bold text-gray-900">1. Fiduciary Duties in a Digital Context</h3>
                                  <p>As a Director, your duty of oversight extends to the automated systems used by the organization. You cannot outsource liability to software. You must understand <em>what</em> the system monitors and <em>how</em> it escalates risks to you.</p>
                                  
                                  <h3 className="text-lg font-bold text-gray-900">2. Interacting with Magnus</h3>
                                  <p>Your "read-only" access to this dashboard is a governance control. It allows you to verify management's reports without creating accidental records of "instruction" that could blur the line between oversight and management (piercing the corporate veil).</p>

                                  <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
                                      <h4 className="font-bold text-yellow-800 text-sm">Critical Red Flags</h4>
                                      <ul className="list-disc pl-5 mt-2 text-sm text-yellow-900">
                                          <li>Any "Critical" finding open for more than 90 days.</li>
                                          <li>Manual override of a "Public Support Test" failure warning.</li>
                                          <li>Missing conflict of interest disclosures from key employees.</li>
                                      </ul>
                                  </div>
                              </div>
                          )}

                          {/* EVIDENCE INDEX */}
                          {regulatoryDoc === 'evidence' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Regulator-Facing Evidence Index</h1>
                                      <div className="bg-blue-50 border border-blue-200 p-3 rounded text-blue-800 text-xs font-bold">
                                          DISCLOSURE MAP - DO NOT VOLUNTEER OUTSIDE SCOPE
                                      </div>
                                  </div>
                                  
                                  <table className="w-full text-sm text-left">
                                      <thead className="bg-gray-50 font-bold text-gray-700">
                                          <tr>
                                              <th className="p-3">Evidence Category</th>
                                              <th className="p-3">Primary Artifact</th>
                                              <th className="p-3">Disclosure Risk</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y">
                                          <tr>
                                              <td className="p-3">Governance</td>
                                              <td className="p-3">Meeting Minutes (Redacted)</td>
                                              <td className="p-3 text-green-600">Low (Standard)</td>
                                          </tr>
                                          <tr>
                                              <td className="p-3">Risk Assessments</td>
                                              <td className="p-3">Magnus "Final" PDF Reports</td>
                                              <td className="p-3 text-green-600">Low (If finalized)</td>
                                          </tr>
                                          <tr>
                                              <td className="p-3">Internal Deliberation</td>
                                              <td className="p-3">Draft/Comment Threads</td>
                                              <td className="p-3 text-red-600 font-bold">HIGH (Privileged)</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                          )}

                          {/* ENFORCEMENT NOTICE */}
                          {regulatoryDoc === 'enforcement' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mock Enforcement Notice & Response</h1>
                                      <p className="text-gray-500"><strong>Exercise:</strong> Receipt of Subpoena regarding "Restricted Fund Usage"</p>
                                  </div>

                                  <div className="border border-gray-300 p-6 rounded bg-gray-50 font-mono text-sm mb-6">
                                      <p className="mb-4"><strong>SUBPOENA DUCES TECUM</strong></p>
                                      <p>YOU ARE HEREBY COMMANDED to produce... all records relating to the solicitation, receipt, and expenditure of funds designated for the 'Youth Scholarship Program' from Jan 1, 2023 to present...</p>
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-900">Immediate Response Checklist</h3>
                                  <ul className="list-disc pl-5 space-y-2">
                                      <li><strong>Hour 0-2:</strong> General Counsel notifies D&O Carrier (Potential Claim).</li>
                                      <li><strong>Hour 2-4:</strong> IT Administrator activates "Litigation Hold" in Magnus (Scope: 'Youth Scholarship').</li>
                                      <li><strong>Day 1:</strong> Outside Counsel issues "Preservation Notice" to all staff.</li>
                                  </ul>
                              </div>
                          )}

                          {/* D&O INSURANCE */}
                          {regulatoryDoc === 'insurance' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">D&O Insurance Alignment Analysis</h1>
                                      <p className="text-gray-500">How Magnus artifacts support insurability and claim defense.</p>
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-900">1. Reducing "Failure of Oversight" Claims</h3>
                                  <p>Insurers look for evidence of systems. The <strong>Escalation Matrix</strong> provides proof that the Board has a structured mechanism for hearing bad news, defending against "Caremark" claims.</p>

                                  <h3 className="text-lg font-bold text-gray-900">2. Coverage Triggers</h3>
                                  <p>Many policies exclude "known circumstances." By using Magnus to document remediation of findings <em>before</em> renewal, you sanitize the risk profile presented to underwriters.</p>
                              </div>
                          )}

                          {/* CERTIFICATION */}
                          {regulatoryDoc === 'certification' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Director Certification Framework</h1>
                                      <p className="text-gray-500">Annual Attestation of Compliance Oversight</p>
                                  </div>
                                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                      <p className="italic text-gray-700 mb-4">
                                          "I hereby certify that I have reviewed the Annual Compliance Summary generated by Magnus. I have had the opportunity to ask questions regarding the 'High Risk' finding in Schedule B, and I am satisfied with the remediation plan presented by management."
                                      </p>
                                      <div className="flex justify-end mt-4">
                                          <button className="bg-magnus-secondary text-white px-4 py-2 rounded text-sm font-bold opacity-50 cursor-not-allowed">
                                              Sign Digitally (Mock)
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* INTERVIEW SCRIPT */}
                          {regulatoryDoc === 'interview' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Regulatory Interview Rehearsal</h1>
                                      <div className="bg-purple-50 border border-purple-200 p-3 rounded text-purple-800 text-xs font-bold">
                                          SCRIPTED DEFENSE - DO NOT IMPROVISE
                                      </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                      <div>
                                          <p className="font-bold text-red-700">Q: "Who decided to reclassify these expenses as 'Program' instead of 'Admin'?"</p>
                                          <p className="bg-green-50 p-3 rounded border border-green-100 text-gray-800 mt-2">
                                              A: "That classification followed our 'Expense Allocation Policy' v4.2. The Magnus system flagged the transaction type, and our CFO reviewed it against the policy criteria. Here is the timestamped approval log." (Stop talking).
                                          </p>
                                      </div>
                                      <div>
                                          <p className="font-bold text-red-700">Q: "Why didn't the Board intervene earlier?"</p>
                                          <p className="bg-green-50 p-3 rounded border border-green-100 text-gray-800 mt-2">
                                              A: "The Board relies on the 'Materiality Thresholds' defined in our charter. This issue was below the $50k threshold for automatic Board notification until Q3, at which point it was immediately placed on the agenda."
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* CRISIS PROTOCOL */}
                          {regulatoryDoc === 'crisis' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Compliance Crisis Communications</h1>
                                      <p className="text-gray-500">Holding Statements for Regulatory Events</p>
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-900">Scenario A: Leak of Investigation</h3>
                                  <div className="bg-gray-100 p-4 rounded italic text-gray-700">
                                      "We are aware of the inquiry from [Agency]. We are cooperating fully. As a matter of policy, we do not comment on ongoing regulatory discussions, but we remain confident in our compliance posture."
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-900 mt-6">Internal Staff Memo</h3>
                                  <div className="bg-gray-100 p-4 rounded italic text-gray-700">
                                      "You may see reports regarding [Issue]. Please refer all external inquiries to Legal. Do not discuss this on Slack or email, as those communications may be subject to discovery."
                                  </div>
                              </div>
                          )}

                          {/* MATURITY SCORECARD */}
                          {regulatoryDoc === 'maturity' && (
                              <div className="space-y-6">
                                  <div className="border-b border-gray-100 pb-4 mb-4">
                                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Governance Maturity Scorecard</h1>
                                      <p className="text-gray-500">Multi-Year Roadmap to "Optimized" State</p>
                                  </div>

                                  <div className="space-y-4">
                                      <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
                                          <div className="w-12 font-bold text-2xl text-gray-400">1</div>
                                          <div>
                                              <h4 className="font-bold text-gray-600">Ad-Hoc</h4>
                                              <p className="text-xs">Compliance is reactive. Relies on heroics of individual staff.</p>
                                          </div>
                                      </div>
                                      <div className="flex items-center p-4 bg-white rounded-lg border-2 border-magnus-secondary shadow-md relative">
                                          <div className="absolute top-2 right-2 bg-magnus-secondary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">CURRENT STATE</div>
                                          <div className="w-12 font-bold text-2xl text-magnus-secondary">2</div>
                                          <div>
                                              <h4 className="font-bold text-gray-900">Defined</h4>
                                              <p className="text-xs text-gray-600">Policies exist. Magnus dashboard deployed. Monthly reviews occur.</p>
                                          </div>
                                      </div>
                                      <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                          <div className="w-12 font-bold text-2xl text-gray-400">3</div>
                                          <div>
                                              <h4 className="font-bold text-gray-900">Managed</h4>
                                              <p className="text-xs text-gray-600">Metrics drive decisions. Risk tolerance is quantified.</p>
                                          </div>
                                      </div>
                                      <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                          <div className="w-12 font-bold text-2xl text-gray-400">4</div>
                                          <div>
                                              <h4 className="font-bold text-gray-900">Optimized</h4>
                                              <p className="text-xs text-gray-600">Continuous auditing. Automated self-correction.</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}

                      </div>
                  </div>
              </div>
          )}

          {/* TAB: REPORTS */}
          {activeTab === 'reports' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-center justify-between">
                          <div>
                              <h3 className="font-bold text-blue-900">Audit Reports</h3>
                              <p className="text-blue-700 text-sm mt-1">Full compliance deep-dives.</p>
                          </div>
                          {!isRegulatorMode && (
                              <button 
                                onClick={() => handleGenerateReport('Audit')}
                                disabled={!!generatingReport}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                {generatingReport === 'Audit' ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Generate'}
                              </button>
                          )}
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl flex items-center justify-between">
                          <div>
                              <h3 className="font-bold text-emerald-900">Forensic Analysis</h3>
                              <p className="text-emerald-700 text-sm mt-1">Transaction-level tracing.</p>
                          </div>
                          {!isRegulatorMode && (
                              <button 
                                onClick={() => handleGenerateReport('Forensic')}
                                disabled={!!generatingReport}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                              >
                                {generatingReport === 'Forensic' ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Generate'}
                              </button>
                          )}
                      </div>
                      <div className="bg-purple-50 border border-purple-100 p-6 rounded-xl flex items-center justify-between">
                          <div>
                              <h3 className="font-bold text-purple-900">Advisory Briefs</h3>
                              <p className="text-purple-700 text-sm mt-1">Executive summaries.</p>
                          </div>
                          {!isRegulatorMode && (
                              <button 
                                onClick={() => handleGenerateReport('Advisory')}
                                disabled={!!generatingReport}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                              >
                                {generatingReport === 'Advisory' ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Generate'}
                              </button>
                          )}
                      </div>
                  </div>

                  <Card title="Repository">
                      <div className="space-y-2">
                          {data.reports.length === 0 && <p className="text-center text-gray-500 py-8">No reports generated yet.</p>}
                          {data.reports.map(report => (
                              <ReportRow key={report.id} report={report} />
                          ))}
                      </div>
                  </Card>
              </div>
          )}

          {/* TAB: ORGS */}
          {activeTab === 'orgs' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <table className="w-full text-left">
                          <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Organization Name</th>
                                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">EIN</th>
                                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Risk Score</th>
                                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {availableOrganizations.map(org => (
                                  <tr key={org.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4">
                                          <div className="font-bold text-gray-900">{org.name}</div>
                                          <div className="text-xs text-gray-500">{org.memberCount} members</div>
                                      </td>
                                      <td className="px-6 py-4 font-mono text-xs text-gray-600">{org.ein}</td>
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-2">
                                              <div className={cn("h-2 w-16 rounded-full overflow-hidden bg-gray-100")}>
                                                  <div className={cn("h-full", org.riskScore > 50 ? "bg-red-500" : "bg-green-500")} style={{width: `${org.riskScore}%`}}></div>
                                              </div>
                                              <span className="text-xs font-bold">{org.riskScore}</span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">{org.status}</span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          {org.id !== currentOrganization.id && (
                                              <button onClick={() => handleOrgSwitch(org.id)} className="text-magnus-secondary hover:underline font-bold text-xs">Switch to Org</button>
                                          )}
                                          {org.id === currentOrganization.id && (
                                              <span className="text-gray-400 text-xs italic">Current</span>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                      {!isRegulatorMode && (
                          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                              <button className="text-gray-500 hover:text-gray-900 text-sm font-medium flex items-center justify-center gap-2">
                                  <Plus className="h-4 w-4" /> Register New Organization
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          )}
          
        </div>

        {/* LIABILITY DISCLAIMER FOOTER */}
        <footer className="bg-gray-50 border-t border-gray-200 p-4 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                CONFIDENTIAL: Authorized Use Only. Magnus Compliance Consulting (MCC) provides data intelligence and control infrastructure. 
                MCC does not provide legal advice or make final compliance determinations. All risk remediation decisions must be approved by the designated human fiduciary.
            </p>
        </footer>
      </main>
    </div>
  );
};

const IS_DEMO = import.meta.env.VITE_APP_MODE === 'demo';

const DemoOnly: React.FC = () => (
    <div className="max-w-2xl mx-auto mt-24 p-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Client Dashboard is not active.</h2>
        <p>This area will be enabled once a production backend is connected.</p>
    </div>
);

const Dashboard: React.FC = () => {
    if (IS_DEMO) {
        return <DemoOnly />;
    }
    return (
        <div className="max-w-2xl mx-auto mt-24 p-8 bg-red-100 border-l-4 border-red-500 text-red-900 rounded shadow text-center">
            <h2 className="text-2xl font-bold mb-4">Dashboard is disabled.</h2>
            <p>Production backend required for dashboard access.</p>
        </div>
    );
};

export default Dashboard;
