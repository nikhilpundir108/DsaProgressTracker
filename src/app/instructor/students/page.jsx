'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { EmptyState } from '@/components/EmptyState';
import { Users, Search, Eye, ExternalLink, Mail, GraduationCap } from 'lucide-react';

export default function InstructorStudentsDirectoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'SUPER_ADMIN'))) {
      router.push('/instructor/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadAllStudents = async () => {
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

    if (user) loadAllStudents();
  }, [user]);

  // Aggregate distinct students from instructor batches
  const studentMap = new Map();
  batches.forEach((b) => {
    (b.students || []).forEach((s) => {
      if (typeof s === 'object' && s._id) {
        if (!studentMap.has(s._id)) {
          studentMap.set(s._id, { ...s, batchName: b.name, batchCode: b.code });
        }
      }
    });
  });

  const students = Array.from(studentMap.values());

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.collegeRollNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Enrolled Students" />

        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Student Directory</h1>
              <p className="text-xs text-slate-400 mt-1">
                All students currently enrolled across your DSA sections
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by student name, roll no, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/60 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">LeetCode</th>
                  <th className="py-3 px-4">GFG</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      Loading students...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No enrolled students found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-teal-950 text-teal-300 border border-teal-800/40 flex items-center justify-center font-bold">
                            {s.name?.charAt(0)}
                          </div>
                          <div>
                            <span>{s.name}</span>
                            <span className="block text-[10px] text-slate-400 font-normal">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{s.collegeRollNo || '—'}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                          {s.batchCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {s.leetcodeHandle ? (
                          <span className="font-mono text-amber-400 font-semibold">
                            {s.leetcodeStats?.totalSolved || 0} Solved
                          </span>
                        ) : (
                          <span className="text-slate-500">Not set</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {s.gfgHandle ? (
                          <span className="font-mono text-emerald-400 font-semibold">
                            {s.gfgStats?.totalSolved || 0} Solved
                          </span>
                        ) : (
                          <span className="text-slate-500">Not set</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/instructor/students/${s._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                        >
                          <span>Deep Analytics</span>
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
