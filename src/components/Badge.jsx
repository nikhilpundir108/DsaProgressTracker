import React from 'react';

export function DifficultyBadge({ difficulty }) {
  const d = (difficulty || 'Easy').toLowerCase();
  if (d === 'easy' || d === 'basic' || d === 'school') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        {difficulty || 'Easy'}
      </span>
    );
  }
  if (d === 'medium') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
        Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
      Hard
    </span>
  );
}

export function PlatformBadge({ platform }) {
  const p = (platform || 'LEETCODE').toUpperCase();
  if (p === 'GFG') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-900/40 text-green-300 border border-green-700/50">
        GFG
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-900/40 text-amber-300 border border-amber-700/50">
      LeetCode
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = (status || 'PENDING').toUpperCase();
  if (s === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        ✓ Completed
      </span>
    );
  }
  if (s === 'LATE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
        ⏱ Solved Late
      </span>
    );
  }
  if (s === 'APPROVED' || s === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-400 border border-teal-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
        {status}
      </span>
    );
  }
  if (s === 'REJECTED' || s === 'INACTIVE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
      ○ Pending
    </span>
  );
}

export function RoleBadge({ role }) {
  if (role === 'SUPER_ADMIN') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
        Super Admin
      </span>
    );
  }
  if (role === 'INSTRUCTOR') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
        Instructor
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
      Student
    </span>
  );
}
