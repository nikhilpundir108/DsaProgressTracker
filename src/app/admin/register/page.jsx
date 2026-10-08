'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'react-toastify';
import { ArrowLeft, Code2, ShieldCheck } from 'lucide-react';

export default function SuperAdminRegisterPage() {
  const { registerSuperAdmin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationKey, setRegistrationKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await registerSuperAdmin({ name, email, password, registrationKey });
      if (result.requiresEmailConfirmation) {
        setConfirmationEmail(email.trim());
        setPassword('');
        setRegistrationKey('');
        toast.success(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Super Admin registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 selection:bg-brand-500 selection:text-white">
      <div className="flex flex-col items-center mb-8 text-center">
        <Link href="/" className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-teal-500/25">
            <Code2 className="w-7 h-7" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            DSA<span className="text-brand-400">Track</span>
          </span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 mt-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Super Administrator Registration</span>
        </div>
      </div>

      <section className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Register Super Admin</h1>
          <p className="mt-2 text-xs text-slate-400">
            Use any valid email address and the invitation key provided by the platform owner.
          </p>
        </div>

        {confirmationEmail ? (
          <div className="space-y-4 text-center" role="status">
            <div className="mx-auto w-12 h-12 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Verify your email</h2>
            <p className="text-sm text-slate-300">
              We sent a verification link to <strong className="text-white">{confirmationEmail}</strong>. Confirm the address before signing in.
            </p>
            <Link href="/admin/login" className="inline-flex px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition">
              Go to Admin Login
            </Link>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full name
            </label>
            <input
              id="admin-name"
              type="text"
              autoComplete="name"
              maxLength={100}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email address
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 transition"
            />
            <p className="mt-1 text-[11px] text-slate-500">Use at least 12 characters.</p>
          </div>

          <div>
            <label htmlFor="admin-registration-key" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Invitation key
            </label>
            <input
              id="admin-registration-key"
              type="password"
              autoComplete="off"
              required
              value={registrationKey}
              onChange={(event) => setRegistrationKey(event.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 transition-all"
          >
            {loading ? 'Creating account...' : 'Create Super Admin account'}
          </button>
        </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/admin/login" className="font-semibold text-purple-300 hover:text-purple-200 transition">
            Sign in
          </Link>
        </p>
      </section>

      <Link href="/admin/login" className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Admin Login
      </Link>
    </main>
  );
}