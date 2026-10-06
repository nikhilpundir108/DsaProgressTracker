'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { DifficultyBadge, PlatformBadge } from '@/components/Badge';
import {
  BookOpen,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Sparkles,
} from 'lucide-react';

export default function CreateAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [batch, setBatch] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(params.id || '');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Default deadline 7 days in future
  const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [deadline, setDeadline] = useState(defaultDate);

  // List of questions in assignment
  const [questions, setQuestions] = useState([
    {
      title: 'Two Sum',
      platform: 'LEETCODE',
      url: 'https://leetcode.com/problems/two-sum/',
      slug: 'two-sum',
      difficulty: 'Easy',
      topic: 'Array',
    },
    {
      title: 'Missing Number',
      platform: 'LEETCODE',
      url: 'https://leetcode.com/problems/missing-number/',
      slug: 'missing-number',
      difficulty: 'Easy',
      topic: 'Array',
    },
  ]);

  // New question form state
  const [qTitle, setQTitle] = useState('');
  const [qPlatform, setQPlatform] = useState('LEETCODE');
  const [qUrl, setQUrl] = useState('');
  const [qDifficulty, setQDifficulty] = useState('Easy');
  const [qTopic, setQTopic] = useState('Array');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sample quick add DSA problems
  const popularTemplates = [
    { title: 'Best Time to Buy and Sell Stock', platform: 'LEETCODE', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', slug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy', topic: 'Array' },
    { title: 'Maximum Subarray', platform: 'LEETCODE', url: 'https://leetcode.com/problems/maximum-subarray/', slug: 'maximum-subarray', difficulty: 'Medium', topic: 'Array' },
    { title: 'Binary Search', platform: 'LEETCODE', url: 'https://leetcode.com/problems/binary-search/', slug: 'binary-search', difficulty: 'Easy', topic: 'Binary Search' },
    { title: 'Reverse Linked List', platform: 'LEETCODE', url: 'https://leetcode.com/problems/reverse-linked-list/', slug: 'reverse-linked-list', difficulty: 'Easy', topic: 'Linked List' },
    { title: 'Detect Loop in linked list', platform: 'GFG', url: 'https://practice.geeksforgeeks.org/problems/detect-loop-in-linked-list/1', slug: 'detect-loop-in-linked-list', difficulty: 'Medium', topic: 'Linked List' },
    { title: 'Subarray with given sum', platform: 'GFG', url: 'https://practice.geeksforgeeks.org/problems/subarray-with-given-sum-1587115621/1', slug: 'subarray-with-given-sum', difficulty: 'Medium', topic: 'Array' },
  ];

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'SUPER_ADMIN'))) {
      router.push('/instructor/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadBatch = async () => {
      try {
        const res = await fetch('/api/batches');
        if (res.ok) {
          const data = await res.json();
          setBatches(data.batches || []);
          if (params.id) {
            const current = (data.batches || []).find((b) => b._id === params.id);
            if (current) {
              setBatch(current);
              setSelectedBatchId(current._id);
            }
          } else if (data.batches?.length > 0) {
            setBatch(data.batches[0]);
            setSelectedBatchId(data.batches[0]._id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (user) loadBatch();
  }, [user, params.id]);

  // Auto-slug extraction from URL or Title
  const handleUrlChange = (url) => {
    setQUrl(url);
    if (url) {
      try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts.includes('problems')) {
          const pIdx = parts.indexOf('problems');
          if (parts[pIdx + 1]) {
            const rawSlug = parts[pIdx + 1].toLowerCase();
            if (!qTitle) {
              const formattedTitle = rawSlug
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
              setQTitle(formattedTitle);
            }
          }
        }
      } catch (e) {}
    }
  };

  const addQuestion = (e) => {
    e?.preventDefault();
    if (!qTitle.trim()) {
      setError('Please provide a question title');
      return;
    }

    const cleanSlug = (qTitle || 'problem')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newQ = {
      title: qTitle.trim(),
      platform: qPlatform,
      url: qUrl.trim() || (qPlatform === 'GFG' ? `https://practice.geeksforgeeks.org/problems/${cleanSlug}` : `https://leetcode.com/problems/${cleanSlug}/`),
      slug: cleanSlug,
      difficulty: qDifficulty,
      topic: qTopic.trim() || 'General',
    };

    setQuestions([...questions, newQ]);
    setQTitle('');
    setQUrl('');
    setError('');
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addTemplateQuestion = (item) => {
    const isAlreadyAdded = questions.some((q) => q.slug === item.slug);
    if (!isAlreadyAdded) {
      setQuestions([...questions, item]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Assignment Title is required');
      return;
    }

    if (!selectedBatchId) {
      setError('Please select a batch');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question to the assignment');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          batchId: selectedBatchId,
          deadline,
          questions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create assignment');
      }

      router.push(`/instructor/batches/${selectedBatchId}?tab=assignments`);
    } catch (err) {
      setError(err.message || 'Error creating assignment');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Create Assignment" />

        <main className="p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          <Link
            href={params.id ? `/instructor/batches/${params.id}?tab=assignments` : '/instructor/dashboard'}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Assignments</span>
          </Link>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
            <div className="pb-6 border-b border-slate-800">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Create & Assign Problem Set to Batch
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Add problems from LeetCode & GeeksforGeeks. Once assigned, all approved batch students will see them immediately.
              </p>
            </div>

            {error && (
              <div className="my-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {/* Assignment Title & Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Assignment Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Array Practice — Week 1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Assign to Batch <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  >
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.code}) • {b.studentCount || 0} Students
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Submission Deadline <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Master Two Pointers, Prefix Sum, and Kadane's Algorithm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Questions Builder Section */}
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-brand-400" />
                      <span>Questions List ({questions.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Problems students must solve on LeetCode or GeeksforGeeks
                    </p>
                  </div>
                </div>

                {/* Question List Cards */}
                {questions.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    No questions added yet. Use the question builder below to add questions.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="text-xs font-mono text-slate-500 w-5 text-center">#{idx + 1}</span>
                          <PlatformBadge platform={q.platform} />
                          <DifficultyBadge difficulty={q.difficulty} />
                          <div className="overflow-hidden">
                            <h4 className="font-semibold text-white text-sm truncate">{q.title}</h4>
                            <span className="text-[11px] text-slate-400">
                              Topic: {q.topic} • Slug: <span className="font-mono text-slate-300">{q.slug}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {q.url && (
                            <a
                              href={q.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-800 transition"
                              title="Preview Problem URL"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => removeQuestion(idx)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                            title="Remove Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Question Subform */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-brand-400" />
                    <span>Add Problem</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Platform</label>
                      <select
                        value={qPlatform}
                        onChange={(e) => setQPlatform(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                      >
                        <option value="LEETCODE">LeetCode</option>
                        <option value="GFG">GeeksforGeeks</option>
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Problem Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Best Time to Buy and Sell Stock"
                        value={qTitle}
                        onChange={(e) => setQTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Difficulty</label>
                      <select
                        value={qDifficulty}
                        onChange={(e) => setQDifficulty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        URL (Optional — auto extracts slug)
                      </label>
                      <input
                        type="url"
                        placeholder="https://leetcode.com/problems/..."
                        value={qUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Topic</label>
                      <input
                        type="text"
                        placeholder="e.g. Array, Tree, DP"
                        value={qTopic}
                        onChange={(e) => setQTopic(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition"
                      >
                        + Add to List
                      </button>
                    </div>
                  </div>

                  {/* Popular Templates Quick Add */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mb-2">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Quick-Add Popular DSA Problems:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {popularTemplates.map((t, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => addTemplateQuestion(t)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] flex items-center gap-1.5 transition"
                        >
                          <span>+ {t.title}</span>
                          <span className="text-[10px] text-teal-400">({t.platform})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
                <Link
                  href={params.id ? `/instructor/batches/${params.id}` : '/instructor/dashboard'}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Assigning...' : 'Assign to Entire Batch'}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
