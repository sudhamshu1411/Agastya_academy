import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Quote, Shield, Target } from "lucide-react";

export function About() {
  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24 font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-24"
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-slate-900"></span>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">The Institution</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif italic mb-12">
            About the Academy.
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 leading-relaxed mb-8 border-l-2 border-slate-900 pl-6">
            Agastya Academy was founded on a singular premise: to provide an unambiguous, rigorous, and highly focused environment for engineering and medical aspirants, stripped of all commercial noise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-slate-900 p-8 shadow-[12px_12px_0px_var(--color-slate-900)]"
          >
            <Shield className="w-8 h-8 mb-6 text-slate-900" />
            <h2 className="text-2xl font-serif italic mb-4">Our Integrity</h2>
            <p className="text-sm text-slate-600 mb-6">
              We do not believe in mass enrollments. A tightly controlled batch size ensures every student receives individual attention, customized tracking, and the freedom to interrogate complex concepts without feeling lost in a crowd.
            </p>
            <Link to="/philosophy" className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:gap-4 transition-all">
              Read Our Philosophy <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <div className="bg-slate-900 text-white p-6 shadow-[8px_8px_0px_#cbd5e1]">
              <Target className="w-6 h-6 mb-4 text-slate-400" />
              <h3 className="font-bold text-sm mb-2">The Goal</h3>
              <p className="text-xs text-slate-400">To cultivate clarity of thought and depth of subject knowledge over rote memorization.</p>
            </div>
            <div className="bg-white border border-slate-900 p-6 shadow-[8px_8px_0px_var(--color-slate-900)]">
              <BookOpen className="w-6 h-6 mb-4 text-slate-900" />
              <h3 className="font-bold text-sm mb-2">The Curriculum</h3>
              <p className="text-xs text-slate-600">A structured progression blending rigorous theory with exhaustive problem-solving.</p>
            </div>
            <div className="sm:col-span-2 bg-slate-100 p-6 border-l-4 border-slate-900 flex gap-4">
              <Quote className="w-6 h-6 text-slate-400 shrink-0" />
              <p className="text-sm font-serif italic text-slate-700">"Education here is not a transaction; it is a shared commitment to intellectual rigor."</p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
