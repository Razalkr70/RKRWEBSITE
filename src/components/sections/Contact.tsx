import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

export const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{success: boolean, message: string} | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);
    
    const formData = new FormData(event.currentTarget);
    formData.append("access_key", "5da0bc3d-b509-43cc-991a-4448cdfdfe98");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSubmitResult({ success: true, message: "Enquiry sent successfully! We will get back to you soon." });
        
        // Save to LocalStorage for Admin Portal
        try {
          const newLead = {
            id: Date.now(),
            name: formData.get("name") as string,
            company: (formData.get("organization") as string) || 'N/A',
            service: formData.get("project_type") as string,
            status: 'New',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            message: formData.get("message") as string,
          };
          const existingLeads = JSON.parse(localStorage.getItem('rkr_leads') || '[]');
          localStorage.setItem('rkr_leads', JSON.stringify([newLead, ...existingLeads]));
        } catch (e) {
          console.error("Failed to save lead locally");
        }

        (event.target as HTMLFormElement).reset();
      } else {
        setSubmitResult({ success: false, message: data.message || "Something went wrong. Please try again." });
      }
    } catch (error) {
      setSubmitResult({ success: false, message: "Network error. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contact">
      {/* Final CTA Section */}
      <section className="relative py-24 bg-primary overflow-hidden">
        {/* Geometric Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] rounded-full bg-secondary opacity-50 blur-[100px]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold mb-6"
            style={{ color: 'white' }}
          >
            HAVE AN IDEA? <br /> LET'S BUILD IT.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 mb-10 text-balance"
          >
            Tell us what you're trying to solve. We'll help turn the idea into a practical digital solution.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <button 
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 bg-dark font-bold rounded-md hover:bg-gray-900 transition-colors shadow-lg cursor-pointer" 
              style={{ color: 'white' }}
            >
              Start a Project
            </button>
            <a 
              href="https://wa.me/918606230949?text=Hi%20RKR%20Solutions!%20I%20have%20an%20idea%20for%20a%20project." 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white font-bold rounded-md hover:bg-white/10 transition-colors flex items-center justify-center group cursor-pointer" 
              style={{ color: 'white' }}
            >
              <WhatsAppIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              WhatsApp Us
            </a>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6">
                LET'S TALK ABOUT <br /> YOUR NEXT PROJECT
              </h2>
              <div className="w-12 h-1 bg-primary mb-10"></div>
              
              <div className="space-y-6 text-lg text-muted">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-dark mb-2">RKR SOLUTIONS</h3>
                  <p>Building Intelligent Digital Solutions</p>
                </div>
                
                <div>
                  <div className="font-semibold text-dark mb-1">Email:</div>
                  <a href="mailto:razalkrdeveloper@gmail.com" className="hover:text-primary transition-colors">
                    razalkrdeveloper@gmail.com
                  </a>
                </div>
                
                <div>
                  <div className="font-semibold text-dark mb-1">Phone:</div>
                  <a href="tel:+918606230949" className="hover:text-primary transition-colors">
                    +91 86062 30949
                  </a>
                </div>
                
                <div>
                  <div className="font-semibold text-dark mb-1">Instagram:</div>
                  <a href="https://instagram.com/rkr_solutions" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    @rkr_solutions
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <form className="space-y-6" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Name</label>
                    <input type="text" name="name" required className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Business / Organization</label>
                    <input type="text" name="organization" className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" placeholder="Company Inc." />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Email</label>
                    <input type="email" name="email" required className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Phone</label>
                    <input type="tel" name="phone" required className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" placeholder="+1 234 567 890" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Project Type</label>
                  <select name="project_type" className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-dark bg-white">
                    <option>AI Solution</option>
                    <option>Website</option>
                    <option>Web Application</option>
                    <option>Dashboard</option>
                    <option>Automation</option>
                    <option>Business Software</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Tell us about your requirement</label>
                  <textarea name="message" required rows={4} className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none" placeholder="Briefly describe what you are looking to build..."></textarea>
                </div>

                {/* Form Feedback Message */}
                {submitResult && (
                  <div className={`p-4 rounded-md flex items-center text-sm font-medium ${submitResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {submitResult.success && <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />}
                    {submitResult.message}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className={`w-full hover:bg-secondary font-bold py-4 px-8 rounded-md transition-colors flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${isSubmitting ? 'bg-gray-400' : 'bg-primary'}`} style={{ color: 'white' }}>
                  {isSubmitting ? 'Sending Enquiry...' : (
                    <>
                      Send Enquiry
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
