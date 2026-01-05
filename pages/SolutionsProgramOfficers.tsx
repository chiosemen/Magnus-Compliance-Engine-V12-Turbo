import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ListChecks, TrendingUp, AlertTriangle, ArrowRight, Check } from 'lucide-react';

const SolutionsProgramOfficers: React.FC = () => {
  return (
    <div className="bg-white animate-fade-in">
       {/* Hero */}
      <div className="bg-magnus-primary text-white py-20 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-magnus-secondary opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Vet Grantees Before You Fund,<br/>Not After</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
               Automated due diligence for high-volume grant portfolios.
            </p>
         </div>
      </div>

      {/* The Challenge */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="bg-orange-50 rounded-2xl p-8 border border-orange-100 flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3 text-center">
               <AlertTriangle className="h-24 w-24 text-orange-500 mx-auto" />
            </div>
            <div className="md:w-2/3">
               <h2 className="text-2xl font-bold text-gray-900 mb-4">The Challenge</h2>
               <p className="text-lg text-gray-700 leading-relaxed">
                  You're responsible for millions in grants, but conducting thorough due diligence on 50+ grantees is impossible with limited staff and time. Manual review of Form 990s is slow, error-prone, and often happens too late in the cycle.
               </p>
            </div>
         </div>
      </div>

      {/* The Solution */}
      <div className="py-16 bg-gray-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-gray-900">The Solution</h2>
               <p className="text-gray-600 mt-2">Magnus provides automated compliance screening for your entire grantee portfolio.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <ListChecks className="h-10 w-10 text-magnus-secondary mb-4" />
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Bulk Analysis</h3>
                  <p className="text-sm text-gray-600">Bulk Form 990 analysis for all active grantees instantly.</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <AlertTriangle className="h-10 w-10 text-magnus-secondary mb-4" />
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Red Flag Alerts</h3>
                  <p className="text-sm text-gray-600">Automatic notifications for organizations with elevated risk profiles.</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <TrendingUp className="h-10 w-10 text-magnus-secondary mb-4" />
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Portfolio Dashboard</h3>
                  <p className="text-sm text-gray-600">Comparative risk dashboard across your entire portfolio.</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <Search className="h-10 w-10 text-magnus-secondary mb-4" />
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Due Diligence Reports</h3>
                  <p className="text-sm text-gray-600">Downloadable PDF reports ready for board approval packages.</p>
               </div>
            </div>
         </div>
      </div>

      {/* Pricing / Packages */}
      <div className="py-20 max-w-4xl mx-auto px-4">
         <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Portfolio Screening Packages</h2>
         <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-8 md:p-12">
               <ul className="space-y-6">
                  <li className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-6">
                     <span className="font-medium text-gray-900 flex items-center gap-3 text-lg">
                        <Check className="h-6 w-6 text-green-500 flex-shrink-0" /> Up to 25 organizations
                     </span>
                     <span className="font-bold text-3xl text-magnus-primary mt-2 sm:mt-0">$12,500</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-6">
                     <span className="font-medium text-gray-900 flex items-center gap-3 text-lg">
                        <Check className="h-6 w-6 text-green-500 flex-shrink-0" /> Up to 50 organizations
                     </span>
                     <span className="font-bold text-3xl text-magnus-primary mt-2 sm:mt-0">$22,500</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-6">
                     <span className="font-medium text-gray-900 flex items-center gap-3 text-lg">
                        <Check className="h-6 w-6 text-green-500 flex-shrink-0" /> Up to 100 organizations
                     </span>
                     <span className="font-bold text-3xl text-magnus-primary mt-2 sm:mt-0">$40,000</span>
                  </li>
                   <li className="flex flex-col sm:flex-row sm:items-center justify-between pt-2">
                     <span className="font-medium text-gray-900 flex items-center gap-3 text-lg">
                        <Check className="h-6 w-6 text-green-500 flex-shrink-0" /> Ongoing monitoring
                     </span>
                     <span className="font-bold text-2xl text-gray-500 mt-2 sm:mt-0">Custom Pricing</span>
                  </li>
               </ul>
            </div>
            <div className="bg-gray-50 p-8 text-center border-t border-gray-100">
               <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-magnus-primary text-white font-bold rounded-lg hover:bg-magnus-dark transition-colors shadow-lg">
                  Schedule Portfolio Review <ArrowRight className="h-5 w-5" />
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
};
export default SolutionsProgramOfficers;