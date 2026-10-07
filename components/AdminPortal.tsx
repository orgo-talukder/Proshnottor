'use client';

import React, { useState, useMemo } from 'react';
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
import {
  saveQuestionAndKeyToFirestore,
  saveQuizToFirestore,
  recordAuditLog,
} from '../lib/firestore-service';
import { useAuth, ADMIN_ALLOWLIST_EMAIL } from '../lib/auth-context';
import MathText from './MathText';
import {
  Plus,
  Upload,
  BookOpen,
  HelpCircle,
  Users,
  Search,
  Check,
  Trash2,
  Layers,
  Activity,
  AlertCircle,
  Sparkles,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminPortalProps {
  questions: Question[];
  questionKeys: Record<string, QuestionKey>;
  quizzes: Quiz[];
  attempts: ExamAttempt[];
  logs: SystemAuditLog[];
  onDataUpdated: () => void;
}

interface MockUser {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  status: 'active' | 'blocked';
  attemptsCount: number;
}

export default function AdminPortal({
  questions,
  questionKeys,
  quizzes,
  attempts,
  logs,
  onDataUpdated,
}: AdminPortalProps) {
  const { user, adminVerified, reauthenticateAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'quizzes' | 'users' | 'bulk' | 'logs'>('overview');

  // Admin password re-auth state
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState('');
  const [reauthLoading, setReauthLoading] = useState(false);
  const [showReauthPassword, setShowReauthPassword] = useState(false);

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
  const [questionSearch, setQuestionSearch] = useState('');

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

  // Mock Users State (Section 50)
  const [userList, setUserList] = useState<MockUser[]>([
    { uid: 'u-1', name: 'রাফি আহমেদ', email: 'rafi@example.com', role: 'student', status: 'active', attemptsCount: 5 },
    { uid: 'u-2', name: 'তানিয়া সুলতানা', email: 'tania@admin.edu.bd', role: 'admin', status: 'active', attemptsCount: 12 },
    { uid: 'u-3', name: 'সাকিব হাসান', email: 'sakib77@gmail.com', role: 'student', status: 'active', attemptsCount: 2 },
    { uid: 'u-4', name: 'ফারহানা ইসলাম', email: 'farhana.du@gmail.com', role: 'student', status: 'blocked', attemptsCount: 1 },
  ]);
  const [userSearch, setUserSearch] = useState('');

  // Calculate Overview Stats (Section 42)
  const totalQuestions = questions.length;
  const totalQuizzes = quizzes.length;
  const totalAttempts = attempts.length;
  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((acc, cur) => acc + (cur.result?.percentage || 0), 0) / attempts.length
        )
      : 0;

  // Filtered Questions for Question Bank Table (Section 43)
  const filteredQuestions = useMemo(() => {
    if (!questionSearch.trim()) return questions;
    const q = questionSearch.toLowerCase();
    return questions.filter(
      (item) =>
        item.stem.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        (item.topic || '').toLowerCase().includes(q)
    );
  }, [questions, questionSearch]);

  // Delete question
  const handleDeleteQuestion = (qId: string) => {
    if (confirm('আপনি কি এই প্রশ্নটি প্রশ্নব্যাংক থেকে মুছে ফেলতে চান?')) {
      const updated = questions.filter((q) => q.id !== qId);
      const updatedKeys = { ...questionKeys };
      delete updatedKeys[qId];
      saveStoredQuestions(updated);
      saveStoredQuestionKeys(updatedKeys);
      addAuditLog('QUESTION_DELETED', `প্রশ্ন মুছে ফেলা হয়েছে (ID: ${qId})`, 'warn');
      onDataUpdated();
    }
  };

  // Toggle Quiz Status
  const handleToggleQuizStatus = (quizId: string) => {
    const updated = quizzes.map((q) => {
      if (q.id === quizId) {
        const nextStatus = q.status === 'published' ? 'draft' : 'published';
        return { ...q, status: nextStatus as any };
      }
      return q;
    });
    saveStoredQuizzes(updated);
    addAuditLog('QUIZ_STATUS_TOGGLE', `পরীক্ষার স্ট্যাটাস পরিবর্তিত হয়েছে: ${quizId}`);
    onDataUpdated();
  };

  // Toggle User Block Status (Section 50)
  const handleToggleUserBlock = (uid: string) => {
    setUserList((prev) =>
      prev.map((u) => {
        if (u.uid === uid) {
          const nextStatus = u.status === 'active' ? 'blocked' : 'active';
          addAuditLog(
            'USER_STATUS_CHANGE',
            `ইউজার ${u.name} (${u.email}) স্ট্যাটাস: ${nextStatus === 'blocked' ? 'ব্লকড' : 'সক্রিয়'} করা হয়েছে`,
            nextStatus === 'blocked' ? 'security' : 'info'
          );
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleReauthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReauthError('');
    setReauthLoading(true);
    try {
      const success = await reauthenticateAdmin(reauthPassword);
      if (!success) {
        setReauthError('পাসওয়ার্ড সঠিক নয় অথবা আপনি অনুমোদিত অ্যাডমিন নন।');
      }
    } catch (err: any) {
      setReauthError('পাসওয়ার্ড যাচাইকরণ ব্যর্থ হয়েছে।');
    } finally {
      setReauthLoading(false);
    }
  };

  // Add Question Handler (Section 44, 45)
  const handleCreateQuestion = async (e: React.FormEvent) => {
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

    // Cloud Firestore Sync
    try {
      await saveQuestionAndKeyToFirestore(newQuestion, newKey);
      await recordAuditLog('QUESTION_CREATED', user?.email || 'admin', `Question added: ${qId}`);
    } catch (err) {
      console.warn('Firestore sync background note:', err);
    }

    // Reset Form
    setNewStem('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setNewExplanation('');
    alert('প্রশ্নব্যাংকে নতুন প্রশ্ন সফলভাবে সংরক্ষিত হয়েছে (Cloud Firestore Synced)!');
    onDataUpdated();
  };

  // Create Quiz Handler (Section 47, 48)
  const handleCreateQuiz = async (e: React.FormEvent) => {
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

    // Cloud Firestore Sync
    try {
      await saveQuizToFirestore(newQuiz);
      await recordAuditLog('QUIZ_CREATED', user?.email || 'admin', `Quiz published: ${quizId} - ${newQuizTitle}`);
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }

    setNewQuizTitle('');
    setNewQuizDesc('');
    setSelectedQuestionIds([]);
    alert('নতুন পরীক্ষা সফলভাবে তৈরি ও প্রকাশিত হয়েছে (Cloud Firestore Synced)!');
    onDataUpdated();
  };

  // Bulk Import Handler (Section 46)
  const handleBulkImport = async () => {
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

        // Cloud sync each imported question
        try {
          await saveQuestionAndKeyToFirestore(q, key);
        } catch (e) {
          // ignore individual sync fails
        }
      }

      if (count > 0) {
        saveStoredQuestions([...importedQuestions, ...questions]);
        saveStoredQuestionKeys(importedKeys);
        addAuditLog('BULK_IMPORT', `${count} টি প্রশ্ন বাল্ক ইমপোর্টের মাধ্যমে যোগ করা হয়েছে।`);
        setBulkStatus(`${count} টি প্রশ্ন সফলভাবে ক্লাউড ও লোকাল ডাটাবেজে যোগ হয়েছে!`);
        setBulkInput('');
        onDataUpdated();
      } else {
        setBulkStatus('কোনো বৈধ প্রশ্ন পাওয়া যায়নি।');
      }
    } catch (err: any) {
      setBulkStatus(`ত্রুটি: ${err.message || 'JSON ফরম্যাট সঠিক নয়।'}`);
    }
  };

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

  // Admin Password Re-authentication Screen
  if (!adminVerified) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-purple-950/60 border border-purple-800 text-purple-400 items-center justify-center mb-2">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-[#F5F5F5]">Administrator Security Verification</h2>
            <p className="text-xs text-[#A3A3A3]">
              Confirm administrative session credentials for <span className="text-[#FACC15] font-mono">{ADMIN_ALLOWLIST_EMAIL}</span>.
            </p>
          </div>

          {reauthError && (
            <div className="p-3 rounded-xl border border-rose-900/50 bg-rose-950/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{reauthError}</span>
            </div>
          )}

          <form onSubmit={handleReauthSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-[#A3A3A3]">
                অ্যাডমিন পাসওয়ার্ড (Admin Password)
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type={showReauthPassword ? 'text' : 'password'}
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-10 pl-9 pr-10 rounded-xl border border-[#262626] bg-[#121212] text-xs text-[#F5F5F5] placeholder-[#444] outline-none focus:border-[#FACC15]"
                />
                <button
                  type="button"
                  onClick={() => setShowReauthPassword(!showReauthPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#F5F5F5] p-1 transition-colors"
                  title={showReauthPassword ? 'পাসওয়ার্ড গোপন করুন' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showReauthPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={reauthLoading}
              className="w-full h-11 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
            >
              <span>{reauthLoading ? 'যাচাই করা হচ্ছে...' : 'অ্যাডমিন প্যানেল আনলক করুন'}</span>
              <ShieldCheck className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Admin Header (Section 39, 40) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#FACC15] font-semibold mb-1">
              <Layers className="h-4 w-4" />
              <span>Admin Console · Task-First & Data-First</span>
            </div>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">
              প্রশ্নোত্তর অ্যাডমিন কন্ট্রোল প্যানেল
            </h1>
            <p className="text-xs text-[#A3A3A3] mt-1">
              প্রশ্নব্যাংক ম্যানেজমেন্ট, KaTeX সমীকরণ লাইভ প্রিভিউ, পরীক্ষা কনফিগারেশন ও অডিট ট্র্যাকিং।
            </p>
          </div>

          {/* Navigation Tabs (Section 40) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-[#262626] bg-[#0A0A0A] text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'overview' ? 'bg-[#FACC15] text-black' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              ওভারভিউ
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'questions' ? 'bg-[#FACC15] text-black' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              প্রশ্নব্যাংক ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'quizzes' ? 'bg-[#FACC15] text-black' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              পরীক্ষা ({quizzes.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'users' ? 'bg-[#FACC15] text-black' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              ইউজার ({userList.length})
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'bulk' ? 'bg-[#FACC15] text-black' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              বাল্ক ইমপোর্ট
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'logs' ? 'bg-[#FACC15] text-black' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              লগ ({logs.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Overview (Section 42) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-5">
                <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-[#FACC15]" /> মোট প্রশ্ন
                </span>
                <span className="mt-2 block text-3xl font-extrabold font-mono text-[#F5F5F5]">
                  {totalQuestions}
                </span>
              </div>
              <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-5">
                <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-sky-400" /> সক্রিয় পরীক্ষা
                </span>
                <span className="mt-2 block text-3xl font-extrabold font-mono text-[#F5F5F5]">
                  {totalQuizzes}
                </span>
              </div>
              <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-5">
                <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-400" /> পরীক্ষার্থী সেশন
                </span>
                <span className="mt-2 block text-3xl font-extrabold font-mono text-[#F5F5F5]">
                  {totalAttempts}
                </span>
              </div>
              <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-5">
                <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-purple-400" /> গড় স্কোর
                </span>
                <span className="mt-2 block text-3xl font-extrabold font-mono text-[#FACC15]">
                  {avgScore}%
                </span>
              </div>
            </div>

            {/* Recent Attempts Log Table */}
            <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6">
              <h3 className="text-sm font-bold text-[#F5F5F5] mb-4">
                সাম্প্রতিক পরীক্ষার রেকর্ড ও জমা ({attempts.length})
              </h3>
              {attempts.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#A3A3A3]">
                  এখনো কোনো পরীক্ষা সম্পন্ন হয়নি।
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#262626] text-[#A3A3A3]">
                        <th className="pb-3 font-medium">পরীক্ষা</th>
                        <th className="pb-3 font-medium">সময়</th>
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

        {/* Tab 2: Question Creator + Question Bank Table (Section 43, 44, 45) */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <form onSubmit={handleCreateQuestion} className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 space-y-4">
                <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#FACC15]" />
                  <span>নতুন প্রশ্ন তৈরি (KaTeX সমীকরণ সমর্থিত)</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#A3A3A3] mb-1">বিষয়</label>
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="min-h-[40px] w-full rounded-lg border border-[#333] bg-[#000000] px-3 text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A3A3A3] mb-1">টপিক</label>
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="min-h-[40px] w-full rounded-lg border border-[#333] bg-[#000000] px-3 text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">
                    প্রশ্ন (LaTeX ম্যাথ: $ সমীকরণ $ বা $$ সমীকরণ $$)
                  </label>
                  <textarea
                    rows={3}
                    value={newStem}
                    onChange={(e) => setNewStem(e.target.value)}
                    className="w-full rounded-lg border border-[#333] bg-[#000000] p-3 text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                    placeholder="যেমন: সমীকরণ $x^2 + 5x + 6 = 0$-এর সমাধান কোনটি?"
                    required
                  />
                </div>

                {/* 4 Options Builder */}
                <div className="space-y-2">
                  <label className="block text-xs text-[#A3A3A3]">
                    অপশনসমূহ (রেডিও বাটন দিয়ে সঠিক উত্তর চিহ্নিত করুন):
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
                        className="min-h-[38px] flex-1 rounded-lg border border-[#333] bg-[#000000] px-3 text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                        placeholder={`অপশন ${opt.label}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">
                    সমাধান ও ব্যাখ্যা
                  </label>
                  <textarea
                    rows={2}
                    value={newExplanation}
                    onChange={(e) => setNewExplanation(e.target.value)}
                    className="w-full rounded-lg border border-[#333] bg-[#000000] p-3 text-xs text-[#F5F5F5] focus:border-[#FACC15] focus:outline-none"
                    placeholder="পরীক্ষার ফলাফলে শিক্ষার্থীরা এই ব্যাখ্যা দেখতে পাবে..."
                  />
                </div>

                <button
                  type="submit"
                  className="min-h-[44px] w-full rounded-xl bg-[#FACC15] font-bold text-xs text-black hover:bg-[#EAB308]"
                >
                  প্রশ্নব্যাংকে যুক্ত করুন
                </button>
              </form>

              {/* Live KaTeX Preview */}
              <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-[#222] mb-4">
                  <h3 className="text-xs font-bold text-[#F5F5F5] flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#FACC15]" />
                    লাইভ রেন্ডার প্রিভিউ
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

            {/* Question Bank Table (Section 43) */}
            <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-base font-bold text-[#F5F5F5]">
                  প্রশ্নব্যাংকের প্রশ্ন তালিকা ({filteredQuestions.length} টি)
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#A3A3A3]" />
                  <input
                    type="text"
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    placeholder="প্রশ্ন বা বিষয় খুঁজুন..."
                    className="min-h-[36px] rounded-lg border border-[#333] bg-[#000000] pl-8 pr-3 text-xs text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#262626] text-[#A3A3A3]">
                      <th className="pb-3 font-medium">প্রশ্ন</th>
                      <th className="pb-3 font-medium">বিষয়</th>
                      <th className="pb-3 font-medium">টপিক</th>
                      <th className="pb-3 font-medium text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C1C]">
                    {filteredQuestions.map((q) => (
                      <tr key={q.id} className="text-[#D4D4D4] hover:bg-[#121212]">
                        <td className="py-3 font-medium text-[#F5F5F5] max-w-md">
                          <MathText content={q.stem} inline />
                        </td>
                        <td className="py-3 text-[#A3A3A3]">{q.subject}</td>
                        <td className="py-3 text-[#A3A3A3]">{q.topic}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-[#A3A3A3] hover:text-red-400 rounded transition-colors"
                            title="প্রশ্ন মুছে ফেলুন"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Quiz Management (Section 47, 48) */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6">
              <h3 className="text-base font-bold text-[#F5F5F5] mb-4">
                প্রকাশিত ও প্রস্তুতকৃত পরীক্ষা তালিকা ({quizzes.length})
              </h3>

              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#222] bg-[#000000] gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#A3A3A3] mb-1">
                        <span className="font-semibold text-[#FACC15]">
                          {quiz.type === 'mock' ? 'মক টেস্ট' : 'কুইজ'}
                        </span>
                        <span>·</span>
                        <span>{quiz.subject}</span>
                        <span>·</span>
                        <span>{quiz.settings.durationMinutes} মিনিট</span>
                      </div>
                      <h4 className="font-bold text-sm text-[#F5F5F5]">{quiz.title}</h4>
                      <p className="text-xs text-[#A3A3A3] mt-0.5">{quiz.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleQuizStatus(quiz.id)}
                        className={`min-h-[38px] px-3.5 rounded-lg text-xs font-bold transition-colors ${
                          quiz.status === 'published'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800'
                            : 'bg-[#262626] text-[#A3A3A3]'
                        }`}
                      >
                        {quiz.status === 'published' ? '✓ প্রকাশিত (Published)' : 'ড্রাফট (Draft)'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Quiz Form */}
            <form onSubmit={handleCreateQuiz} className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 space-y-4">
              <h3 className="text-base font-bold text-[#F5F5F5]">
                নতুন মক পরীক্ষা কনফিগার করুন
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">পরীক্ষার নাম</label>
                  <input
                    type="text"
                    value={newQuizTitle}
                    onChange={(e) => setNewQuizTitle(e.target.value)}
                    className="min-h-[40px] w-full rounded-lg border border-[#333] bg-[#000000] px-3 text-xs text-[#F5F5F5]"
                    placeholder="যেমন: ৪৬তম বিসিএস মডেল টেস্ট"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">ধরন</label>
                  <select
                    value={newQuizType}
                    onChange={(e) => setNewQuizType(e.target.value as any)}
                    className="min-h-[40px] w-full rounded-lg border border-[#333] bg-[#000000] px-3 text-xs text-[#F5F5F5]"
                  >
                    <option value="mock">মক এক্সাম (কাউন্টডাউন ও নেগেটিভ মার্কিং)</option>
                    <option value="quiz">অনুশীলন কুইজ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">সময় (মিনিট)</label>
                  <input
                    type="number"
                    value={newQuizDuration}
                    onChange={(e) => setNewQuizDuration(Number(e.target.value))}
                    className="min-h-[40px] w-full rounded-lg border border-[#333] bg-[#000000] px-3 text-xs text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">নেগেটিভ মার্ক</label>
                  <select
                    value={newQuizNegative}
                    onChange={(e) => setNewQuizNegative(Number(e.target.value))}
                    className="min-h-[40px] w-full rounded-lg border border-[#333] bg-[#000000] px-3 text-xs text-[#F5F5F5]"
                  >
                    <option value={0}>০ (নেই)</option>
                    <option value={0.25}>০.২৫ (বিসিএস)</option>
                    <option value={0.5}>০.৫০</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">বিষয়</label>
                  <input
                    type="text"
                    value={newQuizSubject}
                    onChange={(e) => setNewQuizSubject(e.target.value)}
                    className="min-h-[40px] w-full rounded-lg border border-[#333] bg-[#000000] px-3 text-xs text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#A3A3A3] mb-2 font-semibold">
                  প্রশ্ন নির্বাচন করুন ({selectedQuestionIds.length} টি নির্বাচিত):
                </label>
                <div className="max-h-52 overflow-y-auto space-y-2 p-3 rounded-lg border border-[#222] bg-[#000000]">
                  {questions.map((q) => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    return (
                      <label
                        key={q.id}
                        className={`flex items-start gap-3 p-2 rounded cursor-pointer text-xs ${
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
                          className="mt-0.5 text-[#FACC15]"
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
                className="min-h-[44px] w-full rounded-xl bg-[#FACC15] font-bold text-xs text-black hover:bg-[#EAB308]"
              >
                পরীক্ষা প্রকাশ করুন
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: User Management (Section 50) */}
        {activeTab === 'users' && (
          <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#F5F5F5]">ইউজার ম্যানেজমেন্ট ও একাউন্ট কন্ট্রোল</h3>
                <p className="text-xs text-[#A3A3A3]">নিবন্ধিত শিক্ষার্থী ও অ্যাডমিনদের তালিকা ও পারমিশন।</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#A3A3A3]" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="ইউজার খুঁজুন..."
                  className="min-h-[36px] rounded-lg border border-[#333] bg-[#000000] pl-8 pr-3 text-xs text-[#F5F5F5]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#262626] text-[#A3A3A3]">
                    <th className="pb-3 font-medium">নাম</th>
                    <th className="pb-3 font-medium">ইমেইল</th>
                    <th className="pb-3 font-medium">রোল</th>
                    <th className="pb-3 font-medium">পরীক্ষা সেশন</th>
                    <th className="pb-3 font-medium">স্ট্যাটাস</th>
                    <th className="pb-3 font-medium text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C1C]">
                  {userList
                    .filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.includes(userSearch))
                    .map((user) => (
                      <tr key={user.uid} className="text-[#D4D4D4] hover:bg-[#121212]">
                        <td className="py-3 font-medium text-[#F5F5F5]">{user.name}</td>
                        <td className="py-3 font-mono text-[#A3A3A3]">{user.email}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              user.role === 'admin'
                                ? 'bg-purple-950/40 text-purple-400 border border-purple-800'
                                : 'bg-[#222] text-[#A3A3A3]'
                            }`}
                          >
                            {user.role === 'admin' ? 'অ্যাডমিন' : 'শিক্ষার্থী'}
                          </span>
                        </td>
                        <td className="py-3 font-mono">{user.attemptsCount} টি</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              user.status === 'active'
                                ? 'bg-emerald-950/40 text-emerald-400'
                                : 'bg-red-950/40 text-red-400'
                            }`}
                          >
                            {user.status === 'active' ? 'সক্রিয়' : 'ব্লকড'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleUserBlock(user.uid)}
                              className={`min-h-[32px] px-2.5 rounded text-xs font-semibold ${
                                user.status === 'active'
                                  ? 'border border-red-800 text-red-400 hover:bg-red-950/20'
                                  : 'border border-emerald-800 text-emerald-400 hover:bg-emerald-950/20'
                              }`}
                            >
                              {user.status === 'active' ? 'ব্লক করুন' : 'আনব্লক করুন'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Bulk Import (Section 46) */}
        {activeTab === 'bulk' && (
          <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
              <Upload className="h-4 w-4 text-[#FACC15]" />
              JSON বাল্ক প্রশ্ন আপলোড
            </h3>
            <p className="text-xs text-[#A3A3A3]">
              একাধিক প্রশ্ন একসাথে ইমপোর্ট করতে নিচের JSON স্ট্রাকচার অনুসরণ করুন:
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
                className="min-h-[44px] rounded-lg border border-[#333] bg-[#000000] px-4 text-xs text-[#A3A3A3] hover:text-white"
              >
                নমুনা টেমপ্লেট লোড করুন
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="min-h-[44px] rounded-lg bg-[#FACC15] px-5 text-xs font-bold text-black hover:bg-[#EAB308]"
              >
                ইমপোর্ট সম্পন্ন করুন
              </button>
            </div>
          </div>
        )}

        {/* Tab 6: Logs (Section 52) */}
        {activeTab === 'logs' && (
          <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6">
            <h3 className="text-sm font-bold text-[#F5F5F5] mb-4">
              সিস্টেম ও অডিট লগ ({logs.length})
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
                  <span suppressHydrationWarning className="text-[#A3A3A3] shrink-0 text-[10px]">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
