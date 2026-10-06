'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { NavigationTab, UserProfile } from '../lib/types';

interface TopHeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenMobileSidebar: () => void;
  unreadCount: number;
  profile: UserProfile;
  userRole: 'student' | 'admin';
  onToggleRole: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function TopHeader({
  currentTab,
  onSelectTab,
  onOpenMobileSidebar,
  unreadCount,
  profile,
  userRole,
  onToggleRole,
  onLogout,
  searchQuery,
  onSearchChange,
}: TopHeaderProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumb = () => {
    switch (currentTab) {
      case 'dashboard':
        return { parent: 'Dashboard', child: 'Overview' };
      case 'mcq_exam':
        return { parent: 'Exams', child: 'All MCQ Tests' };
      case 'history_exams':
        return { parent: 'History', child: 'Exam History' };
      case 'history_wrong':
        return { parent: 'History', child: 'Wrong Questions Review' };
      case 'progress':
        return { parent: 'Activity', child: 'Progress Analytics' };
      case 'bookmarks':
        return { parent: 'Activity', child: 'Saved Questions' };
      case 'leaderboard':
        return { parent: 'Activity', child: 'Leaderboard Rankings' };
      case 'notifications':
        return { parent: 'Support', child: 'Notifications' };
      case 'help':
        return { parent: 'Support', child: 'Help Center & FAQ' };
      case 'privacy':
        return { parent: 'Support', child: 'Privacy Policy' };
      case 'profile':
        return { parent: 'Account', child: 'User Profile' };
      case 'settings':
        return { parent: 'Account', child: 'System Settings' };
      case 'admin':
        return { parent: 'Administration', child: 'Admin Console' };
      default:
        return { parent: 'Dashboard', child: 'Overview' };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#000000] border-b border-[#262626] flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left: Mobile hamburger & Breadcrumb Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden h-9 w-9 rounded-lg border border-[#262626] bg-[#0A0A0A] text-[#A3A3A3] hover:text-white flex items-center justify-center"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Clean Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#6B6B6B] hover:text-[#A3A3A3] cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            {breadcrumb.parent}
          </span>
          <ChevronRight className="h-3 w-3 text-[#3F3F3F]" />
          <span className="font-semibold text-[#F5F5F5]">{breadcrumb.child}</span>
        </div>
      </div>

      {/* Right: Search + Notifications + User Avatar Menu */}
      <div className="flex items-center gap-3">
        {/* Search input in header (desktop) */}
        <div className="relative hidden lg:block">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search exams, subjects..."
            className="w-56 h-8 pl-8 pr-3 bg-[#0A0A0A] border border-[#262626] focus:border-[#FACC15] rounded-lg text-xs text-[#F5F5F5] placeholder-[#555] outline-none transition-colors"
          />
        </div>

        {/* Notifications Button */}
        <button
          onClick={() => onSelectTab('notifications')}
          className="relative h-8 w-8 rounded-lg border border-[#262626] bg-[#0A0A0A] hover:bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5] flex items-center justify-center transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#FACC15] text-black font-bold text-[9px] flex items-center justify-center ring-2 ring-black">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Role Quick Toggle */}
        <button
          onClick={onToggleRole}
          className={`hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-xs font-semibold transition-colors ${
            userRole === 'admin'
              ? 'border-amber-500/50 bg-amber-950/20 text-amber-300 hover:bg-amber-900/30'
              : 'border-[#262626] bg-[#0A0A0A] text-[#A3A3A3] hover:text-[#F5F5F5] hover:border-[#3F3F3F]'
          }`}
          title="Switch role for demo testing"
        >
          {userRole === 'admin' ? (
            <>
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>Admin Mode</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Student Mode</span>
            </>
          )}
        </button>

        {/* User Avatar & Dropdown Mini-Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-xl border border-[#262626] bg-[#0A0A0A] hover:border-[#3F3F3F] transition-colors"
          >
            <div className="h-7 w-7 rounded-lg bg-[#FACC15] text-black font-bold text-xs flex items-center justify-center shrink-0">
              {profile.displayName.charAt(0)}
            </div>
            <span className="hidden md:inline text-xs font-medium text-[#F5F5F5] max-w-[100px] truncate">
              {profile.displayName.split(' ')[0]}
            </span>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#262626] bg-[#0A0A0A] shadow-2xl py-1 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="px-3.5 py-2.5 border-b border-[#1F1F1F]">
                <p className="text-xs font-bold text-[#F5F5F5] truncate">{profile.displayName}</p>
                <p className="text-[11px] text-[#A3A3A3] truncate">{profile.email}</p>
                <span className="inline-block mt-1 text-[10px] font-mono text-[#FACC15] bg-[#FACC15]/10 px-1.5 py-0.5 rounded">
                  {userRole === 'admin' ? 'Role: Administrator' : 'Role: Student (Examinee)'}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onSelectTab('profile');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#141414] text-left transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#141414] text-left transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTab('help');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#141414] text-left transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Help Center</span>
                </button>

                <button
                  onClick={() => {
                    onToggleRole();
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-[#141414] text-left transition-colors"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Switch to {userRole === 'admin' ? 'Student' : 'Admin'}</span>
                </button>
              </div>

              <div className="border-t border-[#1F1F1F] pt-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#EF4444] hover:bg-[#1F1212] text-left transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
