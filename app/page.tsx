'use client';

import React from 'react';
import Link from 'next/link';
import LandingShell from '../components/shells/LandingShell';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Timer,
  Trophy,
  BarChart3,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      title: 'Precision Exam HUD',
      description: 'Zero-distraction Pure Black OLED player with 32+ question matrix palette and real-time status tracking.',
      icon: Timer,
    },
    {
      title: 'Instant Server Evaluation',
      description: 'Server-side answer validation preventing key exposure. Instant negative marking score card and accuracy breakdown.',
      icon: ShieldCheck,
    },
    {
      title: 'Comprehensive Subject Tree',
      description: 'Unlimited practice across General Knowledge, Science, Math, Literature, and Competitive Exam syllabi.',
      icon: BarChart3,
    },
    {
      title: 'Competitive Leaderboards',
      description: 'Measure performance velocity against peers across Bangladesh with daily streaks and percentile rankings.',
      icon: Trophy,
    },
  ];

  return (
    <LandingShell>
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121212] border border-[#3F3F3F] text-xs font-semibold text-[#FACC15] mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
          <span>Pure Black OLED EdTech Engine v2.0</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#F5F5F5] max-w-4xl leading-tight sm:leading-tight">
          Master Competitive Exams with <span className="text-[#FACC15]">Deliberate Practice</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-[#A3A3A3] max-w-2xl leading-relaxed">
          High-performance online mock test and MCQ practice platform. Real-time timer HUD, tabular accuracy analytics, and server-graded evaluation.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FACC15]/10"
          >
            <span>Start Free Practice Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#121212] border border-[#3F3F3F] hover:border-[#6B6B6B] text-[#F5F5F5] font-semibold text-base flex items-center justify-center transition-colors"
          >
            <span>Examinee Sign In</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-[#A3A3A3]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span>Server-Graded Integrity</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span>Tabular High Precision Timers</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span>BCS & Varsity Admission Syllabi</span>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-16 px-4 md:px-8 border-t border-[#262626] bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">Engineered for Exam Readiness</h2>
            <p className="text-sm text-[#A3A3A3]">Built on clean OLED aesthetics, tabular typography, and resilient offline capabilities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#121212] border border-[#262626] hover:border-[#3F3F3F] rounded-2xl p-6 transition-colors flex flex-col space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] border border-[#3F3F3F] flex items-center justify-center text-[#FACC15]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#F5F5F5]">{feat.title}</h3>
                  <p className="text-xs text-[#A3A3A3] leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Conversion Banner Section */}
      <section className="py-20 px-4 md:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-[#0A0A0A] border border-[#3F3F3F] rounded-3xl p-8 sm:p-12 space-y-6 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#FACC15]/10 rounded-full blur-2xl" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F5F5]">
            Ready to test your knowledge velocity?
          </h2>
          <p className="text-sm text-[#A3A3A3] max-w-xl mx-auto">
            Join thousands of examinees taking daily mock tests, subject drills, and competitive exam evaluations.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-base transition-colors"
            >
              <span>Create Free Examinee Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </LandingShell>
  );
}
