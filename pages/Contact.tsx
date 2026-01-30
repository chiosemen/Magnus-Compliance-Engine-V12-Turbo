import React from 'react';
import { Mail, Phone, MapPin, Calendar, Clock } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-magnus-primary text-white py-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
               Have a question about your compliance status? Our team is ready to help.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
           
           {/* Contact Form */}
           <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
              <form className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                       <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none" />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                       <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none" />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none" />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none" />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">How can we help?</label>
                    <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-magnus-secondary focus:border-transparent outline-none"></textarea>
                 </div>

                         {import.meta.env.VITE_APP_MODE === 'demo' ? (
                            <div className="w-full py-3 bg-gray-300 text-gray-700 font-bold rounded-lg text-center cursor-not-allowed">
                               This form is disabled in demo mode.
                            </div>
                         ) : (
                            <button type="button" className="w-full py-3 bg-magnus-secondary text-white font-bold rounded-lg hover:bg-teal-600 transition-colors shadow-md">
                               Send Message
                            </button>
                         )}
              </form>
           </div>

           {/* Contact Info */}
           <div>
              <div className="bg-gray-50 rounded-2xl p-8 mb-8">
                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                 <div className="space-y-6">
                    <div className="flex items-start">
                       <Mail className="h-6 w-6 text-magnus-primary mr-4 mt-1" />
                       <div>
                          <p className="font-bold text-gray-900">Email</p>
                          <p className="text-gray-600">contact@magnus.tech</p>
                          <p className="text-gray-600">support@magnus.tech</p>
                       </div>
                    </div>
                    <div className="flex items-start">
                       <Phone className="h-6 w-6 text-magnus-primary mr-4 mt-1" />
                       <div>
                          <p className="font-bold text-gray-900">Phone</p>
                          <p className="text-gray-600">+1 (555) 019-2834</p>
                          <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am - 5pm EST</p>
                       </div>
                    </div>
                    <div className="flex items-start">
                       <MapPin className="h-6 w-6 text-magnus-primary mr-4 mt-1" />
                       <div>
                          <p className="font-bold text-gray-900">Headquarters</p>
                          <p className="text-gray-600">123 Innovation Drive, Suite 400</p>
                          <p className="text-gray-600">Tech Valley, CA 94025</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-magnus-primary text-white rounded-2xl p-8">
                 <h3 className="text-xl font-bold mb-4">Ready for a Deep Dive?</h3>
                 <p className="text-indigo-200 mb-6">
                    Schedule a 30-minute consultation with our senior compliance officers to discuss your specific needs.
                 </p>
                 <button className="w-full py-3 bg-white text-magnus-primary font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Book Consultation
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;