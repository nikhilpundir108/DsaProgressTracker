'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import {
  RefreshCw,
  Database,
  Bell,
  Code2,
  ExternalLink,
  CheckCircle,
  Menu,
  X,
} from 'lucide-react';

export function Navbar({ title, onSync, isSyncing }) {
  const { user, logout, refreshUser } = useAuth();
  const [reseedLoading, setReseedLoading] = useState(false);
  const [reseedSuccess, setReseedSuccess] = useState(false);

  const handleReseed = async () => {
    if (!confirm('Reseed database with fresh demo data? (All testing accounts and sample submissions will be restored)')) {
      return;
    }
    setReseedLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        setReseedSuccess(true);
        setTimeout(() => setReseedSuccess(false), 4000);
        await refreshUser();
        window.location.reload();
      }
    } catch (e) {
      alert('Error reseeding: ' + e.message);
    } finally {
      setReseedLoading(false);
    }
  };

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

        {/* Demo Data Reseed quick action */}
        <button
          onClick={handleReseed}
          disabled={reseedLoading}
          title="Reset / Reseed Demo Data"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition"
        >
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>{reseedLoading ? 'Seeding...' : 'Reset Demo Data'}</span>
        </button>

        {reseedSuccess && (
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fadeIn">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Demo Data Ready</span>
          </span>
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
