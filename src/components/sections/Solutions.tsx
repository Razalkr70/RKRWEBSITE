import { motion } from 'framer-motion';
import { Bot, Workflow, BarChart3, Settings2, Brain, Send, Activity } from 'lucide-react';

const aiFeatures = [
  {
    title: 'AI ASSISTANTS',
    description: 'Intelligent assistants connected to relevant business information.',
    icon: Bot,
  },
  {
    title: 'AI AUTOMATION',
    description: 'Automate repetitive tasks and workflows.',
    icon: Workflow,
  },
  {
    title: 'AI INSIGHTS',
    description: 'Turn business data into useful intelligence.',
    icon: BarChart3,
  },
  {
    title: 'CUSTOM AI',
    description: 'Build AI solutions around specific business requirements.',
    icon: Settings2,
  },
];

export const Solutions = () => {
  return (
    <section id="solutions" className="py-24 bg-dark text-white overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-6">
              <Brain className="w-4 h-4 text-secondary mr-2" />
              <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'white' }}>
                Applied AI
              </span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: 'white' }}>
              MAKE YOUR BUSINESS <br />
              <span className="text-secondary">SMARTER WITH AI</span>
            </h2>
            <p className="text-lg text-gray-400 mb-10 text-balance">
              Practical AI solutions designed to improve efficiency, automate repetitive work, and turn business information into useful insights.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {aiFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                    className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <Icon className="w-6 h-6 text-secondary mb-3" />
                    <h3 className="text-base font-bold mb-2" style={{ color: 'white' }}>{feature.title}</h3>
                    <p className="text-sm" style={{ color: '#D1D5DB' }}>{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Side: AI Interface Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] w-full"
          >
            <div className="absolute inset-0 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="h-14 border-b border-gray-100 flex items-center px-4 justify-between bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-sm font-semibold text-gray-900">Intelligence Hub</div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-5 flex flex-col justify-end space-y-6 bg-white">
                {/* User Message */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="self-end max-w-[80%] bg-gray-900 border border-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-sm"
                  style={{ color: 'white' }}
                >
                  Analyze the Q3 performance data and generate a summary report.
                </motion.div>
                
                {/* AI Response with Loading/Content */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 }}
                  className="self-start w-[85%] bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm p-4 shadow-sm"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900">AI Assistant</span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Based on the Q3 data, overall performance has improved significantly. Here is the key insight from the report:
                    </p>
                    
                    {/* Embedded Insight Card */}
                    <div className="mt-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                      <div className="flex items-center text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                        <Activity className="w-3 h-3 mr-1" /> Key Insight
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold text-gray-900">+24.5%</div>
                        <div className="text-sm font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Efficiency Gain</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="h-12 rounded-full bg-white border border-gray-200 px-4 flex items-center justify-between shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <div className="text-sm text-gray-400">Ask the assistant...</div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Floating Nodes */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -right-6 top-1/4 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary opacity-50 blur-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
