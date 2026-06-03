import React from 'react';
import { ShieldAlert, User, ShieldCheck, GraduationCap } from 'lucide-react';

export function RoleSwitcher() {
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
  let originalRole = (localStorage.getItem('originalUserRole') || '').toLowerCase().trim();
  
  if (!originalRole) {
    originalRole = (localStorage.getItem('userRole') || 'student').toLowerCase().trim();
    if (isSuperAdmin) {
      originalRole = 'founder';
    }
    localStorage.setItem('originalUserRole', originalRole);
  }
  
  const currentRole = (localStorage.getItem('userRole') || '').toLowerCase().trim();
  
  // Strict safety check: Show RoleSwitcher only if the user inherently has a role higher than student
  if (originalRole === 'student' || originalRole === 'new user' || originalRole === '') return null;

  const setRole = (e: React.MouseEvent, role: string, path: string) => {
    e.preventDefault();
    localStorage.setItem('userRole', role);
    window.location.href = path; // Force reload to ensure entire app state is clean
  };

  const isFounder = originalRole === 'founder' || isSuperAdmin;
  const isAdmin = originalRole === 'admin' || isFounder || originalRole === 'administrator';
  const isFaculty = originalRole === 'faculty' || isAdmin || originalRole === 'teacher';

  return (
    <div className="px-4 py-4 mt-auto border-t border-white/20 bg-slate-800">
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-3">Master Override</div>
      <div className="space-y-2">
        {isFounder && (
          <a href="/founder/dashboard" onClick={(e) => setRole(e, 'founder', '/founder/dashboard')} className={`flex items-center gap-2 text-xs font-medium cursor-pointer ${currentRole === 'founder' ? 'text-amber-400' : 'text-amber-500/90 hover:text-amber-400'}`}>
            <ShieldAlert className="w-3 h-3" /> Founder View
          </a>
        )}
        {isAdmin && (
          <a href="/admin/dashboard" onClick={(e) => setRole(e, 'admin', '/admin/dashboard')} className={`flex items-center gap-2 text-xs cursor-pointer hover:text-white ${currentRole === 'admin' ? 'text-white font-medium' : 'text-white/70'}`}>
            <ShieldCheck className="w-3 h-3" /> Admin View
          </a>
        )}
        {isFaculty && (
          <a href="/faculty/dashboard" onClick={(e) => setRole(e, 'faculty', '/faculty/dashboard')} className={`flex items-center gap-2 text-xs cursor-pointer hover:text-white ${currentRole === 'faculty' ? 'text-white font-medium' : 'text-white/70'}`}>
            <GraduationCap className="w-3 h-3" /> Faculty View
          </a>
        )}
        <a href="/dashboard" onClick={(e) => setRole(e, 'student', '/dashboard')} className={`flex items-center gap-2 text-xs cursor-pointer hover:text-white ${currentRole === 'student' ? 'text-white font-medium' : 'text-white/70'}`}>
          <User className="w-3 h-3" /> Student View
        </a>
        <a href="/dashboard" onClick={(e) => setRole(e, 'new user', '/dashboard')} className={`flex items-center gap-2 text-xs cursor-pointer hover:text-white ${currentRole === 'new user' ? 'text-white font-medium' : 'text-white/70'}`}>
          <User className="w-3 h-3" /> New User View
        </a>
      </div>
    </div>
  );
}
