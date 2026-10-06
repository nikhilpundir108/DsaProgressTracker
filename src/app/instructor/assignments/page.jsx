'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { EmptyState } from '@/components/EmptyState';
import { ProgressBar } from '@/components/ProgressBar';
import { BookOpen, Plus, Search, Calendar, Users, ChevronRight, ExternalLink } from 'lucide-react';

export default function InstructorAssignmentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'SUPER_ADMIN'))) {
      router.push('/instructor/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const res = await fetch('/api/assignments');
        if (res.ok) {
          const data = await res.json();
          setAssignments(data.assignments || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadAssignments();
  }, [user]);

  const filtered = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.batchId?.name && a.batchId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.batchId?.code && a.batchId.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Assignments" />

        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Batch Assignments</h1>
              <p className="text-xs text-slate-400 mt-1">
                Curated DSA problem sets assigned across your student batches
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/60 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <Link
                href="/instructor/batches"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Assignment</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">Loading assignments...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No assignments found"
              description="Create an assignment for one of your batches to assign LeetCode and GFG problems."
              actionText="Go to Batches to Assign"
              actionHref="/instructor/batches"
              icon={BookOpen}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((assign) => (
                <div
                  key={assign._id}
                  className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border border-slate-800 hover:border-brand-500/40 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                        {assign.batchId?.code || 'BATCH'}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(assign.deadline).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition">
                      {assign.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {assign.description || 'Practice problem set for batch students.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                      <span className="text-slate-300 font-semibold">{assign.batchId?.name}</span>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span>{assign.questionCount || 0} Questions Assigned</span>
                        <span className="text-emerald-400 font-bold">{assign.completedCount || 0} Submissions</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <Link
                      href={`/instructor/batches/${assign.batchId?._id}?tab=assignments`}
                      className="text-xs font-semibold text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <span>Manage Batch</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/instructor/batches/${assign.batchId?._id}?tab=progress`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    >
                      View Progress
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
