import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Solutions from './pages/Solutions';
import SolutionsExecutives from './pages/SolutionsExecutives';
import SolutionsProgramOfficers from './pages/SolutionsProgramOfficers';
import Resources from './pages/Resources';
import BlogPost from './pages/BlogPost';
import GuideLanding from './pages/GuideLanding';
import DafCalculator from './pages/DafCalculator';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import RedFlagAlert from './pages/RedFlagAlert';

const ScrollHandler = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollHandler />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/red-flag-alert" element={<RedFlagAlert />} />
            <Route path="/about" element={<About />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/solutions/executives" element={<SolutionsExecutives />} />
            <Route path="/solutions/program-officers" element={<SolutionsProgramOfficers />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/blog/:id" element={<BlogPost />} />
            <Route path="/resources/guide/:id" element={<GuideLanding />} />
            <Route path="/resources/tools/daf-calculator" element={<DafCalculator />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;