import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BookOpen, Trophy, Award, History, MapPin } from "lucide-react";
import { getValidUsers } from "../lib/users";

export function Faculty() {
  const [facultyMembers, setFacultyMembers] = useState<any[]>([]);

  useEffect(() => {
    // Wait for the component to mount, then load active faculty from store
    const users = getValidUsers();
    const faculty = users.filter((u: any) => u.role === "faculty");
    
    // Make sure we have R.P Kumar at the very least for demo structure
    const defaultFaculty = [
      {
         fullName: "R.P Kumar",
         roleTitle: "Chief Mentor",
         bio: "With over 14 years of dedicated teaching experience in NEET & JEE Advanced physics, Mr. Pavan has developed a unique pedagogy that breaks down complex abstractions into grounded, intuitive principles.",
         education: "B.Tech IIT Madras",
         trackRecord: "Mentored 50+ students in Top 1000 AIR."
      }
    ];

    // Combine static default with dynamic ones, avoiding duplicates by name if needed,
    // actually let's just show default if none present, otherwise map them.
    if (faculty.length === 0) {
      setFacultyMembers(defaultFaculty);
    } else {
      setFacultyMembers(faculty.map(f => ({
        fullName: f.fullName || "Demo Faculty",
        roleTitle: "Senior Faculty",
        bio: "Dedicated teaching professional committed to academic excellence.",
        education: "Advanced Degree",
        trackRecord: "Proven results.",
        email: f.email
      })));
    }
  }, []);

  return (
    <div className="bg-slate-50 pt-20">
      
      {/* Hero */}
      <section className="py-24 border-b border-slate-900 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
           <div className="flex items-center justify-center gap-4 mb-8">
            <span className="h-px w-8 bg-white/30"></span>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/50">Instruction</span>
            <span className="h-px w-8 bg-white/30"></span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif italic mb-8 leading-tight"
          >
            Guided by Mastery.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto"
          >
            We do not employ "recent graduates" or "part-time contractors." Every class at Agastya is delivered by industry veterans who have shaped top ranks for over a decade.
          </motion.p>
        </div>
      </section>

      {/* Primary Faculty Profile */}
      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {facultyMembers.map((member, index) => (
          <div key={index} className="flex flex-col lg:flex-row border border-slate-900 bg-white shadow-[12px_12px_0px_#1A1A1A] mb-12">
            {/* Faculty Image placeholder */}
            <div className="lg:w-2/5 bg-slate-200 border-b lg:border-b-0 lg:border-r border-slate-900 relative min-h-[400px]">
               <div className="absolute inset-0 bg-slate-800 mix-blend-multiply opacity-10"></div>
               <div className="absolute bottom-6 left-6 bg-slate-900 text-white p-4 font-mono text-sm uppercase tracking-widest shadow-[4px_4px_0px_#1A1A1A] z-10">
                 {member.roleTitle}
               </div>
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                  <BookOpen className="w-16 h-16 mb-4 opacity-50 stroke-1" />
                  <p className="font-serif italic text-2xl">{member.fullName}</p>
                  <p className="font-mono text-xs uppercase tracking-widest mt-2">{member.education}</p>
               </div>
            </div>
            
            {/* Faculty Details */}
            <div className="lg:w-3/5 p-8 lg:p-14">
              <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 mb-2">{member.fullName}</h2>
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-8 pb-8 border-b border-slate-200">
                Senior Faculty & Academic Director
              </p>
              
              <div className="space-y-6">
                <p className="text-slate-700 leading-relaxed">
                  {member.bio}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pt-8 border-t border-slate-200">
                 <div className="flex items-start gap-4">
                   <Trophy className="w-5 h-5 text-slate-900 shrink-0" />
                   <div>
                     <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-900 mb-1">Track Record</h4>
                     <p className="font-mono text-sm text-slate-600">{member.trackRecord}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4">
                   <History className="w-5 h-5 text-slate-900 shrink-0" />
                   <div>
                     <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-900 mb-1">Experience</h4>
                     <p className="font-mono text-sm text-slate-600">14+ Years exclusive coaching.</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4">
                   <Award className="w-5 h-5 text-slate-900 shrink-0" />
                   <div>
                     <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-900 mb-1">Education</h4>
                     <p className="font-mono text-sm text-slate-600">{member.education}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4">
                   <MapPin className="w-5 h-5 text-slate-900 shrink-0" />
                   <div>
                     <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-900 mb-1">Contact</h4>
                     <p className="font-mono text-sm text-slate-600">{member.email || "Faculty Pool"}</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        ))}
        
      </section>

      {/* Pedagogy Note */}
      <section className="py-24 bg-slate-900 text-slate-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-8 h-8 text-white mx-auto mb-8 opacity-50" />
          <h2 className="text-3xl font-serif italic text-white mb-8">The Agastya Promise</h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-12">
            "We do not delegate doubt-solving to junior associates. The master who teaches the theory is the same master who resolves your confusion. In a batch of just 15 students, there is no place to hide your ignorance, and no limit to how far you can excel."
          </p>
          <div className="w-16 h-px bg-white/30 mx-auto"></div>
        </div>
      </section>

    </div>
  );
}
