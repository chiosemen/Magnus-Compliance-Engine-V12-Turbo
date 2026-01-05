import React from 'react';
import QuickCheckTool from '../components/QuickCheck/QuickCheckTool';
import { CheckCircle, BarChart3, Lock, Zap, ArrowRight, TrendingUp, Shield, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-magnus-primary pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-magnus-secondary/20 text-magnus-secondary text-sm font-semibold mb-6 border border-magnus-secondary/30">
            New: V12 Turbo Engine Live
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Uncover Compliance Risks<br />
            <span className="text-magnus-secondary">Before Regulators Do</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300 mb-10">
            AI-powered analysis of nonprofit Form 990 filings to identify governance gaps, donor-advised fund risks, and regulatory exposure.
          </p>

          <div className="flex justify-center gap-4 mb-12">
             <button 
                onClick={() => scrollToSection('quick-check')}
                className="px-6 py-3 bg-magnus-accent text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg"
             >
                Get Free Compliance Diagnostic
             </button>
             <button 
                onClick={() => scrollToSection('process')}
                className="px-6 py-3 bg-transparent border border-gray-400 text-white font-medium rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
             >
                <PlayCircle className="h-5 w-5" />
                See How It Works
             </button>
          </div>
          
          <QuickCheckTool />
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-magnus-dark border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
            <div className="p-4">
               <div className="text-3xl font-bold text-white mb-1">500+</div>
               <div className="text-gray-400 text-sm uppercase tracking-wide">Nonprofits Analyzed</div>
            </div>
            <div className="p-4">
               <div className="text-3xl font-bold text-magnus-secondary mb-1">40%</div>
               <div className="text-gray-400 text-sm uppercase tracking-wide">Avg. Risk Score Improvement</div>
            </div>
            <div className="p-4">
               <div className="text-3xl font-bold text-white mb-1">$2B+</div>
               <div className="text-gray-400 text-sm uppercase tracking-wide">Grants Managed by Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Process: How it Works */}
      <section id="process" className="py-24 bg-white scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-base text-magnus-secondary font-semibold tracking-wide uppercase">Our Process</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  From raw data to actionable intelligence
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Step 1 */}
                <div className="relative">
                    <div className="bg-blue-50 rounded-2xl p-8 h-full border border-blue-100 relative z-10">
                        <div className="w-12 h-12 bg-magnus-primary text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6 shadow-lg">1</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">ANALYZE</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Upload your EIN. Our AI analyzes 3 years of Form 990 data to generate a comprehensive risk assessment in 48 hours.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Instant Data Ingestion</li>
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 50-Point Inspection</li>
                        </ul>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                     <div className="bg-teal-50 rounded-2xl p-8 h-full border border-teal-100 relative z-10">
                        <div className="w-12 h-12 bg-magnus-secondary text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6 shadow-lg">2</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">REMEDIATE</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Expert review of findings leads to a prioritized action plan and board-ready recommendations.
                        </p>
                         <ul className="space-y-2 text-sm text-gray-500">
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Policy Restructuring</li>
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Amendment Preparation</li>
                        </ul>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                     <div className="bg-orange-50 rounded-2xl p-8 h-full border border-orange-100 relative z-10">
                        <div className="w-12 h-12 bg-magnus-accent text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6 shadow-lg">3</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">MONITOR</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Ongoing dashboard access provides automated alerts and quarterly compliance check-ins.
                        </p>
                         <ul className="space-y-2 text-sm text-gray-500">
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Real-time Risk Scoring</li>
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Vendor Screening</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Trusted by Leaders in Philanthropy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map(i => <div key={i} className="text-yellow-400">★</div>)}
                    </div>
                    <blockquote className="text-gray-700 text-lg italic mb-6">
                        "Magnus identified $2M in unreported DAF contributions we didn't catch in our audit."
                    </blockquote>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">JS</div>
                        <div>
                            <div className="font-bold text-gray-900">Jane Smith</div>
                            <div className="text-sm text-gray-500">CFO, Education Nonprofit ($15M budget)</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map(i => <div key={i} className="text-yellow-400">★</div>)}
                    </div>
                    <blockquote className="text-gray-700 text-lg italic mb-6">
                        "The compliance dashboard saved our foundation from funding an organization with serious governance gaps."
                    </blockquote>
                    <div className="flex items-center gap-4">
                         <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">MK</div>
                        <div>
                            <div className="font-bold text-gray-900">Michael Key</div>
                            <div className="text-sm text-gray-500">Program Officer, National Foundation</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Case Studies / Insights */}
      <section id="insights" className="py-24 bg-white scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex justify-between items-end mb-12">
                 <div>
                    <h2 className="text-3xl font-bold text-gray-900">Latest Insights</h2>
                    <p className="text-gray-600 mt-2">Real-world examples of compliance wins.</p>
                 </div>
                 <Link to="/resources" className="text-magnus-primary font-bold hover:text-magnus-secondary flex items-center gap-1">
                    View all resources <ArrowRight className="h-4 w-4" />
                 </Link>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <Link to="/resources#cases" className="group block">
                    <div className="bg-gray-100 rounded-xl h-48 mb-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-magnus-primary/10 group-hover:bg-magnus-primary/20 transition-colors"></div>
                        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide text-magnus-primary">Case Study</div>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-magnus-secondary transition-colors mb-2">
                        How One $8M Nonprofit Fixed Their Governance Gap
                    </h3>
                    <p className="text-gray-600 text-sm">A deep dive into restructuring bylaws to satisfy IRS requirements.</p>
                 </Link>

                 <Link to="/resources#cases" className="group block">
                    <div className="bg-gray-100 rounded-xl h-48 mb-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-magnus-primary/10 group-hover:bg-magnus-primary/20 transition-colors"></div>
                        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide text-magnus-primary">Case Study</div>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-magnus-secondary transition-colors mb-2">
                        Foundation Saves $500K Grant Through Due Diligence
                    </h3>
                    <p className="text-gray-600 text-sm">Preventing funds from going to a non-compliant grantee.</p>
                 </Link>

                 <Link to="/resources#blog" className="group block">
                    <div className="bg-gray-100 rounded-xl h-48 mb-4 relative overflow-hidden">
                         <div className="absolute inset-0 bg-magnus-primary/10 group-hover:bg-magnus-primary/20 transition-colors"></div>
                        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide text-magnus-secondary">Article</div>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-magnus-secondary transition-colors mb-2">
                        The Hidden Risks of Donor-Advised Fund Reliance
                    </h3>
                    <p className="text-gray-600 text-sm">Understanding the "tipping" problem in public support tests.</p>
                 </Link>
             </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-magnus-primary py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to secure your nonprofit?</h2>
              <p className="text-indigo-100 mb-8 text-lg">Join 500+ organizations using Magnus to stay compliant and confident.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => scrollToSection('quick-check')} className="px-8 py-4 bg-magnus-accent text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg">
                      Get Free Compliance Diagnostic
                  </button>
                  <Link to="/contact" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-magnus-primary transition-colors">
                      Contact Sales
                  </Link>
              </div>
          </div>
      </section>
    </div>
  );
};

export default Home;