'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  Code2,
} from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 selection:bg-brand-500 selection:text-white">
      {/* Brand */}
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white font-black shadow-xl shadow-teal-500/25">
            <Code2 className="w-7 h-7" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            DSA<span className="text-brand-400">Track</span>
          </span>
        </Link>
        <p className="text-sm text-slate-400">Select your account type to continue</p>
      </div>

      {/* Role Cards */}
      <div className="w-full max-w-md space-y-4">
        {/* Student Option */}
        <Link
          href="/student/login"
          className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900 transition-all group shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-105 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Student Portal</h3>
              <p className="text-xs text-slate-400">College email sign-in or student registration</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition" />
        </Link>

        {/* Instructor Option */}
        <Link
          href="/instructor/login"
          className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all group shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Instructor Portal</h3>
              <p className="text-xs text-slate-400">Instructor ID (e.g. INS001) & Password</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
        </Link>

        {/* Super Admin Option */}
        <Link
          href="/admin/login"
          className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all group shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Super Admin Portal</h3>
              <p className="text-xs text-slate-400">College Administration ID & Password</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
        </Link>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
}
