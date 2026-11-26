import { motion } from 'framer-motion';
import { BrainCircuit, Globe, LineChart, Repeat, Settings2, Check } from 'lucide-react';

const services = [
  {
    title: 'AI SOLUTIONS',
    icon: BrainCircuit,
    description: 'Build intelligent applications and AI-powered workflows designed around your business needs.',
    capabilities: ['AI Assistants', 'Intelligent Automation', 'Machine Learning', 'NLP', 'AI-powered Insights'],
  },
  {
    title: 'WEB DEVELOPMENT',
    icon: Globe,
    description: 'Modern, responsive websites and web applications designed for performance and usability.',
    capabilities: ['Business Websites', 'Web Applications', 'Responsive UI', 'Backend Systems', 'API Integration'],
  },
  {
    title: 'ANALYTICS & DASHBOARDS',
    icon: LineChart,
    description: 'Transform business data into clear dashboards and actionable insights.',
    capabilities: ['Business Dashboards', 'KPI Tracking', 'Data Visualization', 'Reports', 'BI Solutions'],
  },
  {
    title: 'AUTOMATION',
    icon: Repeat,
    description: 'Reduce repetitive work and improve operational efficiency through connected digital workflows.',
    capabilities: ['Workflow Automation', 'Notifications', 'Data Processing', 'Process Optimization', 'System Integration'],
  },
  {
    title: 'BUSINESS SOFTWARE',
    icon: Settings2,
    description: 'Custom digital systems built around specific business workflows.',
    capabilities: ['CRM', 'ERP', 'Management Systems', 'Internal Tools', 'Custom Platforms'],
  },
];

export const Services = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-3xl md:text-4xl font-bold text-dark mb-4 tracking-tight"
          >
            TECHNOLOGY BUILT <br className="hidden sm:block"/> AROUND YOUR BUSINESS
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted text-balance"
          >
            From intelligent automation to modern digital platforms, we build technology around the way your business works.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-soft transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                  <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">{service.title}</h3>
                <p className="text-muted mb-6 line-clamp-3">{service.description}</p>
                <ul className="space-y-2">
                  {service.capabilities.map((cap) => (
                    <li key={cap} className="flex items-center text-sm text-dark font-medium">
                      <Check className="w-4 h-4 text-secondary mr-2 flex-shrink-0" />
                      {cap}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
