import React from 'react';
import { ShieldCheck, Mail, Phone, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-magnus-primary text-white pt-16 pb-8 border-t border-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
               <ShieldCheck className="h-8 w-8 text-magnus-secondary" />
               <span className="font-bold text-xl tracking-tight">MAGNUS</span>
            </div>
            <p className="text-indigo-200 text-sm leading-relaxed">
              The AI-powered standard for nonprofit compliance. We turn complex regulatory data into clear, actionable intelligence for boards, executives, and donors.
            </p>
          </div>
          
          {/* Solutions */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-magnus-secondary mb-4">Solutions</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/services#audits" className="hover:text-white transition-colors">Compliance Audits</Link></li>
              <li><Link to="/services#daf" className="hover:text-white transition-colors">DAF Flow Mapping</Link></li>
              <li><Link to="/solutions/executives" className="hover:text-white transition-colors">For Executives</Link></li>
              <li><Link to="/solutions#board" className="hover:text-white transition-colors">For Boards</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-magnus-secondary mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/resources#blog" className="hover:text-white transition-colors">Compliance Blog</Link></li>
              <li><Link to="/resources#cases" className="hover:text-white transition-colors">Case Studies</Link></li>
              <li><Link to="/resources#guides" className="hover:text-white transition-colors">Webinar Library</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Form 990 Checker</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-magnus-secondary mb-4">Contact</h3>
            <div className="space-y-3 text-sm text-gray-300 mb-6">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@magnus.tech</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (555) 019-2834</div>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="bg-indigo-900/50 p-2 rounded-full hover:bg-magnus-secondary transition-colors"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="bg-indigo-900/50 p-2 rounded-full hover:bg-magnus-secondary transition-colors"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-indigo-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-indigo-300">
          <p>&copy; {new Date().getFullYear()} Magnus Compliance Engine. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
             <a href="#" className="hover:text-white">Privacy Policy</a>
             <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;