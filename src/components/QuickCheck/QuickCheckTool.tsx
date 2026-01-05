
import React, { useState } from 'react';
import { Search, Loader2, MapPin, ChevronDown } from 'lucide-react';
import { analyzeOrganization, submitLeadGen } from '../../services/mockBackend';
import { AssessmentResult } from '../../types';
import ResultsCard from './ResultsCard';

const DMA_REGIONS = [
  "New York", "Los Angeles", "Chicago", "Philadelphia", "Dallas-Ft. Worth",
  "San Francisco-Oak-San Jose", "Atlanta", "Houston", "Washington (Hagerstown)",
  "Boston (Manchester)", "Phoenix (Prescott)", "Seattle-Tacoma", "Tampa-St. Pete (Sarasota)",
  "Minneapolis-St. Paul", "Detroit", "Denver", "Orlando-Daytona Bch-Melbrn",
  "Miami-Ft. Lauderdale", "Cleveland-Akron (Canton)", "Sacramento-Stkton-Modesto"
];

const QuickCheckTool: React.FC = () => {
  const [ein, setEin] = useState('');
  const [dma, setDma] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ein || ein.length < 9) {
      setError('Please enter a valid 9-digit EIN.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Simulate backend call
      const data = await analyzeOrganization(ein, dma);
      setResult(data);
    } catch (err) {
      setError('Could not fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (email: string) => {
    if (result) {
      try {
        await submitLeadGen(result.organization.ein, email);
      } catch (err) {
        console.error("Failed to capture lead", err);
      }
    }
  };

  const resetTool = () => {
    setResult(null);
    setEin('');
    setDma('');
    setError('');
  };

  if (result) {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 scroll-mt-28" id="quick-check-results">
            <ResultsCard 
              result={result} 
              onReset={resetTool} 
              onLeadSubmit={handleLeadSubmit}
            />
        </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 relative z-10 scroll-mt-28" id="quick-check">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-magnus-primary mb-2">Free Compliance Quick Check</h2>
          <p className="text-gray-600">Enter a nonprofit EIN to instantly scan for Tier 1 Red Flags using our AI engine.</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={ein}
              onChange={(e) => setEin(e.target.value.replace(/\D/g, '').slice(0, 9))}
              className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-magnus-secondary focus:border-magnus-secondary focus:bg-white transition-all text-lg"
              placeholder="Enter 9-Digit EIN (e.g., 123456789)"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={dma}
              onChange={(e) => setDma(e.target.value)}
              className="block w-full pl-10 pr-10 py-4 border border-gray-300 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-magnus-secondary focus:border-magnus-secondary focus:bg-white transition-all text-lg appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-500">Select DMA Region (Optional)</option>
              {DMA_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-magnus-accent hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-magnus-accent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Analyzing Form 990 Data...
              </>
            ) : (
              'Run Compliance Scan'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          *Data sourced from IRS Form 990 filings. Analysis powered by Magnus Compliance Engine V12.
        </p>
      </div>
    </div>
  );
};

export default QuickCheckTool;
