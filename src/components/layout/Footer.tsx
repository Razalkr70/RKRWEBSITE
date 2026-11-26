import { useState } from 'react';
import { Mail, Phone, MapPin, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

export const Footer = () => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="bg-dark text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Col 1: Brand & Socials */}
            <div className="col-span-1">
              <a href="#home" className="inline-block mb-4">
                <img 
                  src="/logo.png" 
                  alt="RKR Solutions Logo" 
                  className="h-28 w-auto object-contain" 
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </a>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Building Intelligent Digital Solutions for growing businesses worldwide.
              </p>
              <div className="flex space-x-4">
                <a href="https://wa.me/918606230949" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-green-500 transition-all shadow-sm" title="WhatsApp">
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/rkr_solutions" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-pink-500 transition-all shadow-sm" title="Instagram">
                  <InstagramIcon className="w-5 h-5" />
                </a>
                <a href="tel:+918606230949" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-500 transition-all shadow-sm" title="Call Us">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6" style={{ color: 'white' }}>Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#home" className="text-gray-400 hover:text-primary transition-colors">Home</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-primary transition-colors">Services</a></li>
                <li><a href="#projects" className="text-gray-400 hover:text-primary transition-colors">Projects</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-primary transition-colors">About</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-primary transition-colors">Contact</a></li>
                <li><Link to="/admin" className="text-gray-400 hover:text-primary transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

            {/* Col 3: Get in Touch */}
            <div>
              <h4 className="text-lg font-semibold mb-6" style={{ color: 'white' }}>Get in Touch</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start">
                  <Mail className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <a href="mailto:razalkrdeveloper@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                    razalkrdeveloper@gmail.com
                  </a>
                </li>
                <li className="flex items-start">
                  <Phone className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <a href="tel:+918606230949" className="text-gray-400 hover:text-white transition-colors">
                    +91 86062 30949
                  </a>
                </li>
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    Kunnamkulam, Thrissur<br/>Kerala, India
                  </span>
                </li>
              </ul>
            </div>

            {/* Col 4: Mini CTA */}
            <div>
              <h4 className="text-lg font-semibold mb-6" style={{ color: 'white' }}>Ready to build?</h4>
              <p className="text-gray-400 text-sm mb-6">
                Let's turn your idea into reality. Start a project with us today.
              </p>
              <a 
                href="#contact" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-primary hover:bg-secondary font-semibold rounded-lg transition-colors group cursor-pointer" 
                style={{ color: 'white' }}
              >
                Start a Project
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} RKR Solutions. All rights reserved.
            </p>
            <div className="flex space-x-6 text-gray-500">
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }} className="hover:text-white transition-colors cursor-pointer">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xl font-bold text-dark">
                  {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-gray-400 hover:text-dark hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto text-dark/80 space-y-4">
                {activeModal === 'privacy' ? (
                  <>
                    <p>At RKR Solutions, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information when you interact with our website and services.</p>
                    <h4 className="font-bold text-dark mt-6 mb-2">Information Collection</h4>
                    <p>We collect information you provide directly to us, such as when you fill out a contact form, request a quote, or communicate with us. This may include your name, email address, phone number, and project details.</p>
                    <h4 className="font-bold text-dark mt-6 mb-2">How We Use Your Information</h4>
                    <p>We use the information we collect to respond to your inquiries, provide and improve our services, and send you important updates regarding your project.</p>
                    <h4 className="font-bold text-dark mt-6 mb-2">Data Protection</h4>
                    <p>Your data is securely stored and never sold to third parties. We implement industry-standard security measures to protect your personal information against unauthorized access.</p>
                  </>
                ) : (
                  <>
                    <p>By accessing or using the RKR Solutions website and services, you agree to be bound by these Terms of Service. Please read them carefully.</p>
                    <h4 className="font-bold text-dark mt-6 mb-2">Services</h4>
                    <p>We provide digital solution development, including AI integrations, websites, web applications, and business automation. Specific project scopes, timelines, and deliverables will be clearly defined in individual contracts.</p>
                    <h4 className="font-bold text-dark mt-6 mb-2">Intellectual Property</h4>
                    <p>Upon full payment, intellectual property rights for custom-developed software are typically transferred to the client, unless otherwise specified in the project agreement.</p>
                    <h4 className="font-bold text-dark mt-6 mb-2">Liability</h4>
                    <p>While we strive for technical excellence, RKR Solutions shall not be liable for any indirect, incidental, or consequential damages arising from the use of our digital products or services.</p>
                  </>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2 bg-dark hover:bg-gray-900 rounded-lg font-medium transition-colors cursor-pointer"
                  style={{ color: 'white' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
