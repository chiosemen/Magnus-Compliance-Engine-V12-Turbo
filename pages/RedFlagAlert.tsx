import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Clock, CheckCircle, Download, ArrowRight, ShieldAlert } from 'lucide-react';

const RedFlagAlert: React.FC = () => {
  return (
    <div className="bg-white animate-fade-in">
      {/* Hero */}
      <div className="bg-magnus-primary text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-magnus-secondary opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-magnus-secondary/20 border border-magnus-secondary/30 rounded-full px-4 py-1 mb-6 text-magnus-secondary font-semibold text-sm">
            <ShieldAlert className="h-4 w-4" />
            Executive Compliance Briefing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Red Flag Alert</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Identify critical compliance risks in your Form 990 filings, governance structure, and donor reporting before they become liabilities.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column: What it is & Who it's for */}
            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <FileText className="h-6 w-6 text-magnus-secondary" />
                        What It Is
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        A 2-3 page executive briefing identifying compliance risks in your Form 990 filings, governance structure, and donor reporting. This isn't just a data dump—it's a strategic document designed for decision-makers.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <Users className="h-6 w-6 text-magnus-secondary" />
                        Who It's For
                    </h2>
                    <ul className="space-y-4">
                        {[
                            "Nonprofit executives preparing for audits",
                            "Foundation program officers conducting due diligence",
                            "Board members overseeing governance",
                            "Major donors evaluating grant recipients"
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-gray-700">
                                <span className="mt-1.5 h-2 w-2 rounded-full bg-magnus-accent flex-shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* Right Column: Pricing & Delivery Card */}
            <div>
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-lg sticky top-24">
                    <div className="flex items-center gap-2 text-magnus-primary font-bold mb-6">
                        <Clock className="h-5 w-5" />
                        <span className="uppercase tracking-wide text-sm">Turnaround Time: 48-72 Hours</span>
                    </div>
                    
                    <div className="mb-8 border-b border-gray-200 pb-8">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-gray-900">$3,500</span>
                            <span className="text-gray-500 font-medium">/ report</span>
                        </div>
                        <p className="text-green-600 mt-2 text-sm font-medium flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Credited toward full audit if engaged within 30 days
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link to="/contact" className="block w-full text-center py-4 bg-magnus-accent text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-md">
                            Schedule Free Consultation
                        </Link>
                        <button className="block w-full text-center py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-magnus-primary hover:text-magnus-primary transition-colors flex items-center justify-center gap-2 group">
                            <Download className="h-4 w-4 group-hover:text-magnus-primary" />
                            Download Sample Report
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* What's Included Section */}
        <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What's Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    "Analysis of 3 years of Form 990 filings",
                    "DAF flow mapping and donor concentration analysis",
                    "Governance and accountability assessment",
                    "Revenue recognition and reporting review",
                    "Prioritized remediation recommendations",
                    "30-minute debrief call with compliance expert"
                ].map((feature, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-800 leading-snug">{feature}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 bg-magnus-dark rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-6">Ready to mitigate your risk?</h2>
                <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-magnus-primary font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-xl">
                    Get Started Now <ArrowRight className="h-5 w-5" />
                </Link>
            </div>
            {/* Background decorative elements */}
             <div className="absolute top-0 left-0 w-64 h-64 bg-magnus-secondary opacity-10 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-magnus-accent opacity-10 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default RedFlagAlert;