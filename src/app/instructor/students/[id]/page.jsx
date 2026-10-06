'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { StatsCard } from '@/components/StatsCard';
import { ProgressBar } from '@/components/ProgressBar';
import { DifficultyDonutChart } from '@/components/Charts';
import { StatusBadge, DifficultyBadge } from '@/components/Badge';
import {
  ArrowLeft,
  Users,
  Code2,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Mail,
  GraduationCap,
  Sparkles,
  Trophy,
} from 'lucide-react';

export default function StudentAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'SUPER_ADMIN'))) {
      router.push('/instructor/login');
    }
  }, [user, authLoading, router]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${params.id}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      } else {
        router.push('/instructor/dashboard');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && params.id) {
      loadStudentData();
    }
  }, [user, params.id]);

  const handleSyncStudent = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/student/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: params.id }),
      });
      if (res.ok) {
        setMsg('Student data synchronized live from LeetCode & GFG!');
        setTimeout(() => setMsg(''), 4000);
        await loadStudentData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading student analytics...
      </div>
    );
  }

  const { student, batches, analytics } = data;
  const lc = student.leetcodeStats || {};
  const gfg = student.gfgStats || {};

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={`Analytics: ${student.name}`} onSync={handleSyncStudent} isSyncing={isSyncing} />

        <main className="p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <Link
            href="/instructor/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          {msg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {/* Student Profile Header Card matching Requirement #25 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-950/80 border border-teal-800/60 text-teal-300 font-bold text-2xl flex items-center justify-center shadow-lg shadow-teal-500/10">
                {student.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{student.name}</h1>
                <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {student.email}
                  </span>
                  <span>•</span>
                  <span>Roll: <strong className="text-slate-200 font-mono">{student.collegeRollNo || '—'}</strong></span>
                  <span>•</span>
                  <span>{student.branch} Sec {student.section}</span>
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {batches.map((b) => (
                    <span
                      key={b._id}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-slate-800 text-teal-300 border border-slate-700"
                    >
                      {b.name} ({b.code})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSyncStudent}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-brand-600/20 text-brand-300 border border-brand-500/40 hover:bg-brand-600/30 text-xs font-semibold flex items-center gap-2 transition self-start md:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Live Coding Data'}</span>
            </button>
          </div>

          {/* Overall Metrics Cards matching Requirement #25 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard
              title="Total Assigned"
              value={analytics.totalAssignedQuestions}
              subtitle="Coursework problems"
              icon={BookOpen}
              color="indigo"
            />
            <StatsCard
              title="Completed"
              value={analytics.totalCompletedQuestions}
              subtitle="Verified solved"
              icon={CheckCircle2}
              color="emerald"
            />
            <StatsCard
              title="Pending"
              value={analytics.pendingQuestions}
              subtitle="Remaining to solve"
              icon={Clock}
              color="rose"
            />
            <StatsCard
              title="Overall Progress"
              value={`${analytics.overallProgress}%`}
              subtitle="Batch completion"
              icon={Trophy}
              color="teal"
            />
          </div>

          {/* Coding Platform Stats Grid matching Requirement #25 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LeetCode Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                    LC
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">LeetCode Statistics</h3>
                    <span className="text-xs text-slate-400 font-mono">
                      @{student.leetcodeHandle || 'not connected'}
                    </span>
                  </div>
                </div>
                {student.leetcodeHandle && (
                  <a
                    href={`https://leetcode.com/u/${student.leetcodeHandle}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Solved</span>
                  <span className="text-xl font-extrabold text-white">{lc.totalSolved || 0}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 font-semibold block uppercase">Easy</span>
                  <span className="text-xl font-extrabold text-emerald-400">{lc.easySolved || 0}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-amber-500/20">
                  <span className="text-[10px] text-amber-400 font-semibold block uppercase">Medium</span>
                  <span className="text-xl font-extrabold text-amber-400">{lc.mediumSolved || 0}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-rose-500/20">
                  <span className="text-[10px] text-rose-400 font-semibold block uppercase">Hard</span>
                  <span className="text-xl font-extrabold text-rose-400">{lc.hardSolved || 0}</span>
                </div>
              </div>

              <DifficultyDonutChart
                easy={lc.easySolved || 0}
                medium={lc.mediumSolved || 0}
                hard={lc.hardSolved || 0}
              />
            </div>

            {/* GFG Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                    GFG
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">GeeksforGeeks Statistics</h3>
                    <span className="text-xs text-slate-400 font-mono">
                      @{student.gfgHandle || 'not connected'}
                    </span>
                  </div>
                </div>
                {student.gfgHandle && (
                  <a
                    href={`https://auth.geeksforgeeks.org/user/${student.gfgHandle}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-center">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Total Solved</span>
                  <span className="text-2xl font-extrabold text-teal-300 mt-1 block">
                    {gfg.totalSolved || 0}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Coding Score</span>
                  <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
                    {gfg.codingScore || (gfg.totalSolved || 0) * 4}
                  </span>
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

          {/* Assignment-by-Assignment Breakdown matching Requirement #25 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Coursework Assignments Breakdown</h3>
            <p className="text-xs text-slate-400">
              Individual assignment completion stats and question progress
            </p>

            {analytics.assignmentBreakdown?.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No assignments in student batches.</p>
            ) : (
              <div className="space-y-3">
                {analytics.assignmentBreakdown.map((assign) => (
                  <div
                    key={assign._id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{assign.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
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

                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <span className="text-xs text-slate-400 block">Questions</span>
                        <span className="text-sm font-mono font-bold text-white">
                          {assign.completedQuestions} / {assign.totalQuestions}
                        </span>
                      </div>
                      <div className="w-16">
                        <span className="text-xs text-slate-400 block">Progress</span>
                        <span
                          className={`text-sm font-mono font-bold ${
                            assign.progressPercentage === 100
                              ? 'text-emerald-400'
                              : assign.progressPercentage >= 50
                              ? 'text-teal-300'
                              : 'text-amber-400'
                          }`}
                        >
                          {assign.progressPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
