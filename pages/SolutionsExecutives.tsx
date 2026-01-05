import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, CheckCircle, FileBarChart, ArrowRight, Quote, CheckSquare } from 'lucide-react';

const SolutionsExecutives: React.FC = () => {
  return (
    <div className="bg-white animate-fade-in">
      {/* Hero */}
      <div className="bg-magnus-primary text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-magnus-secondary opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Protect Your Organization<br/>Before Your Next Audit</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
               Proactive compliance intelligence for nonprofit leaders.
            </p>
            <div className="mt-8">
               <Link to="/contact" className="px-8 py-4 bg-magnus-accent text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg inline-block">
                  Get Your Free Compliance Assessment
               </Link>
            </div>
         </div>
      </div>

      {/* Pain Points */}
      <div className="py-16 bg-gray-50">
         <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Is compliance keeping you up at night?</h2>
            <div className="grid md:grid-cols-2 gap-6">
               {[
                  "Worried about IRS scrutiny of Form 990 filings?",
                  "Concerned about donor-advised fund transparency?",
                  "Preparing for major grant applications?",
                  "Facing board questions about governance?"
               ].map((point, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                     <div className="bg-red-50 p-2 rounded-full flex-shrink-0">
                        <ShieldAlert className="h-6 w-6 text-red-500" />
                     </div>
                     <p className="font-medium text-gray-800">{point}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* How Magnus Helps */}
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How Magnus Helps</h2>
            <p className="text-gray-600 mt-4">We turn regulatory data into your competitive advantage.</p>
         </div>
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition-shadow bg-white">
               <div className="w-16 h-16 bg-magnus-secondary/10 text-magnus-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldAlert className="h-8 w-8" />
               </div>
               <h3 className="font-bold text-lg mb-3 text-gray-900">Proactive Risk Identification</h3>
               <p className="text-sm text-gray-600 leading-relaxed">Spot flags before the IRS does using our automated scanning engine.</p>
            </div>
            
            <div className="text-center p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition-shadow bg-white">
               <div className="w-16 h-16 bg-magnus-secondary/10 text-magnus-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileBarChart className="h-8 w-8" />
               </div>
               <h3 className="font-bold text-lg mb-3 text-gray-900">Board-Ready Documentation</h3>
               <p className="text-sm text-gray-600 leading-relaxed">Clear, jargon-free reports designed for non-expert board members.</p>
            </div>
            
            <div className="text-center p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition-shadow bg-white">
               <div className="w-16 h-16 bg-magnus-secondary/10 text-magnus-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8" />
               </div>
               <h3 className="font-bold text-lg mb-3 text-gray-900">Audit Preparation</h3>
               <p className="text-sm text-gray-600 leading-relaxed">Be fully prepared with organized data when the auditors arrive.</p>
            </div>
            
            <div className="text-center p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition-shadow bg-white">
               <div className="w-16 h-16 bg-magnus-secondary/10 text-magnus-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <ArrowRight className="h-8 w-8" />
               </div>
               <h3 className="font-bold text-lg mb-3 text-gray-900">Continuous Monitoring</h3>
               <p className="text-sm text-gray-600 leading-relaxed">Real-time alerts on new risks as they emerge throughout the year.</p>
            </div>
         </div>
      </div>

      {/* Success Story */}
      <div className="bg-magnus-dark py-24 text-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-64 h-64 bg-magnus-secondary opacity-10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
         <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <Quote className="h-12 w-12 text-magnus-secondary mx-auto mb-8 opacity-50" />
            <blockquote className="text-2xl md:text-3xl font-bold italic mb-10 leading-relaxed text-gray-100">
               "Magnus identified $2M in unreported DAF contributions we didn't catch in our audit. It saved us from a potential PR nightmare."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
               <div className="h-12 w-12 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">JS</div>
               <div className="text-left">
                  <div className="font-bold text-white">Jane Smith</div>
                  <div className="text-sm text-magnus-secondary">CFO, Education Nonprofit</div>
               </div>
            </div>
         </div>
      </div>

      {/* CTA */}
      <div id="assessment" className="py-24 text-center bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to secure your organization?</h2>
            <p className="text-gray-600 mb-8 text-lg">Take the first step towards total compliance confidence today.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-magnus-accent text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg">
                Get Your Free Compliance Assessment <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
      </div>
    </div>
  );
};

export default SolutionsExecutives;