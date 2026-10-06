'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { ShieldCheck, Mail, Globe, UserCheck, ExternalLink } from 'lucide-react';

export default function StudentSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Settings" />

        <main className="p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <span>Account & Authentication</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your account is managed via verified Google OAuth
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Authenticated Email</span>
                  <span className="text-sm font-mono text-white font-bold">{user.email}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Google Verified
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Student Profile & Handles</span>
                  <span className="text-xs text-slate-400">Manage your LeetCode and GFG usernames</span>
                </div>
                <Link
                  href="/student/profile"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  Edit Handles →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
