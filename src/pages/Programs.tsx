import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Target, Calendar, CheckCircle2 } from "lucide-react";

export function Programs() {
  const programs = [
    {
      title: "Two-Year Comprehensive",
      target: "Class 11 & 12",
      icon: <Calendar className="w-6 h-6" />,
      desc: "Our flagship program designed for students entering Class 11. It provides a structured pacing, building an impregnable foundation while systematically ascending to advanced problem-solving required for JEE and NEET.",
      features: ["Complete NCERT coverage", "Iterative revision cycles", "Weekly unified assessments", "Personalized mentorship and tracking"]
    },
    {
      title: "One-Year Target",
      target: "Class 12 Pass (Droppers)",
      icon: <Target className="w-6 h-6" />,
      desc: "A highly intensive, fast-paced curriculum for students dedicating a year exclusively to competitive preparation. Focus is heavily localized on closing conceptual gaps and rigorous testing.",
      features: ["Accelerated curriculum", "High-frequency testing", "Advanced problem-solving clinics", "Dedicated doubt-resolution hours"]
    },
    {
      title: "Foundation Program",
      target: "Class 9 & 10",
      icon: <Clock className="w-6 h-6" />,
      desc: "An early-start initiative designed to inculcate analytical thinking and mathematical rigor well before the actual JEE/NEET preparation begins. We fortify core logic over rote learning.",
      features: ["Olympiad preparation", "Mental aptitude enhancement", "Core science deep dives", "Analytical mathematics"]
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24 font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-24"
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-slate-900"></span>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Offerings</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif italic mb-8">
            Academic Programs.
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 leading-relaxed">
            We offer specialized, highly focused programs designed for distinct stages of a student's academic journey. Each program maintains our strict cap on batch sizes to ensure uncompromised quality.
          </p>
        </motion.div>

        <div className="space-y-12">
          {programs.map((program, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-900 shadow-[12px_12px_0px_var(--color-slate-900)] p-8 md:p-12 flex flex-col md:flex-row gap-12"
            >
              <div className="md:w-1/3">
                <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center mb-6">
                  {program.icon}
                </div>
                <h2 className="text-3xl font-serif italic mb-2">{program.title}</h2>
                <span className="inline-block bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-6">
                  {program.target}
                </span>
              </div>
              <div className="md:w-2/3 flex flex-col justify-between">
                <p className="text-slate-600 mb-8 leading-relaxed">
                  {program.desc}
                </p>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 pb-2">Program Features</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {program.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           className="mt-24 text-center border-t border-slate-200 pt-16 flex flex-col items-center"
        >
          <h2 className="text-3xl font-serif italic mb-6">Looking to Enroll?</h2>
          <p className="text-slate-600 max-w-lg mb-8">Admissions are currently open for the upcoming academic session. Review our intake process and register for the screening test.</p>
          <Link to="/admissions" className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
            Admissions Process <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
