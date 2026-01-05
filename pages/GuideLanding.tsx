import React, { useState } from 'react';
import { Download, CheckCircle, Shield, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const GuideLanding: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="bg-white min-h-screen animate-fade-in pt-20">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Column: Copy */}
              <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
                      <Download className="h-4 w-4" />
                      Free Resource
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                      The Executive's Guide to Form 990 Compliance
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                      Stop worrying about your annual filing. This 50-point checklist reveals exactly what the IRS—and your major donors—are looking for.
                  </p>
                  
                  <div className="space-y-4 mb-10">
                      {[
                          "Common triggers for automatic IRS audits",
                          "How to properly report executive compensation",
                          "Governance policies you must have in place",
                          "Checklist for board meeting minutes"
                      ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                              <CheckCircle className="h-6 w-6 text-magnus-secondary flex-shrink-0" />
                              <span className="text-gray-800 font-medium">{item}</span>
                          </div>
                      ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-6">
                      <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          PDF Format
                      </div>
                      <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          Updated for 2024
                      </div>
                  </div>
              </div>

              {/* Right Column: Form & Visual */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-xl relative overflow-hidden">
                   {/* Decorative Blob */}
                   <div className="absolute -top-20 -right-20 w-64 h-64 bg-magnus-secondary opacity-10 rounded-full blur-3xl"></div>
                   
                   <div className="relative z-10 text-center">
                       <img 
                            src="https://placehold.co/400x500/0A2E4E/ffffff?text=Executive+Guide+2024" 
                            alt="Guide Cover" 
                            className="w-48 mx-auto mb-8 shadow-2xl rounded-lg transform -rotate-2 border-4 border-white"
                       />
                       
                       {!isSubmitted ? (
                           <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm text-left">
                               <h3 className="font-bold text-gray-900 mb-4 text-lg">Get your copy now</h3>
                               <div className="space-y-4">
                                   <div>
                                       <label className="block text-sm font-bold text-gray-700 mb-1">Work Email Address</label>
                                       <input 
                                            type="email" 
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none"
                                            placeholder="name@organization.org"
                                       />
                                   </div>
                                   <button className="w-full py-4 bg-magnus-primary text-white font-bold rounded-lg hover:bg-magnus-dark transition-colors shadow-lg">
                                       Download PDF Guide
                                   </button>
                                   <p className="text-xs text-gray-400 text-center">
                                       By downloading, you agree to receive our weekly compliance tips.
                                   </p>
                               </div>
                           </form>
                       ) : (
                           <div className="bg-green-50 p-8 rounded-xl border border-green-100">
                               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <CheckCircle className="h-8 w-8" />
                               </div>
                               <h3 className="text-2xl font-bold text-green-800 mb-2">Check your inbox!</h3>
                               <p className="text-green-700">
                                   We've sent the guide to <strong>{email}</strong>.
                               </p>
                               <Link to="/resources" className="mt-6 inline-block text-green-800 font-bold underline hover:text-green-900">
                                   Back to Resources
                               </Link>
                           </div>
                       )}
                   </div>
              </div>

          </div>
       </div>
    </div>
  );
};

export default GuideLanding;