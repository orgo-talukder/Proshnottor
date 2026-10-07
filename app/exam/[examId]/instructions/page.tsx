'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FocusShell from '@/components/shells/FocusShell';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Quiz } from '@/lib/types';
import { ShieldAlert, Clock, AlertTriangle, ArrowRight, CheckSquare, Square } from 'lucide-react';

export default function ExamInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      if (!examId) return;
      try {
        const ref = doc(db, 'quizzes', examId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setQuiz({ ...(snap.data() as Quiz), id: snap.id });
        }
      } catch (err) {
        console.error('Failed to load quiz instructions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [examId]);

  const handleStartExam = () => {
    if (!agreed) return;
    router.push(`/exam/${examId}/runner`);
  };

  if (loading) {
    return (
      <FocusShell examTitle="Loading Instructions..." onExit={() => router.push('/dashboard')}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
        </div>
      </FocusShell>
    );
  }

  return (
    <FocusShell
      examTitle={quiz?.title || 'Examination Instructions'}
      onExit={() => router.push('/dashboard')}
    >
      <div className="max-w-3xl mx-auto my-auto w-full bg-[#0A0A0A] border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#262626] pb-4">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#121212] border border-[#3F3F3F] text-[#FACC15]">
            Pre-Exam Regulations
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] mt-2">
            {quiz?.title || 'Competitive Mock Examination'}
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">{quiz?.description}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[#121212] border border-[#262626] space-y-0.5">
            <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider">Duration</span>
            <div className="text-sm font-bold text-[#F5F5F5] tabular-nums">
              {quiz?.settings?.durationMinutes || 30} Minutes
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121212] border border-[#262626] space-y-0.5">
            <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider">Total Questions</span>
            <div className="text-sm font-bold text-[#F5F5F5] tabular-nums">
              {quiz?.questionIds?.length || 0} MCQs
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121212] border border-[#262626] space-y-0.5">
            <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider">Negative Ratio</span>
            <div className="text-sm font-bold text-[#EF4444] tabular-nums">
              {((quiz?.settings?.negativeRatio || 0.25) * 100).toFixed(0)}% Penalty
            </div>
          </div>
        </div>

        <div className="space-y-3 bg-[#121212] border border-[#262626] rounded-xl p-4 text-xs text-[#A3A3A3]">
          <h3 className="font-bold text-[#F5F5F5] text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#FACC15]" />
            <span>Standard Evaluation Rules</span>
          </h3>
          <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
            <li>Once started, the countdown timer runs continuously on server time.</li>
            <li>Each correct answer awards 1.0 point. Incorrect answers deduct the negative ratio penalty.</li>
            <li>You can navigate questions using the right Matrix Palette or Previous/Next controls.</li>
            <li>Answers are continuously saved in local draft state to survive network drops.</li>
            <li>When time expires, your current progress will be automatically evaluated by the server.</li>
          </ul>
        </div>

        <div
          onClick={() => setAgreed(!agreed)}
          className="flex items-center gap-3 p-3 rounded-xl bg-[#121212] border border-[#3F3F3F] cursor-pointer hover:border-[#FACC15] transition-colors"
        >
          <div className="text-[#FACC15] shrink-0">
            {agreed ? <CheckSquare className="w-5 h-5 fill-[#FACC15] text-black" /> : <Square className="w-5 h-5 text-[#6B6B6B]" />}
          </div>
          <span className="text-xs text-[#F5F5F5] font-medium">
            I have read and understood all examination regulations and am ready to begin.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2.5 rounded-xl bg-[#121212] border border-[#3F3F3F] text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5]"
          >
            Cancel
          </button>
          <button
            disabled={!agreed}
            onClick={handleStartExam}
            className="px-6 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Launch Examination Stage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </FocusShell>
  );
}
