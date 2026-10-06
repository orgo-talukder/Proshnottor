'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AppSidebar from '../components/AppSidebar';
import TopHeader from '../components/TopHeader';
import DashboardView from '../components/DashboardView';
import MCQExamCatalog from '../components/MCQExamCatalog';
import ExamInstructionsModal from '../components/ExamInstructionsModal';
import LiveExamRunner from '../components/LiveExamRunner';
import ExamResultView from '../components/ExamResultView';
import HistoryAndWrongQuestions from '../components/HistoryAndWrongQuestions';
import ProgressView from '../components/ProgressView';
import BookmarksView from '../components/BookmarksView';
import LeaderboardView from '../components/LeaderboardView';
import NotificationsView from '../components/NotificationsView';
import HelpAndPrivacyView from '../components/HelpAndPrivacyView';
import ProfileAndSettingsView from '../components/ProfileAndSettingsView';
import AdminPortal from '../components/AdminPortal';
import {
  Quiz,
  ExamAttempt,
  Question,
  QuestionKey,
  SystemAuditLog,
  NavigationTab,
  UserProfile,
  Bookmark,
  AppNotification,
  ExamPreferences,
} from '../lib/types';
import { seedQuizzes, seedQuestions, seedQuestionKeys } from '../lib/seedData';
import {
  getStoredQuizzes,
  getStoredQuestions,
  getStoredQuestionKeys,
  getStoredAttempts,
  saveStoredAttempts,
  getStoredLogs,
  getStoredUserRole,
  setStoredUserRole,
  getStoredProfile,
  saveStoredProfile,
  getStoredPreferences,
  saveStoredPreferences,
  getStoredBookmarks,
  toggleBookmark,
  getStoredNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  startExamAttempt,
} from '../lib/store';

