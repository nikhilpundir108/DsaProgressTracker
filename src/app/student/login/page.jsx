'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import {
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Code2,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/Modal';

export default function StudentLoginPage() {
  const router = useRouter();
  const { googleLogin } = useAuth();

  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const demoStudents = [
    { name: 'Nikhil Kumar', email: 'nikhil@mit.ac.in', desc: 'Active student with 6/10 solved in Week 1' },
    { name: 'Aman Gupta', email: 'aman@mit.ac.in', desc: 'Active student with 8/10 solved in Week 1' },
    { name: 'Priya Singh', email: 'priya@miet.ac.in', desc: 'MIET student with pending join request' },
    { name: 'Kavya Sharma', email: 'kavya@mit.ac.in', desc: 'First time student (tests Profile Setup flow)' },
  ];

  const handleGoogleAuth = async (emailToAuth, nameToAuth) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const email = emailToAuth || googleEmail;
      const name = nameToAuth || googleName || email.split('@')[0];

      await googleLogin({
        email,
        name,
        googleId: `google_${email.split('@')[0]}_${Date.now()}`,
      });
      setGoogleModalOpen(false);
    } catch (err) {
      setErrorMessage(err.message || 'Google authentication rejected');
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 selection:bg-brand-500 selection:text-white">
      {/* Brand */}
      <div className="flex flex-col items-center mb-8 text-center">
        <Link href="/" className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white font-black shadow-xl shadow-teal-500/25">
            <Code2 className="w-7 h-7" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            DSA<span className="text-brand-400">Track</span>
          </span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30 mt-2">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student Portal Authentication</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Student Google Login</h2>
          <p className="mt-2 text-xs text-slate-400">
            Authentication is restricted to official college email accounts:
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-800 text-teal-300 border border-slate-700">
              @mit.ac.in
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-800 text-teal-300 border border-slate-700">
              @miet.ac.in
            </span>
          </div>
        </div>

        {/* Primary Google Login Button */}
        <button
          onClick={() => setGoogleModalOpen(true)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {/* Google Color Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Quick 1-Click Demo Accounts */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>1-Click Test Student Accounts:</span>
          </p>

          <div className="space-y-2">
            {demoStudents.map((s) => (
              <button
                key={s.email}
                onClick={() => handleGoogleAuth(s.email, s.name)}
                disabled={loading}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/40 text-left transition group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-teal-300">{s.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{s.email}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition" />
              </button>
            ))}

            {/* Test Rejection button with unauthorized domain */}
            <button
              onClick={() => handleGoogleAuth('unauthorized_user@gmail.com', 'Random User')}
              disabled={loading}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-800/40 text-left transition text-rose-300"
            >
              <div>
                <span className="text-xs font-bold block">Test Unauthorized Domain (@gmail.com)</span>
                <span className="text-[10px] text-rose-400">Verifies domain restriction error modal</span>
              </div>
              <XCircle className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
        <Link href="/instructor/login" className="hover:text-slate-300 transition">
          Instructor Login →
        </Link>
        <span>•</span>
        <Link href="/admin/login" className="hover:text-slate-300 transition">
          Super Admin Login →
        </Link>
      </div>

      {/* Google OAuth Input Modal */}
      <Modal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        title="Google OAuth Sign-In"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGoogleAuth();
          }}
          className="space-y-4"
        >
          <p className="text-xs text-slate-400">
            Enter your official college Google account credentials to simulate Google OAuth sign-in.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Nikhil Kumar"
              value={googleName}
              onChange={(e) => setGoogleName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Google Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. nikhil@mit.ac.in"
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">Must end with @mit.ac.in or @miet.ac.in</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition"
          >
            {loading ? 'Authenticating...' : 'Sign In with Google'}
          </button>
        </form>
      </Modal>

      {/* Domain Restriction Error Modal (As specified in requirement #11) */}
      <Modal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="Access Restricted"
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white">Access Restricted</h4>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Please login using your official <span className="font-semibold text-teal-300">@mit.ac.in</span> or{' '}
            <span className="font-semibold text-teal-300">@miet.ac.in</span> Google account.
          </p>
          <div className="mt-6 w-full">
            <button
              onClick={() => setErrorModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
            >
              Try Again with College Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
