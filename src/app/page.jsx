'use client';

import React from 'react';
import Link from 'next/link';
import {
  Code2,
  GraduationCap,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Layers,
  Database,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="px-6 lg:px-12 h-20 border-b border-slate-800/80 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white font-black shadow-lg shadow-teal-500/25">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              DSA<span className="text-brand-400">Track</span>
            </span>
            <span className="block text-[11px] text-slate-400 font-medium tracking-wider -mt-1">
              COLLEGE DSA PLATFORM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition shadow-lg shadow-brand-500/20"
          >
            Portal Login →
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 lg:py-24 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/30 mb-8 animate-pulse-subtle">
          <span className="w-2 h-2 rounded-full bg-brand-400"></span>
          <span>Live DSA Progress & Assignment Tracking for MIT & MIET</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Track College DSA Performance Across <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-brand-400 to-indigo-400">LeetCode</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">GeeksforGeeks</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          One unified platform for instructors to assign curated DSA problems to entire batches, automatically verify student submissions, and view deep individual analytics.
        </p>

        {/* 3 User Role Login Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Student Card */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group border border-slate-800 hover:border-teal-500/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-500/20 transition"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Student Portal</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Login with your official <span className="text-slate-300 font-mono">@mit.ac.in</span> or <span className="text-slate-300 font-mono">@miet.ac.in</span> Google account. Join batch by code, sync LeetCode & GFG progress, solve assignments.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                href="/student/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300 group-hover:translate-x-1 transition"
              >
                <span>Student Login with Google</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Instructor Card */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group border border-slate-800 hover:border-indigo-500/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Instructor Portal</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Login with Instructor ID (e.g. <span className="text-slate-300 font-mono">INS001</span>) & password. Create batches, generate unique batch codes, assign questions, track student progress & leaderboards.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                href="/instructor/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-1 transition"
              >
                <span>Instructor ID Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Super Admin Card */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group border border-slate-800 hover:border-purple-500/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Super Admin Portal</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Highest-level college administrator dashboard. Create instructors, generate unique INS IDs, reset credentials, enable/disable instructor access, view campus wide statistics.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 group-hover:translate-x-1 transition"
              >
                <span>Super Admin Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 w-full text-left">
          <h2 className="text-2xl font-bold text-white text-center mb-10">How DSATrack Streamlines College DSA</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white">Automatic Progress Sync</h4>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Pulls live public solved statistics from Tashif LeetCode API and GeeksforGeeks, automatically matching assigned problem slugs against solved submissions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white">Batch-Wide Assignments</h4>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Assign curated problem sets to entire batches in one click with deadlines. Instructors never have to manually select students individually.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white">Deep Student Analytics</h4>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Drill down into individual student profiles, difficulty distributions (Easy/Med/Hard), contest ratings, and assignment-by-assignment completion rates.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>DSATrack — College DSA Progress & Assignment Tracking Platform. Built for MIT & MIET Colleges.</p>
      </footer>
    </div>
  );
}
