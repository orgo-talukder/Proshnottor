'use client';

import React from 'react';
import StudentAppShell from '../../components/shells/StudentAppShell';
import { HelpCircle, Mail, FileText, ShieldCheck } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      q: 'How is negative marking calculated?',
      a: 'Each incorrect answer deducts the specified negative ratio (usually 25% or 0.25 points) from your total score.',
    },
    {
      q: 'Are my answers saved if my internet drops?',
      a: 'Yes, practice drafts are saved locally in your browser and synced with the server upon reconnection.',
    },
    {
      q: 'Can I retake a mock test after completion?',
      a: 'Yes, you can launch a retake anytime. All attempts will be recorded in your history archives.',
    },
  ];

  return (
    <StudentAppShell pageTitle="Help & Support">
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">Help & Frequently Asked Questions</h1>
          <p className="text-xs text-[#A3A3A3]">Guidance on examination rules, scoring policies, and platform features.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, idx) => (
            <div key={idx} className="p-5 bg-[#0A0A0A] border border-[#262626] rounded-2xl space-y-2">
              <h3 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#FACC15]" />
                <span>{f.q}</span>
              </h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed pl-6">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </StudentAppShell>
  );
}
