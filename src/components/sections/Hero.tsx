import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, BarChart3, Bot, Workflow } from 'lucide-react';
import { useEffect } from 'react';

export const Hero = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 50, stiffness: 400 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);
  
  // Parallax depths
  const x1 = useTransform(smoothMouseX, [-1000, 1000], [-15, 15]);
  const y1 = useTransform(smoothMouseY, [-1000, 1000], [-15, 15]);
  
  const x2 = useTransform(smoothMouseX, [-1000, 1000], [30, -30]);
  const y2 = useTransform(smoothMouseY, [-1000, 1000], [30, -30]);
  
  const x3 = useTransform(smoothMouseX, [-1000, 1000], [-45, 45]);
  const y3 = useTransform(smoothMouseY, [-1000, 1000], [-45, 45]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = e.clientX - innerWidth / 2;
      const y = e.clientY - innerHeight / 2;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-background">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-50 to-transparent opacity-50 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Side Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <span className="text-xs font-semibold text-primary tracking-wider uppercase">
                AI • Web • Analytics • Automation
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark leading-tight tracking-tight mb-6">
              BUILDING <br />
              <span className="text-primary">INTELLIGENT</span> <br />
              DIGITAL SOLUTIONS.
            </h1>
            
            <p className="text-lg text-muted mb-8 max-w-xl text-balance">
              We design and develop intelligent digital solutions that help businesses work smarter, streamline operations, and grow digitally.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <a href="#contact" className="inline-flex justify-center items-center px-6 py-3 rounded-md bg-primary hover:bg-secondary text-[#ffffff] font-medium transition-all shadow-soft hover:-translate-y-0.5 group">
                Start a Project
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#projects" className="inline-flex justify-center items-center px-6 py-3 rounded-md bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-dark font-medium transition-colors">
                View Our Work
              </a>
            </div>
          </motion.div>

          {/* Right Side Parallax Composition */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[400px] lg:h-[500px] w-full"
          >
            {/* Main Dashboard Card */}
            <motion.div 
              style={{ x: x1, y: y1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[480px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 p-5 z-20 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analytics Overview</span>
                </div>
                <div className="flex items-center">
                   <span className="px-2 py-1 rounded-md bg-green-50 text-[10px] font-bold text-green-600 border border-green-200 flex items-center gap-1.5 shadow-sm">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                     Live
                   </span>
                </div>
              </div>
              
              {/* KPI Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer group shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <BarChart3 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">+14.5%</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1 font-medium">Monthly Revenue</div>
                  <div className="text-xl font-extrabold text-dark">$124,500</div>
                </div>
                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer group shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <Workflow className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">Active</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1 font-medium">Automated Tasks</div>
                  <div className="text-xl font-extrabold text-dark">12,842</div>
                </div>
              </div>
              
              {/* Main Chart Area */}
              <div className="relative h-40 bg-gray-50/80 rounded-xl border border-gray-100 p-4 flex flex-col justify-end overflow-hidden z-10 cursor-pointer group shadow-inner">
                 {/* Animated curved line chart SVG */}
                 <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="gradientLight" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <motion.path 
                      d="M 0,80 C 20,60 30,90 50,40 C 70,-10 80,60 100,20 L 100,100 L 0,100 Z" 
                      fill="url(#gradientLight)" 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                    <motion.path 
                      d="M 0,80 C 20,60 30,90 50,40 C 70,-10 80,60 100,20" 
                      fill="none" 
                      stroke="#2563EB" 
                      strokeWidth="3"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                    />
                 </svg>
                 
                 {/* Chart Grid Lines */}
                 <div className="absolute inset-0 flex flex-col justify-between py-6 px-0 pointer-events-none opacity-10">
                   <div className="w-full h-px bg-gray-400"></div>
                   <div className="w-full h-px bg-gray-400"></div>
                   <div className="w-full h-px bg-gray-400"></div>
                 </div>
                 
                 {/* Interactive Data Points (Hover effect) */}
                 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-primary shadow-[0_0_10px_rgba(37,99,235,0.4)] absolute left-[20%] top-[60%]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-primary shadow-[0_0_10px_rgba(37,99,235,0.4)] absolute left-[50%] top-[40%]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-primary shadow-[0_0_10px_rgba(37,99,235,0.4)] absolute left-[80%] top-[25%]"></div>
                 </div>
              </div>
            </motion.div>
            
            {/* Floating Element 1 - AI Assistant */}
            <motion.div 
              style={{ x: x2, y: y2 }}
              className="absolute top-4 right-0 lg:-right-8 w-60 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-gray-100 p-4 z-30 flex flex-col gap-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-dark">AI Assistant</div>
                  <div className="text-[10px] text-green-500 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online</div>
                </div>
              </div>
              <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50 relative mt-1">
                <div className="absolute -left-1.5 top-3 w-3 h-3 bg-blue-50/50 border-l border-t border-blue-100/50 rotate-[-45deg]"></div>
                <p className="text-xs text-gray-600 relative z-10 leading-relaxed font-medium">Analysis complete. Conversion is up <span className="text-green-600 font-bold">12%</span>. Generate report?</p>
              </div>
            </motion.div>
            
            {/* Floating Element 2 - Workflow Preview */}
            <motion.div 
              style={{ x: x3, y: y3 }}
              className="absolute bottom-10 left-0 lg:-left-12 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-30"
            >
              <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-3 space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <div className="p-4 flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                    <Workflow className="w-5 h-5 text-primary" />
                 </div>
                 <div className="flex-1">
                    <div className="text-xs font-bold text-dark mb-2">Automation Sequence</div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                       <motion.div 
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          animate={{ width: ["0%", "100%", "0%"] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                       />
                    </div>
                 </div>
              </div>
            </motion.div>
            
            {/* Connecting SVG Lines (Abstract) */}
            <svg className="absolute inset-0 w-full h-full -z-10 text-gray-200" style={{ pointerEvents: 'none' }}>
              <path d="M100 150 C 200 100, 300 300, 400 200" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M50 300 C 150 400, 350 200, 450 350" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="100" cy="150" r="3" fill="currentColor" />
              <circle cx="400" cy="200" r="3" fill="currentColor" />
              <circle cx="50" cy="300" r="3" fill="currentColor" />
              <circle cx="450" cy="350" r="3" fill="currentColor" />
            </svg>

          </motion.div>
        </div>
      </div>
    </section>
  );
};
