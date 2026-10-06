'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { EmptyState } from '@/components/EmptyState';
import {
  Layers,
  Plus,
  Copy,
  Check,
  Search,
  Users,
  BookOpen,
  ChevronRight,
  Trophy,
} from 'lucide-react';

export default function InstructorBatchesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'SUPER_ADMIN'))) {
      router.push('/instructor/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const res = await fetch('/api/batches');
        if (res.ok) {
          const data = await res.json();
          setBatches(data.batches || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadBatches();
  }, [user]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filtered = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="My Batches" />

        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">DSA Course Batches</h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage your academic course sections, batch codes, and coursework
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/60 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <Link
                href="/instructor/batches/create"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Batch</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">Loading batches...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No batches found"
              description="Create your first batch to generate a code and enroll students."
              actionText="+ Create Batch"
              actionHref="/instructor/batches/create"
              icon={Layers}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((batch) => (
                <div
                  key={batch._id}
                  className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border border-slate-800 hover:border-brand-500/40 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        {batch.branch} • Section {batch.section} • {batch.academicYear}
                      </span>
                      <button
                        onClick={() => copyCode(batch.code)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 hover:border-teal-500/50 transition"
                      >
                        {copiedCode === batch.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <span>{batch.code}</span>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          </>
                        )}
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition">
                      {batch.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {batch.description || 'Data Structures and Algorithms curriculum coursework.'}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">Students</span>
                        <span className="text-base font-bold text-white">{batch.studentCount || 0}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">Assignments</span>
                        <span className="text-base font-bold text-white">{batch.assignmentCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-semibold">
                    <Link
                      href={`/instructor/batches/${batch._id}`}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-center transition"
                    >
                      View Hub
                    </Link>
                    <Link
                      href={`/instructor/batches/${batch._id}?tab=progress`}
                      className="py-2 px-3 rounded-xl bg-brand-600/20 text-brand-300 border border-brand-500/30 hover:bg-brand-600/30 text-center transition"
                    >
                      Progress
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
