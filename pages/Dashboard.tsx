
import React, { useState, useEffect } from 'react';
import { 
  Lock, LayoutDashboard, FileText, AlertTriangle, 
  Settings, LogOut, Download, CheckCircle, Clock, 
  Bell, ChevronRight, Upload, CreditCard 
} from 'lucide-react';
import { getDashboardData, login } from '../services/mockBackend';
import { DashboardData, RiskLevel } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulate login
      await login(email);
      const dashboardData = await getDashboardData();
      setData(dashboardData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
      alert('Login failed. Please use a valid email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setData(null);
    setEmail('');
    setPassword('');
  };

  // Render Risk Gauge
  const renderRiskGauge = (score: number) => {
    const gaugeData = [
      { name: 'Score', value: score },
      { name: 'Remaining', value: 100 - score },
    ];
    const color = score < 30 ? '#10B981' : score < 60 ? '#F59E0B' : '#EF4444';

    return (
      <div className="relative h-48 w-full flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[{ value: 100 }]}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              fill="#F3F4F6"
              stroke="none"
              dataKey="value"
            />
            <Pie
              data={gaugeData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
              stroke="none"
              paddingAngle={0}
            >
              <Cell fill={color} />
              <Cell fill="transparent" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 text-center">
          <div className="text-4xl font-bold text-gray-900">{score}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Risk Score</div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
          <div className="mx-auto h-16 w-16 bg-magnus-light rounded-full flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-magnus-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Portal Access</h2>
          <p className="text-gray-600 mb-8">
            Log in to access your organization's compliance dashboard, full audit reports, and remediation tools.
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none"
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none"
              required
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-magnus-primary text-white py-3 rounded-lg font-bold hover:bg-magnus-dark transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">Logging in...</span>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-sm">
            <a href="#" className="text-magnus-secondary hover:text-magnus-primary font-medium">Forgot password?</a>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
             Protected by Magnus Compliance Engine V12. <br/>256-bit SSL Encryption.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-magnus-dark text-white flex-shrink-0">
        <div className="p-6 border-b border-gray-700">
           <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
              <span className="text-magnus-secondary">MAGNUS</span> PORTAL
           </h1>
           <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-magnus-secondary/20 flex items-center justify-center font-bold text-magnus-secondary border border-magnus-secondary/30">
                 {data.user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                 <div className="text-sm font-bold truncate">{data.user.name}</div>
                 <div className="text-xs text-gray-400 truncate">{data.user.organization}</div>
              </div>
           </div>
        </div>
        <nav className="p-4 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'findings', icon: AlertTriangle, label: 'Findings & Risks' },
            { id: 'reports', icon: FileText, label: 'Reports' },
            { id: 'documents', icon: Upload, label: 'Documents' },
            { id: 'billing', icon: CreditCard, label: 'Billing' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === item.id 
                  ? 'bg-magnus-secondary text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/5 rounded-xl transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
           <h2 className="text-3xl font-bold text-gray-900">
             {activeTab === 'overview' ? 'Compliance Overview' : 
              activeTab === 'findings' ? 'Risk Findings' :
              activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
           </h2>
           <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-magnus-primary transition-colors">
                 <Bell className="h-6 w-6" />
                 <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="text-sm text-gray-500 text-right hidden sm:block">
                 Last updated: <span className="font-medium text-gray-900">Today, 9:41 AM</span>
              </div>
           </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
             {/* Stats Row */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                   <h3 className="text-gray-500 text-sm font-medium mb-4">Overall Risk Score</h3>
                   {renderRiskGauge(data.stats.riskScore)}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                   <div>
                     <h3 className="text-gray-500 text-sm font-medium mb-1">Open Findings</h3>
                     <div className="text-4xl font-bold text-gray-900">{data.stats.openFindings}</div>
                   </div>
                   <div className="mt-4 flex items-center gap-2 text-sm text-red-500 bg-red-50 py-2 px-3 rounded-lg self-start">
                      <AlertTriangle className="h-4 w-4" /> Action Required
                   </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                   <div>
                     <h3 className="text-gray-500 text-sm font-medium mb-1">Resolved Items</h3>
                     <div className="text-4xl font-bold text-gray-900">{data.stats.resolvedFindings}</div>
                   </div>
                   <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 py-2 px-3 rounded-lg self-start">
                      <CheckCircle className="h-4 w-4" /> On Track
                   </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                   <div>
                     <h3 className="text-gray-500 text-sm font-medium mb-1">Next Filing Deadline</h3>
                     <div className="text-2xl font-bold text-gray-900">{data.stats.nextDeadline}</div>
                   </div>
                   <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 py-2 px-3 rounded-lg self-start">
                      <Clock className="h-4 w-4" /> 15 Days Left
                   </div>
                </div>
             </div>

             {/* Alerts & Recent Activity */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                   <h3 className="font-bold text-lg text-gray-900 mb-6">Priority Action Items</h3>
                   <div className="space-y-4">
                      {data.findings.filter(f => f.status !== 'Resolved').map((finding) => (
                        <div key={finding.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                           <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                             finding.severity === RiskLevel.HIGH ? 'bg-red-100 text-red-500' :
                             finding.severity === RiskLevel.MEDIUM ? 'bg-yellow-100 text-yellow-500' : 'bg-green-100 text-green-500'
                           }`}>
                              <AlertTriangle className="h-5 w-5" />
                           </div>
                           <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                 <h4 className="font-bold text-gray-900">{finding.category}</h4>
                                 <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    finding.severity === RiskLevel.HIGH ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                 }`}>{finding.severity}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                           </div>
                           <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                   <h3 className="font-bold text-lg text-gray-900 mb-6">Recent Alerts</h3>
                   <div className="space-y-6 relative before:absolute before:left-2 before:top-8 before:bottom-0 before:w-0.5 before:bg-gray-100">
                      {data.alerts.map((alert) => (
                         <div key={alert.id} className="relative pl-8">
                            <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white ${
                               alert.type === 'critical' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            <p className="text-sm text-gray-800 font-medium">{alert.message}</p>
                            <span className="text-xs text-gray-400">{alert.date}</span>
                         </div>
                      ))}
                   </div>
                   <button className="w-full mt-8 py-2 text-sm text-magnus-primary font-bold hover:bg-magnus-light rounded-lg transition-colors">
                      View All Notifications
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'findings' && (
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
              <table className="w-full">
                 <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</th>
                       <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {data.findings.map((finding) => (
                       <tr key={finding.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                finding.status === 'Open' ? 'bg-red-100 text-red-800' :
                                finding.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                             }`}>
                                {finding.status}
                             </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{finding.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{finding.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                             <span className={`text-xs font-bold ${
                                finding.severity === RiskLevel.HIGH ? 'text-red-600' :
                                finding.severity === RiskLevel.MEDIUM ? 'text-yellow-600' : 'text-green-600'
                             }`}>{finding.severity}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                             <button className="text-magnus-primary hover:text-magnus-secondary">Review</button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {activeTab === 'reports' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {data.reports.map((report) => (
                 <div key={report.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <FileText className="h-8 w-8" />
                       </div>
                       <div className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{report.type}</div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-magnus-primary transition-colors">{report.name}</h3>
                    <p className="text-sm text-gray-500 mb-6">Generated on {report.date}</p>
                    <div className="flex items-center justify-between mt-auto">
                       <span className="text-xs text-gray-400 font-mono">{report.size}</span>
                       <button className="flex items-center gap-2 text-sm font-bold text-magnus-primary hover:text-magnus-secondary">
                          <Download className="h-4 w-4" /> Download
                       </button>
                    </div>
                 </div>
              ))}
              
              {/* Generate New Report Card */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-magnus-secondary hover:bg-blue-50/50 transition-colors cursor-pointer group">
                  <div className="p-3 bg-white text-gray-400 rounded-full mb-4 shadow-sm group-hover:text-magnus-secondary">
                      <LayoutDashboard className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Generate New Report</h3>
                  <p className="text-sm text-gray-500">Run a fresh analysis on current data</p>
              </div>
           </div>
        )}
        
        {/* Placeholder for other tabs */}
        {(activeTab !== 'overview' && activeTab !== 'findings' && activeTab !== 'reports') && (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-gray-100 animate-fade-in">
                <div className="p-6 bg-gray-50 rounded-full mb-4">
                    <Settings className="h-12 w-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Module Under Construction</h3>
                <p className="text-gray-500 max-w-md text-center">
                    The {activeTab} module is currently being integrated with our Tier 2 systems. Check back soon.
                </p>
            </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
