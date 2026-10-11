'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'react-toastify';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { ForgotPasswordModal } from '@/components/ForgotPasswordModal';

export default function SuperAdminLoginPage() {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      await login(identifier, password, 'SUPER_ADMIN');
    } catch (err) {
      toast.error(err.message || 'Invalid Super Admin credentials');
    } finally {
      setLoading(false);
    }
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 mt-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>College Super Administrator Portal</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Super Admin Login</h2>
          <p className="mt-1 text-xs text-slate-400">
            Highest-level administrator access for instructor & batch governance
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin ID / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                autoComplete="email"
                required
                placeholder="admin@college.ac.in or ADMIN001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-xs text-purple-400 hover:text-purple-300 transition"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? 'Authenticating...' : 'Sign In as Super Admin'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need an administrator account?{' '}
          <Link
            href="/admin/register"
            className="font-semibold text-purple-300 hover:text-purple-200 transition"
          >
            Register
          </Link>
        </p>
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
        <Link href="/student/login" className="hover:text-slate-300 transition">
          Student Portal →
        </Link>
        <span>•</span>
        <Link href="/instructor/login" className="hover:text-slate-300 transition">
          Instructor Login →
        </Link>
      </div>

      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        initialEmail={identifier}
      />
    </div>
  );
}
