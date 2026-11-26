import { motion } from 'framer-motion';
import { ArrowRight, LayoutDashboard, Layers, Users } from 'lucide-react';

const projects = [
  {
    id: 'knext',
    name: 'KONDOTTY NEXT',
    category: 'Civic Digital Platform',
    description: 'A digital platform connecting citizens, representatives, services, complaints, ideas, and intelligent assistance through a unified system.',
    features: ['Citizen interface', 'Admin dashboard', 'AI assistant', 'Mobile interface'],
    icon: Users,
    color: 'from-blue-500 to-cyan-400',
    image: '/knext.png',
    mockupStyle: 'browser'
  },
  {
    id: 'safivestar',
    name: 'SAFIVESTAR',
    category: 'Distribution Management',
    description: 'A digital workflow for managing vehicles, drivers, inventory, supplies, deliveries, and operational reporting.',
    features: ['Driver interface', 'Admin dashboard', 'Inventory', 'Delivery tracking'],
    icon: Layers,
    color: 'from-indigo-500 to-purple-500',
    image: '/safivestar.png',
    mockupStyle: 'transparent'
  },
  {
    id: 'crm',
    name: 'TELECALLER CRM',
    category: 'Lead Management System',
    description: 'A dedicated CRM designed for telecallers to track inquiries, manage leads, schedule follow-ups, and monitor conversion funnels.',
    features: ['Lead tracking', 'Follow-up queues', 'Conversion funnel', 'Telecaller dashboard'],
    icon: LayoutDashboard,
    color: 'from-purple-500 to-pink-500',
    image: '/telecaller-crm-v3.png',
    mockupStyle: 'browser',
    imageFit: 'contain'
  }
];

export const Projects = () => {
  return (
    <section id="projects" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-dark mb-4"
          >
            BUILT FOR REAL-WORLD PROBLEMS
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted text-balance"
          >
            A selection of digital products and systems developed by RKR Solutions.
          </motion.p>
        </div>

        <div className="space-y-24">
          {projects.map((project, index) => {
            const isEven = index % 2 === 0;
            const Icon = project.icon;
            return (
              <div key={project.id} className={`flex flex-col lg:flex-row gap-12 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                
                {/* Project Info */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex-1 lg:max-w-lg"
                >
                  <div className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">
                    {project.category}
                  </div>
                  <h3 className="text-3xl font-bold text-dark mb-4">{project.name}</h3>
                  <p className="text-muted text-lg mb-8">
                    {project.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {project.features.map(feature => (
                      <div key={feature} className="flex items-center text-sm font-medium text-dark">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <a href="#contact" className="inline-flex items-center font-semibold text-primary hover:text-secondary transition-colors group">
                    View Our Work
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className={`flex-1 w-full relative group ${project.image ? 'aspect-[4/3] lg:aspect-video' : 'h-[400px] rounded-2xl overflow-hidden shadow-soft'}`}
                >
                  {!project.image && (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
                    </>
                  )}
                  
                  {project.image ? (
                    project.mockupStyle === 'browser' ? (
                      /* Image Mockup (Browser Window) */
                      <div className="absolute inset-4 md:inset-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col transform group-hover:scale-[1.02] transition-transform duration-500">
                        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 space-x-2 shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-1 bg-white overflow-hidden relative">
                          <img 
                            src={project.image} 
                            alt={`${project.name} Dashboard`} 
                            className={`absolute inset-0 w-full h-full object-top ${project.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                          />
                        </div>
                      </div>
                    ) : (
                      /* Transparent Image Mockup (No Borders) */
                      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 transform group-hover:scale-105 transition-transform duration-500">
                        <img 
                          src={project.image} 
                          alt={`${project.name} App Interface`} 
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      </div>
                    )
                  ) : (
                    /* Realistic UI composition instead of empty skeletons */
                    <div className="absolute inset-6 md:inset-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col transform group-hover:scale-[1.02] transition-transform duration-500">
                       {/* App Header */}
                       <div className="h-12 bg-gray-50 border-b border-gray-100 flex items-center px-4 justify-between">
                         <div className="flex items-center">
                           <Icon className="w-5 h-5 text-primary mr-2" />
                           <div className="text-sm font-bold text-gray-800">{project.name}</div>
                         </div>
                         <div className="flex space-x-2">
                           <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                           <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                           <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                         </div>
                       </div>
                       
                       {/* Dashboard Content */}
                       <div className="flex-1 p-4 md:p-5 grid grid-cols-3 gap-4 bg-gray-50/50">
                          {/* Main Area */}
                          <div className="col-span-2 flex flex-col space-y-4">
                            {/* Metrics / Chart Area */}
                            <div className="flex-1 bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col">
                               <div className="flex justify-between items-center mb-4">
                                 <div className="text-xs font-semibold text-gray-500 uppercase">Activity Overview</div>
                                 <div className="text-[10px] font-medium bg-green-50 text-green-600 px-2 py-0.5 rounded-full">+12.5%</div>
                               </div>
                               {/* Simple CSS Bar Chart */}
                               <div className="flex-1 flex items-end justify-between space-x-2">
                                 {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                   <div key={i} className="w-full bg-primary/10 rounded-t-sm relative group">
                                     <div className="absolute bottom-0 w-full bg-primary/60 rounded-t-sm transition-all duration-500" style={{ height: `${h}%` }}></div>
                                   </div>
                                 ))}
                               </div>
                            </div>
                            
                            {/* List / Table Area */}
                            <div className="h-24 bg-white rounded-lg border border-gray-100 shadow-sm p-3 flex flex-col justify-between">
                               <div className="text-xs font-semibold text-gray-500 mb-2">Recent Items</div>
                               <div className="space-y-2">
                                 {[1, 2].map(i => (
                                   <div key={i} className="flex items-center justify-between">
                                     <div className="flex items-center space-x-2">
                                       <div className="w-4 h-4 rounded bg-gray-100"></div>
                                       <div className="h-2 w-16 bg-gray-200 rounded"></div>
                                     </div>
                                     <div className="h-2 w-8 bg-gray-100 rounded"></div>
                                   </div>
                                 ))}
                               </div>
                            </div>
                          </div>
                          
                          {/* Sidebar Area */}
                          <div className="col-span-1 flex flex-col space-y-4">
                             {/* Status Card */}
                             <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 text-center">
                                <div className="text-xs text-gray-400 mb-1">System Status</div>
                                <div className="text-sm font-bold text-gray-800">Operational</div>
                                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                                  <div className="bg-green-400 h-1.5 rounded-full w-4/5"></div>
                                </div>
                             </div>
                             
                             {/* Modules List */}
                             <div className="flex-1 bg-white rounded-lg border border-gray-100 shadow-sm p-3">
                                <div className="text-xs font-semibold text-gray-500 mb-3">Modules</div>
                                <div className="space-y-2">
                                  {project.features.slice(0, 3).map(feature => (
                                    <div key={feature} className="text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-100 px-2 py-1 rounded">
                                      {feature}
                                    </div>
                                  ))}
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                </motion.div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
