'use client';

import React, { useState } from 'react';
import {
  User,
  Settings,
  ShieldCheck,
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
  Moon,
  Volume2,
  Clock,
  Type,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile, ExamPreferences } from '../lib/types';

interface ProfileAndSettingsViewProps {
  viewType: 'profile' | 'settings';
  profile: UserProfile;
  preferences: ExamPreferences;
  userRole: 'student' | 'admin';
  onUpdateProfile: (updated: UserProfile) => void;
  onUpdatePreferences: (updated: ExamPreferences) => void;
  onToggleRole: () => void;
}

export default function ProfileAndSettingsView({
  viewType,
  profile,
  preferences,
  userRole,
  onUpdateProfile,
  onUpdatePreferences,
  onToggleRole,
}: ProfileAndSettingsViewProps) {
  // Profile edit states
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [institution, setInstitution] = useState(profile.institution || '');
  const [targetExam, setTargetExam] = useState(profile.targetExam || '');
  const [district, setDistrict] = useState(profile.district || '');
  const [savedToast, setSavedToast] = useState(false);

  // Preference states
  const [hideTimer, setHideTimer] = useState(preferences.hideTimer);
  const [confirmSubmit, setConfirmSubmit] = useState(preferences.confirmSubmit);
  const [fontScale, setFontScale] = useState(preferences.fontScale);
  const [soundEnabled, setSoundEnabled] = useState(preferences.soundEnabled);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      displayName,
      institution,
      targetExam,
      district,
    };
    onUpdateProfile(updated);
    setEditingProfile(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleSavePreferences = () => {
    const updated: ExamPreferences = {
      hideTimer,
      confirmSubmit,
      fontScale,
      soundEnabled,
    };
    onUpdatePreferences(updated);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Alert */}
      {savedToast && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>পরিবর্তন সফলভাবে সংরক্ষণ করা হয়েছে!</span>
        </div>
      )}

      {viewType === 'profile' ? (
        /* PROFILE TAB (Spec Section 61-62) */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#262626] pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
                User Profile
              </h1>
              <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
                আপনার ব্যক্তিগত ও একাডেমিক তথ্য ব্যবস্থাপনা।
              </p>
            </div>

            {!editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="h-9 px-4 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#EAB308] transition-all shadow"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Header Box */}
          <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[#141414] border border-[#262626] text-[#FACC15] text-2xl font-black flex items-center justify-center shrink-0 shadow">
                {profile.displayName.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#F5F5F5]">{profile.displayName}</h2>
                <p className="text-xs text-[#A3A3A3] font-mono mt-0.5">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono font-bold bg-[#FACC15]/10 text-[#FACC15] px-2 py-0.5 rounded border border-[#FACC15]/20">
                    {userRole === 'admin' ? 'Role: Administrator' : 'Role: Student'}
                  </span>
                  <span className="text-[10px] font-mono text-[#A3A3A3]">
                    Streak: 🔥 {profile.streak} Days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form OR View Cards */}
          {editingProfile ? (
            <form onSubmit={handleSaveProfile} className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#F5F5F5] mb-2">Edit Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#A3A3A3] mb-1 font-medium">Full Name (নাম)</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-[#262626] bg-[#121212] text-white outline-none focus:border-[#FACC15]"
                  />
                </div>

                <div>
                  <label className="block text-[#A3A3A3] mb-1 font-medium">Institution (শিক্ষা প্রতিষ্ঠান)</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#262626] bg-[#121212] text-white outline-none focus:border-[#FACC15]"
                  />
                </div>

                <div>
                  <label className="block text-[#A3A3A3] mb-1 font-medium">Target Exam (লক্ষ্য)</label>
                  <input
                    type="text"
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#262626] bg-[#121212] text-white outline-none focus:border-[#FACC15]"
                  />
                </div>

                <div>
                  <label className="block text-[#A3A3A3] mb-1 font-medium">District (জেলা)</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#262626] bg-[#121212] text-white outline-none focus:border-[#FACC15]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C1C1C]">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="h-9 px-4 rounded-xl border border-[#262626] text-xs text-[#A3A3A3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#EAB308] flex items-center gap-1.5 shadow"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 space-y-2">
                <span className="text-[11px] uppercase font-bold text-[#6B6B6B]">Academic Details</span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[#A3A3A3]">Institution:</span>
                    <p className="font-semibold text-[#F5F5F5]">{profile.institution || 'ঢাকা বিশ্ববিদ্যালয়'}</p>
                  </div>
                  <div>
                    <span className="text-[#A3A3A3]">Target Exam:</span>
                    <p className="font-semibold text-[#F5F5F5]">{profile.targetExam || '47th BCS & Job Recruitment'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 space-y-2">
                <span className="text-[11px] uppercase font-bold text-[#6B6B6B]">Location & Account</span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[#A3A3A3]">District:</span>
                    <p className="font-semibold text-[#F5F5F5]">{profile.district || 'Dhaka'}</p>
                  </div>
                  <div>
                    <span className="text-[#A3A3A3]">Member Since:</span>
                    <p className="font-semibold text-[#F5F5F5] font-mono">{profile.createdAt || 'March 2026'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SETTINGS TAB (Spec Section 63-66) */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#262626] pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
                System Settings
              </h1>
              <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
                পরীক্ষার ইন্টারফেস, টাইমার, ফন্ট সাইজ ও নিরাপত্তা কনফিগারেশন।
              </p>
            </div>

            <button
              onClick={handleSavePreferences}
              className="h-9 px-4 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#EAB308] flex items-center gap-1.5 shadow"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Settings</span>
            </button>
          </div>

          {/* 1. Appearance */}
          <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F5F5F5]">
              <Moon className="h-4 w-4 text-[#FACC15]" />
              <span>Appearance & Color System</span>
            </div>
            <p className="text-xs text-[#A3A3A3]">
              Proshnottor প্ল্যাটফর্মটি ১০০% <strong>Pure Black (#000000)</strong> OLED কালার সিস্টেমে ডিজাইন করা হয়েছে যা দীর্ঘস্থায়ী পরীক্ষা ও অনুশীলনে চোখের ক্লান্তি দূর করে।
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="px-3 py-1.5 rounded-lg border border-[#FACC15] bg-black text-[#FACC15] font-bold text-xs flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#FACC15]" />
                Pure Black OLED (Active Default)
              </span>
            </div>
          </div>

          {/* 2. Exam Preferences */}
          <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
              Exam Experience Preferences
            </h2>

            {/* Hide Timer Preference */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#1C1C1C] bg-[#121212]">
              <div>
                <span className="text-xs font-bold text-[#F5F5F5] block">Hide Timer (টাইমার লুকান)</span>
                <span className="text-[11px] text-[#A3A3A3]">
                  টাইমার লুকিয়ে রাখলেও নির্ধারিত সময় গণনা অব্যাহত থাকবে।
                </span>
              </div>
              <input
                type="checkbox"
                checked={hideTimer}
                onChange={(e) => setHideTimer(e.target.checked)}
                className="h-5 w-5 rounded border-[#333] bg-black text-[#FACC15] focus:ring-[#FACC15] cursor-pointer"
              />
            </div>

            {/* Confirm Submit Preference */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#1C1C1C] bg-[#121212]">
              <div>
                <span className="text-xs font-bold text-[#F5F5F5] block">Confirm Submit (সাবমিশন নিশ্চিতকরণ)</span>
                <span className="text-[11px] text-[#A3A3A3]">
                  পরীক্ষা জমা দেওয়ার আগে উত্তর না দেওয়া প্রশ্নের সংখ্যা সম্বলিত পপআপ সতর্কবার্তা।
                </span>
              </div>
              <input
                type="checkbox"
                checked={confirmSubmit}
                onChange={(e) => setConfirmSubmit(e.target.checked)}
                className="h-5 w-5 rounded border-[#333] bg-black text-[#FACC15] focus:ring-[#FACC15] cursor-pointer"
              />
            </div>

            {/* Font Scale Preference */}
            <div className="p-3 rounded-xl border border-[#1C1C1C] bg-[#121212] space-y-2">
              <span className="text-xs font-bold text-[#F5F5F5] block">Question Font Scale (প্রশ্নের ফন্ট সাইজ)</span>
              <div className="flex items-center gap-2">
                {(['sm', 'md', 'lg', 'xl'] as const).map((scale) => (
                  <button
                    key={scale}
                    onClick={() => setFontScale(scale)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                      fontScale === scale
                        ? 'bg-[#FACC15] text-black'
                        : 'bg-[#1C1C1C] text-[#A3A3A3] hover:text-white'
                    }`}
                  >
                    {scale.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Security & Demo Role Switch */}
          <div className="rounded-2xl border border-amber-500/20 bg-[#120F08] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Role-Based Access Control (RBAC) Switcher</span>
            </div>
            <p className="text-xs text-[#A3A3A3]">
              বর্তমানে সক্রিয় রোল: <strong className="text-white">{userRole === 'admin' ? 'Administrator' : 'Student'}</strong>। আপনি এখান থেকে এক ক্লিকে অ্যাডমিন ও শিক্ষার্থী ইন্টারফেসের মধ্যে স্যুইচ করে পরীক্ষা তৈরি ও পরিচালনা করতে পারেন।
            </p>
            <button
              onClick={onToggleRole}
              className="mt-2 h-9 px-4 rounded-xl border border-amber-500/50 bg-amber-950/40 text-amber-300 font-bold text-xs hover:bg-amber-900/50 transition-colors"
            >
              Switch to {userRole === 'admin' ? 'Student Mode' : 'Admin Console'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
