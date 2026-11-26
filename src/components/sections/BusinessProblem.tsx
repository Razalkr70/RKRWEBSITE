import { motion } from 'framer-motion';
import { XCircle, ArrowRight } from 'lucide-react';

const problems = [
  'Manual data entry',
  'Scattered spreadsheets',
  'Repetitive tasks',
  'Disconnected systems',
  'Difficult reporting',
  'Limited visibility'
];

export const BusinessProblem = () => {
  return (
    <section className="py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Problems */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-100"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-dark mb-8">
              STILL MANAGING YOUR BUSINESS MANUALLY?
            </h2>
            <div className="space-y-4">
              {problems.map((problem) => (
                <div key={problem} className="flex items-center text-lg text-muted">
                  <XCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                  {problem}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Solution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-lg"
          >
            <div className="w-12 h-1 bg-primary mb-6"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6 leading-tight">
              WE BUILD THE SYSTEM AROUND YOUR WORKFLOW.
            </h2>
            <p className="text-lg text-muted mb-8 text-balance">
              Instead of forcing your business into a generic tool, we design digital systems around your actual processes. Resulting in higher efficiency, better adoption, and clearer insights.
            </p>
            <a href="#contact" className="inline-flex items-center font-semibold text-primary hover:text-secondary transition-colors group">
              Discuss Your Requirement
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
