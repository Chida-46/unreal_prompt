import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  sublabel,
  icon: Icon,
  color = 'indigo',
  trend,
}) => {
  const colorStyles: Record<string, { bg: string; text: string; iconBg: string }> = {
    indigo: { bg: 'bg-indigo-50/50', text: 'text-indigo-600', iconBg: 'bg-indigo-50' },
    emerald: { bg: 'bg-emerald-50/50', text: 'text-emerald-600', iconBg: 'bg-emerald-50' },
    amber: { bg: 'bg-amber-50/50', text: 'text-amber-600', iconBg: 'bg-amber-50' },
    rose: { bg: 'bg-rose-50/50', text: 'text-rose-600', iconBg: 'bg-rose-50' },
    blue: { bg: 'bg-blue-50/50', text: 'text-blue-600', iconBg: 'bg-blue-50' },
  };

  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition duration-150">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${style.iconBg} ${style.text}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {sublabel && (
        <p className="mt-1 text-xs text-slate-500 font-medium">{sublabel}</p>
      )}
    </div>
  );
};
