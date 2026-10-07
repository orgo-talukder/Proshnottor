'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminAppShell from '../../components/shells/AdminAppShell';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  FileQuestion,
  FileText,
  Users,
  ScrollText,
  Plus,
  UploadCloud,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    questionsCount: 0,
    quizzesCount: 0,
    attemptsCount: 0,
    studentsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminStats() {
      try {
        const qSnap = await getDocs(collection(db, 'questions'));
        const zSnap = await getDocs(collection(db, 'quizzes'));
        const aSnap = await getDocs(collection(db, 'attempts'));
        const uSnap = await getDocs(collection(db, 'users'));

        setStats({
          questionsCount: qSnap.size,
          quizzesCount: zSnap.size,
          attemptsCount: aSnap.size,
          studentsCount: uSnap.size,
        });
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminStats();
  }, []);

  return (
    <AdminAppShell pageTitle="Platform Executive Overview">
      <div className="space-y-8">
        <div className="border-b border-[#262626] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#F5F5F5]">Administration Console</h1>
            <p className="text-xs text-[#A3A3A3]">Manage question repositories, create mock tests, and audit examinee logs.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/questions/import"
              className="px-4 py-2 rounded-xl bg-[#121212] border border-[#3F3F3F] hover:border-[#FACC15] text-[#FACC15] font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Questions</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-[#A3A3A3]">
              <span className="text-xs font-semibold">Question Repository</span>
              <FileQuestion className="w-4 h-4 text-[#FACC15]" />
            </div>
            <div className="text-3xl font-extrabold text-[#F5F5F5] tabular-nums">
              {loading ? '...' : stats.questionsCount}
            </div>
            <p className="text-[11px] text-[#A3A3A3]">Total active stem items</p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-[#A3A3A3]">
              <span className="text-xs font-semibold">Published Papers</span>
              <FileText className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="text-3xl font-extrabold text-[#F5F5F5] tabular-nums">
              {loading ? '...' : stats.quizzesCount}
            </div>
            <p className="text-[11px] text-[#A3A3A3]">Mock tests and quizzes</p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-[#A3A3A3]">
              <span className="text-xs font-semibold">Exam Submissions</span>
              <TrendingUp className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <div className="text-3xl font-extrabold text-[#F5F5F5] tabular-nums">
              {loading ? '...' : stats.attemptsCount}
            </div>
            <p className="text-[11px] text-[#A3A3A3]">Evaluated student papers</p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-[#A3A3A3]">
              <span className="text-xs font-semibold">Registered Examinees</span>
              <Users className="w-4 h-4 text-[#FACC15]" />
            </div>
            <div className="text-3xl font-extrabold text-[#F5F5F5] tabular-nums">
              {loading ? '...' : stats.studentsCount}
            </div>
            <p className="text-[11px] text-[#A3A3A3]">Active student accounts</p>
          </div>
        </div>

        {/* Admin Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/questions"
            className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#262626] hover:border-[#3F3F3F] transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#121212] border border-[#3F3F3F] flex items-center justify-center text-[#FACC15] group-hover:scale-105 transition-transform">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F5F5] group-hover:text-[#FACC15] transition-colors">
                Question Bank Management
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-1">Add, edit, or purge questions, correct option keys, and solution explanations.</p>
            </div>
          </Link>

          <Link
            href="/admin/questions/import"
            className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#262626] hover:border-[#3F3F3F] transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#121212] border border-[#3F3F3F] flex items-center justify-center text-[#FACC15] group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F5F5] group-hover:text-[#FACC15] transition-colors">
                Bulk Question Import Wizard
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-1">Batch upload questions and official answer keys via CSV or JSON format.</p>
            </div>
          </Link>

          <Link
            href="/admin/logs"
            className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#262626] hover:border-[#3F3F3F] transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#121212] border border-[#3F3F3F] flex items-center justify-center text-[#FACC15] group-hover:scale-105 transition-transform">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F5F5] group-hover:text-[#FACC15] transition-colors">
                System Audit Stream
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-1">Monitor authentication events, exam submissions, and administrative changes.</p>
            </div>
          </Link>
        </div>
      </div>
    </AdminAppShell>
  );
}
