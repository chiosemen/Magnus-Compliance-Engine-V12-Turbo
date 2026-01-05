import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Video, Download, Search, Filter, ArrowRight, Calculator, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Resources: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const tab = location.hash.replace('#', '');
      if (['blog', 'guides', 'tools', 'webinars'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [location]);

  const resources = [
    {
      id: 1,
      type: 'blog',
      category: 'Regulatory Update',
      title: 'New IRS Guidance on DAFs: What You Need to Know',
      description: 'The IRS has released proposed regulations on Donor Advised Funds. Here is how it impacts your public support test.',
      date: 'Oct 12, 2024',
      link: '/resources/blog/irs-daf-guidance'
    },
    {
      id: 2,
      type: 'guide',
      category: 'Executive Guide',
      title: 'The Executive\'s Guide to Form 990 Compliance',
      description: 'A comprehensive 50-point checklist to ensure your board is meeting its fiduciary duties.',
      image: 'book-cover-1',
      link: '/resources/guide/executive-compliance'
    },
    {
      id: 3,
      type: 'tool',
      category: 'Interactive Tool',
      title: 'DAF Reliance Calculator',
      description: 'Instantly calculate your organization\'s reliance on Donor Advised Funds and check for "tipping" risks.',
      icon: <Calculator className="h-8 w-8 text-magnus-secondary" />,
      link: '/resources/tools/daf-calculator'
    },
    {
      id: 4,
      type: 'blog',
      category: 'Sector Analysis',
      title: 'Q3 2024 Nonprofit Sector Trends',
      description: 'Data-driven analysis of 5,000+ Form 990 filings reveals a shift in grantmaking patterns.',
      date: 'Sep 28, 2024',
      link: '/resources/blog/sector-trends'
    },
    {
      id: 5,
      type: 'webinar',
      category: 'Webinar Recording',
      title: 'Navigating DAF Rules in 2024',
      description: 'Watch our recorded session with legal expert Sarah Jenkins on the changing landscape of Donor Advised Funds.',
      duration: '45 min',
      link: '/resources/webinar/daf-rules'
    },
    {
      id: 6,
      type: 'tool',
      category: 'Interactive Tool',
      title: 'Form 990 Quick Check',
      description: 'Our signature AI-powered scanner for immediate red flag detection on your latest filing.',
      icon: <ShieldCheck className="h-8 w-8 text-magnus-accent" />,
      link: '/#quick-check'
    },
    {
      id: 7,
      type: 'blog',
      category: 'Case Study',
      title: 'How One $8M Nonprofit Fixed Their Governance Gap',
      description: 'A deep dive into restructuring bylaws to satisfy IRS requirements without disrupting operations.',
      date: 'Aug 15, 2024',
      link: '/resources/blog/governance-case-study'
    },
     {
      id: 8,
      type: 'guide',
      category: 'Checklist',
      title: 'Nonprofit Governance Self-Assessment',
      description: 'Rate your board\'s performance against best practices in accountability and transparency.',
      image: 'checklist-cover',
      link: '/resources/guide/governance-checklist'
    }
  ];

  const filteredResources = activeTab === 'all' 
    ? resources 
    : resources.filter(r => r.type === activeTab);

  return (
    <div className="bg-gray-50 min-h-screen animate-fade-in">
       {/* Hero */}
       <div className="bg-magnus-primary text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-magnus-secondary opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Knowledge Hub</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Expert insights, tactical guides, and powerful tools to help you navigate the nonprofit regulatory landscape.
          </p>
          
          <div className="mt-8 max-w-xl mx-auto relative">
             <input 
                type="text" 
                placeholder="Search articles, guides, and tools..." 
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-magnus-secondary/50 shadow-lg"
             />
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
           {[
             { id: 'all', label: 'All Resources', icon: null },
             { id: 'blog', label: 'Blog & Insights', icon: <FileText className="h-4 w-4" /> },
             { id: 'guide', label: 'Guides & Checklists', icon: <Download className="h-4 w-4" /> },
             { id: 'tool', label: 'Interactive Tools', icon: <Calculator className="h-4 w-4" /> },
             { id: 'webinar', label: 'Webinars', icon: <Video className="h-4 w-4" /> },
           ].map((tab) => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-magnus-primary text-white shadow-md transform scale-105' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
             >
                {tab.icon}
                {tab.label}
             </button>
           ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
               <div key={resource.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                  {/* Card Header / Image Area */}
                  <div className={`h-48 relative overflow-hidden ${resource.type === 'tool' ? 'bg-magnus-light flex items-center justify-center' : 'bg-gray-200'}`}>
                      {resource.type === 'tool' ? (
                          <div className="transform group-hover:scale-110 transition-transform duration-500">
                             {resource.icon}
                          </div>
                      ) : (
                          <div className="absolute inset-0 bg-magnus-primary/10 group-hover:bg-magnus-primary/20 transition-colors flex items-center justify-center">
                              {resource.type === 'blog' && <FileText className="h-12 w-12 text-gray-400" />}
                              {resource.type === 'guide' && <BookOpen className="h-12 w-12 text-gray-400" />}
                              {resource.type === 'webinar' && <Video className="h-12 w-12 text-gray-400" />}
                          </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide text-magnus-primary shadow-sm">
                          {resource.category}
                      </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-magnus-secondary transition-colors mb-3 line-clamp-2">
                          {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
                          {resource.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                          <span className="text-xs text-gray-400 font-medium">
                              {resource.date || resource.duration || (resource.type === 'guide' ? 'Free Download' : 'Free Tool')}
                          </span>
                          <Link to={resource.link} className="text-magnus-primary font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              {resource.type === 'guide' ? 'Get Guide' : resource.type === 'tool' ? 'Use Tool' : 'Read More'} 
                              <ArrowRight className="h-4 w-4" />
                          </Link>
                      </div>
                  </div>
               </div>
            ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-20 bg-magnus-dark rounded-3xl p-8 md:p-12 relative overflow-hidden text-center">
            <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-4">Stay Compliance Current</h2>
                <p className="text-indigo-200 mb-8">
                    Join 5,000+ nonprofit leaders receiving our weekly regulatory updates and governance tips.
                </p>
                <form className="flex flex-col sm:flex-row gap-4">
                    <input 
                        type="email" 
                        placeholder="Enter your email address" 
                        className="flex-grow px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-magnus-secondary"
                    />
                    <button className="px-8 py-4 bg-magnus-secondary text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-lg whitespace-nowrap">
                        Subscribe Free
                    </button>
                </form>
                <p className="text-xs text-gray-500 mt-4">We respect your inbox. Unsubscribe at any time.</p>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]"></div>
        </div>

      </div>
    </div>
  );
};

export default Resources;