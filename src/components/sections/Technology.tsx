import { motion } from 'framer-motion';

const techGroups = [
  {
    category: 'AI & DATA',
    techs: ['Python', 'TensorFlow', 'Keras', 'Pandas', 'NLP', 'Computer Vision']
  },
  {
    category: 'BACKEND',
    techs: ['Django', 'Django REST Framework', 'Flask', 'MySQL']
  },
  {
    category: 'FRONTEND',
    techs: ['HTML', 'CSS', 'JavaScript']
  },
  {
    category: 'BUSINESS INTELLIGENCE',
    techs: ['Power BI', 'Tableau']
  },
  {
    category: 'AI ECOSYSTEM',
    techs: ['Gemini', 'Hugging Face', 'LangChain']
  }
];

export const Technology = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-dark mb-4"
          >
            BUILT WITH MODERN TECHNOLOGY
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted max-w-2xl mx-auto text-lg"
          >
            We leverage a powerful, modern technology stack to deliver secure, scalable, and intelligent digital solutions.
          </motion.p>
        </div>

        <div className="flex flex-col space-y-6">
          {techGroups.map((group, index) => (
            <motion.div 
              key={group.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              className="group relative flex flex-col md:flex-row md:items-center gap-6 md:gap-12 p-6 md:p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500"
            >
              {/* Left Accent Expanding Line */}
              <div className="absolute left-[-1px] top-8 bottom-8 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center rounded-r-full"></div>
              
              <div className="w-56 flex-shrink-0">
                <h3 className="text-sm font-bold text-gray-400 group-hover:text-primary uppercase tracking-[0.2em] transition-colors duration-300">
                  {group.category}
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {group.techs.map((tech, techIdx) => (
                  <motion.span 
                    key={tech} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index * 0.1) + (techIdx * 0.05), type: "spring", stiffness: 200 }}
                    className="px-5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-700 hover:bg-primary hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 cursor-default"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
