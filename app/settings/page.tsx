'use client';

import React, { useState } from 'react';
import StudentAppShell from '../../components/shells/StudentAppShell';
import { Settings, Bell, Volume2, Eye, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [hideTimer, setHideTimer] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confirmSubmit, setConfirmSubmit] = useState(true);

  return (
    <StudentAppShell pageTitle="Platform Settings">
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">Exam Preferences & Audio Settings</h1>
          <p className="text-xs text-[#A3A3A3]">Customize exam HUD behavior, timer notifications, and submission prompts.</p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl divide-y divide-[#262626]">
          <div className="p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F5F5F5]">Submission Confirmation Dialog</h3>
              <p className="text-xs text-[#A3A3A3] mt-0.5">Prompt confirmation modal before finalizing exam paper submission.</p>
            </div>
            <input
              type="checkbox"
              checked={confirmSubmit}
              onChange={(e) => setConfirmSubmit(e.target.checked)}
              className="w-5 h-5 accent-[#FACC15] cursor-pointer"
            />
          </div>

          <div className="p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F5F5F5]">Exam Countdown Timer HUD</h3>
              <p className="text-xs text-[#A3A3A3] mt-0.5">Keep countdown timer visible in the top navigation bar during live exams.</p>
            </div>
            <input
              type="checkbox"
              checked={!hideTimer}
              onChange={(e) => setHideTimer(!e.target.checked)}
              className="w-5 h-5 accent-[#FACC15] cursor-pointer"
            />
          </div>

          <div className="p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F5F5F5]">Timer Warning Audio Chime</h3>
              <p className="text-xs text-[#A3A3A3] mt-0.5">Play audio alert when remaining exam time drops under 5 minutes.</p>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5 accent-[#FACC15] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </StudentAppShell>
  );
}
