import React from "react";
import { motion } from "motion/react";
import { Award, Star, Quote, ArrowUpRight } from "lucide-react";

export function Results() {
  const testimonials = [
    {
      text: "The structured approach at Agastya entirely changed my perspective on Physics. It wasn't about surviving the syllabus anymore, it was about mastering the intuition behind the math.",
      author: "Aditi S.",
      rank: "AIR 214, JEE Advanced",
      year: "2025"
    },
    {
      text: "Coming from a different city, the small batch size ensured I wasn't neglected. The teachers knew exactly where I struggled before I even asked. Unparalleled dedication.",
      author: "Rahul M.",
      rank: "AIR 560, NEET UG",
      year: "2025"
    },
    {
      text: "No false promises, no marketing gimmicks. Just hardcore, rigorous academics. The environment is intensely competitive yet incredibly supportive.",
      author: "Sneha P.",
      rank: "AIR 1208, JEE Advanced",
      year: "2024"
    }
  ];

  return (
    <div className="bg-slate-900 min-h-screen pt-32 pb-24 font-sans text-slate-300 selection:bg-white selection:text-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, ease: "easeOut" }}
           className="mb-24 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="w-12 h-px bg-slate-500"></span>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white">The Legacy</span>
            <span className="w-12 h-px bg-slate-500"></span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif italic mb-8 text-white">
            Results & Reality.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
            We don't buy ranks or inflate numbers. Our results are a pure reflection of the grueling effort put in by our students and the clinical precision of our faculty.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="bg-slate-800 border border-slate-700 p-8 text-center"
           >
             <Award className="w-8 h-8 text-[#D4AF37] mx-auto mb-6" />
             <h3 className="text-5xl font-serif italic text-white mb-2">42%</h3>
             <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">JEE Adv. Qualification Ratio</p>
           </motion.div>
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="bg-slate-800 border border-slate-700 p-8 text-center relative overflow-hidden"
           >
             <div className="absolute top-0 right-0 p-4"><Star className="w-4 h-4 text-slate-600" /></div>
             <h3 className="text-5xl font-serif italic text-white mb-2 pt-6">8/10</h3>
             <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Students Above 99%ile (Mains)</p>
           </motion.div>
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="bg-slate-800 border border-slate-700 p-8 text-center"
           >
             <h3 className="text-5xl font-serif italic text-white mb-2 pt-6">24</h3>
             <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Top 1000 AI Ranks (Last 3 Yrs)</p>
           </motion.div>
        </div>

        <div className="mb-24">
           <h2 className="text-3xl font-serif italic text-white mb-12 text-center">What the Students Say</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {testimonials.map((t, idx) => (
               <motion.div
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.1 }}
                 className="bg-white text-slate-900 p-8 shadow-[8px_8px_0px_var(--color-slate-600)] flex flex-col justify-between"
               >
                 <div>
                   <Quote className="w-6 h-6 text-slate-300 mb-6" />
                   <p className="font-medium leading-relaxed mb-8">{t.text}</p>
                 </div>
                 <div className="border-t border-slate-200 pt-4">
                   <p className="font-bold">{t.author}</p>
                   <p className="text-xs text-slate-500 font-mono mt-1">{t.rank} | {t.year}</p>
                 </div>
               </motion.div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
}
