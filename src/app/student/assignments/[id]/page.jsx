'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { ProgressBar } from '@/components/ProgressBar';
import { DifficultyBadge, PlatformBadge, StatusBadge } from '@/components/Badge';
import {
  BookOpen,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'STUDENT')) {
      router.push('/student/login');
    }
  }, [user, authLoading, router]);

  const loadAssignment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assignments/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setAssignment(data.assignment);
      } else {
        router.push('/student/assignments');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && params.id) {
      loadAssignment();
    }
  }, [user, params.id]);

  const handleSyncProgress = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/student/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSyncMsg('Progress synchronized with LeetCode & GFG!');
        setTimeout(() => setSyncMsg(''), 4000);
        await loadAssignment();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading || !assignment) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading assignment...
      </div>
    );
  }

  const completedCount = assignment.completedQuestions || 0;
  const totalCount = assignment.totalQuestions || 0;
  const progressPct = assignment.progressPercentage || 0;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={assignment.title} onSync={handleSyncProgress} isSyncing={isSyncing} />

        <main className="p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          <Link
            href="/student/assignments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Assignments</span>
          </Link>

          {syncMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{syncMsg}</span>
            </div>
          )}

          {/* Assignment Header Card matching Requirement #22 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-800 text-teal-300 border border-slate-700">
                    {assignment.batchId?.code}
                  </span>
                  <span className="text-xs text-slate-400">
                    {assignment.batchId?.name} • Instructor: {assignment.instructorId?.name}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {assignment.title}
                </h1>
                {assignment.description && (
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                    {assignment.description}
                  </p>
                )}
              </div>

              <button
                onClick={handleSyncProgress}
                disabled={isSyncing}
                className="px-4 py-2.5 rounded-xl bg-brand-600/20 text-brand-300 border border-brand-500/40 hover:bg-brand-600/30 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Checking Submissions...' : 'Sync Assignment Progress'}</span>
              </button>
            </div>

            {/* Progress Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Assignment Progress</span>
                <span className="text-2xl font-mono font-extrabold text-white mt-1 block">
                  {completedCount} / {totalCount} Solved
                </span>
                <div className="mt-3">
                  <ProgressBar value={progressPct} max={100} size="sm" showLabel={false} colorScheme="auto" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-medium">Submission Deadline</span>
                <div>
                  <span className="text-lg font-bold text-slate-200 block">
                    {new Date(assignment.deadline).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span
                    className={`text-xs font-semibold mt-1 block ${
                      assignment.isExpired ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {assignment.isExpired ? 'Deadline Passed' : 'Active Assignment'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-medium">Completion Rate</span>
                <div>
                  <span className="text-2xl font-mono font-extrabold text-teal-400 block">
                    {progressPct}%
                  </span>
                  <span className="text-xs text-slate-400 mt-1 block">
                    {totalCount - completedCount} questions pending
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Question List matching Requirement #22 & #23 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Questions Checklist</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click 'Open Question' to solve directly on the coding platform. After submitting, click 'Sync' to update status.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {assignment.questions?.map((q, idx) => {
                const isCompleted = q.status === 'COMPLETED' || q.status === 'LATE';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCompleted
                        ? 'bg-slate-950/70 border-emerald-500/30'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Status Icon matching Requirement #22 */}
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-sm">
                            ✓
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center font-bold text-sm">
                            ○
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <PlatformBadge platform={q.platform} />
                          <DifficultyBadge difficulty={q.difficulty} />
                          <span className="text-xs font-semibold text-slate-400">Topic: {q.topic}</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">{q.title}</h4>
                        {q.solvedAt && (
                          <span className="text-[11px] text-emerald-400 mt-0.5 block">
                            Solved at: {new Date(q.solvedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <StatusBadge status={q.status} />

                      {/* Open Question Button matching Requirement #22 */}
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition"
                      >
                        <span>Open Question</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
