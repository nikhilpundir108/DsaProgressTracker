'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import {
  Layers,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function StudentJoinBatchPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [batchCode, setBatchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'STUDENT')) {
      router.push('/student/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchCode.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/student/join-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: batchCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setResult({
        success: true,
        message: data.message,
        batch: data.batch,
      });
    } catch (err) {
      setResult({
        success: false,
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Join Batch" />

        <main className="p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-6">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          {result?.success ? (
            /* Success Response Card matching Requirement #13 */
            <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/40 shadow-lg shadow-teal-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-white">Join Request Sent</h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Your request has been sent to the instructor.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 inline-block text-xs font-mono">
                <span className="text-slate-400 block mb-1">Status:</span>
                <span className="px-3 py-1 rounded-full text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Pending Approval</span>
                </span>
              </div>

              {result.batch && (
                <p className="text-xs text-slate-400">
                  Batch: <strong className="text-slate-200">{result.batch.name}</strong> ({result.batch.code}) •
                  Instructor: {result.batch.instructorName}
                </p>
              )}

              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href="/student/dashboard"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition"
                >
                  Return to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setResult(null);
                    setBatchCode('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
                >
                  Join Another Batch
                </button>
              </div>
            </div>
          ) : (
            /* Input Form matching Requirement #13 */
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl backdrop-blur-md space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Enter Batch Code</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Obtain the batch code from your course instructor to request enrollment.
                </p>
              </div>

              {result && !result.success && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{result.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Batch Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DSA-CSE-A26"
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-base tracking-wider uppercase focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !batchCode.trim()}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/20 transition disabled:opacity-50"
                >
                  {loading ? 'Submitting Join Request...' : 'Request to Join'}
                </button>
              </form>

              {/* Sample available demo code hint */}
              <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Example active college batch codes: <code className="text-slate-300 font-bold">DSA-CSE-A26</code>, <code className="text-slate-300 font-bold">DSA-CSE-B26</code>, <code className="text-slate-300 font-bold">DSA-IT-A26</code></span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
