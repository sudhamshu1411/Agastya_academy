import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock, Target, Users } from "lucide-react";

export function Home() {
  return (
    <div className="bg-slate-50 pt-20">
      {/* Main Hero Layout (Split View) */}
      <div className="flex flex-col lg:flex-row border-b border-slate-900 bg-slate-50 min-h-[calc(100vh-5rem)]">
        
        {/* Left Column: Manifesto & Philosophy */}
        <div className="lg:w-7/12 border-b lg:border-b-0 lg:border-r border-slate-900 p-8 lg:p-16 xl:p-24 flex flex-col justify-between">
          <header>
            <div className="flex items-center gap-4 mb-8">
              <span className="h-px w-12 bg-slate-900"></span>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-500">Academic Seriousness</span>
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-serif text-5xl md:text-7xl lg:text-[84px] leading-[0.85] tracking-tight mb-8 text-slate-900"
            >
              Never lost<br/>
              <span className="italic">in a crowd.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg leading-relaxed text-slate-700 max-w-md"
            >
              A disciplined, mentorship-driven ecosystem designed exclusively for NEET Physics aspirants who seek conceptual clarity over rote memorization.
            </motion.p>
          </header>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-slate-200 pt-8 mt-16"
          >
            <div>
              <h3 className="text-[11px] uppercase tracking-widest font-bold mb-3 text-slate-900">Batch Constraint</h3>
              <p className="text-sm text-slate-600">Strictly limited to 15 members per session to ensure every student is continuously monitored.</p>
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-widest font-bold mb-3 text-slate-900">NEET Precision</h3>
              <p className="text-sm text-slate-600">Rigorous micro-scheduling that bridges the gap between coaching and personal attention.</p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Interactive Elements / Stats */}
        <div className="lg:w-5/12 bg-slate-100 p-8 lg:p-16 xl:p-24 flex flex-col justify-between relative">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white border border-slate-900 p-8 shadow-[12px_12px_0px_var(--color-slate-900)]"
          >
            <h2 className="text-3xl font-serif mb-6 text-slate-900">Admission Status</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-500">Active Batches</span>
                <span className="font-mono text-xl text-slate-900">04</span>
              </div>
              <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-500">Available Seats</span>
                <span className="font-mono text-xl text-amber-700">09</span>
              </div>
              <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-500">Next Intake</span>
                <span className="font-mono text-xl text-slate-900">AUG 15</span>
              </div>
            </div>
            <Link to="/admissions" className="block w-full mt-10 bg-slate-900 text-white text-center py-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors">
              Initiate Enrollment
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20"
          >
            <div className="text-[64px] font-serif leading-none italic text-slate-300 mb-2">98.4%</div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-900">Average Conceptual Score</p>
            <div className="mt-4 h-1 w-full bg-slate-200 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "98.4%" }}
                transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-slate-900" 
              />
            </div>
          </motion.div>

          {/* Absolute Decorative Element */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 1, delay: 0.6 }}
            className="hidden lg:flex absolute top-1/2 -left-16 transform -translate-y-1/2 w-32 h-32 border border-slate-900 rounded-full items-center justify-center bg-slate-50 z-10 shadow-sm"
          >
            <div className="text-[8px] uppercase tracking-[0.2em] font-bold text-center p-4 text-slate-900 leading-relaxed">
              Structured<br/>Preparation
            </div>
          </motion.div>
        </div>
      </div>

      {/* USP Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="h-px w-8 bg-slate-900"></span>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-500">The Method</span>
              <span className="h-px w-8 bg-slate-900"></span>
            </div>
            <h2 className="text-4xl font-serif text-slate-900 mb-6 italic">The Agastya Difference</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm leading-relaxed">We do not believe in mass-market coaching. We believe in rigorous tracking, personal accountability, and conceptual clarity.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="w-5 h-5"/>}
              title="15-Member Exclusive Batch"
              desc="Strictly capped batch sizes ensure every student receives dedicated attention. No back-benchers, no one left behind."
            />
            <FeatureCard 
              icon={<Target className="w-5 h-5"/>}
              title="Daily Micro-Scheduling"
              desc="Your entire preparation is mapped day-by-day. Daily goals, targeted MCQs, and continuous academic monitoring."
            />
            <FeatureCard 
              icon={<Clock className="w-5 h-5"/>}
              title="Continuous Evaluation"
              desc="Daily tests, Sunday grand exams, and deep analytics to identify weak chapters before they become liabilities."
            />
          </div>
        </div>
      </section>

      {/* Faculty Section based on resume */}
      <section className="py-24 bg-white border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="aspect-[4/5] bg-slate-200 w-full max-w-md mx-auto relative overflow-hidden border border-slate-900 shadow-[12px_12px_0px_var(--color-slate-900)]">
                <img 
                  src="/founder.png?v=1" 
                  alt="R.P Kumar" 
                  className="w-full h-full object-cover transition-all duration-700"
                />
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <span className="text-slate-500 font-bold tracking-widest text-[10px] uppercase mb-4 block">Lead Faculty & Academic Director</span>
              <h2 className="text-5xl font-serif text-slate-900 mb-8 italic">R.P Kumar</h2>
              
              <div className="space-y-6 text-slate-700">
                <p className="text-base leading-relaxed">
                  A seasoned Senior Lecturer with over 18 years of experience in junior college education, having taught across multiple premium institutions.
                </p>
                <div className="pl-6 border-l border-slate-900 py-2 my-8">
                  <p className="text-sm italic text-slate-600 font-serif leading-relaxed">
                    "My passion is simplifying complex concepts and contributing to institutional academic excellence through experience-driven teaching and absolute discipline."
                  </p>
                </div>
                <ul className="space-y-4 font-mono text-xs">
                  <li className="flex items-start gap-4">
                    <span className="text-slate-400 mt-0.5">01</span>
                    <span>Former Senior Physics Lecturer at Sri Chaitanya Jr. College</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-slate-400 mt-0.5">02</span>
                    <span>Master of Science in Physics, 2003</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-slate-400 mt-0.5">03</span>
                    <span>Strong conceptual explanation & adaptive teaching methodologies</span>
                  </li>
                </ul>
              </div>
              
              <Link to="/faculty" className="inline-flex items-center gap-3 mt-12 text-[10px] uppercase tracking-widest font-bold text-slate-900 border-b border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors">
                Read Full Academic Profile
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Platform Teaser Section */}
      <section className="py-24 bg-slate-50 text-slate-900 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="h-px w-8 bg-slate-900"></span>
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-500">Technology</span>
              </div>
              <h2 className="text-4xl font-serif mb-8 italic">The Agastya<br/>ERP Ecosystem</h2>
              <p className="text-slate-600 mb-10 text-sm leading-relaxed max-w-md">
                Our hybrid model merges rigorous offline-style discipline with a state-of-the-art digital portal. Every assignment, every attendance log, and every fraction of a mark is tracked.
              </p>
              
              <div className="space-y-4">
                {['Live Virtual Classes', 'Daily Task & Revision Modules', 'Performance Analytics Engine', 'Secure Parent Monitoring Portal'].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-slate-200 py-3">
                    <span className="font-mono text-xs text-slate-400 text-right w-6">0{i+1}</span>
                    <span className="text-xs uppercase tracking-widest font-bold text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/dashboard" className="mt-12 inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors">
                Preview Student Dashboard
              </Link>
            </div>
            
            <div className="relative">
              {/* Mock Dashboard UI representing the ERP - Styling aligned with theme */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-white rounded-none shadow-[16px_16px_0px_var(--color-slate-900)] p-2 border border-slate-900 overflow-hidden relative aspect-video"
              >
                {/* Header mock */}
                <div className="h-10 border-b border-slate-900 flex items-center px-4 gap-4 bg-slate-50">
                  <div className="w-2.5 h-2.5 rounded-full border border-slate-900 bg-white"></div>
                  <div className="w-2.5 h-2.5 rounded-full border border-slate-900 bg-white"></div>
                  <div className="w-2.5 h-2.5 rounded-full border border-slate-900 bg-white"></div>
                  <div className="h-px w-32 bg-slate-300 ml-4"></div>
                </div>
                {/* Content mock */}
                <div className="p-6 bg-white h-full flex gap-6">
                  <div className="w-1/4 h-full bg-slate-50 border border-slate-200 p-4 flex flex-col gap-4">
                    <div className="h-6 w-full border-b border-slate-300 mb-4"></div>
                    <div className="h-1 w-3/4 bg-slate-200"></div>
                    <div className="h-1 w-full bg-slate-200"></div>
                    <div className="h-1 w-5/6 bg-slate-200"></div>
                  </div>
                  <div className="w-3/4 h-full flex flex-col gap-6">
                    <div className="h-32 w-full bg-slate-50 border border-slate-200 p-4 flex gap-4">
                       <div className="h-full w-24 bg-slate-200 border border-slate-300"></div>
                       <div className="flex-1 flex flex-col gap-3 justify-center">
                          <div className="h-2 w-1/3 bg-slate-400"></div>
                          <div className="h-1 w-1/4 bg-slate-300"></div>
                       </div>
                    </div>
                    <div className="flex-1 w-full bg-slate-50 border border-slate-200 p-4">
                      <div className="h-2 w-1/4 bg-slate-300 mb-6"></div>
                      <div className="flex gap-3 h-full items-end pb-4">
                        {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                           <div key={i} className="flex-1 bg-slate-900" style={{ height: `${h}%` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 border border-slate-900 bg-white hover:bg-slate-100 transition-all duration-300 flex flex-col items-start gap-4"
    >
      <div className="text-slate-900 border border-slate-900 p-3 bg-slate-50 shadow-[4px_4px_0px_var(--color-slate-900)]">
        {icon}
      </div>
      <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-900 mt-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
}
