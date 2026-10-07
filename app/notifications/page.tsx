'use client';

import React from 'react';
import StudentAppShell from '../../components/shells/StudentAppShell';
import { Bell, Sparkles } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <StudentAppShell pageTitle="Notifications & Announcements">
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">System Announcements</h1>
          <p className="text-xs text-[#A3A3A3]">Updates regarding new published mock test papers and platform releases.</p>
        </div>

        <div className="p-5 bg-[#0A0A0A] border border-[#262626] rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-[#FACC15]">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-sm font-bold text-[#F5F5F5]">Pure Black OLED Redesign Live</h3>
          </div>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            The platform has been upgraded to a Pure Black OLED design with server-evaluated exam papers and tabular countdown timers.
          </p>
        </div>
      </div>
    </StudentAppShell>
  );
}
