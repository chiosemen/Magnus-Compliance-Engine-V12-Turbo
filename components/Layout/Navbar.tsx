import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck, ChevronDown } from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  children?: { name: string; path: string }[];
}

const navigation: NavItem[] = [
  { 
    name: 'About', 
    path: '/about',
    children: [
      { name: 'Our Approach', path: '/about#approach' },
      { name: 'Team', path: '/about#team' },
      { name: 'Why Magnus', path: '/about#why-magnus' }
    ]
  },
  {
    name: 'Services',
    path: '/services',
    children: [
      { name: 'Red Flag Alert', path: '/services/red-flag-alert' },
      { name: 'Compliance Audits', path: '/services#audits' },
      { name: 'DAF Flow Mapping', path: '/services#daf' },
      { name: 'Ongoing Monitoring', path: '/services#monitoring' },
      { name: 'Board Training', path: '/services#training' },
      { name: 'Remediation', path: '/services#remediation' }
    ]
  },
  {
    name: 'Solutions',
    path: '/solutions',
    children: [
      { name: 'For Executives', path: '/solutions/executives' },
      { name: 'For Program Officers', path: '/solutions/program-officers' },
      { name: 'For Board Members', path: '/solutions#board' },
      { name: 'For Donors', path: '/solutions#donors' }
    ]
  },
  {
    name: 'Resources',
    path: '/resources',
    children: [
      { name: 'Blog & Insights', path: '/resources#blog' },
      { name: 'Interactive Tools', path: '/resources#tool' },
      { name: 'Compliance Guides', path: '/resources#guide' },
      { name: 'Webinars', path: '/resources#webinar' }
    ]
  },
  { name: 'Pricing', path: '/pricing' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Refs for click outside detection
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleMouseEnter = (name: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Handle ESC key to close menu
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" onClick={scrollToTop} className="flex-shrink-0 flex items-center gap-2 group">
              <ShieldCheck className="h-9 w-9 text-magnus-secondary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-2xl text-magnus-primary tracking-tight">MAGNUS<span className="text-magnus-secondary">COMPLIANCE</span></span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link to="/" onClick={scrollToTop} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-magnus-primary">Home</Link>
            
            {navigation.map((item) => (
              <div 
                key={item.name}
                className="relative group px-1"
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex items-center">
                  <Link
                    to={item.path}
                    className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                      isActive(item.path) 
                        ? 'text-magnus-secondary' 
                        : 'text-gray-600 group-hover:text-magnus-primary'
                    }`}
                  >
                    {item.name}
                    {item.children && <ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />}
                  </Link>
                </div>

                {/* Dropdown Menu */}
                {item.children && activeDropdown === item.name && (
                  <div className="absolute left-0 mt-0 w-56 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 overflow-hidden transform opacity-100 scale-100 transition-all duration-200">
                    <div className="py-2 bg-white">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.path}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-magnus-light hover:text-magnus-primary transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <Link to="/contact" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-magnus-primary">Contact</Link>
            
            <div className="pl-4 ml-4 border-l border-gray-200 flex items-center gap-3">
              <Link 
                to="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium text-magnus-primary hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/contact"
                className="bg-magnus-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-magnus-dark transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              ref={mobileButtonRef}
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-magnus-primary hover:text-magnus-secondary focus:outline-none"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with Smooth Transition */}
      <div 
        ref={mobileMenuRef}
        className={`lg:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[calc(100vh-80px)] opacity-100 shadow-xl' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link to="/" onClick={scrollToTop} className="block px-3 py-3 rounded-lg text-base font-medium text-gray-900 hover:bg-gray-50">Home</Link>
            
            {navigation.map((item) => (
              <div key={item.name} className="space-y-1">
                <Link 
                  to={item.path}
                  className={`block px-3 py-3 rounded-lg text-base font-medium flex justify-between items-center ${
                    isActive(item.path) ? 'bg-magnus-light text-magnus-secondary' : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
                
                {item.children && (
                  <div className="pl-4 space-y-1 border-l-2 border-gray-100 ml-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.path}
                        className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-magnus-primary hover:bg-gray-50"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <Link to="/contact" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-900 hover:bg-gray-50">Contact</Link>
            
            <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
               <Link
                to="/dashboard"
                className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium border border-gray-200 text-magnus-primary"
              >
                Client Login
              </Link>
              <Link
                to="/contact"
                className="block w-full text-center px-4 py-3 rounded-lg text-base font-bold bg-magnus-primary text-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;