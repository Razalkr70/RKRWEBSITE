import { motion } from 'framer-motion';
import { Rocket, Building2, TrendingUp, Landmark } from 'lucide-react';

const audiences = [
  {
    title: 'STARTUPS',
    description: 'Build your digital product from the ground up.',
    icon: Rocket
  },
  {
    title: 'SMALL & MEDIUM BUSINESSES',
    description: 'Digitize workflows and improve operations.',
    icon: Building2
  },
  {
    title: 'GROWING BUSINESSES',
    description: 'Connect data, automation, and business processes.',
    icon: TrendingUp
  },
  {
    title: 'ORGANIZATIONS',
    description: 'Build custom digital platforms around your requirements.',
    icon: Landmark
  }
];

export const Audience = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-dark"
          >
            DIGITAL SOLUTIONS <br className="hidden sm:block" /> FOR GROWING BUSINESSES
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {audiences.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group relative overflow-hidden transform hover:-translate-y-2 cursor-pointer"
              >
                {/* Top Accent Line on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                
                {/* Interactive Icon Box */}
                <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:border-primary group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <Icon className="w-6 h-6 text-dark group-hover:text-white transition-colors duration-300" />
                </div>
                
                {/* Text Content */}
                <h3 className="text-lg font-bold text-dark mb-3 group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed group-hover:text-gray-600 transition-colors duration-300">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