export default function Home() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Hydration state
  const [quizzes, setQuizzes] = useState<Quiz[]>(seedQuizzes);
  const [questions, setQuestions] = useState<Question[]>(seedQuestions);
  const [questionKeys, setQuestionKeys] = useState<Record<string, QuestionKey>>(seedQuestionKeys);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    id: 'usr-student-01',
    email: 'argotalukder70@gmail.com',
    displayName: 'Argo Talukder',
    role: 'student',
    institution: 'ঢাকা বিশ্ববিদ্যালয়',
    targetExam: '47th BCS & Job Recruitment',
    district: 'Dhaka',
    streak: 7,
    createdAt: 'March 2026',
  });
  const [preferences, setPreferences] = useState<ExamPreferences>({
    hideTimer: false,
    confirmSubmit: true,
    fontScale: 'md',
    soundEnabled: true,
  });
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Active Flow States
  const [activeAttempt, setActiveAttempt] = useState<ExamAttempt | null>(null);
  const [viewingResultAttempt, setViewingResultAttempt] = useState<ExamAttempt | null>(null);
  const [instructionQuiz, setInstructionQuiz] = useState<Quiz | null>(null);

  // Refresh helper
  const refreshStoreData = () => {
    setQuizzes(getStoredQuizzes());
    setQuestions(getStoredQuestions());
    setQuestionKeys(getStoredQuestionKeys());
    setAttempts(getStoredAttempts());
    setLogs(getStoredLogs());
    setBookmarks(getStoredBookmarks());
    setNotifications(getStoredNotifications());
    setProfile(getStoredProfile());
    setPreferences(getStoredPreferences());
    setUserRole(getStoredUserRole());
    setCurrentTime(Date.now());
  };

  // Sync client storage after hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshStoreData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Unread notifications count
  const unreadNotifsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Check for any uncompleted in-progress attempt
  const inProgressAttempt = useMemo(() => {
    if (!currentTime) return undefined;
    return attempts.find(
      (a) => a.status === 'in_progress' && a.expiresAt > currentTime
    );
  }, [attempts, currentTime]);

  // Discard in-progress attempt
  const handleDiscardAttempt = (attemptId: string) => {
    const updated = attempts.filter((a) => a.id !== attemptId);
    saveStoredAttempts(updated);
    setAttempts(updated);
  };

  // Start exam flow
  const handleStartExam = (quiz: Quiz) => {
    const attempt = startExamAttempt(
      quiz,
      userRole === 'admin' ? 'অ্যাডমিন প্রিভিউ' : profile.displayName
    );
    setActiveAttempt(attempt);
    setInstructionQuiz(null);
  };

  // Retake exam
  const handleRetakeQuiz = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (quiz) {
      setInstructionQuiz(quiz);
    }
  };

  // Custom wrong questions practice
  const handleStartCustomWrongPractice = (wrongQuestions: Question[]) => {
    if (wrongQuestions.length === 0) return;
    const customQuiz: Quiz = {
      id: `quiz-wrong-practice-${Date.now()}`,
      slug: 'wrong-questions-practice',
      title: 'ভুল প্রশ্ন পুনঃঅনুশীলন টেস্ট (Mistakes Practice)',
      description: 'পূর্ববর্তী পরীক্ষাগুলো থেকে ভুল হওয়া প্রশ্নসমূহের বিশেষ রিভিশন মক টেস্ট।',
      type: 'quiz',
      subject: 'সকল বিষয় (Revision)',
      difficulty: 'medium',
      settings: {
        durationMinutes: Math.max(5, Math.ceil(wrongQuestions.length * 1.5)),
        totalMarks: wrongQuestions.length,
        negativeRatio: 0.25,
        shuffleQuestions: true,
        shuffleOptions: false,
        resultMode: 'immediate',
        passPercentage: 60,
        maxAttempts: null,
      },
      questionIds: wrongQuestions.map((q) => q.id),
      totalQuestions: wrongQuestions.length,
      status: 'published',
      createdAt: new Date().toISOString(),
    };

    handleStartExam(customQuiz);
  };

  // Toggle role helper
  const handleToggleRole = () => {
    const nextRole = userRole === 'admin' ? 'student' : 'admin';
    setUserRole(nextRole);
    setStoredUserRole(nextRole);
    refreshStoreData();
    if (nextRole !== 'admin' && currentTab === 'admin') {
      setCurrentTab('dashboard');
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (activeAttempt) {
      if (!confirm('আপনি বর্তমানে একটি Exam-এ আছেন। Logout করলে সেশন প্রভাবিত হতে পারে। আপনি কি প্রস্থান করতে চান?')) {
        return;
      }
    }
    setActiveAttempt(null);
    setViewingResultAttempt(null);
    setCurrentTab('dashboard');
    refreshStoreData();
  };

  // -------------------------------------------------------------
  // FOCUSED EXAM RUNNER (Distraction-Free Fullscreen, Spec Section 33)
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // EVALUATION RESULT VIEW
  // -------------------------------------------------------------
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
          setCurrentTab('dashboard');
          refreshStoreData();
        }}
      />
    );
  }

  // -------------------------------------------------------------
  // MASTER APP-SHELL (Left Sidebar + Top Header + Main Content)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex font-sans">
      {/* 1. Left Sidebar Navigation (Desktop Persistent & Mobile Drawer) */}
      <AppSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSearchQuery('');
        }}
        userRole={userRole}
        unreadNotifsCount={unreadNotifsCount}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        profile={profile}
        onLogout={handleLogout}
      />

      {/* 2. Main Shell Layout (Top Header + Main Viewport) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <TopHeader
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setSearchQuery('');
          }}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          unreadCount={unreadNotifsCount}
          profile={profile}
          userRole={userRole}
          onToggleRole={handleToggleRole}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              quizzes={quizzes}
              attempts={attempts}
              inProgressAttempt={inProgressAttempt}
              currentTime={currentTime}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onStartExam={(quiz) => setInstructionQuiz(quiz)}
              onViewQuizDetails={(quiz) => setInstructionQuiz(quiz)}
              onViewAttemptResult={(att) => setViewingResultAttempt(att)}
              onDiscardAttempt={handleDiscardAttempt}
            />
          )}

          {currentTab === 'mcq_exam' && (
            <MCQExamCatalog
              quizzes={quizzes}
              attempts={attempts}
              onStartExam={(quiz) => setInstructionQuiz(quiz)}
              onViewQuizDetails={(quiz) => setInstructionQuiz(quiz)}
              searchQuery={searchQuery}
              onSearchChange={(q) => setSearchQuery(q)}
            />
          )}

          {(currentTab === 'history_exams' || currentTab === 'history_wrong') && (
            <HistoryAndWrongQuestions
              attempts={attempts}
              questions={questions}
              questionKeys={questionKeys}
              activeTab={currentTab}
              onSelectTab={(tab) => setCurrentTab(tab)}
              onViewAttemptResult={(att) => setViewingResultAttempt(att)}
              onRetakeQuiz={handleRetakeQuiz}
              onStartCustomWrongPractice={handleStartCustomWrongPractice}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressView
              attempts={attempts}
              quizzes={quizzes}
              questions={questions}
              streak={profile.streak}
              onPracticeSubject={(subject) => {
                setSearchQuery(subject);
                setCurrentTab('mcq_exam');
              }}
            />
          )}

          {currentTab === 'bookmarks' && (
            <BookmarksView
              bookmarks={bookmarks}
              questions={questions}
              questionKeys={questionKeys}
              onRemoveBookmark={(qId) => {
                toggleBookmark(qId, '', '');
                refreshStoreData();
              }}
              onNavigateToExams={() => setCurrentTab('mcq_exam')}
            />
          )}

          {currentTab === 'leaderboard' && (
            <LeaderboardView currentUser={profile} />
          )}

          {currentTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkRead={(id) => {
                markNotificationRead(id);
                refreshStoreData();
              }}
              onMarkAllRead={() => {
                markAllNotificationsRead();
                refreshStoreData();
              }}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {(currentTab === 'help' || currentTab === 'privacy') && (
            <HelpAndPrivacyView viewType={currentTab} />
          )}

          {(currentTab === 'profile' || currentTab === 'settings') && (
            <ProfileAndSettingsView
              viewType={currentTab}
              profile={profile}
              preferences={preferences}
              userRole={userRole}
              onUpdateProfile={(updated) => {
                saveStoredProfile(updated);
                refreshStoreData();
              }}
              onUpdatePreferences={(updated) => {
                saveStoredPreferences(updated);
                refreshStoreData();
              }}
              onToggleRole={handleToggleRole}
            />
          )}

          {currentTab === 'admin' && userRole === 'admin' && (
            <AdminPortal
              questions={questions}
              questionKeys={questionKeys}
              quizzes={quizzes}
              attempts={attempts}
              logs={logs}
              onDataUpdated={refreshStoreData}
            />
          )}
        </main>
      </div>

      {/* Pre-Exam Confirmation & Instructions Modal */}
      <ExamInstructionsModal
        quiz={instructionQuiz}
        onClose={() => setInstructionQuiz(null)}
        onProceedToStart={(quiz) => handleStartExam(quiz)}
      />
    </div>
  );
}
