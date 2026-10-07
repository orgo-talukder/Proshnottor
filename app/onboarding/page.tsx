'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthShell from '../../components/shells/AuthShell';
import { useAuth } from '../../lib/auth-context';
import { Target, BookOpen, GraduationCap, Building2, Check, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateUserProfile } = useAuth();

  const [selectedTarget, setSelectedTarget] = useState('BCS & Competitive Exams');
  const [institution, setInstitution] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);

  const targetOptions = [
    {
      id: 'BCS & Competitive Exams',
      title: 'BCS & Govt Job Examinations',
      desc: 'Preliminary, written, and general knowledge mock tests.',
      icon: Target,
    },
    {
      id: 'University Admission (Varsity)',
      title: 'University Admission Test',
      desc: 'Science, Humanities, and Commerce unit prep.',
      icon: GraduationCap,
    },
    {
      id: 'Engineering & Medical Entrance',
      title: 'Pre-Engineering / Medical',
      desc: 'Physics, Chemistry, Math, and Biology focused drills.',
      icon: Building2,
    },
    {
      id: 'General Knowledge & Subject Skill',
      title: 'General MCQ Skill Drills',
      desc: 'Daily subject practice, vocabulary, and logic puzzles.',
      icon: BookOpen,
    },
  ];

  const handleSaveOnboarding = async () => {
    setLoading(true);
    try {
      await updateUserProfile({
        targetExam: selectedTarget,
        institution: institution || 'General Examinee',
        district: district || 'Dhaka',
      });
      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding update error:', err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Customize Your Exam Target"
      subtitle="Select your primary preparation focus to personalize mock test recommendations."
    >
      <div className="space-y-6">
        {/* Target Options Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">
            1. Select Primary Target
          </label>

          {targetOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedTarget === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedTarget(opt.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'bg-[#121212] border-[#FACC15] ring-1 ring-[#FACC15]'
                    : 'bg-[#0A0A0A] border-[#262626] hover:border-[#3F3F3F]'
                }`}
              >
                <div
                  className={`p-2 rounded-lg border shrink-0 ${
                    isSelected
                      ? 'bg-[#FACC15] text-black border-[#FACC15]'
                      : 'bg-[#121212] text-[#A3A3A3] border-[#3F3F3F]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#F5F5F5]">{opt.title}</h4>
                    {isSelected && <Check className="w-4 h-4 text-[#FACC15]" />}
                  </div>
                  <p className="text-[11px] text-[#A3A3A3] mt-0.5">{opt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Institution & District Optional inputs */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">
            2. Academic Background (Optional)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="College / University"
                className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#6B6B6B] outline-none"
              />
            </div>
            <div>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="District (e.g. Dhaka)"
                className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#6B6B6B] outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveOnboarding}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Complete Setup & Enter Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </AuthShell>
  );
}
