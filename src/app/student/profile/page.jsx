'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import {
  UserCheck,
  Mail,
  GraduationCap,
  Code2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function StudentProfilePage() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
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

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'STUDENT')) {
      router.push('/student/login');
    } else if (user) {
      setName(user.name || '');
      setCollegeRollNo(user.collegeRollNo || '');
      setBranch(user.branch || 'CSE');
      setSection(user.section || 'A');
      setGraduationYear(user.graduationYear || '2026');
      setLeetcodeHandle(user.leetcodeHandle || '');
      setGfgHandle(user.gfgHandle || '');
    }
  }, [user, authLoading, router]);

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
          message: `Verified LeetCode Profile (${data.data.totalSolved} Solved)`,
        });
      } else {
        setLcStatus({ valid: false, message: 'Handle not found or private' });
      }
    } catch (e) {
      setLcStatus({ valid: false, message: 'Verification error' });
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
          message: `Verified GFG Profile (${data.data.totalSolved} Solved)`,
        });
      } else {
        setGfgStatus({ valid: false, message: 'Handle not found or private' });
      }
    } catch (e) {
      setGfgStatus({ valid: false, message: 'Verification error' });
    } finally {
      setVerifyingGfg(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

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
      if (res.ok) {
        setMsg({ type: 'success', text: 'Profile and coding handles updated successfully!' });
        await refreshUser();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Network error saving profile' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="My Profile" />

        <main className="p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-teal-950 border border-teal-800 text-teal-300 text-2xl font-bold flex items-center justify-center">
                {user.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{user.name}</h1>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            {msg.text && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  msg.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
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
                    College Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={collegeRollNo}
                    onChange={(e) => setCollegeRollNo(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-mono font-bold uppercase focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch</label>
                  <input
                    type="text"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm uppercase focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm uppercase focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Graduation Year</label>
                  <input
                    type="text"
                    required
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Handles Section with Verify Handle buttons matching Requirement #16 */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Coding Platforms (Sync & Automatic Verification)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* LeetCode */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-amber-400">LeetCode Username</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. nikhil123"
                        value={leetcodeHandle}
                        onChange={(e) => setLeetcodeHandle(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyLc}
                        disabled={verifyingLc || !leetcodeHandle.trim()}
                        className="px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition disabled:opacity-50"
                      >
                        {verifyingLc ? 'Checking...' : 'Verify Handle'}
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

                  {/* GFG */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-emerald-400">
                      GeeksforGeeks Username
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. nikhil_dsa"
                        value={gfgHandle}
                        onChange={(e) => setGfgHandle(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyGfg}
                        disabled={verifyingGfg || !gfgHandle.trim()}
                        className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition disabled:opacity-50"
                      >
                        {verifyingGfg ? 'Checking...' : 'Verify Handle'}
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
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
