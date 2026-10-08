'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Code2, KeyRound } from 'lucide-react';

const loginRoutes = {
  admin: '/admin/login',
  instructor: '/instructor/login',
  student: '/student/login',
};

export default function ResetPasswordPage() {
  const [tokens, setTokens] = useState(null);
  const [loginHref, setLoginHref] = useState('/login');
  const [loadingLink, setLoadingLink] = useState(true);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const role = query.get('role')?.toLowerCase();
    if (role && loginRoutes[role]) setLoginHref(loginRoutes[role]);

    const hash = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');
    const recoveryType = hash.get('type');
    const linkError = query.get('error_description') || query.get('error_code');

    if (accessToken && refreshToken && recoveryType === 'recovery' && !linkError) {
      setTokens({ accessToken, refreshToken });
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    } else {
      setError(linkError ? 'This reset link is invalid or has expired. Request a new password reset.' : 'Open the password reset link from your email to continue.');
    }
    setLoadingLink(false);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tokens, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not reset the password');
      setComplete(true);
    } catch (requestError) {
      setError(requestError.message || 'Could not reset the password');
    } finally {
      setLoading(false);
    }
  };

  const minimumLength = loginHref === '/admin/login' ? 12 : 8;

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white">
            <Code2 className="w-5 h-5" />
          </span>
          <span className="font-extrabold text-xl text-white">DSA<span className="text-brand-400">Track</span></span>
        </Link>

        {complete ? (
          <div className="space-y-4 text-center" role="status">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Password updated</h1>
            <p className="text-sm text-slate-400">Your password has been changed. Sign in with your new password.</p>
            <Link href={loginHref} className="inline-flex px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold">
              Return to sign in
            </Link>
          </div>
        ) : loadingLink ? (
          <p className="text-center text-sm text-slate-400">Checking your reset link...</p>
        ) : tokens ? (
          <>
            <div className="text-center mb-6">
              <KeyRound className="w-8 h-8 mx-auto mb-3 text-teal-300" />
              <h1 className="text-2xl font-bold text-white">Choose a new password</h1>
              <p className="mt-2 text-xs text-slate-400">Use at least {minimumLength} characters.</p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-xs font-semibold text-slate-300 mb-1.5">New password</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={minimumLength}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm password</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={minimumLength}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white text-sm font-semibold"
              >
                {loading ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4 text-center" role="alert">
            <AlertCircle className="w-10 h-10 mx-auto text-amber-300" />
            <h1 className="text-xl font-bold text-white">Reset link unavailable</h1>
            <p className="text-sm text-slate-400">{error}</p>
            <Link href={loginHref} className="inline-flex px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold">
              Back to sign in
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
