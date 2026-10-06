'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { StatsCard } from '@/components/StatsCard';
import { ProgressBar } from '@/components/ProgressBar';
import { DifficultyDonutChart } from '@/components/Charts';
import { StatusBadge, DifficultyBadge } from '@/components/Badge';
import {
  BarChart3,
  RefreshCw,
  CheckCircle2,
  Code2,
  BookOpen,
  Trophy,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function StudentProgressPage() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'STUDENT')) {
      router.push('/student/login');
    }
  }, [user, authLoading, router]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${user._id}`);
      if (res.ok) {
        const d = await res.json();
        setAnalytics(d.analytics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadProgress();
  }, [user]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/student/sync', { method: 'POST' });
      const d = await res.json();
      if (res.ok) {
        setMsg('Live coding data synchronized from LeetCode & GFG!');
        setTimeout(() => setMsg(''), 4000);
        await refreshUser();
        await loadProgress();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  if (authLoading || !user) return null;

  const lc = user.leetcodeStats || {};
  const gfg = user.gfgStats || {};

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="My Progress" onSync={handleSync} isSyncing={isSyncing} />

        <main className="p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-brand-400" />
                <span>My Progress & Analytics</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Detailed breakdown of your DSA problem solving statistics and assignment completions
              </p>
            </div>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-brand-600/20 text-brand-300 border border-brand-500/40 hover:bg-brand-600/30 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>

          {msg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {/* Top Metric Cards matching Requirement #27 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard
              title="LeetCode Solved"
              value={lc.totalSolved || 0}
              subtitle="Problems solved"
              icon={Code2}
              color="amber"
            />
            <StatsCard
              title="GFG Solved"
              value={gfg.totalSolved || 0}
              subtitle="Problems solved"
              icon={Code2}
              color="emerald"
            />
            <StatsCard
              title="Assignments Solved"
              value={`${analytics?.totalCompletedQuestions || 0} / ${analytics?.totalAssignedQuestions || 0}`}
              subtitle="Verified completed"
              icon={BookOpen}
              color="indigo"
            />
            <StatsCard
              title="Assignment Progress"
              value={`${analytics?.overallProgress || 0}%`}
              subtitle="Overall completion"
              icon={Trophy}
              color="teal"
            />
          </div>

          {/* Platform Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LeetCode */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-base">LeetCode Difficulty Breakdown</h3>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {lc.totalSolved || 0} Total Solved
                </span>
              </div>

              <DifficultyDonutChart
                easy={lc.easySolved || 0}
                medium={lc.mediumSolved || 0}
                hard={lc.hardSolved || 0}
              />

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 font-semibold block uppercase">Easy</span>
                  <span className="font-bold text-white text-base">{lc.easySolved || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-amber-500/20">
                  <span className="text-[10px] text-amber-400 font-semibold block uppercase">Medium</span>
                  <span className="font-bold text-white text-base">{lc.mediumSolved || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-rose-500/20">
                  <span className="text-[10px] text-rose-400 font-semibold block uppercase">Hard</span>
                  <span className="font-bold text-white text-base">{lc.hardSolved || 0}</span>
                </div>
              </div>
            </div>

            {/* GFG */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-white text-base">GeeksforGeeks Overview</h3>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {gfg.totalSolved || 0} Total Solved
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-center">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Total Solved</span>
                    <span className="text-3xl font-extrabold text-teal-300 mt-1 block">
                      {gfg.totalSolved || 0}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Coding Score</span>
                    <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">
                      {gfg.codingScore || (gfg.totalSolved || 0) * 4}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex justify-between">
                  <span>Easy Solved:</span>
                  <span className="font-mono font-bold text-emerald-400">{gfg.easySolved || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium Solved:</span>
                  <span className="font-mono font-bold text-amber-400">{gfg.mediumSolved || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hard Solved:</span>
                  <span className="font-mono font-bold text-rose-400">{gfg.hardSolved || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assignments Breakdown List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Coursework Assignments Progress</h3>

            <div className="space-y-3">
              {analytics?.assignmentBreakdown?.map((assign) => (
                <div
                  key={assign._id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{assign.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                        {assign.batchCode}
                      </span>
                    </div>
                    <div className="mt-2 max-w-md">
                      <ProgressBar
                        value={assign.progressPercentage}
                        max={100}
                        size="sm"
                        showLabel={false}
                        colorScheme="auto"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {assign.completedQuestions} / {assign.totalQuestions} Solved
                    </span>
                    <Link
                      href={`/student/assignments/${assign._id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    >
                      Open Assignment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
