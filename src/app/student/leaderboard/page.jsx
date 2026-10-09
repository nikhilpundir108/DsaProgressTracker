'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { EmptyState } from '@/components/EmptyState';
import { Trophy, Layers, Medal, Users } from 'lucide-react';

export default function StudentLeaderboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'STUDENT')) {
      router.push('/student/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const res = await fetch('/api/batches');
        if (res.ok) {
          const data = await res.json();
          const bList = data.batches || [];
          setBatches(bList);
          if (bList.length > 0) {
            setSelectedBatchId(bList[0]._id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadBatches();
  }, [user]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!selectedBatchId) return;
      try {
        const res = await fetch(`/api/batches/${selectedBatchId}/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadLeaderboard();
  }, [selectedBatchId]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Batch Leaderboard" />

        <main className="p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span>Batch Leaderboard</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Competitive ranking based on Assignment Completion % and Total DSA Solved
              </p>
            </div>

            {batches.length > 1 && (
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-teal-500"
              >
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">Loading leaderboard...</div>
          ) : batches.length === 0 ? (
            <EmptyState
              title="You haven't joined any batch yet"
              description="Join a batch to view your ranking among peers on the leaderboard."
              actionText="Join Batch"
              actionHref="/student/join-batch"
              icon={Trophy}
            />
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Rankings</h3>
                <span className="text-xs font-medium text-slate-400">
                  {leaderboard.length} Enrolled Students
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4 w-16">Rank</th>
                      <th className="py-3 px-4">Student</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {leaderboard.map((row) => (
                      <tr
                        key={row._id}
                        className={`transition ${
                          row.isCurrentUser
                            ? 'bg-teal-500/15 border-l-4 border-l-teal-400 font-bold'
                            : row.rank === 1
                            ? 'bg-amber-500/5'
                            : row.rank === 2
                            ? 'bg-slate-400/5'
                            : row.rank === 3
                            ? 'bg-amber-800/5'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold">
                          {row.rank === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xs font-black">
                              🥇
                            </span>
                          ) : row.rank === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center text-xs font-black">
                              🥈
                            </span>
                          ) : row.rank === 3 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-800/20 text-amber-600 border border-amber-800/40 flex items-center justify-center text-xs font-black">
                              🥉
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">#{row.rank}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {row.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
