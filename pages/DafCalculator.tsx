import React, { useState } from 'react';
import { Calculator, Info, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const DafCalculator: React.FC = () => {
  const [revenue, setRevenue] = useState<string>('');
  const [dafContributions, setDafContributions] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const calculateRisk = () => {
    const rev = parseFloat(revenue.replace(/,/g, ''));
    const daf = parseFloat(dafContributions.replace(/,/g, ''));

    if (isNaN(rev) || isNaN(daf) || rev === 0) return;

    const percentage = (daf / rev) * 100;
    setResult(percentage);
  };

  const getRiskLevel = (percentage: number) => {
    if (percentage > 50) return { level: 'High', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, desc: 'Your organization is highly reliant on DAFs. This may "tip" your public support test if these funds come from a limited number of sponsoring organizations.' };
    if (percentage > 20) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle, desc: 'Significant DAF revenue detected. Ensure you are tracking the underlying donors where possible for proper Schedule A reporting.' };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, desc: 'Your DAF reliance appears within healthy diversification limits.' };
  };

  const formatCurrency = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRevenue(formatCurrency(e.target.value));
  };

  const handleDafChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDafContributions(formatCurrency(e.target.value));
  };

  const reset = () => {
      setRevenue('');
      setDafContributions('');
      setResult(null);
  }

  return (
    <div className="bg-gray-50 min-h-screen animate-fade-in pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/resources" className="hover:text-magnus-primary">Resources</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">DAF Calculator</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-magnus-light p-3 rounded-xl text-magnus-primary">
                        <Calculator className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">DAF Reliance Calculator</h1>
                </div>
                <p className="text-gray-600 mb-8 text-sm">
                    Donor Advised Funds (DAFs) are growing in popularity, but over-reliance can jeopardize your "publicly supported" status under IRS 509(a)(1).
                </p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Total Public Support (Line 1)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input 
                                type="text" 
                                value={revenue}
                                onChange={handleRevenueChange}
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none font-mono text-lg"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">From Part VIII, Line 1h of your Form 990</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Total DAF Contributions</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input 
                                type="text" 
                                value={dafContributions}
                                onChange={handleDafChange}
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none font-mono text-lg"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Aggregate contributions from sponsoring orgs (e.g., Fidelity, Schwab)</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            onClick={calculateRisk}
                            className="flex-grow py-3 bg-magnus-primary text-white font-bold rounded-xl hover:bg-magnus-dark transition-colors shadow-md"
                        >
                            Calculate Risk
                        </button>
                        <button 
                            onClick={reset}
                            className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            <RotateCcw className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Result Section */}
            <div className={`rounded-2xl shadow-lg border p-8 transition-all duration-500 ${result !== null ? 'bg-white border-gray-100 opacity-100 translate-y-0' : 'bg-gray-50 border-transparent opacity-50 translate-y-4'}`}>
                {result !== null ? (
                    <div>
                         <h3 className="text-gray-500 font-medium uppercase tracking-wider text-xs mb-2">Analysis Result</h3>
                         <div className="flex items-baseline gap-2 mb-6">
                             <span className="text-5xl font-extrabold text-gray-900">{result.toFixed(1)}%</span>
                             <span className="text-gray-600 font-medium">Reliance</span>
                         </div>
                         
                         {(() => {
                             const analysis = getRiskLevel(result);
                             const Icon = analysis.icon;
                             return (
                                 <div className={`p-6 rounded-xl border ${analysis.bg} ${analysis.border}`}>
                                     <div className="flex items-center gap-3 mb-3">
                                         <Icon className={`h-6 w-6 ${analysis.color}`} />
                                         <h4 className={`text-xl font-bold ${analysis.color}`}>{analysis.level} Risk Level</h4>
                                     </div>
                                     <p className="text-gray-800 leading-relaxed">
                                         {analysis.desc}
                                     </p>
                                 </div>
                             );
                         })()}

                         <div className="mt-8 border-t border-gray-100 pt-6">
                             <h4 className="font-bold text-gray-900 mb-2">Recommendations</h4>
                             <ul className="space-y-3 text-sm text-gray-600">
                                 <li className="flex items-start gap-2">
                                     <div className="mt-1 h-1.5 w-1.5 rounded-full bg-magnus-secondary flex-shrink-0"></div>
                                     Request grant letters from DAF sponsors confirming no goods/services provided.
                                 </li>
                                 <li className="flex items-start gap-2">
                                     <div className="mt-1 h-1.5 w-1.5 rounded-full bg-magnus-secondary flex-shrink-0"></div>
                                     Diversify revenue streams to reduce single-source dependency.
                                 </li>
                             </ul>
                         </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                        <Calculator className="h-16 w-16 mb-4 opacity-20" />
                        <p>Enter your financial data to see the risk analysis.</p>
                    </div>
                )}
            </div>
        </div>
        
        {/* Info Section */}
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
             <Info className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
             <div>
                 <h4 className="font-bold text-blue-900 mb-1">Why does this matter?</h4>
                 <p className="text-blue-800 text-sm leading-relaxed">
                     The IRS "public support test" generally requires that a substantial part of your support comes from the general public. 
                     Large donations from a single source (like a DAF) can sometimes be excluded from the "public" portion of this calculation, 
                     potentially tipping you into "Private Foundation" status, which carries stricter rules and taxes.
                 </p>
             </div>
        </div>

      </div>
    </div>
  );
};

export default DafCalculator;