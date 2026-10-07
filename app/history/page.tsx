'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StudentAppShell from '../../components/shells/StudentAppShell';
import { useAuth } from '../../lib/auth-context';
import { subscribeToUserAttempts } from '../../lib/firestore-service';
import { ExamAttempt } from '../../lib/types';
import { History, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
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

  return (
    <StudentAppShell pageTitle="Exam Attempt Archives">
      <div className="space-y-6">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">Exam Attempt Archives</h1>
          <p className="text-xs text-[#A3A3A3]">Review score cards, accuracy breakdowns, and answer keys for past submissions.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-[#0A0A0A] border border-[#262626] animate-pulse" />
            ))}
          </div>
        ) : attempts.length === 0 ? (
          <div className="p-8 bg-[#0A0A0A] border border-[#262626] rounded-2xl text-center space-y-3 max-w-md mx-auto my-8">
            <History className="w-8 h-8 text-[#6B6B6B] mx-auto" />
            <h3 className="text-sm font-bold text-[#F5F5F5]">No Past Attempts Found</h3>
            <p className="text-xs text-[#A3A3A3]">Launch a mock test or quiz to record your first score card.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((att) => (
              <div
                key={att.id}
                className="bg-[#0A0A0A] border border-[#262626] hover:border-[#3F3F3F] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#121212] border border-[#3F3F3F] text-[#FACC15]">
                      {att.quizType || 'Mock'}
                    </span>
                    <span className="text-xs text-[#A3A3A3]">
                      {new Date(att.submittedAt || att.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#F5F5F5]">{att.quizTitle}</h3>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#262626]">
                  <div className="text-left sm:text-center">
                    <span className="text-[10px] uppercase text-[#A3A3A3] block">Score</span>
                    <span className="text-sm font-bold text-[#FACC15] tabular-nums">
                      {att.score} / {att.totalMarks}
                    </span>
                  </div>

                  <div className="text-left sm:text-center">
                    <span className="text-[10px] uppercase text-[#A3A3A3] block">Accuracy</span>
                    <span className="text-sm font-bold text-[#22C55E] tabular-nums">
                      {att.accuracy || 0}%
                    </span>
                  </div>

                  <Link
                    href={`/exam/${att.quizId}/result?attemptId=${att.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-[#121212] border border-[#3F3F3F] text-xs font-semibold text-[#F5F5F5] hover:border-[#FACC15] flex items-center gap-1 transition-colors"
                  >
                    <span>Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentAppShell>
  );
}
