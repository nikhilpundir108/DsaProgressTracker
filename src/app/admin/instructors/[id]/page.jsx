'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import {
  ArrowLeft,
  Users,
  Layers,
  KeyRound,
  Power,
  Trash2,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

export default function InstructorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadInstructor = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/instructors/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setInstructor(data.instructor);
      } else {
        router.push('/admin/dashboard');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'SUPER_ADMIN' && params.id) {
      loadInstructor();
    }
  }, [user, params.id]);

  const handleToggleActive = async () => {
    if (!instructor) return;
    try {
      const res = await fetch(`/api/admin/instructors/${instructor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !instructor.isActive }),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: `Instructor status updated!` });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
        loadInstructor();
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to update status' });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/instructors/${instructor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Password reset successfully!' });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
        setResetModalOpen(false);
        setNewPassword('');
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Error resetting password' });
    }
  };

  if (loading || !instructor) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading instructor details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={`Instructor: ${instructor.name}`} />

        <main className="p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Instructors</span>
          </Link>

          {msg.text && (
            <div
              className={`p-4 rounded-2xl text-sm flex items-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}
            >
              {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Profile Overview Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 font-bold text-2xl flex items-center justify-center">
                {instructor.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">{instructor.name}</h2>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                    {instructor.instructorId}
                  </span>
                  <StatusBadge status={instructor.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {instructor.email}
                  </span>
                  {instructor.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {instructor.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> {instructor.department || 'Computer Science'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                onClick={() => setResetModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <KeyRound className="w-4 h-4" />
                <span>Reset Password</span>
              </button>

              <button
                onClick={handleToggleActive}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                  instructor.isActive
                    ? 'bg-amber-950/30 text-amber-300 border-amber-800/40 hover:bg-amber-900/40'
                    : 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/40'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{instructor.isActive ? 'Disable Faculty' : 'Enable Faculty'}</span>
              </button>
            </div>
          </div>

          {/* Batches managed by this Instructor */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Batches Managed ({instructor.batches?.length || 0})</span>
            </h3>

            {instructor.batches?.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                This instructor has not created any batches yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {instructor.batches.map((batch) => (
                  <div
                    key={batch._id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/30 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{batch.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {batch.branch} • Sec {batch.section} • Year {batch.academicYear}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                        {batch.code}
                      </span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
                      <span>{batch.students?.length || 0} Students Enrolled</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`Reset Password for ${instructor.name}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
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
          <div className="flex justify-end gap-2 pt-2">
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
