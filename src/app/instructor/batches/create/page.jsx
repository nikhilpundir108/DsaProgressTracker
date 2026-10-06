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
  Copy,
  Check,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function CreateBatchPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [section, setSection] = useState('A');
  const [academicYear, setAcademicYear] = useState('2026');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [createdBatch, setCreatedBatch] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'SUPER_ADMIN'))) {
      router.push('/instructor/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          branch,
          section,
          academicYear,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create batch');
      }

      setCreatedBatch(data.batch);
    } catch (err) {
      setError(err.message || 'Error creating batch');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!createdBatch) return;
    navigator.clipboard.writeText(createdBatch.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Create Batch" />

        <main className="p-6 lg:p-8 max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <Link
              href="/instructor/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Instructor Dashboard</span>
            </Link>
          </div>

          {createdBatch ? (
            /* Created Batch Success Modal/Card matching Specification #9 */
            <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-8 shadow-2xl animate-fadeIn">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40 shadow-lg shadow-teal-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Batch Created Successfully</h2>
                  <p className="text-xs text-slate-400">
                    A unique Batch Code has been generated. Share this code with your students to let them request to join.
                  </p>
                </div>
              </div>

              {/* Batch Code Box */}
              <div className="mt-6 p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                    Generated Unique Batch Code
                  </span>
                  <span className="text-3xl font-mono font-extrabold text-teal-300 tracking-wider mt-1 block">
                    {createdBatch.code}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    {createdBatch.name} • {createdBatch.branch} Sec {createdBatch.section} ({createdBatch.academicYear})
                  </p>
                </div>

                <button
                  onClick={copyCode}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Batch Code Copied!' : 'Copy Batch Code'}</span>
                </button>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/instructor/batches/${createdBatch._id}`}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm text-center shadow-lg shadow-brand-500/20 transition"
                >
                  Open Batch Hub →
                </Link>

                <button
                  onClick={() => {
                    setCreatedBatch(null);
                    setName('');
                    setDescription('');
                  }}
                  className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition"
                >
                  + Create Another Batch
                </button>

                <Link
                  href="/instructor/dashboard"
                  className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm text-center transition"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl backdrop-blur-md">
              <div className="pb-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white tracking-tight">Create New DSA Batch</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Define batch parameters. A distinct unique batch code will be automatically generated.
                </p>
              </div>

              {error && (
                <div className="my-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Batch Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE DSA 2026 - Sec A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Branch <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CSE, IT, ECE"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500 uppercase font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Section <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. A, B, C"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500 uppercase font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Academic Year <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2026"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Core Data Structures and Algorithms coursework for 3rd Year CSE students."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <Link
                    href="/instructor/dashboard"
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 transition"
                  >
                    {loading ? 'Generating Code & Creating...' : '+ Create Batch & Generate Code'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
