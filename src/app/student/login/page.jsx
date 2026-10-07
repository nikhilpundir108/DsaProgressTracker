'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'react-toastify';
import { ArrowRight, Code2, GraduationCap } from 'lucide-react';

export default function StudentLoginPage() {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        const result = await register({ name, email, password });
        if (result.requiresEmailConfirmation) {
          toast.success(result.message);
          setIsRegistering(false);
          setPassword('');
        }
      } else {
        await login(email, password, 'STUDENT');
      }
    } catch (error) {
      toast.error(error.message || (isRegistering ? 'Unable to create your account' : 'Sign in failed'));
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30 mt-2">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student Portal</span>
        </div>
      </div>

      <section className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isRegistering ? 'Create your student account' : 'Student Sign In'}
          </h1>
          <p className="mt-2 text-xs text-slate-400">
            Use your official @mit.ac.in or @miet.ac.in email address.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label htmlFor="student-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full name
              </label>
              <input
                id="student-name"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="student-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
              College email
            </label>
            <input
              id="student-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@mit.ac.in"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="student-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <input
              id="student-password"
              type="password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              required
              minLength={isRegistering ? 8 : 1}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
            />
            {isRegistering && <p className="mt-1 text-[11px] text-slate-500">Use at least 8 characters.</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold text-sm transition"
          >
            {loading ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isRegistering ? 'Already have an account?' : 'New to DSATrack?'}{' '}
          <button
            type="button"
            onClick={() => setIsRegistering((value) => !value)}
            className="font-semibold text-teal-300 hover:text-teal-200 transition"
          >
            {isRegistering ? 'Sign in' : 'Register'}
          </button>
        </p>
      </section>

      <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
        <Link href="/instructor/login" className="hover:text-slate-300 transition">Instructor Login</Link>
        <span aria-hidden="true">•</span>
        <Link href="/admin/login" className="hover:text-slate-300 transition">Super Admin Login</Link>
      </div>
    </main>
  );
}