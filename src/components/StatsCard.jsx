import React from 'react';

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'teal', // teal, indigo, purple, amber, rose, emerald
  trend,
  className = '',
}) {
  const colorStyles = {
    teal: {
      bg: 'from-teal-500/10 to-teal-500/5',
      border: 'border-teal-500/20 hover:border-teal-500/40',
      iconBg: 'bg-teal-500/20 text-teal-400',
      textAccent: 'text-teal-400',
    },
    indigo: {
      bg: 'from-indigo-500/10 to-indigo-500/5',
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      textAccent: 'text-indigo-400',
    },
    purple: {
      bg: 'from-purple-500/10 to-purple-500/5',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/20 text-purple-400',
      textAccent: 'text-purple-400',
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-500/5',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/20 text-amber-400',
      textAccent: 'text-amber-400',
    },
    rose: {
      bg: 'from-rose-500/10 to-rose-500/5',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/20 text-rose-400',
      textAccent: 'text-rose-400',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      textAccent: 'text-emerald-400',
    },
  };

  const style = colorStyles[color] || colorStyles.teal;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.bg} backdrop-blur-md border ${style.border} p-5 transition-all duration-200 hover:-translate-y-0.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="mt-2 text-2xl lg:text-3xl font-bold text-white tracking-tight">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          {trend && (
            <p className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span>↑</span> {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${style.iconBg} border border-white/5 shadow-inner`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
