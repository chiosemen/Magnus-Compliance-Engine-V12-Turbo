import React from 'react';
import { Check, ArrowRight, Shield, Zap, BookOpen, Users, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PricingItem {
  title: string;
  price: string;
  period: string;
  features: string[];
  link: string;
  cta: string;
  savings?: string;
  highlight?: boolean;
}

// Helper component for rendering a pricing card
const PricingCard: React.FC<{ item: PricingItem; highlight?: boolean }> = ({ item, highlight = false }) => (
  <div className={`bg-white rounded-2xl shadow-lg border ${highlight ? 'border-magnus-secondary ring-1 ring-magnus-secondary' : 'border-gray-100'} p-8 flex flex-col h-full hover:shadow-xl transition-shadow`}>
    {highlight && (
      <div className="text-magnus-secondary font-bold text-xs uppercase tracking-wide mb-2">
          Best Value
      </div>
    )}
    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
    <div className="mb-4">
      <span className="text-3xl font-extrabold text-gray-900">{item.price}</span>
      {item.period && <span className="text-gray-500 text-sm ml-2">{item.period}</span>}
      {item.savings && <div className="text-green-600 text-xs font-bold mt-1">{item.savings}</div>}
    </div>
    
    <ul className="space-y-3 mb-8 flex-grow">
      {item.features.map((feature: string, idx: number) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
          <Check className="h-5 w-5 text-magnus-secondary flex-shrink-0" />
          {feature}
        </li>
      ))}
    </ul>

    <Link 
      to={item.link} 
      className={`w-full py-3 rounded-lg font-bold text-center transition-colors ${
          highlight 
          ? 'bg-magnus-primary text-white hover:bg-magnus-dark' 
          : 'bg-white border-2 border-magnus-primary text-magnus-primary hover:bg-magnus-light'
      }`}
    >
      {item.cta}
    </Link>
  </div>
);

const Pricing: React.FC = () => {
  // Define data structures for each section
  const diagnosticServices: PricingItem[] = [
    {
      title: "Red Flag Compliance Alert",
      price: "$3,500",
      period: "48-hour turnaround",
      features: [
         "Analysis of 3 years of Form 990s",
         "Governance structure review",
         "Donor reporting analysis",
         "Executive briefing document"
      ],
      link: "/services/red-flag-alert",
      cta: "View Sample Report"
    },
    {
      title: "Quick Compliance Check",
      price: "$1,500",
      period: "24-hour turnaround",
      features: [
        "Automated Tier 1 risk scan",
        "Basic public support test check",
        "Key red flag summary"
      ],
      link: "/contact",
      cta: "Get Started"
    }
  ];

  const auditServices: PricingItem[] = [
    {
      title: "Comprehensive Compliance Audit",
      price: "$15,000 - $25,000",
      period: "2-3 week engagement",
      features: [
        "Deep-dive into all schedules (A, B, D, F, I, J, L, O, R)",
        "Internal policy review",
        "Interview with key staff",
        "Full remediation roadmap"
      ],
      link: "/contact",
      cta: "Schedule Scoping Call"
    },
    {
      title: "Governance Remediation Package",
      price: "$8,000 - $12,000",
      period: "Custom engagement",
      features: [
        "Bylaws update & restructuring",
        "Conflict of interest policy implementation",
        "Whistleblower & document retention policies",
        "Board resolution drafting"
      ],
      link: "/contact",
      cta: "Get Remediation Help"
    }
  ];

  const monitoringServices: PricingItem[] = [
    {
      title: "Compliance Dashboard (Annual)",
      price: "$30,000",
      period: "/year",
      savings: "Save $12,000 vs monthly",
      features: [
        "Real-time financial system integration",
        "Monthly risk alerts",
        "Vendor screening",
        "Quarterly expert review call"
      ],
      link: "/contact",
      cta: "View Demo",
      highlight: true
    },
    {
      title: "Compliance Dashboard (Monthly)",
      price: "$3,500",
      period: "/month",
      features: [
        "Real-time financial system integration",
        "Monthly risk alerts",
        "Vendor screening",
        "Cancel anytime"
      ],
      link: "/contact",
      cta: "View Demo"
    }
  ];

  const trainingServices: PricingItem[] = [
    {
      title: "Board Compliance Training",
      price: "$5,000",
      period: "/day",
      features: [
        "Virtual or in-person delivery",
        "Fiduciary duty deep-dive",
        "Customized to your bylaws",
        "Q&A with legal experts"
      ],
      link: "/contact",
      cta: "See Sample Agenda"
    },
    {
      title: "Executive Team Workshop",
      price: "$3,500",
      period: "/half-day",
      features: [
        "Up to 12 participants",
        "Operational compliance tactics",
        "Form 990 preparation strategy",
        "Grant reporting best practices"
      ],
      link: "/contact",
      cta: "Book Workshop"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen animate-fade-in">
        <div className="bg-magnus-primary text-white py-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-magnus-secondary opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Transparent Pricing</h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                    Invest in peace of mind. No hidden fees, just clear deliverables.
                </p>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
            
            {/* Diagnostic Services */}
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-100 rounded-xl text-magnus-primary">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Diagnostic Services</h2>
                        <p className="text-gray-600">Fast, affordable snapshots of your compliance health.</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {diagnosticServices.map((item, i) => <PricingCard key={i} item={item} />)}
                </div>
            </section>

             {/* Audit & Remediation */}
             <section>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-teal-100 rounded-xl text-magnus-secondary">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Full Audit & Remediation</h2>
                        <p className="text-gray-600">Deep-dive engagements to fix structural issues.</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {auditServices.map((item, i) => <PricingCard key={i} item={item} />)}
                </div>
            </section>

             {/* Ongoing Monitoring */}
             <section>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-orange-100 rounded-xl text-magnus-accent">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Ongoing Monitoring</h2>
                        <p className="text-gray-600">Protect your status year-round with our dashboard.</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {monitoringServices.map((item, i) => <PricingCard key={i} item={item} highlight={item.highlight} />)}
                </div>
            </section>

             {/* Training */}
             <section>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Training & Workshops</h2>
                        <p className="text-gray-600">Empower your team and board with knowledge.</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {trainingServices.map((item, i) => <PricingCard key={i} item={item} />)}
                </div>
            </section>

            {/* Foundation Services Banner */}
            <section className="bg-magnus-dark rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wide mb-4 text-magnus-secondary">
                            For Foundations
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Grantee Portfolio Screening</h2>
                        <p className="text-indigo-200 max-w-xl">
                            Automated due diligence for your entire grantee portfolio. Custom pricing based on the number of organizations screened.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                         <Link to="/solutions/program-officers" className="inline-flex items-center gap-2 px-8 py-4 bg-magnus-secondary text-white font-bold rounded-lg hover:bg-teal-600 transition-colors shadow-lg">
                            Get Custom Quote <ArrowRight className="h-5 w-5" />
                         </Link>
                    </div>
                 </div>
                 {/* Decorative */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-magnus-secondary opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            </section>

            {/* Custom Scoping */}
            <div className="text-center pb-8">
                 <p className="text-gray-600">
                    Need a custom solution for a merger, acquisition, or complex organizational structure? <br />
                    <Link to="/contact" className="text-magnus-primary font-bold hover:text-magnus-secondary underline decoration-2 underline-offset-4">
                        Contact us for custom scoping
                    </Link>
                 </p>
            </div>

        </div>
    </div>
  );
};

export default Pricing;