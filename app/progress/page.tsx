'use client';

import React, { useEffect, useState } from 'react';
import StudentAppShell from '../../components/shells/StudentAppShell';
import { useAuth } from '../../lib/auth-context';
import { subscribeToUserAttempts } from '../../lib/firestore-service';
import { ExamAttempt } from '../../lib/types';
import { TrendingUp, Award, Target, AlertTriangle } from 'lucide-react';

export default function ProgressPage() {
  const { user, profile } = useAuth();
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToUserAttempts(user.uid, (liveAttempts) => {
      setAttempts(liveAttempts);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const completed = attempts.filter((a) => a.status === 'completed');
  const avgAccuracy =
    completed.length > 0
      ? Math.round(completed.reduce((acc, a) => acc + (a.accuracy || 0), 0) / completed.length)
      : 0;

  const totalQuestionsSolved = completed.reduce((acc, a) => acc + (a.totalQuestions || 0), 0);

  return (
    <StudentAppShell pageTitle="Progress & Performance Analytics">
      <div className="space-y-6">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">Preparation Analytics</h1>
          <p className="text-xs text-[#A3A3A3]">Performance metrics calculated from your submitted examination papers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-5 space-y-2">
            <span className="text-xs text-[#A3A3A3]">Total Questions Attempted</span>
            <div className="text-3xl font-extrabold text-[#F5F5F5] tabular-nums">{totalQuestionsSolved}</div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-5 space-y-2">
            <span className="text-xs text-[#A3A3A3]">Overall Accuracy Rate</span>
            <div className="text-3xl font-extrabold text-[#22C55E] tabular-nums">{avgAccuracy}%</div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-5 space-y-2">
            <span className="text-xs text-[#A3A3A3]">Exam Papers Completed</span>
            <div className="text-3xl font-extrabold text-[#FACC15] tabular-nums">{completed.length}</div>
          </div>
        </div>

        {/* Target Alert */}
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#FACC15]">
            <Target className="w-5 h-5" />
            <h2 className="text-sm font-bold text-[#F5F5F5]">Target Focus: {profile?.targetExam || 'General Prep'}</h2>
          </div>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            Keep completing daily practice drills to increase your streak and accuracy percentile.
          </p>
        </div>
      </div>
    </StudentAppShell>
  );
}
