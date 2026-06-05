import React from 'react';
import { useTheme } from './ThemeProvider';
import { Moon, Sun } from 'lucide-react';

export function RoleSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="px-4 pb-4">
      <button 
        onClick={toggleTheme}
        className="w-full flex items-center justify-between px-3 py-2 border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 transition-colors"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
        {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
      </button>
    </div>
  );
}
