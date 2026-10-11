'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { RefreshCw } from 'lucide-react';

export function Navbar({ title, onSync, isSyncing }) {
  const { user, logout, refreshUser } = useAuth();

  return (
    <header className="h-16 px-6 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white tracking-tight">{title || 'Dashboard'}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Sync button for students or instructors */}
        {onSync && (
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-600/20 text-brand-300 border border-brand-500/40 hover:bg-brand-600/30 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-400' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        )}

        {/* College domain indicator */}
        <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 border border-slate-700/70 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>MIT / MIET Portal</span>
        </div>
      </div>
    </header>
  );
}
