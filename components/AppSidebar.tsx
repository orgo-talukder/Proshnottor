'use client';

import React from 'react';
import {
  LayoutDashboard,
  FileQuestion,
  History,
  TrendingUp,
  Bookmark,
  Trophy,
  Bell,
  HelpCircle,
  ShieldCheck,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { NavigationTab, UserProfile } from '../lib/types';

interface AppSidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isAdmin: boolean;
  unreadNotifsCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  profile: UserProfile | null;
  onLogout: () => void;
}

export default function AppSidebar({
  currentTab,
  onSelectTab,
  isAdmin,
  unreadNotifsCount,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  profile,
  onLogout,
}: AppSidebarProps) {
  const handleNav = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#000000] border-r border-[#262626] text-[#F5F5F5] select-none">
      {/* Brand & Collapse Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#262626]">
        <div
          onClick={() => handleNav('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
        >
          <div className="h-8 w-8 rounded-lg bg-[#FACC15] text-black font-extrabold flex items-center justify-center shrink-0 text-sm shadow">
            প্র
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-[#F5F5F5] leading-none">
                প্রশ্নোত্তর
              </span>
              <span className="text-[10px] text-[#A3A3A3] mt-0.5">
                Proshnottor · MCQ Engine
              </span>
            </div>
          )}
        </div>

        {/* Desktop collapse button */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex h-7 w-7 rounded-lg border border-[#262626] bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#A3A3A3] hover:text-[#F5F5F5] items-center justify-center transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden h-8 w-8 rounded-lg border border-[#262626] bg-[#0A0A0A] text-[#A3A3A3] hover:text-white flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Groups Container */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[#262626]">
        {/* MAIN SECTION */}
        <div>
          {!collapsed && (
            <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase">
              Main
            </div>
          )}
          <nav className="space-y-1">
            <button
              onClick={() => handleNav('dashboard')}
              title={collapsed ? 'Dashboard' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors relative ${
                currentTab === 'dashboard'
                  ? 'bg-[#121212] text-[#F5F5F5] font-semibold'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#0A0A0A]'
              }`}
            >
              {currentTab === 'dashboard' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FACC15] rounded-r-full" />
              )}
              <LayoutDashboard
                className={`h-4 w-4 shrink-0 ${
                  currentTab === 'dashboard' ? 'text-[#FACC15]' : 'text-[#A3A3A3]'
                }`}
              />
              {!collapsed && <span>Dashboard</span>}
            </button>

            <button
              onClick={() => handleNav('mcq')}
              title={collapsed ? 'MCQ Exam' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors relative ${
                currentTab === 'mcq'
                  ? 'bg-[#121212] text-[#F5F5F5] font-semibold'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#0A0A0A]'
              }`}
            >
              {currentTab === 'mcq' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FACC15] rounded-r-full" />
              )}
              <FileQuestion
                className={`h-4 w-4 shrink-0 ${
                  currentTab === 'mcq' ? 'text-[#FACC15]' : 'text-[#A3A3A3]'
                }`}
              />
              {!collapsed && <span>MCQ Exam</span>}
            </button>
          </nav>
        </div>

        {/* ACTIVITY SECTION */}
        <div>
          {!collapsed && (
            <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase">
              Activity
            </div>
          )}
          <nav className="space-y-1">
            {/* History Single Direct Button (NO Dropdown, NO Chevron) */}
            <button
              onClick={() => handleNav('history')}
              title={collapsed ? 'History' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors relative ${
                currentTab === 'history'
                  ? 'bg-[#121212] text-[#F5F5F5] font-semibold'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#0A0A0A]'
              }`}
            >
              {currentTab === 'history' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FACC15] rounded-r-full" />
              )}
              <History
                className={`h-4 w-4 shrink-0 ${
                  currentTab === 'history' ? 'text-[#FACC15]' : 'text-[#A3A3A3]'
                }`}
              />
              {!collapsed && <span>History</span>}
            </button>

            <button
              onClick={() => handleNav('progress')}
              title={collapsed ? 'Progress' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors relative ${
                currentTab === 'progress'
                  ? 'bg-[#121212] text-[#F5F5F5] font-semibold'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#0A0A0A]'
              }`}
            >
              {currentTab === 'progress' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FACC15] rounded-r-full" />
              )}
              <TrendingUp
                className={`h-4 w-4 shrink-0 ${
                  currentTab === 'progress' ? 'text-[#FACC15]' : 'text-[#A3A3A3]'
                }`}
              />
              {!collapsed && <span>Progress</span>}
            </button>

            <button
              onClick={() => handleNav('bookmarks')}
              title={collapsed ? 'Bookmarks' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors relative ${
                currentTab === 'bookmarks'
                  ? 'bg-[#121212] text-[#F5F5F5] font-semibold'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#0A0A0A]'
              }`}
            >
              {currentTab === 'bookmarks' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FACC15] rounded-r-full" />
              )}
              <Bookmark
                className={`h-4 w-4 shrink-0 ${
                  currentTab === 'bookmarks' ? 'text-[#FACC15]' : 'text-[#A3A3A3]'
                }`}
              />
              {!collapsed && <span>Bookmarks</span>}
            </button>

            <button
              onClick={() => handleNav('leaderboard')}
              title={collapsed ? 'Leaderboard' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors relative ${
                currentTab === 'leaderboard'
                  ? 'bg-[#121212] text-[#F5F5F5] font-semibold'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#0A0A0A]'
              }`}
            >
              {currentTab === 'leaderboard' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FACC15] rounded-r-full" />
              )}
              <Trophy
                className={`h-4 w-4 shrink-0 ${
                  currentTab === 'leaderboard' ? 'text-[#FACC15]' : 'text-[#A3A3A3]'
                }`}
              />
              {!collapsed && <span>Leaderboard</span>}
            </button>
          </nav>
        </div>

        {/* SUPPORT SECTION */}
        <div>
          {!collapsed && (
            <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase">
              Support
            </div>
          )}
          <nav className="space-y-1">
            <button
              onClick={() => handleNav('notifications')}
              title={collapsed ? 'Notifications' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors relative ${
                currentTab === 'notifications'
                  ? 'bg-[#121212] text-[#F5F5F5] font-semibold'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#0A0A0A]'
              }`}
            >
              {currentTab === 'notifications' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FACC15] rounded-r-full" />
              )}
              <div className="flex items-center gap-3 truncate">
                <Bell
                  className={`h-4 w-4 shrink-0 ${
                    currentTab === 'notifications' ? 'text-[#FACC15]' : 'text-[#A3A3A3]'
                  }`}
                />
                {!collapsed && <span>Notifications</span>}
              </div>
              {unreadNotifsCount > 0 && !collapsed && (
                <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-[#FACC15] text-black text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav('help')}
              title={collapsed ? 'Help Center' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors relative ${
                currentTab === 'help'
                  ? 'bg-[#121212] text-[#F5F5F5] font-semibold'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#0A0A0A]'
              }`}
            >
              {currentTab === 'help' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FACC15] rounded-r-full" />
              )}
              <HelpCircle
                className={`h-4 w-4 shrink-0 ${
                  currentTab === 'help' ? 'text-[#FACC15]' : 'text-[#A3A3A3]'
                }`}
              />
              {!collapsed && <span>Help Center</span>}
            </button>

            <button
              onClick={() => handleNav('privacy')}
              title={collapsed ? 'Privacy Policy' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors relative ${
                currentTab === 'privacy'
                  ? 'bg-[#121212] text-[#F5F5F5] font-semibold'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#0A0A0A]'
              }`}
            >
              {currentTab === 'privacy' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FACC15] rounded-r-full" />
              )}
              <ShieldCheck
                className={`h-4 w-4 shrink-0 ${
                  currentTab === 'privacy' ? 'text-[#FACC15]' : 'text-[#A3A3A3]'
                }`}
              />
              {!collapsed && <span>Privacy Policy</span>}
            </button>
          </nav>
        </div>

        {/* ACCOUNT SECTION */}
        <div>
          {!collapsed && (
            <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-[#6B6B6B] uppercase">
              Account
            </div>
          )}
          <nav className="space-y-1">
            <button
              onClick={() => handleNav('profile')}
              title={collapsed ? 'Profile' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors relative ${
                currentTab === 'profile'
                  ? 'bg-[#121212] text-[#F5F5F5] font-semibold'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#0A0A0A]'
              }`}
            >
              {currentTab === 'profile' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FACC15] rounded-r-full" />
              )}
              <User
                className={`h-4 w-4 shrink-0 ${
                  currentTab === 'profile' ? 'text-[#FACC15]' : 'text-[#A3A3A3]'
                }`}
              />
              {!collapsed && <span>Profile</span>}
            </button>

            <button
              onClick={() => handleNav('settings')}
              title={collapsed ? 'Settings' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors relative ${
                currentTab === 'settings'
                  ? 'bg-[#121212] text-[#F5F5F5] font-semibold'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#0A0A0A]'
              }`}
            >
              {currentTab === 'settings' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FACC15] rounded-r-full" />
              )}
              <Settings
                className={`h-4 w-4 shrink-0 ${
                  currentTab === 'settings' ? 'text-[#FACC15]' : 'text-[#A3A3A3]'
                }`}
              />
              {!collapsed && <span>Settings</span>}
            </button>
          </nav>
        </div>

        {/* ADMINISTRATION (Strictly only visible if user is the verified admin) */}
        {isAdmin && (
          <div>
            {!collapsed && (
              <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-amber-500 uppercase flex items-center justify-between">
                <span>Administration</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                  ADMIN
                </span>
              </div>
            )}
            <nav className="space-y-1">
              <button
                onClick={() => handleNav('admin')}
                title={collapsed ? 'Admin Console' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors relative border border-amber-500/20 ${
                  currentTab === 'admin'
                    ? 'bg-amber-950/30 text-amber-300 font-semibold'
                    : 'text-amber-400 hover:text-amber-200 hover:bg-[#121212]'
                }`}
              >
                {currentTab === 'admin' && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-400 rounded-r-full" />
                )}
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
                {!collapsed && <span>Admin Console</span>}
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-3 border-t border-[#262626] bg-[#0A0A0A]">
        {!collapsed && profile ? (
          <div className="flex items-center justify-between">
            <div
              onClick={() => handleNav('profile')}
              className="flex items-center gap-2.5 truncate cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-xs font-bold text-[#FACC15] shrink-0">
                {profile.displayName?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-[#F5F5F5] truncate leading-tight">
                  {profile.displayName || 'User'}
                </span>
                <span className="text-[10px] text-[#A3A3A3] truncate">
                  {isAdmin ? 'Administrator' : 'Student'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="h-8 w-8 rounded-lg border border-[#262626] hover:bg-[#1C1C1C] text-[#A3A3A3] hover:text-[#EF4444] flex items-center justify-center transition-colors"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full h-8 rounded-lg border border-[#262626] hover:bg-[#1C1C1C] text-[#A3A3A3] hover:text-[#EF4444] flex items-center justify-center transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 z-30 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className={`fixed top-0 bottom-0 left-0 ${collapsed ? 'w-16' : 'w-64'}`}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer with Backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
