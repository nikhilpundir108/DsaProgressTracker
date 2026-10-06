'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge, RoleBadge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import {
  Users,
  Layers,
  GraduationCap,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Power,
  Eye,
  Edit,
  Search,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, insRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/instructors'),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats);
      }
      if (insRes.ok) {
        const iData = await insRes.json();
        setInstructors(iData.instructors || []);
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'SUPER_ADMIN') {
      loadData();
    }
  }, [user]);

  // Toggle instructor status (Enable / Disable)
  const handleToggleStatus = async (instructor) => {
    const newStatus = !instructor.isActive;
    try {
      const res = await fetch(`/api/admin/instructors/${instructor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        setActionSuccess(`Instructor ${instructor.name} is now ${newStatus ? 'ENABLED' : 'DISABLED'}`);
        setTimeout(() => setActionSuccess(''), 4000);
        loadData();
      }
    } catch (e) {
      setActionError('Failed to update status');
    }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedInstructor || !newPassword) return;

    try {
      const res = await fetch(`/api/admin/instructors/${selectedInstructor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        setActionSuccess(`Password for ${selectedInstructor.name} (${selectedInstructor.instructorId}) updated!`);
        setTimeout(() => setActionSuccess(''), 4000);
        setResetModalOpen(false);
        setNewPassword('');
      } else {
        const data = await res.json();
        setActionError(data.error || 'Failed to reset password');
      }
    } catch (e) {
      setActionError('Error resetting password');
    }
  };

  // Delete instructor
  const handleDeleteInstructor = async (instructor) => {
    if (!confirm(`Are you sure you want to permanently delete ${instructor.name} (${instructor.instructorId})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/instructors/${instructor._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setActionSuccess(`Instructor ${instructor.name} deleted successfully`);
        setTimeout(() => setActionSuccess(''), 4000);
        loadData();
      }
    } catch (e) {
      setActionError('Failed to delete instructor');
    }
  };

  const filteredInstructors = instructors.filter((ins) => {
    const matchesSearch =
      ins.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ins.instructorId && ins.instructorId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? ins.isActive
        : !ins.isActive;

    return matchesSearch && matchesStatus;
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading Super Admin dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Super Admin Dashboard" />

        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Action alerts */}
          {actionSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}
          {actionError && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Top Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Total Instructors"
              value={stats?.totalInstructors ?? instructors.length}
              subtitle="Registered faculty"
              icon={Users}
              color="indigo"
            />
            <StatsCard
              title="Active Instructors"
              value={stats?.activeInstructors ?? instructors.filter((i) => i.isActive).length}
              subtitle="With active access"
              icon={CheckCircle2}
              color="emerald"
            />
            <StatsCard
              title="Inactive Instructors"
              value={stats?.inactiveInstructors ?? instructors.filter((i) => !i.isActive).length}
              subtitle="Disabled / pending"
              icon={Power}
              color="rose"
            />
            <StatsCard
              title="Total Batches"
              value={stats?.totalBatches ?? '—'}
              subtitle="Across departments"
              icon={Layers}
              color="teal"
            />
            <StatsCard
              title="Total Students"
              value={stats?.totalStudents ?? '—'}
              subtitle="Enrolled college students"
              icon={GraduationCap}
              color="purple"
            />
          </div>

          {/* Instructor Management Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Instructor Management</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage faculty accounts, assign unique INS IDs, and control access
                </p>
              </div>

              <Link
                href="/admin/instructors/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 transition self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Create Instructor</span>
              </Link>
            </div>

            {/* Filter and Search Bar */}
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'ALL'
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  All ({instructors.length})
                </button>
                <button
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Active ({instructors.filter((i) => i.isActive).length})
                </button>
                <button
                  onClick={() => setStatusFilter('INACTIVE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'INACTIVE'
                      ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Inactive ({instructors.filter((i) => !i.isActive).length})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Instructor Name</th>
                    <th className="py-3 px-4">Instructor ID</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Batches</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredInstructors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        No instructors found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInstructors.map((ins) => (
                      <tr key={ins._id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 flex items-center justify-center font-bold text-xs">
                              {ins.name.charAt(0)}
                            </div>
                            <div>
                              <span>{ins.name}</span>
                              <span className="block text-[10px] text-slate-400 font-normal">
                                {ins.department || 'Computer Science'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                          {ins.instructorId || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{ins.email}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {ins.batchCount || 0} Batches
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={ins.isActive ? 'ACTIVE' : 'INACTIVE'} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(ins.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View details */}
                            <Link
                              href={`/admin/instructors/${ins._id}`}
                              title="View Details"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            {/* Reset password */}
                            <button
                              onClick={() => {
                                setSelectedInstructor(ins);
                                setResetModalOpen(true);
                              }}
                              title="Change / Reset Password"
                              className="p-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 transition"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Enable / Disable toggle */}
                            <button
                              onClick={() => handleToggleStatus(ins)}
                              title={ins.isActive ? 'Disable Instructor' : 'Enable Instructor'}
                              className={`p-1.5 rounded-lg transition border ${
                                ins.isActive
                                  ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-800/40'
                                  : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/40'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteInstructor(ins)}
                              title="Delete Instructor"
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`Reset Password — ${selectedInstructor?.name}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-xs text-slate-400">
            Set a new temporary or permanent password for Instructor ID:{' '}
            <span className="text-white font-mono font-semibold">{selectedInstructor?.instructorId}</span>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
