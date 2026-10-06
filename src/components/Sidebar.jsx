'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { RoleBadge } from './Badge';
import {
  LayoutDashboard,
  Users,
  Layers,
  BookOpen,
  Trophy,
  BarChart3,
  UserCheck,
  Settings,
  LogOut,
  Code2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  let links = [];

  if (user.role === 'SUPER_ADMIN') {
    links = [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Instructors', href: '/admin/instructors', icon: Users },
      { name: 'Batches', href: '/admin/batches', icon: Layers },
      { name: 'Students', href: '/admin/students', icon: GraduationCap },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];
  } else if (user.role === 'INSTRUCTOR') {
    links = [
      { name: 'Dashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
      { name: 'Batches', href: '/instructor/batches', icon: Layers },
      { name: 'Assignments', href: '/instructor/assignments', icon: BookOpen },
      { name: 'Students', href: '/instructor/students', icon: Users },
      { name: 'Leaderboard', href: '/instructor/leaderboard', icon: Trophy },
      { name: 'Progress', href: '/instructor/progress', icon: BarChart3 },
      { name: 'Profile', href: '/instructor/profile', icon: UserCheck },
      { name: 'Settings', href: '/instructor/settings', icon: Settings },
    ];
  } else {
    // STUDENT
    links = [
      { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { name: 'My Batches', href: '/student/batches', icon: Layers },
      { name: 'Assignments', href: '/student/assignments', icon: BookOpen },
      { name: 'My Progress', href: '/student/progress', icon: BarChart3 },
      { name: 'Leaderboard', href: '/student/leaderboard', icon: Trophy },
      { name: 'Profile', href: '/student/profile', icon: UserCheck },
      { name: 'Settings', href: '/student/settings', icon: Settings },
    ];
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between min-h-screen sticky top-0 backdrop-blur-md z-30">
      <div>
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white font-black shadow-lg shadow-teal-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                DSA<span className="text-brand-400">Track</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide -mt-1">
                College Tracker
              </span>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-bold text-teal-300 border border-slate-600">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-100 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between">
            <RoleBadge role={user.role} />
            {user.instructorId && (
              <span className="text-[11px] font-mono font-semibold text-slate-400">
                {user.instructorId}
              </span>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="px-3 space-y-1 mt-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-brand-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
