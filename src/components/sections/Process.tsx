import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'UNDERSTAND',
    description: 'We understand your business, workflow, goals, and challenges.'
  },
  {
    num: '02',
    title: 'DESIGN',
    description: 'We design the experience and system architecture around your requirements.'
  },
  {
    num: '03',
    title: 'BUILD',
    description: 'We develop, integrate, test, and refine the solution.'
  },
  {
    num: '04',
    title: 'LAUNCH',
    description: 'We deploy the product and prepare it for real-world use.'
  }
];

export const Process = () => {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-dark max-w-sm">
            FROM IDEA TO <br className="hidden md:block" />
            <span className="text-primary">INTELLIGENT PRODUCT</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative mt-12">
          {/* Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-6 left-[24px] w-[calc(75%)] h-[1.5px] bg-gray-200 z-0"></div>

          {steps.map((step, index) => (
            <motion.div 
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6, ease: "easeOut" }}
              className="relative z-10 group cursor-pointer"
            >
              <motion.div 
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-full bg-white border-[1.5px] border-primary text-primary flex items-center justify-center font-bold text-lg mb-6 mx-auto lg:mx-0 ring-[12px] ring-white group-hover:bg-primary group-hover:text-white transition-colors duration-300"
              >
                {step.num}
              </motion.div>
              <div className="text-center lg:text-left transform transition-transform duration-300 group-hover:-translate-y-1">
                <h3 className="text-lg font-bold text-dark mb-3 uppercase tracking-wide group-hover:text-primary transition-colors duration-300">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
