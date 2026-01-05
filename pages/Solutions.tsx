import React from 'react';
import { Briefcase, Gavel, Heart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Solutions: React.FC = () => {
  const roles = [
    {
      id: 'executives',
      title: 'For Nonprofit Executives',
      icon: <Briefcase className="h-8 w-8 text-magnus-primary" />,
      description: "Sleep better knowing your organization is audit-ready. We provide dashboards that translate complex compliance data into green/red status lights.",
      benefits: ["Automated 990 review", "Executive compensation benchmarking", "Conflict of interest monitoring"],
      link: "/solutions/executives",
      linkText: "Learn more about solutions for Executives"
    },
    {
      id: 'officers',
      title: 'For Program Officers',
      icon: <Gavel className="h-8 w-8 text-magnus-secondary" />,
      description: "Ensure your grantees are compliant before cutting the check. Streamline your due diligence process with our automated risk reports.",
      benefits: ["Grantee risk scoring", "Expenditure responsibility tracking", "Impact verification"],
      link: "/solutions/program-officers",
      linkText: "Learn more about solutions for Program Officers"
    },
    {
      id: 'board',
      title: 'For Board Members',
      icon: <TrendingUp className="h-8 w-8 text-magnus-accent" />,
      description: "Fulfill your fiduciary duty without getting bogged down in the weeds. Get high-level summaries of governance health and financial stability.",
      benefits: ["Quarterly governance digests", "Fiduciary duty alerts", "Succession planning tools"],
      link: "/contact",
      linkText: "Learn more about solutions for Board Members"
    },
    {
      id: 'donors',
      title: 'For Donors & Watchdogs',
      icon: <Heart className="h-8 w-8 text-pink-500" />,
      description: "Verify before you give. Use our tools to ensure your donation is going to a transparent, well-governed organization.",
      benefits: ["Transparency badges", "Overhead ratio analysis", "Impact-per-dollar metrics"],
      link: "/contact",
      linkText: "Learn more about solutions for Donors"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white pb-16 pt-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-magnus-primary mb-4">Solutions by Role</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
               Compliance looks different depending on where you sit. Tailored intelligence for every stakeholder.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-24">
         <div className="space-y-8">
            {roles.map((role, idx) => (
               <div key={idx} id={role.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="md:flex">
                     <div className="md:w-1/4 bg-gray-50 p-8 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-100">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                           {role.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center">{role.title}</h3>
                     </div>
                     <div className="p-8 md:w-3/4">
                        <p className="text-lg text-gray-600 mb-6">{role.description}</p>
                        <div>
                           <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Key Capabilities</h4>
                           <div className="grid sm:grid-cols-3 gap-4">
                              {role.benefits.map((benefit, bIdx) => (
                                 <div key={bIdx} className="bg-magnus-light text-magnus-primary px-4 py-2 rounded-lg text-sm font-medium">
                                    {benefit}
                                 </div>
                              ))}
                           </div>
                        </div>
                        <div className="mt-8 text-right">
                           <Link to={role.link} className="text-magnus-secondary font-bold hover:text-magnus-primary transition-colors flex items-center justify-end gap-2">
                              {role.linkText} &rarr;
                           </Link>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Solutions;