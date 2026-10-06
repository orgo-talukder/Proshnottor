'use client';

import React, { useState } from 'react';
import {
  Question,
  QuestionKey,
  Quiz,
  ExamAttempt,
  SystemAuditLog,
} from '../lib/types';
import {
  saveStoredQuestions,
  saveStoredQuestionKeys,
  saveStoredQuizzes,
  addAuditLog,
} from '../lib/store';
import MathText from './MathText';
import {
  Plus,
  Upload,
  BookOpen,
  HelpCircle,
  FileText,
  ListFilter,
  Check,
  Eye,
  Trash2,
  Clock,
  Award,
  Layers,
  Activity,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AdminPortalProps {
  questions: Question[];
  questionKeys: Record<string, QuestionKey>;
  quizzes: Quiz[];
  attempts: ExamAttempt[];
  logs: SystemAuditLog[];
  onDataUpdated: () => void;
}

export default function AdminPortal({
  questions,
  questionKeys,
  quizzes,
  attempts,
  logs,
  onDataUpdated,
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'quizzes' | 'bulk' | 'logs'>('overview');

  // Question Creation Form State
  const [newStem, setNewStem] = useState('');
  const [newSubject, setNewSubject] = useState('গাণিতিক যুক্তি');
  const [newTopic, setNewTopic] = useState('বীজগণিত');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  // New Quiz Creation State
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizDesc, setNewQuizDesc] = useState('');
  const [newQuizType, setNewQuizType] = useState<'quiz' | 'mock'>('mock');
  const [newQuizSubject, setNewQuizSubject] = useState('বিসিএস বিশেষ');
  const [newQuizDuration, setNewQuizDuration] = useState(15);
  const [newQuizNegative, setNewQuizNegative] = useState(0.25);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Bulk Import State
  const [bulkInput, setBulkInput] = useState('');
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);

  // Calculate Overview Stats
  const totalQuestions = questions.length;
  const totalQuizzes = quizzes.length;
  const totalAttempts = attempts.length;
  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((acc, cur) => acc + (cur.result?.percentage || 0), 0) / attempts.length
        )
      : 0;

  // Add Question Handler
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStem.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      alert('অনুগ্রহ করে প্রশ্ন এবং ৪টি অপশন সঠিকভাবে লিখুন।');
      return;
    }

    const qId = `q-${Date.now()}`;
    const optIds = [`${qId}_a`, `${qId}_b`, `${qId}_c`, `${qId}_d`];

    const newQuestion: Question = {
      id: qId,
      stem: newStem,
      type: 'mcq_single',
      subject: newSubject,
      topic: newTopic,
      difficulty: newDifficulty,
      defaultMarks: 1,
      language: 'bn',
      options: [
        { id: optIds[0], text: optA },
        { id: optIds[1], text: optB },
        { id: optIds[2], text: optC },
        { id: optIds[3], text: optD },
      ],
    };

    const newKey: QuestionKey = {
      questionId: qId,
      correctOptionIds: [optIds[correctOptionIdx]],
      explanation: newExplanation || 'সঠিক উত্তর সংজ্ঞায়িত করা হয়েছে।',
    };

    const updatedQuestions = [newQuestion, ...questions];
    const updatedKeys = { ...questionKeys, [qId]: newKey };

    saveStoredQuestions(updatedQuestions);
    saveStoredQuestionKeys(updatedKeys);
    addAuditLog('QUESTION_CREATED', `নতুন প্রশ্ন যোগ করা হয়েছে: ${newStem.substring(0, 30)}...`);

    // Reset Form
    setNewStem('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setNewExplanation('');
    alert('প্রশ্নব্যাংকে নতুন প্রশ্ন সফলভাবে সংরক্ষিত হয়েছে!');
    onDataUpdated();
  };

  // Create Quiz Handler
  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim() || selectedQuestionIds.length === 0) {
      alert('কুইজের শিরোনাম লিখুন এবং অন্তত ১টি প্রশ্ন নির্বাচন করুন।');
      return;
    }

    const quizId = `quiz-${Date.now()}`;
    const slug = `quiz-${Date.now().toString(36)}`;

    const newQuiz: Quiz = {
      id: quizId,
      slug,
      title: newQuizTitle,
      description: newQuizDesc || 'নতুন প্রস্তুতকৃত পরীক্ষা।',
      type: newQuizType,
      subject: newQuizSubject,
      difficulty: 'medium',
      totalQuestions: selectedQuestionIds.length,
      questionIds: selectedQuestionIds,
      status: 'published',
      createdAt: new Date().toISOString(),
      settings: {
        durationMinutes: newQuizDuration,
        totalMarks: selectedQuestionIds.length,
        negativeRatio: newQuizNegative,
        shuffleQuestions: true,
        shuffleOptions: true,
        resultMode: newQuizType === 'mock' ? 'after_submit' : 'immediate',
        passPercentage: 50,
        maxAttempts: null,
      },
    };

    const updated = [newQuiz, ...quizzes];
    saveStoredQuizzes(updated);
    addAuditLog('QUIZ_CREATED', `নতুন পরীক্ষা প্রকাশিত হয়েছে: ${newQuizTitle} (${selectedQuestionIds.length} প্রশ্ন)`);

    setNewQuizTitle('');
    setNewQuizDesc('');
    setSelectedQuestionIds([]);
    alert('নতুন পরীক্ষা সফলভাবে তৈরি ও প্রকাশিত হয়েছে!');
    onDataUpdated();
  };

  // Bulk Import Handler
  const handleBulkImport = () => {
    try {
      const parsed = JSON.parse(bulkInput);
      if (!Array.isArray(parsed)) {
        throw new Error('ইনপুট অবশ্যই একটি JSON Array হতে হবে।');
      }

      let count = 0;
      const importedQuestions: Question[] = [];
      const importedKeys: Record<string, QuestionKey> = { ...questionKeys };

      for (const item of parsed) {
        if (!item.stem || !item.options || !Array.isArray(item.options)) continue;
        const qId = item.id || `q-import-${Date.now()}-${count}`;
        const optIds = item.options.map((_: any, idx: number) => `${qId}_opt_${idx}`);

        const q: Question = {
          id: qId,
          stem: item.stem,
          type: 'mcq_single',
          subject: item.subject || 'সাধারণ জ্ঞান',
          topic: item.topic || 'সাধারণ',
          difficulty: item.difficulty || 'medium',
          defaultMarks: 1,
          language: 'bn',
          options: item.options.map((optText: string, idx: number) => ({
            id: optIds[idx],
            text: optText,
          })),
        };

        const key: QuestionKey = {
          questionId: qId,
          correctOptionIds: [optIds[item.correctIndex || 0]],
          explanation: item.explanation || 'সঠিক উত্তর সংরক্ষিত।',
        };

        importedQuestions.push(q);
        importedKeys[qId] = key;
        count++;
      }

      if (count > 0) {
        saveStoredQuestions([...importedQuestions, ...questions]);
        saveStoredQuestionKeys(importedKeys);
        addAuditLog('BULK_IMPORT', `${count} টি প্রশ্ন বাল্ক ইমপোর্টের মাধ্যমে যোগ করা হয়েছে।`);
        setBulkStatus(`${count} টি প্রশ্ন সফলভাবে যোগ হয়েছে!`);
        setBulkInput('');
        onDataUpdated();
      } else {
        setBulkStatus('কোনো বৈধ প্রশ্ন পাওয়া যায়নি।');
      }
    } catch (err: any) {
      setBulkStatus(`ত্রুটি: ${err.message || 'JSON ফরম্যাট সঠিক নয়।'}`);
    }
  };

  // Sample JSON Template for user
  const sampleTemplate = `[
  {
    "stem": "যদি $a^2 + b^2 = 25$ এবং $ab = 12$ হয়, তবে $(a+b)^2$-এর মান কত?",
    "options": ["$49$", "$37$", "$50$", "$25$"],
    "correctIndex": 0,
    "subject": "গাণিতিক যুক্তি",
    "topic": "বীজগণিত",
    "difficulty": "medium",
    "explanation": "$(a+b)^2 = a^2 + b^2 + 2ab = 25 + 2(12) = 25 + 24 = 49$।"
  }
]`;

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#FACC15] font-semibold mb-1">
              <Layers className="h-4 w-4" />
              <span>এডমিনিস্ট্রেটিভ ম্যানেজমেন্ট</span>
            </div>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">
              প্রশ্নোত্তর অ্যাডমিন কন্ট্রোল প্যানেল
            </h1>
            <p className="text-xs text-[#A3A3A3] mt-1">
              প্রশ্নব্যাংক সমৃদ্ধকরণ, LaTeX সমীকরণ প্রিভিউ, মক পরীক্ষা কনফিগারেশন এবং লাইভ অডিট ট্র্যাকিং।
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-[#262626] bg-[#0A0A0A] text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'overview' ? 'bg-[#FACC15] text-black font-bold' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              ওভারভিউ
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'questions' ? 'bg-[#FACC15] text-black font-bold' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              প্রশ্ন যোগ (LaTeX)
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'quizzes' ? 'bg-[#FACC15] text-black font-bold' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              পরীক্ষা তৈরি
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'bulk' ? 'bg-[#FACC15] text-black font-bold' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              বাল্ক ইমপোর্ট
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'logs' ? 'bg-[#FACC15] text-black font-bold' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              সিস্টেম লগ ({logs.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-5">
                <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-[#FACC15]" /> প্রশ্নব্যাংকে মোট প্রশ্ন
                </span>
                <span className="mt-2 block text-3xl font-extrabold font-mono text-[#F5F5F5]">
                  {totalQuestions}
                </span>
              </div>
              <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-5">
                <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-sky-400" /> প্রকাশিত পরীক্ষা
                </span>
                <span className="mt-2 block text-3xl font-extrabold font-mono text-[#F5F5F5]">
                  {totalQuizzes}
                </span>
              </div>
              <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-5">
                <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-400" /> মোট পরীক্ষার্থী সেশন
                </span>
                <span className="mt-2 block text-3xl font-extrabold font-mono text-[#F5F5F5]">
                  {totalAttempts}
                </span>
              </div>
              <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-5">
                <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-purple-400" /> গড় অর্জিত স্কোর
                </span>
                <span className="mt-2 block text-3xl font-extrabold font-mono text-[#FACC15]">
                  {avgScore}%
                </span>
              </div>
            </div>

            {/* Recent Attempts History Table */}
            <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6">
              <h3 className="text-sm font-bold text-[#F5F5F5] mb-4">
                সাম্প্রতিক পরীক্ষার ফলাফল ও জমা রেকর্ড ({attempts.length})
              </h3>
              {attempts.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#A3A3A3]">
                  এখনো কোনো পরীক্ষা সম্পন্ন হয়নি। ছাত্র মোডে যেয়ে পরীক্ষা দিন!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#262626] text-[#A3A3A3]">
                        <th className="pb-3 font-medium">পরীক্ষার নাম</th>
                        <th className="pb-3 font-medium">তারিখ/সময়</th>
                        <th className="pb-3 font-medium">স্কোর</th>
                        <th className="pb-3 font-medium">নির্ভুলতা</th>
                        <th className="pb-3 font-medium">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C1C1C]">
                      {attempts.map((att) => (
                        <tr key={att.id} className="text-[#D4D4D4] hover:bg-[#121212]">
                          <td className="py-3 font-medium text-[#F5F5F5]">{att.quizTitle}</td>
                          <td className="py-3 font-mono text-[#A3A3A3]">
                            {new Date(att.startedAt).toLocaleTimeString('bn-BD')}
                          </td>
                          <td className="py-3 font-mono font-bold text-[#FACC15]">
                            {att.result?.score || 0} / {att.totalMarks}
                          </td>
                          <td className="py-3 font-mono">
                            {att.result?.accuracy || 0}%
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                              জমা সম্পন্ন
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Question Creation with Live KaTeX Preview */}
        {activeTab === 'questions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <form onSubmit={handleCreateQuestion} className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 space-y-4">
              <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#FACC15]" />
                <span>নতুন প্রশ্ন যুক্ত করুন</span>
              </h3>

              {/* Subject & Topic */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">বিষয়</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full rounded-lg border border-[#333] bg-[#000000] px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                    placeholder="যেমন: গাণিতিক যুক্তি"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">টপিক</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full rounded-lg border border-[#333] bg-[#000000] px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                    placeholder="যেমন: অনুপাত ও শতাংশ"
                    required
                  />
                </div>
              </div>

              {/* Question Stem */}
              <div>
                <label className="block text-xs text-[#A3A3A3] mb-1">
                  প্রশ্নের মূল বক্তব্য (LaTeX সমর্থিত: $ সূত্র $ অথবা $$ সূত্র $$)
                </label>
                <textarea
                  rows={3}
                  value={newStem}
                  onChange={(e) => setNewStem(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#000000] p-3 text-xs sm:text-sm text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                  placeholder="যেমন: একটি সংখ্যার বর্গ $x^2 = 144$ হলে, $x$-এর মান কত?"
                  required
                />
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                <label className="block text-xs text-[#A3A3A3]">
                  অপশনসমূহ ও সঠিক উত্তর নির্বাচন করুন:
                </label>
                {[
                  { label: 'ক', val: optA, set: setOptA, idx: 0 },
                  { label: 'খ', val: optB, set: setOptB, idx: 1 },
                  { label: 'গ', val: optC, set: setOptC, idx: 2 },
                  { label: 'ঘ', val: optD, set: setOptD, idx: 3 },
                ].map((opt) => (
                  <div key={opt.idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={correctOptionIdx === opt.idx}
                      onChange={() => setCorrectOptionIdx(opt.idx)}
                      className="text-[#FACC15] focus:ring-[#FACC15] cursor-pointer"
                      title="সঠিক উত্তর হিসেবে চিহ্নিত করুন"
                    />
                    <span className="text-xs font-mono font-bold text-[#FACC15]">{opt.label}.</span>
                    <input
                      type="text"
                      value={opt.val}
                      onChange={(e) => opt.set(e.target.value)}
                      className="flex-1 rounded-lg border border-[#333] bg-[#000000] px-3 py-1.5 text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                      placeholder={`অপশন ${opt.label} (LaTeX সমর্থিত)`}
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs text-[#A3A3A3] mb-1">
                  বিস্তারিত সমাধান ও ব্যাখ্যা (LaTeX সমর্থিত)
                </label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#000000] p-3 text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                  placeholder="ধাপে ধাপে সমাধান..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#FACC15] py-2.5 text-xs font-bold text-black hover:bg-[#EAB308] active:scale-[0.98] transition-all"
              >
                প্রশ্নব্যাংকে যুক্ত করুন
              </button>
            </form>

            {/* Live KaTeX Preview Box */}
            <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#222] mb-4">
                <h3 className="text-xs font-bold text-[#F5F5F5] flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#FACC15]" />
                  লাইভ প্রিভিউ (শিক্ষার্থীরা যেভাবে দেখবে)
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono">KaTeX Active</span>
              </div>

              <div className="flex-1 rounded-lg border border-[#222] bg-[#000000] p-4 text-xs space-y-4">
                <div>
                  <span className="text-[10px] text-[#A3A3A3] block mb-1">
                    {newSubject} · {newTopic}
                  </span>
                  <div className="text-sm font-semibold text-[#F5F5F5]">
                    {newStem ? <MathText content={newStem} /> : <span className="text-[#555]">প্রশ্ন লিখলে এখানে লাইভ দেখতে পাবেন...</span>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {[optA, optB, optC, optD].map((optText, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded border text-xs flex items-center gap-2 ${
                        correctOptionIdx === i
                          ? 'border-[#22C55E] bg-emerald-950/20 text-emerald-300'
                          : 'border-[#262626] text-[#A3A3A3]'
                      }`}
                    >
                      <span className="font-mono font-bold">
                        {['ক', 'খ', 'গ', 'ঘ'][i]}.
                      </span>
                      <div className="flex-1">
                        {optText ? <MathText content={optText} /> : <span className="text-[#555]">-</span>}
                      </div>
                      {correctOptionIdx === i && (
                        <span className="text-[10px] text-emerald-400 font-bold">✓ সঠিক</span>
                      )}
                    </div>
                  ))}
                </div>

                {newExplanation && (
                  <div className="pt-3 border-t border-[#1C1C1C] text-[11px] text-[#D4D4D4]">
                    <strong className="text-[#FACC15] block mb-0.5">ব্যাখ্যার প্রিভিউ:</strong>
                    <MathText content={newExplanation} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Quiz Management */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateQuiz} className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 space-y-4">
              <h3 className="text-base font-bold text-[#F5F5F5]">
                নতুন মক টেস্ট বা অনুশীলন কুইজ তৈরি করুন
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">পরীক্ষার নাম</label>
                  <input
                    type="text"
                    value={newQuizTitle}
                    onChange={(e) => setNewQuizTitle(e.target.value)}
                    className="w-full rounded-lg border border-[#333] bg-[#000000] px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                    placeholder="যেমন: ৪৬তম বিসিএস বিশেষ মডেল টেস্ট"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">ধরন</label>
                  <select
                    value={newQuizType}
                    onChange={(e) => setNewQuizType(e.target.value as any)}
                    className="w-full rounded-lg border border-[#333] bg-[#000000] px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                  >
                    <option value="mock">মক এক্সাম (নির্দিষ্ট সময় ও নেগেটিভ মার্ক)</option>
                    <option value="quiz">অনুশীলন কুইজ (তাৎক্ষণিক ফলাফল)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">সময় (মিনিট)</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={newQuizDuration}
                    onChange={(e) => setNewQuizDuration(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#333] bg-[#000000] px-3 py-2 text-xs text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">নেগেটিভ মার্ক অনুপাত</label>
                  <select
                    value={newQuizNegative}
                    onChange={(e) => setNewQuizNegative(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#333] bg-[#000000] px-3 py-2 text-xs text-[#F5F5F5]"
                  >
                    <option value={0}>০ (নেগেটিভ নেই)</option>
                    <option value={0.25}>০.২৫ (বিসিএস স্ট্যান্ডার্ড)</option>
                    <option value={0.5}>০.৫০</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">বিষয় বিভাগ</label>
                  <input
                    type="text"
                    value={newQuizSubject}
                    onChange={(e) => setNewQuizSubject(e.target.value)}
                    className="w-full rounded-lg border border-[#333] bg-[#000000] px-3 py-2 text-xs text-[#F5F5F5]"
                  />
                </div>
              </div>

              {/* Question Selection Checkbox List */}
              <div>
                <label className="block text-xs text-[#A3A3A3] mb-2 font-semibold">
                  প্রশ্নব্যাংক থেকে প্রশ্ন নির্বাচন করুন ({selectedQuestionIds.length} টি নির্বাচিত):
                </label>
                <div className="max-h-56 overflow-y-auto space-y-2 p-3 rounded-lg border border-[#222] bg-[#000000]">
                  {questions.map((q) => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    return (
                      <label
                        key={q.id}
                        className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors text-xs ${
                          isSelected ? 'bg-[#1C1C1C] text-white' : 'text-[#A3A3A3] hover:bg-[#121212]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedQuestionIds([...selectedQuestionIds, q.id]);
                            } else {
                              setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== q.id));
                            }
                          }}
                          className="mt-0.5 rounded border-[#333] text-[#FACC15] focus:ring-[#FACC15]"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-[#FACC15] mr-2">[{q.subject}]</span>
                          <span>{q.stem}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#FACC15] py-2.5 text-xs font-bold text-black hover:bg-[#EAB308]"
              >
                পরীক্ষা তৈরি ও প্রকাশ করুন
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Bulk Import */}
        {activeTab === 'bulk' && (
          <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
              <Upload className="h-4 w-4 text-[#FACC15]" />
              JSON দিয়ে বাল্ক প্রশ্ন ইমপোর্ট
            </h3>
            <p className="text-xs text-[#A3A3A3]">
              নিচের ফরম্যাট অনুযায়ী একাধিক প্রশ্ন একসাথে ইমপোর্ট করতে পারেন:
            </p>

            <textarea
              rows={8}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={sampleTemplate}
              className="w-full rounded-lg border border-[#333] bg-[#000000] p-3 font-mono text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
            />

            {bulkStatus && (
              <div className="p-3 rounded-lg border border-[#262626] bg-[#000000] text-xs font-mono text-[#FACC15]">
                {bulkStatus}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBulkInput(sampleTemplate)}
                className="rounded-lg border border-[#333] bg-[#000000] px-4 py-2 text-xs text-[#A3A3A3] hover:text-white"
              >
                নমুনা টেমপ্লেট লোড করুন
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="rounded-lg bg-[#FACC15] px-5 py-2 text-xs font-bold text-black hover:bg-[#EAB308]"
              >
                ইমপোর্ট প্রক্রিয়া করুন
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Logs */}
        {activeTab === 'logs' && (
          <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6">
            <h3 className="text-sm font-bold text-[#F5F5F5] mb-4">
              সিস্টেম অডিট ও নিরাপত্তা লগ ({logs.length})
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-2 font-mono text-xs">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-lg border border-[#222] bg-[#000000]"
                >
                  <div>
                    <span className="font-bold text-[#FACC15] mr-2">[{log.action}]</span>
                    <span className="text-[#D4D4D4]">{log.details}</span>
                  </div>
                  <span className="text-[#A3A3A3] shrink-0 text-[10px]">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
