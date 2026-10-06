'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import {
  Users,
  Lock,
  User,
  ArrowRight,
  Code2,
  KeyRound,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '@/components/Modal';

export default function InstructorLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const demoInstructors = [
    { name: 'Prof. Rahul Sharma', id: 'INS001', email: 'rahul@mit.ac.in', pass: 'password123', batches: 'CSE Sec A & B' },
    { name: 'Dr. Sunita Verma', id: 'INS002', email: 'sunita@miet.ac.in', pass: 'password123', batches: 'IT Sec A' },
    { name: 'Prof. Amit Patel (Inactive test)', id: 'INS003', email: 'amit@mit.ac.in', pass: 'password123', batches: 'Disabled by Admin' },
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(identifier, password, 'INSTRUCTOR');
    } catch (err) {
      setError(err.message || 'Invalid Instructor credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (insId, pass) => {
    setIdentifier(insId);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 selection:bg-brand-500 selection:text-white">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <Link href="/" className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white font-black shadow-xl shadow-teal-500/25">
            <Code2 className="w-7 h-7" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            DSA<span className="text-brand-400">Track</span>
          </span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mt-2">
          <Users className="w-3.5 h-3.5" />
          <span>Instructor Portal</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Instructor Sign In</h2>
          <p className="mt-1 text-xs text-slate-400">
            Sign in with your Instructor ID (e.g. <span className="font-mono text-indigo-300">INS001</span>) or Email
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Instructor ID / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. INS001 or rahul@mit.ac.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? 'Authenticating...' : 'Sign In as Instructor'}
          </button>
        </form>

        {/* Quick 1-Click Demo Instructors */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>1-Click Test Instructor Credentials:</span>
          </p>

          <div className="space-y-2">
            {demoInstructors.map((ins) => (
              <button
                key={ins.id}
                onClick={() => handleQuickFill(ins.id, ins.pass)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/40 text-left transition group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">{ins.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                      {ins.id}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Password: {ins.pass} ({ins.batches})</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
        <Link href="/student/login" className="hover:text-slate-300 transition">
          Student Google Login →
        </Link>
        <span>•</span>
        <Link href="/admin/login" className="hover:text-slate-300 transition">
          Super Admin Login →
        </Link>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Instructor Password Assistance"
      >
        <div className="space-y-3 py-2 text-sm text-slate-300">
          <p>
            Instructor credentials and initial passwords are created and managed by the <span className="text-white font-semibold">Super Admin</span>.
          </p>
          <p className="text-xs text-slate-400">
            If you have forgotten your password or need a credential reset, please contact your college Super Administrator or use the default demo password: <span className="text-indigo-300 font-mono font-bold">password123</span>.
          </p>
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => setForgotModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
