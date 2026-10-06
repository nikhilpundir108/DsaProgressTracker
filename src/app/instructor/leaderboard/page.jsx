'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { Trophy, ChevronRight, Layers, Users } from 'lucide-react';

export default function InstructorLeaderboardSelectorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Batch Leaderboards" />

        <main className="p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>Batch Leaderboards</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select a batch section to view competitive rankings and assignment milestones
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">Loading batches...</div>
          ) : batches.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm bg-slate-900/40 rounded-3xl border border-slate-800">
              No batches created yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {batches.map((batch) => (
                <Link
                  key={batch._id}
                  href={`/instructor/batches/${batch._id}?tab=leaderboard`}
                  className="glass-card rounded-3xl p-6 border border-slate-800 hover:border-amber-500/40 transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        {batch.branch} • Sec {batch.section}
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                        {batch.code}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-lg group-hover:text-amber-300 transition">
                      {batch.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {batch.studentCount || 0} Students enrolled
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400">
                    <span>Open Leaderboard</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
