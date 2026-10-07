'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FocusShell from '@/components/shells/FocusShell';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Quiz, Question } from '@/lib/types';
import { submitExamAction } from '@/app/actions/submit-exam';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Send,
  AlertCircle,
} from 'lucide-react';

export default function ExamRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Attempt State
  const [userAnswers, setUserAnswers] = useState<Record<string, { selected: string[]; markedForReview?: boolean; visited?: boolean }>>({});
  const [startTime] = useState<number>(() => Date.now());
  const [timeLeftSec, setTimeLeftSec] = useState<number>(30 * 60);
  const [attemptId] = useState<string>(() => `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`);

  // Load Exam Data
  useEffect(() => {
    async function loadExam() {
      if (!examId) return;
      try {
        const quizRef = doc(db, 'quizzes', examId);
        const quizSnap = await getDoc(quizRef);
        if (quizSnap.exists()) {
          const qData = { ...(quizSnap.data() as Quiz), id: quizSnap.id };
          setQuiz(qData);
          const dur = (qData.settings?.durationMinutes || 30) * 60;
          setTimeLeftSec(dur);

          // Fetch questions for this quiz without correct keys
          const qIds = qData.questionIds || [];
          const allQuestionsSnap = await getDocs(collection(db, 'questions'));
          const qList: Question[] = [];
          allQuestionsSnap.forEach((d) => {
            if (qIds.includes(d.id)) {
              const { correctOptionIds, correctIndex, ...sanitized } = d.data() as any;
              qList.push({ ...sanitized, id: d.id });
            }
          });

          const sorted = qIds.map((id) => qList.find((q) => q.id === id)).filter((q): q is Question => q !== undefined);
          setQuestions(sorted.length > 0 ? sorted : qList);

          const initialAns: Record<string, any> = {};
          (sorted.length > 0 ? sorted : qList).forEach((q, idx) => {
            initialAns[q.id] = { selected: [], markedForReview: false, visited: idx === 0 };
          });
          setUserAnswers(initialAns);
        }
      } catch (err) {
        console.error('Failed to load runner questions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadExam();
  }, [examId]);

  // Submit Handler
  const handleFinalSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await submitExamAction({
        attemptId,
        quizId: examId,
        userId: user?.uid || 'anonymous-examinee',
        userAnswers,
        startedAt: startTime,
        questionOrder: questions.map((q) => q.id),
      });

      if (res.success) {
        router.push(`/exam/${examId}/result?attemptId=${attemptId}`);
      } else {
        alert('Exam submission error: ' + (res.error || 'Server error'));
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('An error occurred during submission.');
      setSubmitting(false);
    }
  }, [submitting, attemptId, examId, user, userAnswers, startTime, questions, router]);

  // Countdown Timer Hook
  useEffect(() => {
    if (loading || submitting || !quiz) return;

    const interval = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, submitting, quiz, handleFinalSubmit]);

  // Format Timer
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeftSec / 60);
    const secs = timeLeftSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [timeLeftSec]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optId: string) => {
    if (!currentQuestion || submitting) return;
    const qId = currentQuestion.id;
    const currentSelected = userAnswers[qId]?.selected || [];

    const newSelected = currentSelected.includes(optId)
      ? currentSelected.filter((id) => id !== optId)
      : [optId];

    setUserAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        selected: newSelected,
        visited: true,
      },
    }));
  };

  const handleToggleReview = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        markedForReview: !prev[qId]?.markedForReview,
      },
    }));
  };

  const handleClearSelection = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        selected: [],
      },
    }));
  };

  const answeredCount = useMemo(() => {
    return Object.values(userAnswers).filter((a) => a.selected && a.selected.length > 0).length;
  }, [userAnswers]);

  const markedCount = useMemo(() => {
    return Object.values(userAnswers).filter((a) => a.markedForReview).length;
  }, [userAnswers]);

  if (loading) {
    return (
      <FocusShell examTitle="Loading Examination Stage..." onExit={() => router.push('/dashboard')}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
        </div>
      </FocusShell>
    );
  }

  return (
    <FocusShell
      examTitle={quiz?.title || 'Mock Test Player'}
      timeLeftFormatted={formattedTime}
      isUrgentTimer={timeLeftSec < 300}
      onExit={() => setShowSubmitModal(true)}
    >
      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full max-w-[840px] space-y-6">
          <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#262626] rounded-xl p-3 px-4">
            <span className="text-xs text-[#A3A3A3] font-medium">
              Question <strong className="text-[#FACC15] text-sm tabular-nums">{currentIndex + 1}</strong> of {questions.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleReview}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  userAnswers[currentQuestion?.id]?.markedForReview
                    ? 'bg-[#A855F7]/20 border border-[#A855F7] text-[#A855F7]'
                    : 'bg-[#121212] border border-[#3F3F3F] text-[#A3A3A3] hover:text-[#F5F5F5]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{userAnswers[currentQuestion?.id]?.markedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>
            </div>
          </div>

          {currentQuestion && (
            <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#FACC15] uppercase tracking-wider">
                  {currentQuestion.subject || 'General Section'}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#F5F5F5] leading-relaxed">
                  {currentQuestion.stem}
                </h2>
              </div>

              <div className="space-y-3 pt-2">
                {currentQuestion.options?.map((opt, optIdx) => {
                  const optKey = String(optIdx);
                  const isSelected = userAnswers[currentQuestion.id]?.selected?.includes(optKey) || userAnswers[currentQuestion.id]?.selected?.includes(opt.id);
                  const optionLabel = ['A', 'B', 'C', 'D', 'E'][optIdx] || String(optIdx + 1);

                  return (
                    <div
                      key={opt.id || optIdx}
                      onClick={() => handleSelectOption(optKey)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-[#121212] border-[#FACC15] ring-1 ring-[#FACC15]'
                          : 'bg-[#0A0A0A] border-[#262626] hover:border-[#3F3F3F] hover:bg-[#121212]'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#FACC15] text-black border-[#FACC15]'
                            : 'bg-[#121212] text-[#A3A3A3] border-[#3F3F3F]'
                        }`}
                      >
                        {optionLabel}
                      </div>
                      <span className="text-sm text-[#F5F5F5] font-medium leading-normal">
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#262626]/60">
                <button
                  onClick={handleClearSelection}
                  className="px-3 py-1.5 rounded-lg bg-[#121212] text-[#A3A3A3] hover:text-[#F5F5F5] text-xs font-semibold"
                >
                  Clear Selection
                </button>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl bg-[#121212] border border-[#3F3F3F] text-xs font-semibold text-[#F5F5F5] hover:border-[#6B6B6B] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    disabled={currentIndex === questions.length - 1}
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-4 py-2 rounded-xl bg-[#121212] border border-[#3F3F3F] text-xs font-semibold text-[#F5F5F5] hover:border-[#6B6B6B] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[320px] shrink-0 space-y-4">
          <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <h3 className="text-sm font-bold text-[#F5F5F5]">Question Matrix</h3>
              <span className="text-xs text-[#A3A3A3] tabular-nums">
                {answeredCount} / {questions.length} Solved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-[#A3A3A3]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#121212] border border-[#F5F5F5]" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#A855F7]/30 border border-[#A855F7]" />
                <span>Flagged ({markedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#0A0A0A] border border-[#262626]" />
                <span>Unvisited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#0A0A0A] border-2 border-[#FACC15]" />
                <span>Current</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-[280px] overflow-y-auto pr-1 no-scrollbar pt-2">
              {questions.map((q, idx) => {
                const ans = userAnswers[q.id];
                const isCurrent = idx === currentIndex;
                const isAnswered = ans?.selected && ans.selected.length > 0;
                const isFlagged = ans?.markedForReview;

                let cellStyle = 'bg-[#0A0A0A] border-[#262626] text-[#6B6B6B]';
                if (isFlagged) {
                  cellStyle = 'bg-[#A855F7]/20 border-[#A855F7] text-[#A855F7] font-bold';
                } else if (isAnswered) {
                  cellStyle = 'bg-[#121212] border-[#F5F5F5] text-[#F5F5F5] font-bold';
                }

                if (isCurrent) {
                  cellStyle += ' ring-2 ring-[#FACC15] text-[#FACC15]';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 w-full rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${cellStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#262626]">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-3 px-4 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#FACC15]/10"
              >
                <Send className="w-4 h-4 fill-black" />
                <span>Submit Examination</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0A0A0A] border border-[#3F3F3F] rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-[#FACC15]">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#F5F5F5]">Confirm Examination Submission</h3>
            </div>

            <div className="space-y-2 text-xs text-[#A3A3A3] bg-[#121212] border border-[#262626] p-4 rounded-xl">
              <p>Are you sure you want to finish and submit your test paper?</p>
              <div className="flex justify-between text-[#F5F5F5] font-medium pt-1">
                <span>Answered: {answeredCount} / {questions.length}</span>
                <span>Unattempted: {questions.length - answeredCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#121212] border border-[#3F3F3F] text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5]"
              >
                Continue Test
              </button>
              <button
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Yes, Submit Paper</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </FocusShell>
  );
}
