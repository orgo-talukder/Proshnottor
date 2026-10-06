'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Clock,
  Award,
  AlertTriangle,
  Play,
  Info,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Quiz, ExamAttempt } from '../lib/types';

interface MCQExamCatalogProps {
  quizzes: Quiz[];
  attempts: ExamAttempt[];
  onStartExam: (quiz: Quiz) => void;
  onViewQuizDetails: (quiz: Quiz) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function MCQExamCatalog({
  quizzes,
  attempts,
  onStartExam,
  onViewQuizDetails,
  searchQuery,
  onSearchChange,
}: MCQExamCatalogProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'duration' | 'marks'>('recommended');

  // Extract unique subjects
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach((q) => set.add(q.subject));
    return Array.from(set);
  }, [quizzes]);

  // Check which exams are completed
  const completedQuizIds = useMemo(() => {
    const set = new Set<string>();
    attempts.forEach((a) => {
      if (a.status === 'evaluated') set.add(a.quizId);
    });
    return set;
  }, [attempts]);

  // Filtered & Sorted Quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter((quiz) => {
        if (selectedSubject !== 'all' && quiz.subject !== selectedSubject) return false;
        if (selectedDifficulty !== 'all' && quiz.difficulty !== selectedDifficulty) return false;
        if (selectedType !== 'all' && quiz.type !== selectedType) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = quiz.title.toLowerCase().includes(q);
          const matchSubject = quiz.subject.toLowerCase().includes(q);
          const matchDesc = quiz.description.toLowerCase().includes(q);
          if (!matchTitle && !matchSubject && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'duration') return a.settings.durationMinutes - b.settings.durationMinutes;
        if (sortBy === 'marks') return b.settings.totalMarks - a.settings.totalMarks;
        return 0;
      });
  }, [quizzes, selectedSubject, selectedDifficulty, selectedType, searchQuery, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Search input (Mobile + Desktop sync) */}
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
          <span className="hidden sm:inline font-mono">
            {filteredQuizzes.length} টি পরীক্ষা প্রাপ্ত
          </span>
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

      {/* 3. Empty State (Spec Section 77) */}
      {filteredQuizzes.length === 0 ? (
        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-12 text-center max-w-md mx-auto">
          <HelpCircle className="h-10 w-10 text-[#6B6B6B] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#F5F5F5]">কোনো পরীক্ষা পাওয়া যায়নি</h3>
          <p className="text-xs text-[#A3A3A3] mt-1">
            আপনার নির্বাচিত ফিল্টার বা অনুসন্ধানের সাথে কোনো পরীক্ষা মিলেনি।
          </p>
          <button
            onClick={() => {
              setSelectedSubject('all');
              setSelectedDifficulty('all');
              setSelectedType('all');
              onSearchChange('');
            }}
            className="mt-4 h-9 px-4 rounded-xl bg-[#262626] text-xs font-semibold text-white hover:bg-[#333] transition-colors"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        /* 4. 3-Column Exam Card Grid (Spec Section 23-26 & 87) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz) => {
            const isCompleted = completedQuizIds.has(quiz.id);

            return (
              <div
                key={quiz.id}
                className="group rounded-2xl border border-[#262626] bg-[#0A0A0A] hover:border-[#3F3F3F] p-5 flex flex-col justify-between transition-all hover:bg-[#0F0F0F]"
              >
                <div>
                  {/* Top metadata line */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-[#FACC15] truncate max-w-[140px]">
                      {quiz.subject}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Done</span>
                        </span>
                      )}
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
                    {quiz.description}
                  </p>

                  {/* Exam Specifications */}
                  <div className="mt-4 pt-3 border-t border-[#1C1C1C] grid grid-cols-2 gap-2 text-xs text-[#A3A3A3] font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#6B6B6B]" />
                      <span>{quiz.settings.durationMinutes} Min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-[#6B6B6B]" />
                      <span>{quiz.settings.totalMarks} Marks</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-[#6B6B6B]">Q:</span>
                      <span>{quiz.totalQuestions} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#EF4444]">
                      <span className="text-[#6B6B6B]">Neg:</span>
                      <span>-{quiz.settings.negativeRatio}</span>
                    </div>
                  </div>
                </div>

                {/* Card CTA Buttons */}
                <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewQuizDetails(quiz)}
                    className="h-9 px-3 rounded-xl border border-[#262626] bg-[#121212] hover:bg-[#1A1A1A] text-xs text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
                  >
                    View Exam
                  </button>
                  <button
                    onClick={() => onStartExam(quiz)}
                    className="h-9 px-4 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#EAB308] flex items-center gap-1.5 transition-all shadow"
                  >
                    <span>Start</span>
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
