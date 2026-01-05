import React from 'react';
import { Shield, Search, FileBarChart, CheckSquare, Activity, GraduationCap, Wrench, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services: React.FC = () => {
  const services = [
    {
      id: "audits",
      title: "Compliance Audits",
      description: "Automated and manual deep-scanning of Form 990 Schedules A, B, O, and R for immediate compliance risks. We verify public support tests and flagging governance gaps.",
      icon: <Shield className="h-8 w-8 text-white" />,
      features: ["Risk Scoring", "Public Support Test Verification", "Lobbying Expenditure Analysis"],
      link: "/services/red-flag-alert",
      linkText: "View Red Flag Alert"
    },
    {
      id: "daf",
      title: "DAF Flow Mapping",
      description: "Specialized analysis of incoming and outgoing Donor Advised Fund transactions to ensure proper categorization and avoid 'tipping' public support status.",
      icon: <Activity className="h-8 w-8 text-white" />,
      features: ["Transaction Categorization", "Flow Visualization", "Origin Traceability"]
    },
    {
      id: "monitoring",
      title: "Ongoing Monitoring",
      description: "Real-time dashboard access that connects to your financial systems to alert you of compliance drift before it becomes a tax issue.",
      icon: <Search className="h-8 w-8 text-white" />,
      features: ["Monthly Alerts", "Vendor Screening", "Grant Reporting Compliance"]
    },
    {
      id: "training",
      title: "Board Training",
      description: "Educational modules designed for fiduciary boards. We simplify complex IRS regulations into actionable governance habits.",
      icon: <GraduationCap className="h-8 w-8 text-white" />,
      features: ["Fiduciary Duty Workshops", "Conflict of Interest Training", "Governance Policy Review"]
    },
    {
      id: "remediation",
      title: "Remediation Consulting",
      description: "Found a problem? Our team helps you fix it. From amending prior year returns to restructuring bylaws, we handle the cleanup.",
      icon: <Wrench className="h-8 w-8 text-white" />,
      features: ["Amended Returns", "Policy Restructuring", "IRS Communication Support"]
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-magnus-primary text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-magnus-secondary rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Services & Expertise</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Comprehensive compliance solutions powered by our Tier 1 Data Engine and Tier 2 Automation.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} id={service.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 flex flex-col">
              <div className="bg-magnus-primary p-6 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-magnus-primary to-magnus-dark opacity-50"></div>
                <div className="relative bg-white/10 p-4 rounded-full backdrop-blur-sm ring-1 ring-white/20">
                  {service.icon}
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6 flex-grow leading-relaxed">{service.description}</p>
                <div className="mb-8">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Key Deliverables</h4>
                  <ul className="space-y-3">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center text-sm text-gray-700">
                        <CheckSquare className="h-4 w-4 text-magnus-secondary mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                {service.link ? (
                    <Link to={service.link} className="w-full py-3 bg-white border-2 border-magnus-primary text-magnus-primary rounded-lg font-bold hover:bg-magnus-primary hover:text-white transition-all flex items-center justify-center gap-2">
                        {service.linkText} <ArrowRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <Link to="/contact" className="w-full py-3 border-2 border-magnus-primary text-center text-magnus-primary rounded-lg font-bold hover:bg-magnus-primary hover:text-white transition-all">
                        Get a Quote
                    </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-magnus-light py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-magnus-primary mb-6">Not sure what you need?</h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                Start with our free automated diagnostic to see where your organization stands today.
            </p>
            <Link to="/contact" className="inline-flex items-center px-8 py-4 bg-magnus-accent text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg">
                Schedule a Consultation
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;