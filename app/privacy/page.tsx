'use client';

import React from 'react';
import StudentAppShell from '../../components/shells/StudentAppShell';
import { ShieldCheck, Lock, Eye } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <StudentAppShell pageTitle="Privacy & Security Policy">
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">Data Privacy & Security Standard</h1>
          <p className="text-xs text-[#A3A3A3]">Our commitments to candidate data privacy and examination evaluation integrity.</p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-6 space-y-4 text-xs text-[#A3A3A3] leading-relaxed">
          <div className="flex items-center gap-2 text-[#FACC15] font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Pure Black Security Architecture</span>
          </div>
          <p>
            Chorcha utilizes server-side examination evaluation engines. Candidate responses are evaluated on authenticated cloud instances, ensuring complete anti-cheating confidentiality and zero exposure of master solution keys to the browser client during live examination sessions.
          </p>
          <div className="flex items-center gap-2 text-[#22C55E] font-semibold text-sm pt-2">
            <Lock className="w-4 h-4" />
            <span>Account Confidentiality</span>
          </div>
          <p>
            Personal profile metrics, historical exam scores, and streak data remain restricted to your authenticated user account. We never share examinee academic logs with third parties without consent.
          </p>
        </div>
      </div>
    </StudentAppShell>
  );
}

