import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, User, ShieldCheck, GraduationCap } from 'lucide-react';

export function RoleSwitcher() {
  const userEmail = localStorage.getItem('userEmail');
  
  if (userEmail !== 'sudhamshu1411@gmail.com') return null;

  const setRole = (role: string) => {
    localStorage.setItem('userRole', role);
  };

  return (
    <div className="px-4 py-4 mt-auto border-t border-white/20 bg-slate-800">
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-3">Master Override</div>
      <div className="space-y-2">
        <Link to="/founder/dashboard" onClick={() => setRole('founder')} className="flex items-center gap-2 text-xs text-white/70 hover:text-white">
          <ShieldAlert className="w-3 h-3" /> Founder View
        </Link>
        <Link to="/admin/dashboard" onClick={() => setRole('admin')} className="flex items-center gap-2 text-xs text-white/70 hover:text-white">
          <ShieldCheck className="w-3 h-3" /> Admin View
        </Link>
        <Link to="/faculty/dashboard" onClick={() => setRole('faculty')} className="flex items-center gap-2 text-xs text-white/70 hover:text-white">
          <GraduationCap className="w-3 h-3" /> Faculty View
        </Link>
        <Link to="/dashboard" onClick={() => setRole('student')} className="flex items-center gap-2 text-xs text-white/70 hover:text-white">
          <User className="w-3 h-3" /> Student View
        </Link>
      </div>
    </div>
  );
}
