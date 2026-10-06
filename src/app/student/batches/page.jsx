'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import {
  Layers,
  Plus,
  Users,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';

export default function StudentBatchesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Join batch modal
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [batchCodeInput, setBatchCodeInput] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinResult, setJoinResult] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'STUDENT')) {
      router.push('/student/login');
    }
  }, [user, authLoading, router]);

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

  useEffect(() => {
    if (user) loadBatches();
  }, [user]);

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
      loadBatches();
    } catch (err) {
      setJoinResult({
        success: false,
        message: err.message,
      });
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="My Batches" />

        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Enrolled Batches</h1>
              <p className="text-xs text-slate-400 mt-1">
                Your approved DSA course sections and pending join requests
              </p>
            </div>

            <button
              onClick={() => setJoinModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Join Another Batch</span>
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">Loading batches...</div>
          ) : batches.length === 0 ? (
            <EmptyState
              title="You haven't joined any batch yet."
              description="Enter your instructor's batch code to request access to coursework."
              actionText="Join Batch"
              onAction={() => setJoinModalOpen(true)}
              icon={Layers}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batches.map((batch) => (
                <div
                  key={batch._id}
                  className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border border-slate-800 hover:border-teal-500/40 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        {batch.branch} • Section {batch.section}
                      </span>
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-800 text-teal-300 border border-slate-700">
                        {batch.code}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition">
                      {batch.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {batch.description || 'Data Structures and Algorithms curriculum coursework.'}
                    </p>

                    <div className="mt-5 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                      <p>
                        <strong className="text-slate-300">Instructor:</strong>{' '}
                        {batch.instructorId?.name || 'Faculty Member'}
                      </p>
                      <p>
                        <strong className="text-slate-300">Academic Year:</strong> {batch.academicYear}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <Link
                      href={`/student/assignments`}
                      className="text-xs font-semibold text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <span>View Batch Assignments</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Join Batch Modal */}
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
