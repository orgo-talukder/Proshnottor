'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StudentAppShell from '../../components/shells/StudentAppShell';
import { subscribeToPublishedQuizzes } from '../../lib/firestore-service';
import { Quiz } from '../../lib/types';
import { FileText, Clock, ArrowRight, Award } from 'lucide-react';

export default function MockTestsPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPublishedQuizzes((liveQuizzes) => {
      setQuizzes(liveQuizzes.filter((q) => q.type === 'mock' || !q.type));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <StudentAppShell pageTitle="Timed Mock Tests">
      <div className="space-y-6">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">Full-Length Mock Tests</h1>
          <p className="text-xs text-[#A3A3A3]">Simulated examination papers with negative ratio marking and tabular timers.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-[#0A0A0A] border border-[#262626] animate-pulse" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-8 bg-[#0A0A0A] border border-[#262626] rounded-2xl text-center space-y-3 max-w-md mx-auto my-8">
            <FileText className="w-8 h-8 text-[#6B6B6B] mx-auto" />
            <h3 className="text-sm font-bold text-[#F5F5F5]">No Mock Tests Published</h3>
            <p className="text-xs text-[#A3A3A3]">No active mock test papers available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-[#0A0A0A] border border-[#262626] hover:border-[#3F3F3F] rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#121212] border border-[#3F3F3F] text-[#FACC15]">
                      Mock Test
                    </span>
                    <span className="text-xs text-[#A3A3A3] flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-[#6B6B6B]" />
                      {quiz.settings?.durationMinutes || 30} mins
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F5F5F5] group-hover:text-[#FACC15] transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-[#A3A3A3] line-clamp-2">{quiz.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#262626]/60">
                  <div className="flex items-center gap-3 text-xs text-[#A3A3A3]">
                    <span>{quiz.questionIds?.length || 0} MCQs</span>
                    <span>·</span>
                    <span className="text-[#EF4444]">
                      {((quiz.settings?.negativeRatio || 0.25) * 100).toFixed(0)}% Penalty
                    </span>
                  </div>

                  <Link
                    href={`/exam/${quiz.id}/instructions`}
                    className="px-4 py-2 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Launch Paper</span>
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
