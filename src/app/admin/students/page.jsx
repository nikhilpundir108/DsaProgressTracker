'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/Badge';
import { GraduationCap, Search, ExternalLink, Code } from 'lucide-react';

export default function AdminStudentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await fetch('/api/admin/students');
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'SUPER_ADMIN') {
      loadStudents();
    }
  }, [user]);

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.collegeRollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.leetcodeHandle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.gfgHandle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="All College Students" />

        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">College Students</h2>
              <p className="text-xs text-slate-400 mt-1">
                Directory of all registered students with verified @mit.ac.in & @miet.ac.in credentials
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by name, roll no, email, handle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/60 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Branch/Sec</th>
                  <th className="py-3 px-4">Batches</th>
                  <th className="py-3 px-4">LeetCode</th>
                  <th className="py-3 px-4">GFG</th>
                  <th className="py-3 px-4">Total Solved</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      Loading student directory...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const lc = s.leetcodeStats?.totalSolved || 0;
                    const gfg = s.gfgStats?.totalSolved || 0;
                    return (
                      <tr key={s._id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-teal-950/60 text-teal-300 border border-teal-800/40 flex items-center justify-center font-bold text-xs">
                              {s.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <span>{s.name}</span>
                              <span className="block text-[10px] text-slate-400 font-normal">{s.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">{s.collegeRollNo || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {s.branch || 'CSE'} - {s.section || 'A'}
                        </td>
                        <td className="py-3.5 px-4">
                          {s.batches?.length > 0 ? (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                              {s.batches[0].code}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {s.leetcodeHandle ? (
                            <span className="font-mono text-amber-400 font-semibold">{lc} Solved</span>
                          ) : (
                            <span className="text-slate-500">Not set</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {s.gfgHandle ? (
                            <span className="font-mono text-emerald-400 font-semibold">{gfg} Solved</span>
                          ) : (
                            <span className="text-slate-500">Not set</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">{lc + gfg}</td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={s.isProfileComplete ? 'ACTIVE' : 'PENDING'} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
