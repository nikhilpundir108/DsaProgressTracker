'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export function DifficultyDonutChart({ easy = 0, medium = 0, hard = 0 }) {
  const data = [
    { name: 'Easy', value: easy, color: '#10b981' },
    { name: 'Medium', value: medium, color: '#f59e0b' },
    { name: 'Hard', value: hard, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  const total = easy + medium + hard;

  if (total === 0) {
    return (
      <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs">
        <span>No solved problems yet</span>
      </div>
    );
  }

  return (
    <div className="h-44 relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#ffffff',
            }}
            labelStyle={{ color: '#ffffff' }}
            itemStyle={{ color: '#ffffff' }}
          />
          <Pie
            data={data}
            innerRadius={46}
            outerRadius={65}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-extrabold text-white">{total}</span>
        <span className="text-[10px] uppercase font-semibold text-slate-400">Solved</span>
      </div>
    </div>
  );
}

export function AssignmentStatusBarChart({ completed = 0, pending = 0, late = 0 }) {
  const data = [
    { name: 'Completed', count: completed, fill: '#10b981' },
    { name: 'Pending', count: pending, fill: '#64748b' },
    { name: 'Late', count: late, fill: '#f97316' },
  ];

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#ffffff',
            }}
            labelStyle={{ color: '#ffffff' }}
            itemStyle={{ color: '#ffffff' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
