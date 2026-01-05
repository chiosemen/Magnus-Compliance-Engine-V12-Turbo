import React, { useEffect, useState } from 'react';
import { AssessmentResult, RiskLevel } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, AlertCircle, Sparkles, FileText, ArrowRight, Download, Share2, Mail, Loader2 } from 'lucide-react';
import { generateRiskSummary } from '../../services/geminiService';

interface ResultsCardProps {
  result: AssessmentResult;
  onReset: () => void;
  onLeadSubmit: (email: string) => Promise<void>;
}

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
                    <div key={idx} className="p-6 hover:bg-gray-50 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="mt-1 flex-shrink-0">
                                {factor.severity === RiskLevel.HIGH ? (
                                    <div className="p-2 bg-red-100 rounded-full text-red-600">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                ) : factor.severity === RiskLevel.MEDIUM ? (
                                    <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                ) : (
                                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                                        <CheckCircle className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-magnus-primary transition-colors">{factor.category}</h4>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        factor.severity === RiskLevel.HIGH ? 'bg-red-100 text-red-700' :
                                        factor.severity === RiskLevel.MEDIUM ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {factor.severity} Impact
                                    </span>
                                </div>
                                <p className="text-gray-800 font-medium mb-1">{factor.finding}</p>
                                <p className="text-gray-500 text-sm leading-relaxed">{factor.details}</p>
                            </div>
                            <div className="mt-4 md:mt-0 flex-shrink-0 text-right md:w-32">
                                <div className="text-sm text-gray-400 mb-1">Risk Contribution</div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${factor.severity === RiskLevel.HIGH ? 'bg-red-500' : factor.severity === RiskLevel.MEDIUM ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                        style={{ width: `${factor.score}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">{factor.score}/100</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Lead Gen / Email Capture */}
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