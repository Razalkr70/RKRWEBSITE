import { motion } from 'framer-motion';
import { Target, PenTool, Maximize, Cpu } from 'lucide-react';

const reasons = [
  {
    title: 'BUSINESS-FIRST',
    description: 'We start with the problem, not the technology.',
    icon: Target
  },
  {
    title: 'CUSTOM',
    description: 'Solutions are designed around your workflow.',
    icon: PenTool
  },
  {
    title: 'SCALABLE',
    description: 'Build systems that can grow with your business.',
    icon: Maximize
  },
  {
    title: 'PRACTICAL AI',
    description: 'Use AI where it creates real value.',
    icon: Cpu
  }
];

export const WhyUs = () => {
  return (
    <section id="about" className="py-24 bg-dark text-white relative overflow-hidden">
      {/* Background glowing blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold" 
            style={{ color: 'white' }}
          >
            WHY RKR SOLUTIONS?
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                className="group relative bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer overflow-hidden backdrop-blur-sm"
              >
                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>

                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Icon className="w-7 h-7 text-secondary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-wide group-hover:text-secondary transition-colors duration-300" style={{ color: 'white' }}>{reason.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">{reason.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
