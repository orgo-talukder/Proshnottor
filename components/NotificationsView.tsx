'use client';

import React from 'react';
import { Bell, CheckCheck, FileQuestion, Award, Flame, Info, ArrowRight } from 'lucide-react';
import { AppNotification, NavigationTab } from '../lib/types';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
}

export default function NotificationsView({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigateTab,
}: NotificationsViewProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <FileQuestion className="h-4 w-4 text-[#FACC15]" />;
      case 'result':
        return <Award className="h-4 w-4 text-emerald-400" />;
      case 'streak':
        return <Flame className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            নতুন পরীক্ষার বিজ্ঞপ্তি, রেজাল্ট প্রকাশ ও সিস্টেম আপডেট।
          </p>
        </div>

        <button
          onClick={onMarkAllRead}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[#262626] bg-[#0A0A0A] hover:bg-[#141414] text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
        >
          <CheckCheck className="h-4 w-4" />
          <span>সব পঠিত চিহ্নিত করুন</span>
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-12 text-center">
          <Bell className="h-8 w-8 text-[#6B6B6B] mx-auto mb-2" />
          <p className="text-xs font-bold text-[#F5F5F5]">কোনো নোটিফিকেশন নেই</p>
          <p className="text-[11px] text-[#A3A3A3] mt-1">সব নতুন আপডেট এখানে দেখানো হবে।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                onMarkRead(notif.id);
                if (notif.linkTab) onNavigateTab(notif.linkTab);
              }}
              className={`rounded-2xl border p-4.5 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                !notif.read
                  ? 'border-[#FACC15]/40 bg-[#0F0E08] hover:border-[#FACC15]'
                  : 'border-[#262626] bg-[#0A0A0A] hover:border-[#3F3F3F]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#F5F5F5]">{notif.title}</h3>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-[#FACC15] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-[#6B6B6B] font-mono mt-2 block">
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              {notif.linkTab && (
                <div className="shrink-0 pt-1 text-[#A3A3A3] hover:text-[#FACC15]">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
