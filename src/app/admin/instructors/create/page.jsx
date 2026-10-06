'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import {
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export default function CreateInstructorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Created instructor result
  const [createdResult, setCreatedResult] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          department,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create instructor');
      }

      setCreatedResult({
        instructor: data.instructor,
        rawPassword: data.rawPassword,
      });
    } catch (err) {
      setError(err.message || 'Error creating instructor');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type = 'id') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Create Instructor" />

        <main className="p-6 lg:p-8 max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Dashboard</span>
            </Link>
          </div>

          {createdResult ? (
            /* Success Display Card Matching Specification #5 */
            <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 shadow-2xl animate-fadeIn">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Instructor Created Successfully</h2>
                  <p className="text-xs text-slate-400">
                    A unique Instructor ID has been generated. Provide these credentials to the faculty member.
                  </p>
                </div>
              </div>

              {/* Formatted Credential Box */}
              <div className="mt-6 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-white font-bold">{createdResult.instructor.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Instructor ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold text-base bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                      {createdResult.instructor.instructorId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(createdResult.instructor.instructorId, 'id')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Copy ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-200">{createdResult.instructor.email}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Password:</span>
                  <span className="text-emerald-400 font-bold">{createdResult.rawPassword}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() =>
                    copyToClipboard(
                      `DSATrack Instructor Credentials:\nInstructor ID: ${createdResult.instructor.instructorId}\nEmail: ${createdResult.instructor.email}\nPassword: ${createdResult.rawPassword}\nLogin Portal: ${window.location.origin}/instructor/login`,
                      'all'
                    )
                  }
                  className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition"
                >
                  {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAll ? 'Credentials Copied to Clipboard!' : 'Copy Full Credentials Text'}</span>
                </button>

                <button
                  onClick={() => {
                    setCreatedResult(null);
                    setName('');
                    setEmail('');
                    setPhone('');
                  }}
                  className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition"
                >
                  + Create Another
                </button>

                <Link
                  href="/admin/dashboard"
                  className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm text-center transition"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl backdrop-blur-md">
              <div className="pb-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white tracking-tight">Create New Instructor</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Fill in the instructor details. A unique Instructor ID (e.g. INS001) will be automatically generated.
                </p>
              </div>

              {error && (
                <div className="my-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Instructor Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prof. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@mit.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Department (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science & Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Initial Password <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Confirm Password <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <Link
                    href="/admin/dashboard"
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 transition"
                  >
                    {loading ? 'Creating Instructor...' : '+ Generate & Create Instructor'}
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
