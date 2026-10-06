'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import ExamCard from '../components/ExamCard';
import ExamInstructionsModal from '../components/ExamInstructionsModal';
import LiveExamRunner from '../components/LiveExamRunner';
import ExamResultView from '../components/ExamResultView';
import AdminPortal from '../components/AdminPortal';
import StudentHistory from '../components/StudentHistory';
import {
  Quiz,
  ExamAttempt,
  Question,
  QuestionKey,
  SystemAuditLog,
} from '../lib/types';
import {
  getStoredQuizzes,
  getStoredQuestions,
  getStoredQuestionKeys,
  getStoredAttempts,
  getStoredLogs,
  getStoredUserRole,
  getStoredFontScale,
  startExamAttempt,
} from '../lib/store';
import {
  Search,
  BookOpen,
  Clock,
  Award,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'home' | 'mocks' | 'quizzes' | 'history' | 'admin'>('home');
  const [userRole, setUserRole] = useState<'student' | 'admin'>(() => getStoredUserRole());
  const [fontScale, setFontScale] = useState<'sm' | 'md' | 'lg' | 'xl'>(() => getStoredFontScale());

  // Loaded data
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => getStoredQuizzes());
  const [questions, setQuestions] = useState<Question[]>(() => getStoredQuestions());
  const [questionKeys, setQuestionKeys] = useState<Record<string, QuestionKey>>(() => getStoredQuestionKeys());
  const [attempts, setAttempts] = useState<ExamAttempt[]>(() => getStoredAttempts());
  const [logs, setLogs] = useState<SystemAuditLog[]>(() => getStoredLogs());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Active Exam & Modal States
  const [activeAttempt, setActiveAttempt] = useState<ExamAttempt | null>(null);
  const [viewingResultAttempt, setViewingResultAttempt] = useState<ExamAttempt | null>(null);
  const [instructionQuiz, setInstructionQuiz] = useState<Quiz | null>(null);

  // Refresh helper for mutations
  const refreshStoreData = () => {
    setQuizzes(getStoredQuizzes());
    setQuestions(getStoredQuestions());
    setQuestionKeys(getStoredQuestionKeys());
    setAttempts(getStoredAttempts());
    setLogs(getStoredLogs());
    setUserRole(getStoredUserRole());
    setFontScale(getStoredFontScale());
  };

  // Filter quizzes according to tab, subject, and search query
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      // Tab filter
      if (currentTab === 'mocks' && quiz.type !== 'mock') return false;
      if (currentTab === 'quizzes' && quiz.type !== 'quiz') return false;

      // Subject filter
      if (selectedSubject !== 'all' && quiz.subject !== selectedSubject) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = quiz.title.toLowerCase().includes(query);
        const matchesSubject = quiz.subject.toLowerCase().includes(query);
        const matchesDesc = quiz.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubject && !matchesDesc) return false;
      }

      return true;
    });
  }, [quizzes, currentTab, selectedSubject, searchQuery]);

  // Extract unique subjects for filter bar
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach((q) => set.add(q.subject));
    return Array.from(set);
  }, [quizzes]);

  // Handle Exam Start
  const handleStartExam = (quiz: Quiz) => {
    const attempt = startExamAttempt(quiz, userRole === 'admin' ? 'অ্যাডমিন প্রিভিউ' : 'শিক্ষার্থী');
    setActiveAttempt(attempt);
    setInstructionQuiz(null);
  };

  // If currently taking an exam, show LiveExamRunner
  if (activeAttempt) {
    return (
      <LiveExamRunner
        attempt={activeAttempt}
        onFinishExam={(evaluated) => {
          setActiveAttempt(null);
          setViewingResultAttempt(evaluated);
          refreshStoreData();
        }}
        onExit={() => {
          setActiveAttempt(null);
          refreshStoreData();
        }}
      />
    );
  }

  // If viewing a completed exam result, show ExamResultView
  if (viewingResultAttempt) {
    return (
      <ExamResultView
        attempt={viewingResultAttempt}
        questions={questions}
        onRetake={() => {
          const quiz = quizzes.find((q) => q.id === viewingResultAttempt.quizId);
          if (quiz) {
            setViewingResultAttempt(null);
            handleStartExam(quiz);
          }
        }}
        onGoHome={() => {
          setViewingResultAttempt(null);
          refreshStoreData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col font-sans">
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSearchQuery('');
        }}
        userRole={userRole}
        onRoleChange={(role) => setUserRole(role)}
        fontScale={fontScale}
        onFontScaleChange={(scale) => setFontScale(scale)}
      />

      {/* Main Content Areas */}
      {currentTab === 'admin' ? (
        <AdminPortal
          questions={questions}
          questionKeys={questionKeys}
          quizzes={quizzes}
          attempts={attempts}
          logs={logs}
          onDataUpdated={refreshStoreData}
        />
      ) : currentTab === 'history' ? (
        <StudentHistory
          attempts={attempts}
          onViewAttemptResult={(att) => setViewingResultAttempt(att)}
          onGoToExams={() => setCurrentTab('home')}
        />
      ) : (
        <main className="flex-1">
          {/* Hero Section (Clean High-Contrast Pure Black) */}
          {currentTab === 'home' && (
            <section className="relative border-b border-[#262626] bg-[#000000] py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl text-center">
                {/* Quiet 1-line text kicker */}
                <div className="flex items-center justify-center gap-2 text-xs text-[#A3A3A3] mb-4">
                  <span className="font-semibold text-[#FACC15]">বিসিএস · বিশ্ববিদ্যালয় ভর্তি · সরকারি চাকরি</span>
                  <span aria-hidden="true">·</span>
                  <span>Pure Black OLED Engine</span>
                </div>

                {/* Hero Headline */}
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F5F5F5] sm:leading-tight">
                  বাস্তব পরীক্ষার অভিজ্ঞতা ও নির্ভুল মূল্যায়ন
                </h1>

                {/* Subtitle */}
                <p className="mt-4 text-sm sm:text-base text-[#A3A3A3] max-w-2xl mx-auto leading-relaxed">
                  ৫-স্টেট প্রশ্ন প্যালেট, রিয়েলটাইম কাউন্টডাউন টাইমার, KaTeX গণিত সমীকরণ এবং শতভাগ অপটিমিস্টিক অটো-সেভ সহ আধুনিক অনলাইন মক টেস্ট ও কুইজ প্ল্যাটফর্ম।
                </p>

                {/* Hero CTA & Quick Highlights */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      const firstMock = quizzes.find((q) => q.type === 'mock');
                      if (firstMock) setInstructionQuiz(firstMock);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FACC15] px-6 py-3 text-sm font-bold text-black transition-all hover:bg-[#EAB308] active:scale-[0.98]"
                  >
                    <span>মডেল টেস্ট দিন</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setCurrentTab('quizzes')}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#262626] bg-[#0A0A0A] px-5 py-3 text-sm font-semibold text-[#F5F5F5] hover:bg-[#141414] hover:border-[#3F3F3F] transition-all"
                  >
                    <span>অনুশীলন কুইজ ব্রাউজ করুন</span>
                  </button>
                </div>

                {/* Feature Highlights (Unboxed Typography) */}
                <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left pt-8 border-t border-[#1C1C1C]">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-[#FACC15]" /> অটো-সেভ প্রযুক্তি
                    </span>
                    <span className="text-[11px] text-[#A3A3A3] mt-1">
                      প্রতিটি উত্তরের তাৎক্ষণিক লোকাল ও সার্ভার ব্যাকআপ
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-sky-400" /> সার্ভার টাইমার
                    </span>
                    <span className="text-[11px] text-[#A3A3A3] mt-1">
                      রিফ্রেশ করলেও সময় থামবে না, সময় শেষে অটো-সাবমিট
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-emerald-400" /> নেগেটিভ মার্কিং
                    </span>
                    <span className="text-[11px] text-[#A3A3A3] mt-1">
                      বিসিএস ও ভর্তি পরীক্ষা অনুরূপ ০.২৫ নেগেটিভ অনুপাত
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" /> KaTeX গণিত
                    </span>
                    <span className="text-[11px] text-[#A3A3A3] mt-1">
                      জটিল সমীকরণ ও ফর্মুলার ঝকঝকে নির্ভুল ডিসপ্লে
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Exam List Section */}
          <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Search and Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#F5F5F5]">
                  {currentTab === 'mocks'
                    ? 'মক টেস্ট সংগ্রহশালা'
                    : currentTab === 'quizzes'
                    ? 'বিষয়ভিত্তিক অনুশীলন কুইজ'
                    : 'উপলব্ধ পরীক্ষা ও কুইজসমূহ'}
                </h2>
                <p className="text-xs text-[#A3A3A3] mt-0.5">
                  মোট {filteredQuizzes.length} টি পরীক্ষা উপলব্ধ
                </p>
              </div>

              {/* Search & Subject Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#A3A3A3]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="পরীক্ষার নাম বা বিষয় খুঁজুন..."
                    className="w-full sm:w-64 rounded-xl border border-[#262626] bg-[#0A0A0A] pl-9 pr-3 py-2 text-xs text-[#F5F5F5] placeholder-[#666] focus:border-[#FACC15] focus:outline-none"
                  />
                </div>

                {/* Subject Dropdown */}
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="rounded-xl border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                >
                  <option value="all">সকল বিষয়</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid of Exams */}
            {filteredQuizzes.length === 0 ? (
              <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-12 text-center">
                <HelpCircle className="h-8 w-8 text-[#A3A3A3] mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-[#F5F5F5]">কোনো পরীক্ষা পাওয়া যায়নি</h3>
                <p className="text-xs text-[#A3A3A3] mt-1">
                  অন্য কোনো কীওয়ার্ড অথবা অন্য বিষয় নির্বাচন করে পুনরায় চেষ্টা করুন।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredQuizzes.map((quiz) => (
                  <ExamCard
                    key={quiz.id}
                    quiz={quiz}
                    onStartExam={(q) => handleStartExam(q)}
                    onViewInstructions={(q) => setInstructionQuiz(q)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Footer (Clean & Minimalist Pure Black) */}
      <footer className="border-t border-[#262626] bg-[#000000] py-8 px-4 sm:px-6 lg:px-8 text-xs text-[#A3A3A3]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F5F5F5]">প্রশ্নোত্তর (Proshnottor)</span>
            <span>·</span>
            <span>অনলাইন কুইজ ও মক এক্সাম ইঞ্জিন</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Pure Black OLED v1.0</span>
            <span>·</span>
            <span>WCAG AAA Contrast</span>
            <span>·</span>
            <span>KaTeX Math Ready</span>
          </div>
        </div>
      </footer>

      {/* Instructions Modal */}
      <ExamInstructionsModal
        quiz={instructionQuiz}
        onClose={() => setInstructionQuiz(null)}
        onProceedToStart={(q) => handleStartExam(q)}
      />
    </div>
  );
}
