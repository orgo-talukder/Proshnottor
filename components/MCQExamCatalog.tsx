'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Clock,
  Award,
  Play,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useHydrated } from '../hooks/use-hydrated';
import { Quiz, ExamAttempt } from '../lib/types';

interface MCQExamCatalogProps {
  quizzes: Quiz[];
  attempts: ExamAttempt[];
  loading?: boolean;
  onStartExam: (quiz: Quiz) => void;
  onViewQuizDetails: (quiz: Quiz) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function MCQExamCatalog({
  quizzes,
  attempts,
  loading = false,
  onStartExam,
  onViewQuizDetails,
  searchQuery,
  onSearchChange,
}: MCQExamCatalogProps) {
  const isHydrated = useHydrated();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'duration' | 'marks'>('recommended');

  // Extract unique subjects
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach((q) => {
      if (q.subject) set.add(q.subject);
    });
    return Array.from(set);
  }, [quizzes]);

  // Attempt status maps
  const { completedQuizIds, inProgressQuizIds } = useMemo(() => {
    const completed = new Set<string>();
    const inProgress = new Set<string>();
    attempts.forEach((a) => {
      if (a.status === 'evaluated') completed.add(a.quizId);
      if (isHydrated && a.status === 'in_progress' && a.expiresAt > 0) {
        inProgress.add(a.quizId);
      }
    });
    return { completedQuizIds: completed, inProgressQuizIds: inProgress };
  }, [attempts, isHydrated]);

  // Filtered & Sorted Quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter((quiz) => {
        if (selectedSubject !== 'all' && quiz.subject !== selectedSubject) return false;
        if (selectedDifficulty !== 'all' && quiz.difficulty !== selectedDifficulty) return false;
        if (selectedType !== 'all' && quiz.type !== selectedType) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (quiz.title || '').toLowerCase().includes(q);
          const matchSubject = (quiz.subject || '').toLowerCase().includes(q);
          const matchDesc = (quiz.description || '').toLowerCase().includes(q);
          if (!matchTitle && !matchSubject && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'duration') return (a.settings?.durationMinutes || 0) - (b.settings?.durationMinutes || 0);
        if (sortBy === 'marks') return (b.settings?.totalMarks || 0) - (a.settings?.totalMarks || 0);
        return 0;
      });
  }, [quizzes, selectedSubject, selectedDifficulty, selectedType, searchQuery, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      {/* 1. Header (Spec Section 21) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
            MCQ Exam
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            আপনার প্রস্তুতির জন্য বিষয়ভিত্তিক ও পূর্ণাঙ্গ MCQ পরীক্ষা এখানে পাবেন।
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="পরীক্ষা বা বিষয় খুঁজুন..."
            className="w-full h-10 pl-10 pr-3 bg-[#0A0A0A] border border-[#262626] focus:border-[#FACC15] rounded-xl text-xs text-[#F5F5F5] placeholder-[#555] outline-none transition-colors"
          />
        </div>
      </div>

      {/* 2. Filter Toolbar (Spec Section 22) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A0A0A] border border-[#262626] p-3 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="h-9 px-3 rounded-xl border border-[#262626] bg-[#121212] text-xs text-[#F5F5F5] outline-none focus:border-[#FACC15] transition-colors"
          >
            <option value="all">সকল বিষয় (All Subjects)</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-9 px-3 rounded-xl border border-[#262626] bg-[#121212] text-xs text-[#F5F5F5] outline-none focus:border-[#FACC15] transition-colors"
          >
            <option value="all">সকল কাঠিন্য (Difficulty)</option>
            <option value="easy">সহজ (Easy)</option>
            <option value="medium">মাঝারি (Medium)</option>
            <option value="hard">কঠিন (Hard)</option>
          </select>

          {/* Exam Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 px-3 rounded-xl border border-[#262626] bg-[#121212] text-xs text-[#F5F5F5] outline-none focus:border-[#FACC15] transition-colors"
          >
            <option value="all">সকল টাইপ (All Types)</option>
            <option value="mock">মক টেস্ট (Mock Test)</option>
            <option value="quiz">অনুশীলন কুইজ (Practice Quiz)</option>
          </select>
        </div>

        {/* Sort selector & Count */}
        <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
          {!loading && (
            <span className="hidden sm:inline font-mono">
              {filteredQuizzes.length} টি পরীক্ষা প্রাপ্ত
            </span>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 px-3 rounded-xl border border-[#262626] bg-[#121212] text-xs text-[#F5F5F5] outline-none focus:border-[#FACC15] transition-colors"
          >
            <option value="recommended">প্রস্তাবিত (Recommended)</option>
            <option value="duration">সময়সীমা (Duration)</option>
            <option value="marks">পূর্ণমান (Marks)</option>
          </select>
        </div>
      </div>

      {/* 3. Skeleton Loading UI (Spec Section 14) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((sk) => (
            <div
              key={sk}
              className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-[#1A1A1A] rounded" />
                <div className="h-4 w-12 bg-[#1A1A1A] rounded" />
              </div>
              <div className="h-6 w-3/4 bg-[#1A1A1A] rounded" />
              <div className="h-4 w-full bg-[#1A1A1A] rounded" />
              <div className="pt-3 border-t border-[#1C1C1C] grid grid-cols-2 gap-2">
                <div className="h-4 bg-[#1A1A1A] rounded" />
                <div className="h-4 bg-[#1A1A1A] rounded" />
              </div>
              <div className="pt-3 border-t border-[#1C1C1C] flex justify-between">
                <div className="h-9 w-24 bg-[#1A1A1A] rounded-xl" />
                <div className="h-9 w-20 bg-[#1A1A1A] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        /* 4. Real Empty State (Spec Section 3 & 77: No fake cards!) */
        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-12 text-center max-w-md mx-auto space-y-3">
          <HelpCircle className="h-10 w-10 text-[#6B6B6B] mx-auto mb-1" />
          <h3 className="text-sm font-bold text-[#F5F5F5]">
            {quizzes.length === 0
              ? 'এখনও কোনো MCQ Exam available নেই।'
              : 'কোনো পরীক্ষা পাওয়া যায়নি'}
          </h3>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            {quizzes.length === 0
              ? 'অ্যাডমিন প্যানেল থেকে নতুন প্রশ্ন ও পরীক্ষা তৈরি করা হলে এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।'
              : 'আপনার নির্বাচিত ফিল্টার বা অনুসন্ধানের সাথে কোনো পরীক্ষা মিলেনি। ফিল্টার পরিবর্তন করুন।'}
          </p>
          {quizzes.length > 0 && (
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSelectedDifficulty('all');
                setSelectedType('all');
                onSearchChange('');
              }}
              className="mt-2 h-9 px-4 rounded-xl bg-[#262626] text-xs font-semibold text-white hover:bg-[#333] transition-colors"
            >
              ফিল্টার রিসেট করুন
            </button>
          )}
        </div>
      ) : (
        /* 5. Real 3-Column Exam Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz) => {
            const isCompleted = completedQuizIds.has(quiz.id);
            const isInProgress = inProgressQuizIds.has(quiz.id);

            return (
              <div
                key={quiz.id}
                className="group rounded-2xl border border-[#262626] bg-[#0A0A0A] hover:border-[#3F3F3F] p-5 flex flex-col justify-between transition-all hover:bg-[#0F0F0F]"
              >
                <div>
                  {/* Top metadata line */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-[#FACC15] truncate max-w-[140px]">
                      {quiz.subject || 'সাধারণ'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isInProgress ? (
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>Running</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Done</span>
                        </span>
                      ) : null}
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                          quiz.difficulty === 'easy'
                            ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-800/30'
                            : quiz.difficulty === 'hard'
                            ? 'bg-rose-950/30 text-rose-400 border border-rose-800/30'
                            : 'bg-amber-950/30 text-amber-400 border border-amber-800/30'
                        }`}
                      >
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3
                    onClick={() => onViewQuizDetails(quiz)}
                    className="text-base font-bold text-[#F5F5F5] group-hover:text-[#FACC15] cursor-pointer transition-colors line-clamp-1"
                  >
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-1 line-clamp-2 leading-relaxed">
                    {quiz.description || 'বিসিএস ও চাকরির প্রস্তুতির জন্য মানসম্মত প্রশ্ন সম্ভার।'}
                  </p>

                  {/* Exam Specifications */}
                  <div className="mt-4 pt-3 border-t border-[#1C1C1C] grid grid-cols-2 gap-2 text-xs text-[#A3A3A3] font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#6B6B6B]" />
                      <span>{quiz.settings?.durationMinutes || 20} Min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-[#6B6B6B]" />
                      <span>{quiz.settings?.totalMarks || quiz.totalQuestions || 20} Marks</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-[#6B6B6B]">Q:</span>
                      <span>{quiz.totalQuestions || (quiz.questionIds ? quiz.questionIds.length : 0)} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#EF4444]">
                      <span className="text-[#6B6B6B]">Neg:</span>
                      <span>-{quiz.settings?.negativeRatio || 0.25}</span>
                    </div>
                  </div>
                </div>

                {/* Card CTA Buttons */}
                <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewQuizDetails(quiz)}
                    className="h-9 px-3.5 rounded-xl border border-[#262626] bg-[#121212] hover:bg-[#1A1A1A] text-xs text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
                  >
                    View Exam
                  </button>
                  <button
                    onClick={() => onStartExam(quiz)}
                    className="h-9 px-4 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#EAB308] flex items-center gap-1.5 transition-all shadow"
                  >
                    <span>{isInProgress ? 'Continue' : 'Start'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
