import React from 'react';
import { Target, Users, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-magnus-primary text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Transparency is our Mission</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We are building the compliance infrastructure for the next generation of nonprofits.
          </p>
        </div>
      </div>

      {/* Our Approach */}
      <section id="approach" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Approach: Data-First Compliance</h2>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              Traditional compliance is reactive—fixing problems after the IRS sends a letter. Magnus Compliance Engine is proactive. 
            </p>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              We leverage data directly from the IRS and ProPublica to build a real-time risk profile of your organization. By combining this data with our Tier 2 AI automation, we identify patterns that human auditors often miss until it's too late.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="border-l-4 border-magnus-secondary pl-4">
                <h4 className="font-bold text-gray-900 text-lg">Automated</h4>
                <p className="text-sm text-gray-500">Continuous scanning of 990 data</p>
              </div>
              <div className="border-l-4 border-magnus-accent pl-4">
                <h4 className="font-bold text-gray-900 text-lg">Actionable</h4>
                <p className="text-sm text-gray-500">Clear remediation steps, not legal jargon</p>
              </div>
            </div>
          </div>
          <div className="mt-12 lg:mt-0 relative">
             <div className="bg-gray-100 rounded-2xl h-80 w-full flex items-center justify-center">
                <Target className="h-32 w-32 text-magnus-primary opacity-20" />
             </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Meet the Team</h2>
            <p className="mt-4 text-gray-600">Experts in tax law, software engineering, and nonprofit governance.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                {/* Placeholder for Headshot */}
                <Users className="h-full w-full p-4 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Magnus Chi</h3>
              <p className="text-magnus-secondary font-medium">Founder & Lead Engineer</p>
              <p className="mt-4 text-gray-600 text-sm">Builder of the Magnus Compliance Engine. Passionate about using AI to solve regulatory complexity.</p>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                <Users className="h-full w-full p-4 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sarah Jenkins, CPA</h3>
              <p className="text-magnus-secondary font-medium">Head of Compliance</p>
              <p className="mt-4 text-gray-600 text-sm">Former IRS auditor with 15 years of experience in tax-exempt organizations.</p>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                <Users className="h-full w-full p-4 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">David Ross</h3>
              <p className="text-magnus-secondary font-medium">Data Scientist</p>
              <p className="mt-4 text-gray-600 text-sm">Specializes in anomaly detection and predictive modeling for financial risk.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Magnus */}
      <section id="why-magnus" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-magnus-primary rounded-3xl p-8 md:p-16 text-white text-center">
          <Award className="h-16 w-16 text-magnus-accent mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">Why Choose Magnus?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div>
              <h3 className="text-xl font-bold mb-3 text-magnus-secondary">Speed</h3>
              <p className="text-gray-300">Analysis that used to take weeks now takes seconds. Get answers when you need them.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-magnus-secondary">Accuracy</h3>
              <p className="text-gray-300">Powered by direct IRS data feeds, reducing human error in data entry and calculation.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-magnus-secondary">Cost</h3>
              <p className="text-gray-300">Enterprise-grade compliance tools at a price point accessible to small nonprofits.</p>
            </div>
          </div>
          <div className="mt-12">
             <Link to="/contact" className="inline-block bg-white text-magnus-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                Partner With Us
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;