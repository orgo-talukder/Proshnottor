'use client';

import React, { useState } from 'react';
import StudentAppShell from '../../components/shells/StudentAppShell';
import { useAuth } from '../../lib/auth-context';
import { User, Mail, Target, Building2, MapPin, Save, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [targetExam, setTargetExam] = useState(profile?.targetExam || 'BCS & Competitive Exams');
  const [institution, setInstitution] = useState(profile?.institution || '');
  const [district, setDistrict] = useState(profile?.district || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await updateUserProfile({
        displayName,
        targetExam,
        institution,
        district,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentAppShell pageTitle="Examinee Profile">
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">Examinee Profile & Target Settings</h1>
          <p className="text-xs text-[#A3A3A3]">Update your name, academic institution, and target examination focus.</p>
        </div>

        <form onSubmit={handleSave} className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-[#121212] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-[#6B6B6B] outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F5] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
              Primary Preparation Target
            </label>
            <select
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F5] outline-none"
            >
              <option value="BCS & Competitive Exams">BCS & Govt Job Examinations</option>
              <option value="University Admission (Varsity)">University Admission Test</option>
              <option value="Engineering & Medical Entrance">Pre-Engineering / Medical Entrance</option>
              <option value="General Knowledge & Subject Skill">General Knowledge & Skill Drills</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="University / College"
                className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F5] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Dhaka"
                className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F5] outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {saved && (
              <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
                <Check className="w-4 h-4" />
                Profile changes saved!
              </span>
            )}
            <button
              type="submit"
              disabled={loading}
              className="ml-auto px-6 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </StudentAppShell>
  );
}
