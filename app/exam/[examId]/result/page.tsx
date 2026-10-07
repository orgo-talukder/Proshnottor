'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import StudentAppShell from '@/components/shells/StudentAppShell';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ExamAttempt, Question } from '@/lib/types';
import {
  Award,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';

export default function ExamResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const examId = params.examId as string;
  const attemptId = searchParams.get('attemptId');

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questionsMap, setQuestionsMap] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      if (!attemptId) return;
      try {
        const ref = doc(db, 'attempts', attemptId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const att = { ...(snap.data() as ExamAttempt), id: snap.id };
          setAttempt(att);

          const qMap: Record<string, Question> = {};
          if (att.questionOrder?.length) {
            for (const qId of att.questionOrder) {
              const qSnap = await getDoc(doc(db, 'questions', qId));
              if (qSnap.exists()) {
                qMap[qId] = { ...(qSnap.data() as Question), id: qSnap.id };
              }
            }
          }
          setQuestionsMap(qMap);
        }
      } catch (err) {
        console.error('Failed to load result attempt:', err);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [attemptId]);

  if (loading) {
    return (
      <StudentAppShell pageTitle="Loading Score Card...">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
        </div>
      </StudentAppShell>
    );
  }

  if (!attempt) {
    return (
      <StudentAppShell pageTitle="Result Not Found">
        <div className="p-8 bg-[#0A0A0A] border border-[#262626] rounded-2xl text-center space-y-4 max-w-md mx-auto my-12">
          <HelpCircle className="w-10 h-10 text-[#6B6B6B] mx-auto" />
          <h2 className="text-base font-bold text-[#F5F5F5]">Exam Attempt Record Missing</h2>
          <p className="text-xs text-[#A3A3A3]">Unable to locate the specified attempt result in database archives.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 rounded-xl bg-[#FACC15] text-black font-bold text-xs"
          >
            Return to Dashboard
          </button>
        </div>
      </StudentAppShell>
    );
  }

  return (
    <StudentAppShell pageTitle={`Score Card: ${attempt.quizTitle}`}>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#262626] text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={() => router.push(`/exam/${examId}/instructions`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#FDE047]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Exam</span>
          </button>
        </div>

        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-6 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121212] border border-[#3F3F3F] text-[#FACC15] text-xs font-semibold">
            <Award className="w-4 h-4 text-[#FACC15]" />
            <span>Server Evaluated Evaluation Paper</span>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-6xl font-extrabold text-[#FACC15] tabular-nums tracking-tight">
              {attempt.score} <span className="text-xl sm:text-2xl text-[#A3A3A3]">/ {attempt.totalMarks}</span>
            </div>
            <p className="text-xs text-[#A3A3A3] mt-1">Final Points (Negative Marking Applied)</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#262626]">
            <div className="p-3 rounded-xl bg-[#121212] border border-[#262626] space-y-0.5">
              <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider">Accuracy</span>
              <div className="text-lg font-bold text-[#22C55E] tabular-nums">{attempt.accuracy}%</div>
            </div>

            <div className="p-3 rounded-xl bg-[#121212] border border-[#262626] space-y-0.5">
              <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider">Correct</span>
              <div className="text-lg font-bold text-[#22C55E] tabular-nums">{attempt.correctCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-[#121212] border border-[#262626] space-y-0.5">
              <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider">Wrong</span>
              <div className="text-lg font-bold text-[#EF4444] tabular-nums">{attempt.wrongCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-[#121212] border border-[#262626] space-y-0.5">
              <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider">Unattempted</span>
              <div className="text-lg font-bold text-[#A3A3A3] tabular-nums">{attempt.unattemptedCount}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b border-[#262626] pb-3">
            <h2 className="text-base font-bold text-[#F5F5F5]">Answer Sheet & Detailed Solutions</h2>
            <p className="text-xs text-[#A3A3A3]">Review your selections against official answer keys and explanations.</p>
          </div>

          <div className="space-y-4">
            {attempt.questionOrder?.map((qId, idx) => {
              const qObj = questionsMap[qId];
              const ansData = attempt.answers?.[qId] || {};
              const isCorrect = ansData.isCorrect;
              const userSelected = ansData.selected || [];
              const correctOptionIds = ansData.correctOptionIds || [];

              return (
                <div
                  key={qId}
                  className={`bg-[#0A0A0A] border rounded-2xl p-5 space-y-4 ${
                    isCorrect
                      ? 'border-[#22C55E]/40'
                      : userSelected.length === 0
                      ? 'border-[#262626]'
                      : 'border-[#EF4444]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#FACC15] tabular-nums">Q{idx + 1}.</span>
                      <span className="text-xs font-bold text-[#F5F5F5]">{qObj?.stem || 'Question Item'}</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]'
                          : userSelected.length === 0
                          ? 'bg-[#121212] border border-[#3F3F3F] text-[#A3A3A3]'
                          : 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Correct</span>
                        </>
                      ) : userSelected.length === 0 ? (
                        <span>Unattempted</span>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Incorrect</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {qObj?.options?.map((opt, optIdx) => {
                      const optKey = String(optIdx);
                      const isUserChoice = userSelected.includes(optKey) || userSelected.includes(opt.id);
                      const isCorrectChoice = correctOptionIds.includes(optKey) || correctOptionIds.includes(opt.id);

                      let style = 'bg-[#0A0A0A] border-[#262626] text-[#A3A3A3]';
                      if (isCorrectChoice) {
                        style = 'bg-[#22C55E]/10 border-[#22C55E] text-[#F5F5F5] font-semibold';
                      } else if (isUserChoice && !isCorrectChoice) {
                        style = 'bg-[#EF4444]/10 border-[#EF4444] text-[#F5F5F5]';
                      }

                      return (
                        <div
                          key={opt.id || optIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${style}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-[11px] opacity-70">
                              {['A', 'B', 'C', 'D'][optIdx] || optIdx + 1}.
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          {isCorrectChoice && (
                            <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">
                              Correct Answer
                            </span>
                          )}
                          {!isCorrectChoice && isUserChoice && (
                            <span className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {ansData.explanation && (
                    <div className="p-3.5 bg-[#121212] border border-[#262626] rounded-xl space-y-1 text-xs text-[#A3A3A3]">
                      <span className="font-bold text-[#FACC15] block">Official Explanation:</span>
                      <p className="leading-relaxed">{ansData.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StudentAppShell>
  );
}
