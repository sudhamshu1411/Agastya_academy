import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Philosophy() {
  return (
    <div className="bg-slate-50 pt-20">
      
      {/* Hero */}
      <section className="py-24 border-b border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <div className="flex items-center justify-center gap-4 mb-8">
            <span className="h-px w-8 bg-slate-900"></span>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-500">The Method</span>
            <span className="h-px w-8 bg-slate-900"></span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif italic text-slate-900 mb-8 leading-tight"
          >
            Education without discipline is mere entertainment.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
          >
            We do not sell magic formulas or gamified learning. Mastering Physics for NEET requires rigorous tracking, conceptual depth, and inescapable accountability.
          </motion.p>
        </div>
      </section>

      {/* Philosophy Points */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-32">
          
          <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start">
            <div className="md:w-1/3">
              <span className="font-mono text-6xl text-slate-200 block mb-4">01</span>
              <h3 className="font-serif italic text-3xl text-slate-900 mb-4">The Fallacy of Crowds</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Batch constraint protocol</p>
            </div>
            <div className="md:w-2/3 border-l border-slate-200 pl-8 md:pl-12">
              <p className="text-slate-600 leading-relaxed mb-6">
                Most coaching institutes measure success by revenue, leading to crowded batches of 100+ students. In such environments, the average student becomes invisible. Their doubts are ignored, their declining performance goes unnoticed, and their potential is wasted.
              </p>
              <p className="text-slate-600 leading-relaxed font-mono text-sm bg-slate-100 p-6 border border-slate-200">
                Agastya strictly caps batches at 15 members. This ensures every student's gaze is met, every doubt is addressed, and no one can hide their lack of preparation behind the masses.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start">
            <div className="md:w-1/3">
              <span className="font-mono text-6xl text-slate-200 block mb-4">02</span>
              <h3 className="font-serif italic text-3xl text-slate-900 mb-4">Micro-Scheduling</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Algorithmic Discipline</p>
            </div>
            <div className="md:w-2/3 border-l border-slate-200 pl-8 md:pl-12">
              <p className="text-slate-600 leading-relaxed mb-6">
                Telling a student to "study at home" is insufficient. Procrastination is a systemic failure, not a moral one. It happens when tasks are ambiguous and unmonitored.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                 <div className="border border-slate-900 p-6 shadow-[4px_4px_0px_#1A1A1A]">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Daily ERP Tasks</h4>
                    <p className="text-sm font-mono text-slate-600">Students receive exact MCQ counts, video modules, and syllabus chunks daily via the portal.</p>
                 </div>
                 <div className="border border-slate-900 p-6 shadow-[4px_4px_0px_#1A1A1A]">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Completion Tracking</h4>
                    <p className="text-sm font-mono text-slate-600">Faculty monitor daily compliance rates. Inconsistency triggers immediate interventions.</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start">
            <div className="md:w-1/3">
              <span className="font-mono text-6xl text-slate-200 block mb-4">03</span>
              <h3 className="font-serif italic text-3xl text-slate-900 mb-4">Data-Driven Evolution</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Continuous Assessment</p>
            </div>
            <div className="md:w-2/3 border-l border-slate-200 pl-8 md:pl-12">
              <p className="text-slate-600 leading-relaxed mb-6">
                Waiting for a monthly grand test to realize a student is struggling is a critical error. We use high-frequency, low-stakes daily evaluations to map the conceptual understanding of every student.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 text-sm text-slate-700 font-mono">
                  <span className="text-slate-900 font-bold mt-0.5">»</span>
                  Daily quick-fire quizzes before class.
                </li>
                <li className="flex items-start gap-4 text-sm text-slate-700 font-mono">
                  <span className="text-slate-900 font-bold mt-0.5">»</span>
                  Weekly error-log generation isolating weak chapters.
                </li>
                <li className="flex items-start gap-4 text-sm text-slate-700 font-mono">
                  <span className="text-slate-900 font-bold mt-0.5">»</span>
                  Parental transparency through the connected portal ecosystem.
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-900 bg-slate-900 text-white py-24 text-center">
        <h2 className="text-4xl font-serif italic mb-8">Ready to embrace structure?</h2>
        <Link to="/admissions" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-bold shadow-[6px_6px_0px_#666] hover:shadow-[4px_4px_0px_#666] hover:translate-y-[2px] transition-all">
          Apply For Enrollment <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
