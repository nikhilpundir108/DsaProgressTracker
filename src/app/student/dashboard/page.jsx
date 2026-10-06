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
import { StatusBadge, DifficultyBadge, PlatformBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import {
  GraduationCap,
  Layers,
  BookOpen,
  CheckCircle2,
  Clock,
  RefreshCw,
  Trophy,
  ExternalLink,
  Plus,
  ArrowRight,
  Code2,
  Sparkles,
  ChevronRight,
  UserCheck,
  Check,
  Copy,
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading } = useAuth();

  const [batches, setBatches] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [msg, setMsg] = useState('');

  // Join batch modal
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [batchCodeInput, setBatchCodeInput] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinResult, setJoinResult] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'STUDENT')) {
      router.push('/student/login');
    } else if (user && !user.isProfileComplete) {
      router.push('/student/profile/setup');
    }
  }, [user, authLoading, router]);

  const loadStudentData = async () => {
    try {
      const [bRes, aRes, pRes] = await Promise.all([
        fetch('/api/batches'),
        fetch('/api/assignments'),
        fetch(`/api/students/${user._id}`),
      ]);

      if (bRes.ok) {
        const bData = await bRes.json();
        setBatches(bData.batches || []);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAssignments(aData.assignments || []);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        setAnalytics(pData.analytics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'STUDENT' && user.isProfileComplete) {
      loadStudentData();
    }
  }, [user]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/student/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.message || 'LeetCode & GFG progress synced successfully!');
        setTimeout(() => setMsg(''), 4000);
        await refreshUser();
        await loadStudentData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleJoinBatchSubmit = async (e) => {
    e.preventDefault();
    if (!batchCodeInput.trim()) return;

    setJoinLoading(true);
    setJoinResult(null);

    try {
      const res = await fetch('/api/student/join-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: batchCodeInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit join request');
      }

      setJoinResult({
        success: true,
        message: data.message,
        batch: data.batch,
      });
      setBatchCodeInput('');
      loadStudentData();
    } catch (err) {
      setJoinResult({
        success: false,
        message: err.message,
      });
    } finally {
      setJoinLoading(false);
    }
  };

  if (authLoading || !user || !user.isProfileComplete) return null;

  const lcStats = user.leetcodeStats || {};
  const gfgStats = user.gfgStats || {};

  const totalLcSolved = lcStats.totalSolved || 0;
  const totalGfgSolved = gfgStats.totalSolved || 0;
  const totalQuestionsAssigned = analytics?.totalAssignedQuestions || 0;
  const totalQuestionsCompleted = analytics?.totalCompletedQuestions || 0;
  const totalQuestionsPending = analytics?.pendingQuestions || 0;
  const overallProgress = analytics?.overallProgress || 0;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Student Dashboard" onSync={handleSyncNow} isSyncing={isSyncing} />

        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Welcome Banner matching Requirement #15 */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-950/50 via-slate-900 to-indigo-950/50 border border-teal-500/20 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30 mb-2">
                  <span>Student Portal</span>
                  <span>•</span>
                  <span>{user.email}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome, {user.name}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-400">
                  Track your LeetCode and GeeksforGeeks solutions, solve batch assignments, and climb the leaderboard.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setJoinModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Join Batch</span>
                </button>
              </div>
            </div>

            {msg && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{msg}</span>
              </div>
            )}
          </div>

          {/* Statistics Grid matching Requirement #15 & #27 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatsCard
              title="LeetCode Solved"
              value={totalLcSolved}
              subtitle={user.leetcodeHandle ? `@${user.leetcodeHandle}` : 'Connect handle'}
              icon={Code2}
              color="amber"
            />
            <StatsCard
              title="GFG Solved"
              value={totalGfgSolved}
              subtitle={user.gfgHandle ? `@${user.gfgHandle}` : 'Connect handle'}
              icon={Code2}
              color="emerald"
            />
            <StatsCard
              title="Assigned Questions"
              value={totalQuestionsAssigned}
              subtitle="Coursework items"
              icon={BookOpen}
              color="indigo"
            />
            <StatsCard
              title="Questions Completed"
              value={totalQuestionsCompleted}
              subtitle="Verified solved"
              icon={CheckCircle2}
              color="teal"
            />
            <StatsCard
              title="Questions Pending"
              value={totalQuestionsPending}
              subtitle="Awaiting completion"
              icon={Clock}
              color="rose"
            />
          </div>

          {/* Main Content: Progress + Platform Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Overall Assignment Progress Card matching Requirement #27 */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">My Assignment Progress</h3>
                  <p className="text-xs text-slate-400">
                    {totalQuestionsCompleted} of {totalQuestionsAssigned} questions solved across all assignments
                  </p>
                </div>
                <span className="text-2xl font-extrabold text-teal-400 font-mono">{overallProgress}%</span>
              </div>

              <ProgressBar value={overallProgress} max={100} size="lg" colorScheme="auto" showLabel={false} />

              {/* Active Assignments List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">My Assignments</h4>
                  <Link href="/student/assignments" className="text-xs text-brand-400 hover:underline">
                    View All →
                  </Link>
                </div>

                {assignments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No assignments assigned yet.</p>
                ) : (
                  assignments.slice(0, 3).map((assign) => (
                    <div
                      key={assign._id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-white text-sm">{assign.title}</h5>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                            {assign.batchId?.code}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                          Due: {new Date(assign.deadline).toLocaleDateString()} • {assign.questionCount || 0} Questions
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {assign.completedCount || 0}/{assign.questionCount || 0} Solved
                        </span>
                        <Link
                          href={`/student/assignments/${assign._id}`}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Coding Platform Breakdown Donut */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white">LeetCode Solved</h3>
                  <span className="text-xs text-amber-400 font-mono font-bold">
                    {totalLcSolved} Solved
                  </span>
                </div>

                <div className="py-2">
                  <DifficultyDonutChart
                    easy={lcStats.easySolved || 0}
                    medium={lcStats.mediumSolved || 0}
                    hard={lcStats.hardSolved || 0}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 block font-semibold">Easy</span>
                    <span className="font-bold text-white">{lcStats.easySolved || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-amber-500/20">
                    <span className="text-[10px] text-amber-400 block font-semibold">Medium</span>
                    <span className="font-bold text-white">{lcStats.mediumSolved || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-rose-500/20">
                    <span className="text-[10px] text-rose-400 block font-semibold">Hard</span>
                    <span className="font-bold text-white">{lcStats.hardSolved || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>GFG Coding Score:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {gfgStats.codingScore || totalGfgSolved * 4}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Grid: My Batches & Recent Solved Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My Batches */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span>My Enrolled Batches</span>
                </h3>
                <button
                  onClick={() => setJoinModalOpen(true)}
                  className="text-xs text-brand-400 hover:underline"
                >
                  + Join New Batch
                </button>
              </div>

              {batches.length === 0 ? (
                <EmptyState
                  title="You haven't joined any batch yet."
                  description="Enter your instructor's batch code to request access."
                  actionText="Join Batch"
                  onAction={() => setJoinModalOpen(true)}
                  icon={Layers}
                />
              ) : (
                <div className="space-y-3">
                  {batches.map((batch) => (
                    <div
                      key={batch._id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-semibold text-white text-sm">{batch.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {batch.branch} • Sec {batch.section} • Instructor: {batch.instructorId?.name}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                        {batch.code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Solved Activity matching Requirement #27 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Recent Solved Activity</span>
                </h3>
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="text-xs text-brand-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {(lcStats.recentSubmissions || []).slice(0, 5).map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-bold text-sm">✓</span>
                      <span className="font-semibold text-white">{sub.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {sub.timestamp ? new Date(sub.timestamp).toLocaleDateString() : 'Accepted'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Join Batch Modal matching Requirement #13 */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => {
          setJoinModalOpen(false);
          setJoinResult(null);
        }}
        title="Join DSA Batch"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Enter the unique Batch Code provided by your instructor (e.g.{' '}
            <span className="font-mono text-teal-300 font-bold">DSA-CSE-A26</span>).
          </p>

          {joinResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                joinResult.success
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}
            >
              {joinResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <div>
                <span className="font-semibold block">{joinResult.message}</span>
                {joinResult.batch && (
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Batch: {joinResult.batch.name} ({joinResult.batch.code})
                  </span>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleJoinBatchSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Enter Batch Code</label>
              <input
                type="text"
                required
                placeholder="e.g. DSA-CSE-A26"
                value={batchCodeInput}
                onChange={(e) => setBatchCodeInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setJoinModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={joinLoading || !batchCodeInput.trim()}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {joinLoading ? 'Sending Request...' : 'Request to Join'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
