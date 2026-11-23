import React from 'react';
import { Sparkles, Info } from 'lucide-react';

export const Banner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-indigo-700/50 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold tracking-wide uppercase text-indigo-200">Open-Access Academic Demo</span>
        <span className="hidden sm:inline text-indigo-300">|</span>
        <span className="text-slate-200 hidden md:inline">
          No authentication required. Use the role switcher in the header to navigate between Student, Faculty, and Admin views.
        </span>
      </div>
      <div className="flex items-center gap-3 text-indigo-200">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>GenAI Scheduling Engine Active</span>
        </span>
      </div>
    </div>
  );
};
