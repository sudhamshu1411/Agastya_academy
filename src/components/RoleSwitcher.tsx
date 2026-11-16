import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, ShieldCheck, Calendar } from 'lucide-react';
import { supabase } from '../supabaseClient';

export function RoleSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [canSwitchPortals, setCanSwitchPortals] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (!user) return;
      const isFounderEmail = user.email?.toLowerCase().trim() === 'sudhamshu1411@gmail.com';
      if (isFounderEmail) {
        setCanSwitchPortals(true);
        return;
      }
      const metaRole = user.user_metadata?.role;
      if (metaRole === 'founder' || metaRole === 'admin') {
        setCanSwitchPortals(true);
        return;
      }
      if (user.id) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        if (data?.role === 'founder' || data?.role === 'admin') {
          setCanSwitchPortals(true);
        }
      }
    }).catch(() => {});
  }, []);

  const portals = [
    { label: 'Founder', path: '/founder/dashboard' },
    { label: 'Admin', path: '/admin/dashboard' },
    { label: 'Faculty', path: '/faculty/dashboard' },
    { label: 'Student', path: '/dashboard' },
  ];

  return (
    <div className="px-4 pb-4 space-y-3">
      {canSwitchPortals && (
        <div className="border border-slate-700 bg-slate-800/70 p-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" /> Portal Switcher
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {portals.map((p) => {
              const isActive = location.pathname === p.path;
              return (
                <button
                  key={p.path}
                  onClick={() => navigate(p.path)}
                  className={`px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 border-white'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => navigate('/founder/schedule')}
            className="w-full mt-1.5 px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3 h-3" /> Central Scheduler
          </button>
        </div>
      )}

      <button 
        onClick={toggleTheme}
        className="w-full flex items-center justify-between px-3 py-2 border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
        {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
      </button>
    </div>
  );
}
