'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { Layers, Users, BookOpen, Search, Copy, Check } from 'lucide-react';

export default function AdminBatchesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const res = await fetch('/api/batches');
        if (res.ok) {
          const data = await res.json();
          setBatches(data.batches || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'SUPER_ADMIN') {
      loadBatches();
    }
  }, [user]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filtered = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.instructorId?.name && b.instructorId.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Managed Batches" />

        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Managed Batches</h2>
              <p className="text-xs text-slate-400 mt-1">
                DSA course batches created by your instructors or shared with them
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search batches, codes, instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/60 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">Loading batches...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm bg-slate-900/40 rounded-3xl border border-slate-800">
              No batches found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((batch) => (
                <div
                  key={batch._id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/40 transition shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                        {batch.branch} • Sec {batch.section}
                      </span>
                      <button
                        onClick={() => copyCode(batch.code)}
                        className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700 hover:border-teal-500/50 transition"
                        title="Copy Batch Code"
                      >
                        {copiedCode === batch.code ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <span>{batch.code}</span>
                            <Copy className="w-3 h-3 text-slate-400" />
                          </>
                        )}
                      </button>
                    </div>

                    <h3 className="font-bold text-white text-base">{batch.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {batch.description || 'Core Data Structures and Algorithms curriculum'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                      <span className="block font-medium text-slate-300">
                        Instructor: {batch.instructorId?.name || 'Assigned Faculty'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {batch.instructorId?.instructorId}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-400" />
                      <span>{batch.studentCount || 0} Students</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{batch.assignmentCount || 0} Assignments</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
