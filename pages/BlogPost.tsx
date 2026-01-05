import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Tag, Share2, ArrowLeft, Download } from 'lucide-react';

const BlogPost: React.FC = () => {
  return (
    <div className="bg-white min-h-screen animate-fade-in pb-24">
       {/* Article Header */}
       <div className="bg-magnus-primary text-white pt-32 pb-24 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-magnus-primary to-magnus-dark"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-magnus-secondary opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
         
         <div className="max-w-3xl mx-auto px-4 relative z-10">
            <Link to="/resources" className="inline-flex items-center gap-2 text-indigo-300 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Resources
            </Link>
            <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-magnus-secondary/20 border border-magnus-secondary/30 rounded-full text-xs font-bold text-magnus-secondary uppercase tracking-wider">
                    Regulatory Update
                </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
                New IRS Guidance on DAFs: What You Need to Know for 2024
            </h1>
            <div className="flex items-center gap-6 text-indigo-200 text-sm">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Sarah Jenkins, CPA</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>October 12, 2024</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>Compliance, Tax Law</span>
                </div>
            </div>
         </div>
       </div>

       {/* Article Content */}
       <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             
             {/* Main Text */}
             <div className="lg:col-span-8 bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <article className="prose prose-lg text-gray-700 max-w-none">
                    <p className="lead text-xl text-gray-600 mb-8">
                        The IRS has released proposed regulations that could significantly impact how public charities report contributions from Donor Advised Funds (DAFs). Here is a breakdown of the key changes and how they impact your organization's public support test.
                    </p>
                    
                    <h3>The "Tipping" Concern</h3>
                    <p>
                        For years, the nonprofit sector has debated whether funds from DAFs should be treated as public support or as contributions from a single donor. The new guidance suggests a more nuanced approach...
                    </p>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 not-prose rounded-r-lg">
                        <h4 className="text-blue-900 font-bold mb-2">Key Takeaway</h4>
                        <p className="text-blue-800 text-sm">
                            Nonprofits receiving more than 20% of their revenue from a single DAF sponsor should conduct an immediate internal audit of their Schedule A calculations.
                        </p>
                    </div>

                    <h3>What You Need To Do Now</h3>
                    <p>
                        We recommend a three-step approach to prepare for these changes:
                    </p>
                    <ol>
                        <li><strong>Audit your donor list:</strong> Identify all contributions coming from major sponsors like Fidelity Charitable, Schwab Charitable, and local community foundations.</li>
                        <li><strong>Calculate your reliance:</strong> Use our <Link to="/resources/tools/daf-calculator" className="text-magnus-primary font-bold no-underline hover:underline">DAF Reliance Calculator</Link> to see if you are in the danger zone.</li>
                        <li><strong>Update your gift acceptance policy:</strong> Ensure your board has reviewed the risks associated with anonymous DAF gifts.</li>
                    </ol>
                    
                    <h3>Conclusion</h3>
                    <p>
                        While these regulations are not yet final, they signal a clear direction from the IRS towards greater scrutiny of DAF flows. Proactive organizations will use this as an opportunity to diversify their revenue streams.
                    </p>
                </article>

                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Share this article:
                    </div>
                    <div className="flex gap-4">
                        <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                            <Share2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
             </div>

             {/* Sidebar */}
             <div className="lg:col-span-4 space-y-8">
                 {/* Lead Magnet */}
                 <div className="bg-magnus-dark text-white rounded-2xl p-8 shadow-lg">
                     <h3 className="text-2xl font-bold mb-4">Don't guess on compliance.</h3>
                     <p className="text-indigo-200 mb-6 text-sm">
                         Download our comprehensive guide to Form 990 preparation and avoid common audit triggers.
                     </p>
                     <img 
                        src="https://placehold.co/400x500/2a4365/ffffff?text=Guide+Cover" 
                        alt="Guide Cover" 
                        className="w-1/2 mx-auto mb-6 rounded shadow-md transform -rotate-3 hover:rotate-0 transition-transform"
                     />
                     <Link to="/resources/guide/executive-compliance" className="block w-full text-center py-3 bg-magnus-accent text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
                        Download Free Guide
                     </Link>
                 </div>

                 {/* Related Articles */}
                 <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                     <h3 className="font-bold text-gray-900 mb-4">Related Insights</h3>
                     <ul className="space-y-4">
                         <li>
                             <Link to="#" className="block group">
                                 <span className="text-xs text-gray-500 mb-1 block">Case Study</span>
                                 <h4 className="font-medium text-gray-900 group-hover:text-magnus-primary transition-colors">
                                     Bylaw Restructuring for 501(c)(3)
                                 </h4>
                             </Link>
                         </li>
                         <li className="border-t border-gray-200 pt-4">
                             <Link to="#" className="block group">
                                 <span className="text-xs text-gray-500 mb-1 block">Webinar</span>
                                 <h4 className="font-medium text-gray-900 group-hover:text-magnus-primary transition-colors">
                                     Understanding UBIT Taxes
                                 </h4>
                             </Link>
                         </li>
                     </ul>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default BlogPost;