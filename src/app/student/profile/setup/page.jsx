'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Code2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function StudentProfileSetupPage() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [collegeRollNo, setCollegeRollNo] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [section, setSection] = useState('A');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [leetcodeHandle, setLeetcodeHandle] = useState('');
  const [gfgHandle, setGfgHandle] = useState('');

  const [verifyingLc, setVerifyingLc] = useState(false);
  const [verifyingGfg, setVerifyingGfg] = useState(false);
  const [lcStatus, setLcStatus] = useState(null);
  const [gfgStatus, setGfgStatus] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'STUDENT')) {
      router.push('/student/login');
    } else if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setCollegeRollNo(user.collegeRollNo || '');
      setBranch(user.branch || 'CSE');
      setSection(user.section || 'A');
      setGraduationYear(user.graduationYear || '2026');
      setLeetcodeHandle(user.leetcodeHandle || '');
      setGfgHandle(user.gfgHandle || '');
    }
  }, [user, authLoading, router]);

  // Live handle verification with Tashif / LeetCode API
  const handleVerifyLc = async () => {
    if (!leetcodeHandle.trim()) return;
    setVerifyingLc(true);
    setLcStatus(null);
    try {
      const res = await fetch('/api/student/verify-handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'LEETCODE', handle: leetcodeHandle }),
      });
      const data = await res.json();
      if (res.ok && data.data?.success) {
        setLcStatus({
          valid: true,
          totalSolved: data.data.totalSolved,
          message: `Found profile (${data.data.totalSolved} Solved)`,
        });
      } else {
        setLcStatus({ valid: false, message: 'Handle not found or private' });
      }
    } catch (e) {
      setLcStatus({ valid: false, message: 'Verification timed out' });
    } finally {
      setVerifyingLc(false);
    }
  };

  const handleVerifyGfg = async () => {
    if (!gfgHandle.trim()) return;
    setVerifyingGfg(true);
    setGfgStatus(null);
    try {
      const res = await fetch('/api/student/verify-handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'GFG', handle: gfgHandle }),
      });
      const data = await res.json();
      if (res.ok && data.data?.success) {
        setGfgStatus({
          valid: true,
          totalSolved: data.data.totalSolved,
          message: `Found GFG profile (${data.data.totalSolved} Solved)`,
        });
      } else {
        setGfgStatus({ valid: false, message: 'Handle not found or private' });
      }
    } catch (e) {
      setGfgStatus({ valid: false, message: 'Verification timed out' });
    } finally {
      setVerifyingGfg(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!collegeRollNo.trim()) {
      setError('College Roll Number is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          collegeRollNo,
          branch,
          section,
          graduationYear,
          leetcodeHandle,
          gfgHandle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      await refreshUser();
      router.push('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Complete Student Profile</h1>
            <p className="text-xs text-slate-400">
              Welcome to DSATrack! Please provide your college roll number and coding platform handles.
            </p>
          </div>
        </div>

        {error && (
          <div className="my-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name (From Google)
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Google Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 text-sm font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                College Roll Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 22CS084"
                value={collegeRollNo}
                onChange={(e) => setCollegeRollNo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500 uppercase font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Graduation Year
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 2026"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="CSE">Computer Science & Eng (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="AI_ML">AI & Machine Learning</option>
                <option value="ECE">Electronics & Communication (ECE)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Section</label>
              <input
                type="text"
                required
                placeholder="e.g. A, B, C"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500 uppercase font-bold"
              />
            </div>
          </div>

          {/* Coding Handles with Live Verify button matching requirement #16 */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Coding Handles (Used for automatic progress synchronization)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LeetCode Handle */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-amber-400">LeetCode Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. nikhil123"
                    value={leetcodeHandle}
                    onChange={(e) => setLeetcodeHandle(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyLc}
                    disabled={verifyingLc || !leetcodeHandle.trim()}
                    className="px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition disabled:opacity-50"
                  >
                    {verifyingLc ? 'Checking...' : 'Verify'}
                  </button>
                </div>
                {lcStatus && (
                  <p
                    className={`text-[11px] font-medium flex items-center gap-1 ${
                      lcStatus.valid ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {lcStatus.valid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{lcStatus.message}</span>
                  </p>
                )}
              </div>

              {/* GFG Handle */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-emerald-400">GeeksforGeeks Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. nikhil_dsa"
                    value={gfgHandle}
                    onChange={(e) => setGfgHandle(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyGfg}
                    disabled={verifyingGfg || !gfgHandle.trim()}
                    className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition disabled:opacity-50"
                  >
                    {verifyingGfg ? 'Checking...' : 'Verify'}
                  </button>
                </div>
                {gfgStatus && (
                  <p
                    className={`text-[11px] font-medium flex items-center gap-1 ${
                      gfgStatus.valid ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {gfgStatus.valid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{gfgStatus.message}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/20 transition"
            >
              {loading ? 'Saving Profile...' : 'Complete Profile & Enter Dashboard →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
