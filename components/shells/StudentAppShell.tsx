'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  LayoutDashboard,
  HelpCircle,
  FileText,
  Timer,
  History,
  TrendingUp,
  Bookmark,
  Trophy,
  Settings,
  HelpCircle as HelpIcon,
  ShieldCheck,
  LogOut,
  Bell,
  User,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface StudentAppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function StudentAppShell({ children, pageTitle }: StudentAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'MCQ Practice', path: '/mcq', icon: HelpCircle },
    { name: 'Mock Tests', path: '/mock-tests', icon: FileText, badge: 'Live' },
    { name: 'Quizzes', path: '/quizzes', icon: Timer },
    { name: 'History', path: '/history', icon: History },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Saved', path: '/saved', icon: Bookmark },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  const secondaryNavItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Feedback', path: '/help', icon: HelpIcon },
  ];

  const mobilePrimaryTabs = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Practice', path: '/mcq', icon: HelpCircle },
    { name: 'Mocks', path: '/mock-tests', icon: FileText },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex font-sans">
      {/* 1. Desktop Left Sidebar (260px) */}
      <aside className="hidden lg:flex flex-col w-[260px] fixed top-0 bottom-0 left-0 bg-[#0A0A0A] border-r border-[#262626] z-40 select-none">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-[#262626] flex items-center justify-between shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FACC15] flex items-center justify-center font-bold text-black text-lg">
              C
            </div>
            <span className="text-lg font-bold tracking-tight text-[#F5F5F5]">Chorcha</span>
          </Link>
        </div>

        {/* Primary Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#121212] text-[#F5F5F5] font-semibold border-l-2 border-[#FACC15]'
                    : 'text-[#A3A3A3] hover:bg-[#121212] hover:text-[#F5F5F5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FACC15]' : 'text-[#A3A3A3]'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FACC15] text-black uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Admin Panel Entry Link (Visible ONLY to Admin role) */}
          {isAdmin && (
            <div className="pt-2">
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Administration
              </div>
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-[#121212] text-[#FACC15] border border-[#3F3F3F] hover:border-[#FACC15]`}
              >
                <ShieldCheck className="w-4 h-4 text-[#FACC15]" />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Secondary Navigation & User Profile Footer */}
        <div className="p-3 border-t border-[#262626] bg-[#0A0A0A] shrink-0 space-y-2">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#121212] text-[#F5F5F5]'
                    : 'text-[#A3A3A3] hover:bg-[#121212] hover:text-[#F5F5F5]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-[#262626]/50">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#121212] border border-[#262626]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#3F3F3F] flex items-center justify-center shrink-0 text-[#FACC15] font-bold text-xs">
                  {profile?.displayName?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[#F5F5F5] truncate">
                    {profile?.displayName || 'Student'}
                  </span>
                  <span className="text-[10px] text-[#A3A3A3] truncate">
                    {profile?.email || user?.email || 'examinee'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-1.5 rounded hover:bg-[#1A1A1A] text-[#A3A3A3] hover:text-[#EF4444] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Column Wrapper (Padded left 260px on desktop) */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-h-screen pb-16 lg:pb-0">
        {/* Top Header: NO page links in header */}
        <header className="sticky top-0 z-30 h-16 bg-[#000000]/90 backdrop-blur-md border-b border-[#262626] px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#0A0A0A] border border-[#262626] text-[#A3A3A3] hover:text-[#F5F5F5]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-[#F5F5F5] tracking-tight">
              {pageTitle || 'Student Dashboard'}
            </h1>
          </div>

          {/* Top Right Controls - NO page links */}
          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              className="p-2 rounded-lg bg-[#0A0A0A] border border-[#262626] text-[#A3A3A3] hover:text-[#F5F5F5] hover:border-[#3F3F3F] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FACC15]" />
            </Link>

            <Link href="/profile" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0A0A0A] border border-[#3F3F3F] flex items-center justify-center text-[#FACC15] font-bold text-xs hover:border-[#FACC15] transition-colors">
                {profile?.displayName?.[0]?.toUpperCase() || 'S'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Main Stage */}
        <main className="flex-1 p-4 md:p-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0A0A0A] border-t border-[#262626] z-40 flex items-center justify-around px-2">
        {mobilePrimaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#FACC15] font-semibold' : 'text-[#A3A3A3]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium text-[#A3A3A3]"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </div>

      {/* Mobile "More" Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#0A0A0A] h-full border-l border-[#262626] p-4 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#FACC15] text-black font-bold flex items-center justify-center text-sm">C</div>
                  <span className="font-bold text-[#F5F5F5]">Navigation Menu</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded bg-[#121212] text-[#A3A3A3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {[...navItems, ...secondaryNavItems].map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-[#121212] text-[#FACC15] font-semibold'
                          : 'text-[#A3A3A3] hover:bg-[#121212] hover:text-[#F5F5F5]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6B6B6B]" />
                    </Link>
                  );
                })}

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-lg text-sm font-semibold text-[#FACC15] bg-[#121212] border border-[#3F3F3F] mt-3"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#262626]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#121212] text-[#EF4444] border border-[#EF4444]/30 text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
