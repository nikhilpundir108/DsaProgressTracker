'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { Modal } from '@/components/Modal';

export function ForgotPasswordModal({ isOpen, onClose, initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail.includes('@') ? initialEmail : '');
      setSent(false);
      setError('');
    }
  }, [initialEmail, isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not request a password reset');
      setSent(true);
    } catch (requestError) {
      setError(requestError.message || 'Could not request a password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset your password">
      {sent ? (
        <div className="space-y-4 text-center" role="status">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
          <p className="text-sm text-slate-300">
            If an active account exists for that email, a password reset link has been sent. Check your inbox and spam folder.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-400">Enter the email address associated with your account.</p>
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <label className="block text-xs font-semibold text-slate-300" htmlFor="forgot-password-email">
            Email address
          </label>
          <input
            id="forgot-password-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full -mt-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white text-sm font-semibold"
            >
              <Mail className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
