'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ExamAttempt,
  Question,
  PaletteState,
  QuestionKey,
} from '../lib/types';
import {
  updateAttemptAnswer,
  evaluateAttempt,
  getStoredQuestions,
  getStoredQuestionKeys,
} from '../lib/store';
import MathText from './MathText';
import {
  Clock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  Check,
  Flag,
  Send,
  X,
  Menu,
  Wifi,
  WifiOff,
  HelpCircle,
} from 'lucide-react';

interface LiveExamRunnerProps {
  attempt: ExamAttempt;
  onFinishExam: (evaluatedAttempt: ExamAttempt) => void;
  onExit: () => void;
}

export default function LiveExamRunner({
  attempt: initialAttempt,
  onFinishExam,
  onExit,
}: LiveExamRunnerProps) {
  const [attempt, setAttempt] = useState<ExamAttempt>(initialAttempt);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions] = useState<Question[]>(() => getStoredQuestions());
  const [questionKeys] = useState<Record<string, QuestionKey>>(() => getStoredQuestionKeys());
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const remainingMs = initialAttempt.expiresAt - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  });
  const [hideTimer, setHideTimer] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'unanswered' | 'marked'>('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [fontScale, setFontScale] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  // Online / Offline connectivity listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Filter questions strictly according to attempt's questionOrder
  const orderedQuestions: Question[] = useMemo(() => {
    if (!questions.length || !attempt.questionOrder.length) return [];
    const map = new Map<string, Question>();
    for (const q of questions) {
      map.set(q.id, q);
    }
    return attempt.questionOrder
      .map((id) => map.get(id))
      .filter((q): q is Question => q !== undefined);
  }, [questions, attempt.questionOrder]);

  const currentQuestion: Question | undefined = orderedQuestions[currentIndex];

  // Handle Auto-submit on time expiration
  const handleAutoSubmit = useCallback(() => {
    const evaluated = evaluateAttempt(attempt.id, 'timeout');
    if (evaluated) {
      onFinishExam(evaluated);
    }
  }, [attempt.id, onFinishExam]);

  // Server-authoritative countdown timer
  useEffect(() => {
    const calculateRemaining = () => {
      const remainingMs = attempt.expiresAt - Date.now();
      return Math.max(0, Math.floor(remainingMs / 1000));
    };

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt.expiresAt, handleAutoSubmit]);

  // Accidental close protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Manual Submit
  const handleManualSubmit = () => {
    const evaluated = evaluateAttempt(attempt.id, 'manual');
    if (evaluated) {
      setShowSubmitModal(false);
      onFinishExam(evaluated);
    }
  };

  // Answer selection handler (Optimistic Autosave with feedback)
  const handleSelectOption = useCallback((optionId: string) => {
    if (!currentQuestion) return;

    setSaveStatus('saving');
    const qId = currentQuestion.id;
    const currentAns = attempt.answers[qId];
    let newSelected: string[] = [];

    if (currentQuestion.type === 'mcq_multi') {
      const exists = currentAns?.selected.includes(optionId);
      newSelected = exists
        ? currentAns.selected.filter((id) => id !== optionId)
        : [...(currentAns?.selected || []), optionId];
    } else {
      newSelected = [optionId];
    }

    const updated = updateAttemptAnswer(
      attempt.id,
      qId,
      newSelected,
      currentAns?.markedForReview,
      true
    );

    if (updated) {
      setAttempt(updated);
    }
    setTimeout(() => setSaveStatus('saved'), 200);
  }, [attempt.id, attempt.answers, currentQuestion]);

  // Clear current response
  const handleClearResponse = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const currentAns = attempt.answers[qId];
    const updated = updateAttemptAnswer(
      attempt.id,
      qId,
      [],
      currentAns?.markedForReview,
      true
    );
    if (updated) {
      setAttempt(updated);
    }
  }, [attempt.id, attempt.answers, currentQuestion]);

  // Toggle Marked for Review
  const handleToggleMarkForReview = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const currentAns = attempt.answers[qId];
    const newMarked = !currentAns?.markedForReview;
    const updated = updateAttemptAnswer(
      attempt.id,
      qId,
      currentAns?.selected || [],
      newMarked,
      true
    );
    if (updated) {
      setAttempt(updated);
    }
  }, [attempt.id, attempt.answers, currentQuestion]);

  // Navigate to specific index
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < orderedQuestions.length) {
      const targetQ = orderedQuestions[index];
      const currentAns = attempt.answers[targetQ.id];
      const updated = updateAttemptAnswer(
        attempt.id,
        targetQ.id,
        currentAns?.selected || [],
        currentAns?.markedForReview,
        true
      );
      if (updated) setAttempt(updated);
      setCurrentIndex(index);
      setIsMobilePaletteOpen(false);
    }
  }, [attempt.id, attempt.answers, orderedQuestions]);

  // Keyboard Shortcuts (1-4, N, P, M, C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSubmitModal) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (!currentQuestion) return;

      if (e.key === '1' && currentQuestion.options[0]) {
        handleSelectOption(currentQuestion.options[0].id);
      } else if (e.key === '2' && currentQuestion.options[1]) {
        handleSelectOption(currentQuestion.options[1].id);
      } else if (e.key === '3' && currentQuestion.options[2]) {
        handleSelectOption(currentQuestion.options[2].id);
      } else if (e.key === '4' && currentQuestion.options[3]) {
        handleSelectOption(currentQuestion.options[3].id);
      } else if (e.key.toLowerCase() === 'n' || e.key === 'ArrowRight') {
        goToQuestion(currentIndex + 1);
      } else if (e.key.toLowerCase() === 'p' || e.key === 'ArrowLeft') {
        goToQuestion(currentIndex - 1);
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleMarkForReview();
      } else if (e.key.toLowerCase() === 'c') {
        handleClearResponse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentIndex,
    currentQuestion,
    showSubmitModal,
    goToQuestion,
    handleClearResponse,
    handleSelectOption,
    handleToggleMarkForReview,
  ]);

  // 5-State Palette Status Calculator
  const getQuestionPaletteState = useCallback((qId: string): PaletteState => {
    const ans = attempt.answers[qId];
    if (!ans || !ans.visited) return 'not_visited';

    const hasAnswer = ans.selected && ans.selected.length > 0;
    const isMarked = ans.markedForReview;

    if (hasAnswer && isMarked) return 'answered_and_marked';
    if (isMarked) return 'marked_for_review';
    if (hasAnswer) return 'answered';
    return 'not_answered';
  }, [attempt.answers]);

  // Stats calculation
  const stats = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let notVisited = 0;
    let marked = 0;

    for (const qId of attempt.questionOrder) {
      const s = getQuestionPaletteState(qId);
      if (s === 'answered' || s === 'answered_and_marked') answered++;
      if (s === 'not_answered') notAnswered++;
      if (s === 'not_visited') notVisited++;
      if (s === 'marked_for_review' || s === 'answered_and_marked') marked++;
    }

    return { answered, notAnswered, notVisited, marked, total: attempt.questionOrder.length };
  }, [attempt.questionOrder, getQuestionPaletteState]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimerLow = timeLeft < 300; // < 5 mins
  const isTimerCritical = timeLeft < 60; // < 1 min

  // Filtered palette items
  const filteredPaletteQuestions = useMemo(() => {
    return orderedQuestions.map((q, idx) => ({
      question: q,
      index: idx,
      state: getQuestionPaletteState(q.id),
    })).filter((item) => {
      if (paletteFilter === 'unanswered') {
        return item.state === 'not_answered' || item.state === 'not_visited';
      }
      if (paletteFilter === 'marked') {
        return item.state === 'marked_for_review' || item.state === 'answered_and_marked';
      }
      return true;
    });
  }, [orderedQuestions, getQuestionPaletteState, paletteFilter]);

  const currentAnswer = currentQuestion ? attempt.answers[currentQuestion.id] : undefined;
  const isMarked = currentAnswer?.markedForReview || false;
  const selectedOptions = currentAnswer?.selected || [];

  const fontSizes = {
    sm: 'text-sm leading-relaxed',
    md: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
    xl: 'text-xl leading-relaxed',
  };

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col font-sans select-none">
      {/* Offline Warning Banner (Section 26) */}
      {!isOnline && (
        <div className="bg-[#EF4444] text-black px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span>⚠ ইন্টারনেট সংযোগ বিচ্ছিন্ন — আপনার সমস্ত উত্তর নিরাপদে ডিভাইসে সংরক্ষিত হচ্ছে।</span>
        </div>
      )}

      {/* Top Sticky Exam Header (Height: 56-64px, distraction-free) */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#262626] bg-[#000000]/95 px-4 sm:px-6 backdrop-blur">
        {/* Left: Exit button & Exam title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('আপনি কি পরীক্ষা স্থগিত করতে চান? আপনার উত্তর সংরক্ষিত থাকবে এবং পরে চালিয়ে যেতে পারবেন।')) {
                onExit();
              }
            }}
            className="min-h-[44px] flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors rounded-lg px-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">প্রস্থান</span>
          </button>

          <span className="text-[#333] hidden sm:inline">|</span>

          <div>
            <h1 className="text-xs sm:text-sm font-bold text-[#F5F5F5] line-clamp-1 max-w-[180px] sm:max-w-md">
              {attempt.quizTitle}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-[#A3A3A3]">
              <span>
                প্রশ্ন <strong className="text-[#FACC15]">{currentIndex + 1}</strong> / {orderedQuestions.length}
              </span>
              <span aria-hidden="true">·</span>
              {/* Immediate Autosave Feedback (Section 26) */}
              <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {saveStatus === 'saving' ? '⟳ সংরক্ষণ হচ্ছে...' : '✓ সব উত্তর সংরক্ষিত'}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Font Size, Timer, Submit */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Font Scaler */}
          <div className="hidden sm:flex items-center rounded-lg border border-[#262626] bg-[#0A0A0A] p-0.5 text-xs">
            <button
              onClick={() => setFontScale('sm')}
              className={`min-h-[32px] px-2 rounded font-semibold ${fontScale === 'sm' ? 'bg-[#262626] text-[#FACC15]' : 'text-[#A3A3A3]'}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontScale('md')}
              className={`min-h-[32px] px-2 rounded font-semibold ${fontScale === 'md' ? 'bg-[#262626] text-[#FACC15]' : 'text-[#A3A3A3]'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontScale('lg')}
              className={`min-h-[32px] px-2 rounded font-semibold ${fontScale === 'lg' ? 'bg-[#262626] text-[#FACC15]' : 'text-[#A3A3A3]'}`}
            >
              A+
            </button>
          </div>

          {/* Countdown Timer with Threshold Styling (Section 25) */}
          <div className="flex items-center gap-1">
            <div
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-sm sm:text-base font-bold tabular-nums border ${
                isTimerCritical
                  ? 'border-red-500 bg-red-950/40 text-red-400 animate-pulse'
                  : isTimerLow
                  ? 'border-amber-500 bg-amber-950/30 text-amber-400'
                  : 'border-[#262626] bg-[#0A0A0A] text-[#F5F5F5]'
              }`}
            >
              <Clock className={`h-4 w-4 ${isTimerCritical ? 'text-red-400' : isTimerLow ? 'text-amber-400' : 'text-[#FACC15]'}`} />
              <span>{hideTimer ? '••••••' : formatTime(timeLeft)}</span>
            </div>

            {/* Hide Timer Toggle with explicit label tooltip */}
            <button
              onClick={() => setHideTimer(!hideTimer)}
              title="টাইমার লুকান (সময় থামবে না)"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-[#262626] bg-[#0A0A0A] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
            >
              {hideTimer ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          {/* Desktop Submit Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="hidden sm:inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#22C55E] px-4 py-2 text-xs sm:text-sm font-bold text-black transition-all hover:bg-emerald-400 active:scale-[0.98]"
          >
            <Send className="h-3.5 w-3.5" />
            <span>জমা দিন</span>
          </button>
        </div>
      </header>

      {/* Main Container: Split 70-75% Question / 25-30% Palette (Section 18) */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full overflow-hidden">
        {/* Left: Question Stage */}
        <main className="flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentQuestion ? (
            <div className="max-w-3xl w-full mx-auto">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#1C1C1C]">
                <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
                  <span className="font-bold text-[#FACC15]">
                    প্রশ্ন #{currentIndex + 1}
                  </span>
                  <span>·</span>
                  <span>{currentQuestion.subject}</span>
                  <span>·</span>
                  <span>{currentQuestion.topic}</span>
                  <span>·</span>
                  <span>নম্বর: {currentQuestion.defaultMarks}</span>
                </div>

                {/* Mark for review toggle */}
                <button
                  onClick={handleToggleMarkForReview}
                  className={`min-h-[44px] flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                    isMarked
                      ? 'bg-[#A855F7]/20 border border-[#A855F7] text-[#A855F7]'
                      : 'border border-[#262626] text-[#A3A3A3] hover:text-white hover:border-[#3F3F3F]'
                  }`}
                >
                  <Bookmark className={`h-3.5 w-3.5 ${isMarked ? 'fill-[#A855F7]' : ''}`} />
                  <span>{isMarked ? '⚑ রিভিউ চিহ্নিত' : 'রিভিউ রাখুন'}</span>
                </button>
              </div>

              {/* Question Stem (with KaTeX Math Support) */}
              <div className={`font-semibold text-[#F5F5F5] mb-6 ${fontSizes[fontScale]}`}>
                <MathText content={currentQuestion.stem} />
              </div>

              {/* Options List with 48px minimum touch targets */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedOptions.includes(option.id);
                  const optionLetters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
                  const letter = optionLetters[optIdx] || String(optIdx + 1);

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`min-h-[52px] w-full text-left flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all text-sm sm:text-base ${
                        isSelected
                          ? 'border-[#FACC15] bg-[#FACC15]/10 text-white font-medium shadow-sm'
                          : 'border-[#262626] bg-[#0A0A0A] text-[#D4D4D4] hover:border-[#3F3F3F] hover:bg-[#121212]'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold text-xs transition-colors ${
                          isSelected
                            ? 'bg-[#FACC15] text-black font-extrabold'
                            : 'border border-[#333] text-[#A3A3A3] bg-black'
                        }`}
                      >
                        {letter}
                      </span>

                      <div className="flex-1 pt-0.5">
                        <MathText content={option.text} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Clear Response */}
              {selectedOptions.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleClearResponse}
                    className="min-h-[44px] flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-red-400 transition-colors px-3 py-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>উত্তর মুছে ফেলুন (Clear Response)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-[#A3A3A3]">
              প্রশ্ন লোড হচ্ছে...
            </div>
          )}

          {/* Bottom Action Footer (Responsive: Desktop vs Mobile Section 18, 20) */}
          <div className="mt-8 pt-4 border-t border-[#1C1C1C]">
            {/* Desktop Action Row */}
            <div className="hidden sm:flex items-center justify-between gap-3">
              <button
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className={`min-h-[48px] flex items-center gap-1.5 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors ${
                  currentIndex === 0
                    ? 'border-[#262626] text-[#525252] cursor-not-allowed'
                    : 'border-[#262626] bg-[#0A0A0A] text-[#F5F5F5] hover:bg-[#141414]'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>পূর্ববর্তী</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleMarkForReview}
                  className="min-h-[48px] flex items-center gap-1.5 rounded-xl border border-[#262626] bg-[#0A0A0A] px-4 py-2.5 text-xs text-[#A3A3A3] hover:text-[#F5F5F5]"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>রিভিউ (M)</span>
                </button>
              </div>

              <button
                onClick={() => goToQuestion(currentIndex + 1)}
                disabled={currentIndex === orderedQuestions.length - 1}
                className={`min-h-[48px] flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
                  currentIndex === orderedQuestions.length - 1
                    ? 'border border-[#262626] text-[#525252] cursor-not-allowed'
                    : 'bg-[#FACC15] text-black hover:bg-[#EAB308]'
                }`}
              >
                <span>পরবর্তী</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Action Controls (Section 20: Previous, Mark, Next, and Question List Bottom Sheet) */}
            <div className="sm:hidden flex flex-col gap-2.5">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className={`min-h-[48px] flex items-center justify-center rounded-xl border text-xs font-bold ${
                    currentIndex === 0
                      ? 'border-[#262626] text-[#444] cursor-not-allowed'
                      : 'border-[#262626] bg-[#0A0A0A] text-[#F5F5F5]'
                  }`}
                >
                  পূর্ববর্তী
                </button>
                <button
                  onClick={handleToggleMarkForReview}
                  className="min-h-[48px] flex items-center justify-center rounded-xl border border-[#262626] bg-[#0A0A0A] text-xs font-bold text-[#A855F7]"
                >
                  {isMarked ? '⚑ রিভিউড' : 'রিভিউ'}
                </button>
                <button
                  onClick={() => goToQuestion(currentIndex + 1)}
                  disabled={currentIndex === orderedQuestions.length - 1}
                  className={`min-h-[48px] flex items-center justify-center rounded-xl text-xs font-bold ${
                    currentIndex === orderedQuestions.length - 1
                      ? 'border border-[#262626] text-[#444]'
                      : 'bg-[#FACC15] text-black'
                  }`}
                >
                  পরবর্তী
                </button>
              </div>

              {/* Mobile Question List / Palette Bottom Sheet Trigger (Section 20) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsMobilePaletteOpen(true)}
                  className="min-h-[48px] flex items-center justify-center gap-1.5 rounded-xl border border-[#3F3F3F] bg-[#121212] text-xs font-bold text-[#F5F5F5]"
                >
                  <Menu className="h-4 w-4 text-[#FACC15]" />
                  <span>প্রশ্ন তালিকা ({stats.answered}/{stats.total})</span>
                </button>

                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="min-h-[48px] flex items-center justify-center gap-1.5 rounded-xl bg-[#22C55E] text-xs font-bold text-black"
                >
                  <Send className="h-4 w-4" />
                  <span>জমা দিন</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right: Question Palette Grid (Desktop 25-30% Section 18) */}
        <aside className="hidden lg:flex w-80 flex-col border-l border-[#262626] bg-[#0A0A0A] p-5">
          {/* Palette Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
            <h3 className="text-sm font-bold text-[#F5F5F5]">প্রশ্ন প্যালেট</h3>
            <span className="text-xs text-[#A3A3A3] font-mono">
              {stats.answered}/{stats.total} সম্পন্ন
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 mt-3 p-1 rounded-lg bg-[#000000] border border-[#262626] text-xs">
            <button
              onClick={() => setPaletteFilter('all')}
              className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                paletteFilter === 'all' ? 'bg-[#262626] text-white font-bold' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              সব ({stats.total})
            </button>
            <button
              onClick={() => setPaletteFilter('unanswered')}
              className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                paletteFilter === 'unanswered' ? 'bg-[#262626] text-red-400 font-bold' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              বাকি ({stats.notAnswered + stats.notVisited})
            </button>
            <button
              onClick={() => setPaletteFilter('marked')}
              className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                paletteFilter === 'marked' ? 'bg-[#262626] text-purple-400 font-bold' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              রিভিউ ({stats.marked})
            </button>
          </div>

          {/* Palette Grid with explicit colors AND icons (Section 21) */}
          <div className="mt-4 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-5 gap-2">
              {filteredPaletteQuestions.map((item) => {
                const isCurrent = item.index === currentIndex;
                const state = item.state;

                let stateClasses = 'border-[#333] text-[#A3A3A3] hover:border-[#666]';
                let glyph: React.ReactNode = null;

                if (state === 'answered') {
                  stateClasses = 'bg-[#22C55E] text-black border-[#22C55E] font-bold';
                  glyph = <Check className="h-3 w-3 inline ml-0.5" />;
                } else if (state === 'not_answered') {
                  stateClasses = 'border-[#EF4444] text-[#EF4444] hover:bg-red-950/20';
                } else if (state === 'marked_for_review') {
                  stateClasses = 'bg-[#A855F7] text-white border-[#A855F7] font-bold';
                  glyph = <Flag className="h-2.5 w-2.5 inline ml-0.5" />;
                } else if (state === 'answered_and_marked') {
                  stateClasses = 'bg-[#A855F7] text-white border-[#22C55E] font-bold ring-2 ring-[#22C55E]';
                  glyph = <Check className="h-2.5 w-2.5 inline ml-0.5 text-emerald-300" />;
                }

                return (
                  <button
                    key={item.question.id}
                    onClick={() => goToQuestion(item.index)}
                    className={`relative min-h-[44px] flex items-center justify-center rounded-xl text-xs font-mono transition-all border ${stateClasses} ${
                      isCurrent ? 'ring-2 ring-[#FACC15] ring-offset-2 ring-offset-black scale-105' : ''
                    }`}
                  >
                    <span>{item.index + 1}</span>
                    {glyph}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-State Palette Legend (Section 21) */}
          <div className="pt-4 mt-auto border-t border-[#1C1C1C] space-y-2 text-[11px] text-[#A3A3A3]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[#22C55E] flex items-center justify-center text-[8px] text-black font-bold">✓</span> উত্তর সম্পন্ন
              </span>
              <span className="font-bold text-[#F5F5F5] font-mono">{stats.answered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-[#EF4444]" /> অনুত্তরিত
              </span>
              <span className="font-bold text-[#F5F5F5] font-mono">{stats.notAnswered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[#A855F7] flex items-center justify-center text-[8px] text-white">⚑</span> রিভিউ চিহ্নিত
              </span>
              <span className="font-bold text-[#F5F5F5] font-mono">{stats.marked}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-[#333]" /> দেখা হয়নি
              </span>
              <span className="font-bold text-[#F5F5F5] font-mono">{stats.notVisited}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Palette Bottom Sheet (Section 20 & 26) */}
      {isMobilePaletteOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm lg:hidden">
          <div className="max-h-[82vh] w-full rounded-t-3xl border-t border-[#262626] bg-[#0A0A0A] p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
              <div>
                <h3 className="text-base font-bold text-[#F5F5F5]">প্রশ্ন তালিকা (Question Palette)</h3>
                <span className="text-xs text-[#A3A3A3]">
                  {stats.answered}/{stats.total} উত্তর দেওয়া সম্পন্ন
                </span>
              </div>
              <button
                onClick={() => setIsMobilePaletteOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#1C1C1C] text-[#A3A3A3] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter buttons */}
            <div className="my-3 flex items-center gap-1 bg-black p-1 rounded-xl border border-[#262626] text-xs">
              <button
                onClick={() => setPaletteFilter('all')}
                className={`min-h-[40px] flex-1 rounded-lg ${paletteFilter === 'all' ? 'bg-[#262626] text-white font-bold' : 'text-[#A3A3A3]'}`}
              >
                সব
              </button>
              <button
                onClick={() => setPaletteFilter('unanswered')}
                className={`min-h-[40px] flex-1 rounded-lg ${paletteFilter === 'unanswered' ? 'bg-[#262626] text-red-400 font-bold' : 'text-[#A3A3A3]'}`}
              >
                বাকি
              </button>
              <button
                onClick={() => setPaletteFilter('marked')}
                className={`min-h-[40px] flex-1 rounded-lg ${paletteFilter === 'marked' ? 'bg-[#262626] text-purple-400 font-bold' : 'text-[#A3A3A3]'}`}
              >
                রিভিউ
              </button>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto py-2 flex-1">
              <div className="grid grid-cols-5 gap-2.5">
                {filteredPaletteQuestions.map((item) => {
                  const state = item.state;
                  let stateClasses = 'border-[#333] text-[#A3A3A3]';
                  let glyph = null;

                  if (state === 'answered') {
                    stateClasses = 'bg-[#22C55E] text-black border-[#22C55E] font-bold';
                    glyph = <Check className="h-3 w-3 inline ml-0.5" />;
                  } else if (state === 'not_answered') {
                    stateClasses = 'border-[#EF4444] text-[#EF4444]';
                  } else if (state === 'marked_for_review') {
                    stateClasses = 'bg-[#A855F7] text-white border-[#A855F7] font-bold';
                    glyph = <Flag className="h-2.5 w-2.5 inline ml-0.5" />;
                  } else if (state === 'answered_and_marked') {
                    stateClasses = 'bg-[#A855F7] text-white border-[#22C55E] ring-1 ring-[#22C55E]';
                    glyph = <Check className="h-2.5 w-2.5 inline ml-0.5 text-emerald-300" />;
                  }

                  return (
                    <button
                      key={item.question.id}
                      onClick={() => goToQuestion(item.index)}
                      className={`min-h-[48px] rounded-xl flex items-center justify-center text-xs font-mono border ${stateClasses} ${
                        item.index === currentIndex ? 'ring-2 ring-[#FACC15]' : ''
                      }`}
                    >
                      <span>{item.index + 1}</span>
                      {glyph}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setIsMobilePaletteOpen(false);
                setShowSubmitModal(true);
              }}
              className="mt-4 min-h-[48px] w-full rounded-xl bg-[#22C55E] py-3 text-center text-sm font-bold text-black"
            >
              পরীক্ষা শেষ ও জমা দিন
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal (Section 24) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/20 flex items-center justify-center text-[#FACC15]">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F5F5F5]">
                  পরীক্ষা জমা দিতে চান?
                </h3>
                <p className="text-xs text-[#A3A3A3]">
                  জমা দেওয়ার পূর্বে আপনার উত্তরের সারসংক্ষেপ:
                </p>
              </div>
            </div>

            <div className="space-y-2.5 my-5 p-4 rounded-xl border border-[#262626] bg-[#000000] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#A3A3A3]">মোট প্রশ্ন:</span>
                <span className="font-bold text-[#F5F5F5] font-mono">{stats.total} টি</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-semibold">উত্তর দেওয়া হয়েছে:</span>
                <span className="font-bold text-emerald-400 font-mono">{stats.answered} টি</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-400 font-semibold">উত্তরহীন রয়েছে:</span>
                <span className="font-bold text-red-400 font-mono">{stats.notAnswered + stats.notVisited} টি</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-400 font-semibold">রিভিউ চিহ্নিত:</span>
                <span className="font-bold text-purple-400 font-mono">{stats.marked} টি</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1C]">
                <span className="text-[#A3A3A3]">অবশিষ্ট সময়:</span>
                <span className="font-bold text-[#FACC15] font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="min-h-[44px] rounded-xl border border-[#262626] bg-[#0A0A0A] px-4 py-2 text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5]"
              >
                ফিরে যান
              </button>
              <button
                onClick={handleManualSubmit}
                className="min-h-[44px] rounded-xl bg-[#22C55E] px-5 py-2 text-xs font-bold text-black hover:bg-emerald-400 active:scale-[0.98]"
              >
                হ্যাঁ, নিশ্চিতভাবে জমা দিন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
