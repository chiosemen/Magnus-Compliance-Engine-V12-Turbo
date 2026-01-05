import React, { useEffect, useState } from 'react';
import { AssessmentResult, RiskLevel } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, AlertCircle, Sparkles, FileText, ArrowRight, Download, Share2, Mail, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { generateRiskSummary } from '../../services/geminiService';

interface ResultsCardProps {
  result: AssessmentResult;
  onReset: () => void;
  onLeadSubmit: (email: string) => Promise<void>;
}

const RiskFactorItem: React.FC<{ factor: any }> = ({ factor }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityConfig: Record<string, any> = {
    [RiskLevel.CRITICAL]: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      icon: <AlertTriangle className="h-5 w-5 text-red-700" />,
      badge: 'bg-red-100 text-red-800',
      bar: 'bg-red-600'
    },
    [RiskLevel.HIGH]: {
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
      badge: 'bg-orange-100 text-orange-800',
      bar: 'bg-orange-500'
    },
    [RiskLevel.MEDIUM]: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-100',
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      badge: 'bg-yellow-100 text-yellow-800',
      bar: 'bg-yellow-500'
    },
    [RiskLevel.LOW]: {
      bg: 'bg-white',
      border: 'border-gray-100',
      icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
      badge: 'bg-emerald-100 text-emerald-800',
      bar: 'bg-emerald-500'
    }
  };

  const config = severityConfig[factor.severity] || severityConfig[RiskLevel.LOW];

  return (
    <div className={`border-b last:border-b-0 border-gray-100 transition-all duration-300 ${isExpanded ? config.bg : 'bg-white hover:bg-gray-50'}`}>
        <div 
            className="p-6 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                    <div className="p-2 bg-white rounded-full border border-gray-100 shadow-sm">
                        {config.icon}
                    </div>
                </div>
                
                <div className="flex-grow">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{factor.category}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.badge}`}>
                            {factor.severity} Impact
                        </span>
                    </div>
                    <p className="text-gray-800 font-medium mb-1">{factor.finding}</p>
                    {!isExpanded && (
                       <p className="text-gray-400 text-sm truncate max-w-md">Click to view details...</p>
                    )}
                </div>

                <div className="mt-2 md:mt-0 flex-shrink-0 md:w-32 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                    <div className="w-full md:text-right">
                        <div className="text-xs text-gray-400 mb-1">Risk Score</div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${config.bar}`} 
                                style={{ width: `${factor.score}%` }}
                            ></div>
                        </div>
                        <div className="text-xs font-mono text-gray-400 mt-1">{factor.score}/100</div>
                    </div>
                    <div>
                         {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                </div>
            </div>
        </div>

        {isExpanded && (
            <div className="px-6 pb-6 md:pl-20">
                <div className="bg-white/80 p-5 rounded-xl border border-gray-200/60 shadow-inner text-sm">
                    <h5 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-xs uppercase tracking-wide">
                        <FileText className="h-4 w-4" />
                        Analysis Details
                    </h5>
                    <p className="text-gray-600 leading-relaxed mb-4 text-base">
                        {factor.details}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100/50">
                         <span className="text-xs font-mono text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                             Ref: IRS-990-PART-VI
                         </span>
                         <span className="text-xs font-mono text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                             Ref: SCH-A-PART-II
                         </span>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const ResultsCard: React.FC<ResultsCardProps> = ({ result, onReset, onLeadSubmit }) => {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAi = async () => {
      setLoadingAi(true);
      const summary = await generateRiskSummary(result);
      setAiSummary(summary);
      setLoadingAi(false);
    };
    fetchAi();
  }, [result]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !emailSubmitted) {
      setIsSubmitting(true);
      await onLeadSubmit(email);
      setIsSubmitting(false);
      setEmailSubmitted(true);
    }
  };

  const score = result.overallRiskScore;
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const getColor = (s: number) => {
    if (s < 30) return '#10B981'; // Emerald 500
    if (s < 60) return '#F59E0B'; // Amber 500
    return '#EF4444'; // Red 500
  };

  const riskColor = getColor(score);

  // Background track data
  const bgData = [{ name: 'Track', value: 100 }];

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-fade-in relative">
        {/* Decorative top accent */}
        <div className={`h-2 w-full ${score > 50 ? 'bg-red-500' : 'bg-green-500'}`} />
        
      <div className="bg-white px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{result.organization.name}</h2>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-500 border border-gray-200">EIN: {result.organization.ein}</span>
            </div>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Analysis Completed • {new Date().toLocaleDateString()}
            </p>
        </div>
        <div className="flex gap-2">
             <button className="p-2 text-gray-400 hover:text-magnus-primary transition-colors" title="Share Report">
                <Share2 className="h-5 w-5" />
             </button>
             <button className="p-2 text-gray-400 hover:text-magnus-primary transition-colors" title="Download PDF">
                <Download className="h-5 w-5" />
             </button>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-gray-50/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Enhanced Chart Section */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
             
             <h3 className="text-gray-500 font-medium uppercase tracking-wider text-xs mb-4">Compliance Risk Score</h3>
             
             <div className="w-64 h-32 relative mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* Background Track */}
                  <Pie
                    data={bgData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={80}
                    outerRadius={100}
                    dataKey="value"
                    stroke="none"
                    fill="#F3F4F6"
                  />
                  {/* Actual Score */}
                  <Pie
                    data={data}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={80}
                    outerRadius={100}
                    dataKey="value"
                    stroke="none"
                    paddingAngle={0}
                  >
                    <Cell key="cell-0" fill={riskColor} className="drop-shadow-lg" />
                    <Cell key="cell-1" fill="transparent" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Score Display in Center Bottom */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                 <span className="text-5xl font-extrabold text-gray-900 leading-none">{score}</span>
                 <span className="text-xs text-gray-400 font-medium mt-1">/ 100</span>
              </div>
            </div>
            
            <div className="text-center mt-4 w-full">
                <div className={`py-2 px-4 rounded-lg text-sm font-bold border ${
                    score < 30 ? 'bg-green-50 border-green-200 text-green-700' :
                    score < 60 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                    'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {score < 30 ? 'Low Risk Profile' : score < 60 ? 'Moderate Risk Detected' : 'High Risk - Action Required'}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                   Based on 50+ weighted factors from IRS Form 990
                </p>
            </div>
          </div>

          {/* Enhanced AI Summary Section */}
          <div className="lg:col-span-8">
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-1 shadow-sm border border-indigo-100 h-full">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-indigo-50">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Magnus AI Executive Summary</h3>
                            <p className="text-xs text-indigo-500 font-medium">Powered by Gemini 1.5 Flash</p>
                        </div>
                    </div>
                    
                    <div className="flex-grow">
                        {loadingAi ? (
                            <div className="space-y-3 animate-pulse py-4">
                                <div className="h-2 bg-indigo-100 rounded w-full"></div>
                                <div className="h-2 bg-indigo-100 rounded w-11/12"></div>
                                <div className="h-2 bg-indigo-100 rounded w-full"></div>
                                <div className="h-2 bg-indigo-100 rounded w-3/4"></div>
                            </div>
                        ) : (
                            <div className="prose prose-indigo prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed text-base">
                                    {aiSummary}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-indigo-50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-2">
                             <div className="text-xs text-gray-500 uppercase tracking-wide">Revenue</div>
                             <div className="font-bold text-gray-900 text-sm">${(result.organization.revenue / 1000000).toFixed(1)}M</div>
                        </div>
                         <div className="bg-gray-50 rounded-lg p-2">
                             <div className="text-xs text-gray-500 uppercase tracking-wide">Assets</div>
                             <div className="font-bold text-gray-900 text-sm">${(result.organization.assets / 1000000).toFixed(1)}M</div>
                        </div>
                         <div className="bg-gray-50 rounded-lg p-2">
                             <div className="text-xs text-gray-500 uppercase tracking-wide">Fiscal Year</div>
                             <div className="font-bold text-gray-900 text-sm">{result.organization.fiscalYear}</div>
                        </div>
                         <div className="bg-gray-50 rounded-lg p-2">
                             <div className="text-xs text-gray-500 uppercase tracking-wide">Severity</div>
                             <div className={`font-bold text-sm ${score > 50 ? 'text-red-600' : 'text-green-600'}`}>
                                {score > 50 ? 'Critical' : 'Normal'}
                             </div>
                        </div>
                    </div>

                    {/* Integrated Lead Gen in Summary Card */}
                    {!emailSubmitted ? (
                        <form onSubmit={handleEmailSubmit} className="mt-6 pt-4 border-t border-indigo-50">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                Get the full forensic report
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-grow relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input 
                                        type="email" 
                                        placeholder="Enter work email..." 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none text-sm"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-magnus-primary text-white font-bold rounded-lg hover:bg-magnus-dark transition-colors text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send Report <ArrowRight className="h-3 w-3" /></>}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-6 pt-4 border-t border-indigo-50">
                            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium border border-green-100 animate-fade-in">
                                <CheckCircle className="h-4 w-4" />
                                Report successfully sent to {email}
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    Detailed Risk Factors
                </h3>
            </div>
            <div className="divide-y divide-gray-100">
                {result.factors.map((factor, idx) => (
                    <RiskFactorItem key={idx} factor={factor} />
                ))}
            </div>
        </div>

        {/* Lead Gen / Email Capture (Bottom Block) */}
        {!emailSubmitted && (
            <div className="mt-8 mb-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full opacity-50 transform translate-x-1/3 -translate-y-1/2 blur-2xl pointer-events-none"></div>
                
                <div className="relative z-10 max-w-lg">
                    <h4 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Mail className="h-5 w-5 text-magnus-primary" />
                        Get the Full 15-Page Audit Report
                    </h4>
                    <p className="text-gray-600">
                        Unlock detailed remediation steps, historical trend analysis, and a board-ready PDF presentation sent directly to your inbox.
                    </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="relative z-10 w-full md:w-auto flex-1 flex flex-col gap-3">
                    <input 
                        type="email" 
                        placeholder="Enter your work email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={emailSubmitted || isSubmitting}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500"
                    />
                    <button 
                        type="submit"
                        disabled={emailSubmitted || isSubmitting}
                        className={`w-full px-6 py-3 font-bold rounded-xl transition-all shadow-md whitespace-nowrap flex items-center justify-center gap-2 ${
                            emailSubmitted 
                            ? 'bg-green-500 text-white cursor-default' 
                            : 'bg-magnus-primary text-white hover:bg-magnus-dark'
                        }`}
                    >
                        {emailSubmitted ? (
                            <>
                                <CheckCircle className="h-5 w-5" />
                                Report Sent
                            </>
                        ) : isSubmitting ? (
                            <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Sending...
                            </>
                        ) : (
                            <>
                                Send me the full report
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center pt-4">
            <button 
                onClick={onReset}
                className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
            >
                ← Check Another Organization
            </button>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                 <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-4 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all">
                    <Download className="h-4 w-4" />
                    Download PDF Brief
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;