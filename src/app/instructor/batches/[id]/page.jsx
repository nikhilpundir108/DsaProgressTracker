'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { StatsCard } from '@/components/StatsCard';
import { ProgressBar } from '@/components/ProgressBar';
import { StatusBadge, DifficultyBadge, PlatformBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import {
  Layers,
  Users,
  UserCheck,
  UserX,
  BookOpen,
  BarChart3,
  Trophy,
  ArrowLeft,
  Plus,
  Copy,
  Check,
  Search,
  ExternalLink,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

function BatchHubContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const tabQuery = searchParams ? searchParams.get('tab') || 'overview' : 'overview';
  const [activeTab, setActiveTab] = useState(tabQuery);

  const [batch, setBatch] = useState(null);
  const [batchError, setBatchError] = useState('');
  const [progressData, setProgressData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Student progress table state
  const [studentSearch, setStudentSearch] = useState('');
  const [sortBy, setSortBy] = useState('progress'); // 'progress', 'lc', 'gfg', 'total', 'name'
  const [progressFilter, setProgressFilter] = useState('ALL'); // 'ALL', 'ABOVE_75', 'BELOW_50'

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'SUPER_ADMIN'))) {
      router.push('/instructor/login');
    }
  }, [user, authLoading, router]);

  // Sync tab with URL search parameter if changed
  useEffect(() => {
    if (tabQuery && tabQuery !== activeTab) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  const loadBatchDetails = async () => {
    setLoading(true);
    setBatchError('');
    try {
      const [bRes, pRes, lRes] = await Promise.all([
        fetch(`/api/batches/${params.id}`),
        fetch(`/api/batches/${params.id}/progress`),
        fetch(`/api/batches/${params.id}/leaderboard`),
      ]);

      if (bRes.ok) {
        const bData = await bRes.json();
        setBatch(bData.batch);
      } else {
        const bData = await bRes.json();
        setBatchError(bData.error || 'Unable to load this batch.');
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        setProgressData(pData);
      }
      if (lRes.ok) {
        const lData = await lRes.json();
        setLeaderboardData(lData.leaderboard || []);
      }
    } catch (e) {
      console.error(e);
      setBatchError('Unable to load this batch. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && params.id) {
      loadBatchDetails();
    }
  }, [user, params.id]);

  const copyCode = () => {
    if (!batch) return;
    navigator.clipboard.writeText(batch.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSyncBatch = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/student/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: params.id }),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Batch progress synchronized with LeetCode & GFG!' });
        setTimeout(() => setMsg({ type: '', text: '' }), 4000);
        await loadBatchDetails();
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Sync error' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Join request approval/rejection
  const handleJoinRequest = async (requestId, action) => {
    try {
      const res = await fetch(`/api/batches/${params.id}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) {
        setMsg({
          type: 'success',
          text: `Student join request ${action === 'APPROVE' ? 'APPROVED' : 'REJECTED'}!`,
        });
        setTimeout(() => setMsg({ type: '', text: '' }), 3500);
        loadBatchDetails();
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to process join request' });
    }
  };

  // Remove student from batch
  const handleRemoveStudent = async (studentId, studentName) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this batch?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/batches/${params.id}/students?studentId=${studentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMsg({ type: 'success', text: `${studentName} removed from batch` });
        setTimeout(() => setMsg({ type: '', text: '' }), 3500);
        loadBatchDetails();
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to remove student' });
    }
  };

  if (loading || !batch) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-400 text-sm">
        {loading ? (
          'Loading batch hub...'
        ) : (
          <>
            <p className="text-rose-300">{batchError || 'Batch could not be loaded.'}</p>
            <button
              onClick={loadBatchDetails}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition"
            >
              Retry
            </button>
          </>
        )}
      </div>
    );
  }

  // Filter & sort students in progress table
  const rawStudents = progressData?.students || [];
  const filteredStudents = rawStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.collegeRollNo && s.collegeRollNo.toLowerCase().includes(studentSearch.toLowerCase()));

    const matchesProgress =
      progressFilter === 'ALL'
        ? true
        : progressFilter === 'ABOVE_75'
        ? s.progressPercentage >= 75
        : s.progressPercentage < 50;

    return matchesSearch && matchesProgress;
  });

  filteredStudents.sort((a, b) => {
    if (sortBy === 'progress') return b.progressPercentage - a.progressPercentage;
    if (sortBy === 'lc') return b.leetcodeSolved - a.leetcodeSolved;
    if (sortBy === 'gfg') return b.gfgSolved - a.gfgSolved;
    if (sortBy === 'total') return b.totalSolved - a.totalSolved;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Layers },
    { id: 'students', name: `Students (${batch.students?.length || 0})`, icon: Users },
    {
      id: 'requests',
      name: `Join Requests (${batch.pendingRequests?.length || 0})`,
      icon: UserCheck,
      badge: batch.pendingRequests?.length > 0 ? batch.pendingRequests.length : null,
    },
    { id: 'assignments', name: `Assignments (${batch.assignments?.length || 0})`, icon: BookOpen },
    { id: 'progress', name: 'Progress', icon: BarChart3 },
    { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={batch.name} onSync={handleSyncBatch} isSyncing={isSyncing} />

        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Link
                  href="/instructor/dashboard"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Batches</span>
                </Link>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">{batch.name}</h1>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-800 text-teal-300 border border-slate-700">
                    {batch.code}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {batch.branch} • Section {batch.section} • Academic Year {batch.academicYear} • Instructor:{' '}
                  {batch.instructorId?.name}
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <button
                  onClick={copyCode}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Code Copied' : 'Copy Batch Code'}</span>
                </button>

                <Link
                  href={`/instructor/batches/${batch._id}/assignments/create`}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create Assignment</span>
                </Link>
              </div>
            </div>

            {/* Notification alert */}
            {msg.text && (
              <div
                className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  msg.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{msg.text}</span>
              </div>
            )}

            {/* Navigation Tabs matching Requirement #10 */}
            <div className="flex items-center gap-1 mt-6 pt-4 border-t border-slate-800 overflow-x-auto pb-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      router.replace(`/instructor/batches/${batch._id}?tab=${tab.id}`, { scroll: false });
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.name}</span>
                    {tab.badge && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatsCard
                  title="Enrolled Students"
                  value={batch.students?.length || 0}
                  icon={Users}
                  color="teal"
                />
                <StatsCard
                  title="Assignments"
                  value={batch.assignments?.length || 0}
                  icon={BookOpen}
                  color="indigo"
                />
                <StatsCard
                  title="Total Questions"
                  value={progressData?.batch?.totalQuestions || 0}
                  icon={Layers}
                  color="purple"
                />
                <StatsCard
                  title="Batch Progress"
                  value={`${progressData?.batch?.overallBatchProgress || 0}%`}
                  icon={BarChart3}
                  color="emerald"
                />
              </div>

              {/* Progress Summary Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2">Overall Batch Progress</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Aggregate completion across all {progressData?.batch?.totalQuestions || 0} assigned DSA problems
                </p>
                <ProgressBar
                  value={progressData?.batch?.overallBatchProgress || 0}
                  max={100}
                  size="lg"
                  colorScheme="auto"
                />
              </div>

              {/* Recent Assignments Quick Preview */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Batch Assignments</h3>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="text-xs text-brand-400 hover:underline"
                  >
                    View All →
                  </button>
                </div>

                {batch.assignments?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No assignments created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {batch.assignments.map((assign) => (
                      <div
                        key={assign._id}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-semibold text-white text-sm">{assign.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {assign.questions?.length || 0} Questions • Deadline:{' '}
                            {new Date(assign.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          href={`/instructor/batches/${batch._id}?tab=progress`}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                        >
                          View Submissions
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS */}
          {activeTab === 'students' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Enrolled Students ({batch.students?.length || 0})</h3>
                  <p className="text-xs text-slate-400">Manage students active in this batch</p>
                </div>
              </div>

              {batch.students?.length === 0 ? (
                <EmptyState
                  title="No students yet in this batch"
                  description="Share the batch code with your students. Once they submit a join request, approve them in the Join Requests tab."
                  icon={Users}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Roll No</th>
                        <th className="py-3 px-4">LeetCode</th>
                        <th className="py-3 px-4">GFG</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {batch.students.map((student) => (
                        <tr key={student._id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-teal-950 text-teal-300 border border-teal-800/40 flex items-center justify-center font-bold">
                                {student.name?.charAt(0)}
                              </div>
                              <div>
                                <span>{student.name}</span>
                                <span className="block text-[10px] text-slate-400 font-normal">{student.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">{student.collegeRollNo || '—'}</td>
                          <td className="py-3.5 px-4">
                            {student.leetcodeHandle ? (
                              <span className="font-mono text-amber-400 font-semibold">
                                {student.leetcodeStats?.totalSolved || 0} Solved
                              </span>
                            ) : (
                              <span className="text-slate-500">Not connected</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {student.gfgHandle ? (
                              <span className="font-mono text-emerald-400 font-semibold">
                                {student.gfgStats?.totalSolved || 0} Solved
                              </span>
                            ) : (
                              <span className="text-slate-500">Not connected</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status="ACTIVE" />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/instructor/students/${student._id}`}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="View Deep Analytics"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => handleRemoveStudent(student._id, student.name)}
                                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition"
                                title="Remove from Batch"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: JOIN REQUESTS matching Requirement #14 */}
          {activeTab === 'requests' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white">
                  Pending Join Requests ({batch.pendingRequests?.length || 0})
                </h3>
                <p className="text-xs text-slate-400">
                  Approve verified students to grant batch assignment access
                </p>
              </div>

              {batch.pendingRequests?.length === 0 ? (
                <EmptyState
                  title="No pending join requests"
                  description="All student requests have been processed. New requests will appear here when students enter your batch code."
                  icon={UserCheck}
                />
              ) : (
                <div className="space-y-3">
                  {batch.pendingRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm">
                          {req.studentId?.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{req.studentId?.name}</h4>
                          <p className="text-xs text-slate-400">
                            {req.studentId?.email} • Roll: {req.studentId?.collegeRollNo || 'Pending setup'} •{' '}
                            {req.studentId?.branch} Sec {req.studentId?.section}
                          </p>
                          <span className="text-[11px] text-slate-500 mt-0.5 block">
                            Requested: {new Date(req.requestedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Approve / Reject buttons matching Requirement #14 */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleJoinRequest(req._id, 'APPROVE')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleJoinRequest(req._id, 'REJECT')}
                          className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Batch Assignments</h3>
                  <p className="text-xs text-slate-400">Assigned DSA practice problem sets</p>
                </div>
                <Link
                  href={`/instructor/batches/${batch._id}/assignments/create`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create Assignment</span>
                </Link>
              </div>

              {batch.assignments?.length === 0 ? (
                <EmptyState
                  title="No assignments created yet"
                  description="Create curated problem sets from LeetCode and GeeksforGeeks and assign them to this entire batch."
                  actionText="+ Create Assignment"
                  actionHref={`/instructor/batches/${batch._id}/assignments/create`}
                  icon={BookOpen}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {batch.assignments.map((assign) => (
                    <div
                      key={assign._id}
                      className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-brand-500/40 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-teal-400">
                            {assign.questions?.length || 0} Questions
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            Deadline: {new Date(assign.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-base">{assign.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{assign.description}</p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Assigned to {batch.students?.length || 0} Students
                        </span>
                        <button
                          onClick={() => setActiveTab('progress')}
                          className="text-xs font-semibold text-brand-400 hover:underline"
                        >
                          View Progress →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PROGRESS (Flagship Instructor Progress Dashboard matching Requirement #24) */}
          {activeTab === 'progress' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white">Student Progress Dashboard</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live LeetCode & GFG problem completion across all assigned coursework
                  </p>
                </div>
                <button
                  onClick={handleSyncBatch}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-600/20 text-brand-300 border border-brand-500/40 hover:bg-brand-600/30 text-xs font-semibold transition self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Batch Progress'}</span>
                </button>
              </div>

              {/* Progress Filters, Search & Sorters */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <select
                    value={progressFilter}
                    onChange={(e) => setProgressFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">All Progress Levels</option>
                    <option value="ABOVE_75">≥ 75% Completed</option>
                    <option value="BELOW_50">&lt; 50% Completed</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="progress">Sort by Progress %</option>
                    <option value="lc">Sort by LeetCode Solved</option>
                    <option value="gfg">Sort by GFG Solved</option>
                    <option value="total">Sort by Total Solved</option>
                    <option value="name">Sort by Name</option>
                  </select>
                </div>
              </div>

              {/* Progress Table matching Requirement #24 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4 text-right">LC Solved</th>
                      <th className="py-3.5 px-4 text-right">GFG Solved</th>
                      <th className="py-3.5 px-4 text-right">Assigned</th>
                      <th className="py-3.5 px-4 text-right">Completed</th>
                      <th className="py-3.5 px-4 text-right">Pending</th>
                      <th className="py-3.5 px-4 min-w-[140px]">Progress</th>
                      <th className="py-3.5 px-4 text-right">Analytics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500">
                          No student progress records found.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s._id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/40 flex items-center justify-center font-bold">
                                {s.name?.charAt(0)}
                              </div>
                              <div>
                                <span>{s.name}</span>
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  {s.collegeRollNo || s.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                            {s.leetcodeSolved}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                            {s.gfgSolved}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                            {s.assignedQuestions}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-teal-300">
                            {s.completedQuestions}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-rose-400">
                            {s.pendingQuestions}
                          </td>
                          <td className="py-3.5 px-4">
                            <ProgressBar
                              value={s.progressPercentage}
                              max={100}
                              size="sm"
                              showLabel={true}
                              colorScheme="auto"
                            />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/instructor/students/${s._id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-medium"
                            >
                              <span>View</span>
                              <Eye className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: LEADERBOARD matching Requirement #26 */}
          {activeTab === 'leaderboard' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn">
              <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>{batch.name} — Leaderboard</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ranked by Assignment Completion % and Total DSA Solved
                  </p>
                </div>
              </div>

              {!leaderboardData || leaderboardData.length === 0 ? (
                <EmptyState
                  title="No leaderboard entries yet"
                  description="Student rankings will appear once students are enrolled and begin completing questions."
                  icon={Trophy}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 w-16">Rank</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4 text-right">Solved (LC + GFG)</th>
                        <th className="py-3 px-4 text-right">Assignment %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {leaderboardData.map((row) => (
                        <tr
                          key={row._id}
                          className={`hover:bg-slate-800/40 transition ${
                            row.rank === 1
                              ? 'bg-amber-500/5'
                              : row.rank === 2
                              ? 'bg-slate-400/5'
                              : row.rank === 3
                              ? 'bg-amber-700/5'
                              : ''
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
                            <Link
                              href={`/instructor/students/${row._id}`}
                              className="hover:text-brand-400 transition flex items-center gap-2"
                            >
                              <span>{row.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({row.collegeRollNo || row.branch})
                              </span>
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-teal-300">
                            {row.totalSolved}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                            {row.assignmentPercentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BatchHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
          Loading batch...
        </div>
      }
    >
      <BatchHubContent />
    </Suspense>
  );
}
