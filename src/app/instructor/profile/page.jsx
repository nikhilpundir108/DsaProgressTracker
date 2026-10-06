'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { UserCheck, Mail, Phone, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function InstructorProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'SUPER_ADMIN'))) {
      router.push('/instructor/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Faculty Profile" />

        <main className="p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-5 pb-6 border-b border-slate-800">
              <div className="w-20 h-20 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-300 text-3xl font-extrabold flex items-center justify-center shadow-lg shadow-indigo-500/20">
                {user.name?.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white tracking-tight">{user.name}</h1>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                    {user.instructorId}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  DSA Instructor • {user.department || 'Computer Science & Engineering'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Official Email
                </span>
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>{user.email}</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Instructor ID
                </span>
                <span className="text-sm font-mono font-bold text-teal-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>{user.instructorId}</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Department
                </span>
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-400" />
                  <span>{user.department || 'Computer Science & Engineering'}</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Account Status
                </span>
                <span className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Active Faculty Member</span>
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
