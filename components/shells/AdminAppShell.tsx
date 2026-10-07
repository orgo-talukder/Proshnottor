'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  ShieldCheck,
  LayoutDashboard,
  FileQuestion,
  UploadCloud,
  FileText,
  Users,
  ScrollText,
  ArrowLeft,
  LogOut,
  Bell,
  Lock,
  Menu,
  X,
} from 'lucide-react';

interface AdminAppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function AdminAppShell({ children, pageTitle }: AdminAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Question Repository', path: '/admin/questions', icon: FileQuestion },
    { name: 'Import Questions', path: '/admin/questions/import', icon: UploadCloud },
    { name: 'Quizzes & Mocks', path: '/admin/quizzes', icon: FileText },
    { name: 'Student Users', path: '/admin/students', icon: Users },
    { name: 'System Audit Logs', path: '/admin/logs', icon: ScrollText },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#A3A3A3]">Verifying Admin Access...</span>
        </div>
      </div>
    );
  }

  // Strict RBAC Guard Check
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0A0A0A] border border-[#262626] rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center mx-auto text-[#EF4444]">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#F5F5F5]">Access Restricted</h1>
            <p className="text-xs text-[#A3A3A3]">
              You do not have administrative permissions to view the Admin Management Console. Authorized accounts only.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#FACC15] text-black font-semibold text-sm hover:bg-[#FDE047] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Student App</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex font-sans">
      {/* Admin Desktop Sidebar (260px) */}
      <aside className="hidden lg:flex flex-col w-[260px] fixed top-0 bottom-0 left-0 bg-[#0A0A0A] border-r border-[#262626] z-40 select-none">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-[#262626] flex items-center justify-between shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FACC15] flex items-center justify-center font-bold text-black text-lg">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#F5F5F5]">Chorcha Admin</span>
              <span className="text-[10px] text-[#FACC15] font-semibold uppercase tracking-wider">Control Panel</span>
            </div>
          </Link>
        </div>

        {/* Admin Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#121212] text-[#FACC15] font-semibold border-l-2 border-[#FACC15]'
                    : 'text-[#A3A3A3] hover:bg-[#121212] hover:text-[#F5F5F5]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FACC15]' : 'text-[#A3A3A3]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: Return to Student Portal & Sign Out */}
        <div className="p-3 border-t border-[#262626] bg-[#0A0A0A] shrink-0 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#121212] border border-[#262626] text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5] hover:border-[#3F3F3F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#FACC15]" />
            <span>Switch to Student App</span>
          </Link>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#121212] border border-[#262626]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#FACC15] text-black font-bold flex items-center justify-center text-xs shrink-0">
                A
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#F5F5F5] truncate">Administrator</span>
                <span className="text-[10px] text-[#A3A3A3] truncate">{user?.email}</span>
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
      </aside>

      {/* Main Admin Content Stage */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-h-screen">
        {/* Admin Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-[#000000]/90 backdrop-blur-md border-b border-[#262626] px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#0A0A0A] border border-[#262626] text-[#A3A3A3] hover:text-[#F5F5F5]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] text-[10px] font-bold uppercase tracking-wider">
                Admin
              </span>
              <h1 className="text-base sm:text-lg font-bold text-[#F5F5F5]">
                {pageTitle || 'Platform Administration'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/logs"
              className="p-2 rounded-lg bg-[#0A0A0A] border border-[#262626] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Admin Drawer */}
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
                  <ShieldCheck className="w-6 h-6 text-[#FACC15]" />
                  <span className="font-bold text-[#F5F5F5]">Admin Console</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded bg-[#121212] text-[#A3A3A3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-[#121212] text-[#FACC15] font-semibold'
                          : 'text-[#A3A3A3] hover:bg-[#121212] hover:text-[#F5F5F5]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#262626] space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#121212] text-[#FACC15] border border-[#3F3F3F] text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Student App</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
