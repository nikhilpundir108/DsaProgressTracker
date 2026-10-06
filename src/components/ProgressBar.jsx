import React from 'react';

export function ProgressBar({ value = 0, max = 100, showLabel = true, size = 'md', colorScheme = 'auto' }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / (max || 1)) * 100)));

  let barColor = 'bg-brand-500';
  if (colorScheme === 'auto') {
    if (percentage >= 80) barColor = 'bg-emerald-500';
    else if (percentage >= 50) barColor = 'bg-brand-400';
    else if (percentage >= 25) barColor = 'bg-amber-500';
    else barColor = 'bg-slate-500';
  } else if (colorScheme === 'emerald') {
    barColor = 'bg-emerald-500';
  } else if (colorScheme === 'indigo') {
    barColor = 'bg-indigo-500';
  } else if (colorScheme === 'amber') {
    barColor = 'bg-amber-500';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3.5' : 'h-2.5';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-medium text-slate-400">
          <span>Progress</span>
          <span className="text-slate-200 font-semibold">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden ${heightClass} border border-slate-700/50`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
