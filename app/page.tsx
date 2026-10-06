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
import AuthLoginView from '../components/AuthLoginView';
import { useAuth } from '../lib/auth-context';
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
import {
  fetchPublishedQuizzes,
  fetchAllQuestionsAdmin,
  saveAttemptToFirestore,
  fetchUserAttempts,
  fetchUserBookmarks,
} from '../lib/firestore-service';

export default function Home() {
  const { user, profile: authProfile, isAdmin, loading: authLoading, logout, updateUserProfile } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Store data
  const [quizzes, setQuizzes] = useState<Quiz[]>(seedQuizzes);
  const [questions, setQuestions] = useState<Question[]>(seedQuestions);
  const [questionKeys, setQuestionKeys] = useState<Record<string, QuestionKey>>(seedQuestionKeys);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<ExamPreferences>({
    hideTimer: false,
    confirmSubmit: true,
    fontScale: 'md',
    soundEnabled: true,
  });
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Active Flow States
  const [activeAttempt, setActiveAttempt] = useState<ExamAttempt | null>(null);
  const [viewingResultAttempt, setViewingResultAttempt] = useState<ExamAttempt | null>(null);
  const [instructionQuiz, setInstructionQuiz] = useState<Quiz | null>(null);

  // Active profile fallback
  const currentProfile: UserProfile = useMemo(() => {
    if (authProfile) return authProfile;
    if (user) {
      return {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'শিক্ষার্থী',
        role: isAdmin ? 'admin' : 'student',
        streak: 1,
        createdAt: new Date().toISOString(),
      };
    }
    return getStoredProfile();
  }, [authProfile, user, isAdmin]);

  // Refresh helper
  const refreshStoreData = () => {
    setQuizzes(getStoredQuizzes());
    setQuestions(getStoredQuestions());
    setQuestionKeys(getStoredQuestionKeys());
    setAttempts(getStoredAttempts());
    setLogs(getStoredLogs());
    setBookmarks(getStoredBookmarks());
    setNotifications(getStoredNotifications());
    setPreferences(getStoredPreferences());
    setCurrentTime(Date.now());
  };

  // Sync client storage and Cloud Firestore
  useEffect(() => {
    // Try fetching live quizzes from Firestore and syncing local store
    async function loadData() {
      refreshStoreData();

      // Check URL parameters for tab navigation (e.g., ?tab=mcq, ?exam=..., ?next=...)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        const examParam = urlParams.get('exam');
        const nextParam = urlParams.get('next');

        const targetTab = tabParam || (nextParam ? nextParam.replace('/', '') : null);

        if (targetTab && [
          'dashboard', 'mcq', 'history', 'progress', 'bookmarks',
          'leaderboard', 'notifications', 'help', 'privacy', 'profile', 'settings', 'admin'
        ].includes(targetTab)) {
          setCurrentTab(targetTab as NavigationTab);
        }

        if (examParam) {
          const found = seedQuizzes.find((q) => q.id === examParam || q.slug === examParam);
          if (found) {
            setInstructionQuiz(found);
            setCurrentTab('mcq');
          }
        }
      }

      try {
        const cloudQuizzes = await fetchPublishedQuizzes();
        if (cloudQuizzes.length > 0) {
          // Merge cloud quizzes with local seed
          setQuizzes((prev) => {
            const map = new Map<string, Quiz>();
            prev.forEach((q) => map.set(q.id, q));
            cloudQuizzes.forEach((q) => map.set(q.id, q));
            return Array.from(map.values());
          });
        }

        if (user) {
          const userAttempts = await fetchUserAttempts(user.uid);
          if (userAttempts.length > 0) {
            setAttempts(userAttempts);
          }
          const userBms = await fetchUserBookmarks(user.uid);
          if (userBms.length > 0) {
            setBookmarks(userBms);
          }
        }
      } catch (err) {
        console.warn('Background cloud fetch note:', err);
      }
    }
    loadData();
  }, [user]);

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
      currentProfile.displayName || 'শিক্ষার্থী'
    );
    if (user) {
      attempt.userId = user.uid;
      saveAttemptToFirestore(attempt);
    }
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

  // Logout handler
  const handleLogout = async () => {
    if (activeAttempt) {
      if (!confirm('আপনি বর্তমানে একটি Exam-এ আছেন। Logout করলে সেশন প্রভাবিত হতে পারে। আপনি কি প্রস্থান করতে চান?')) {
        return;
      }
    }
    setActiveAttempt(null);
    setViewingResultAttempt(null);
    setCurrentTab('dashboard');
    await logout();
    refreshStoreData();
  };

  // -------------------------------------------------------------
  // 1. AUTH LOADING STATE
  // -------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-[#FACC15] text-black font-extrabold flex items-center justify-center text-xl animate-pulse shadow-xl shadow-[#FACC15]/20">
          প্র
        </div>
        <div className="text-xs text-[#A3A3A3] font-mono">
          নিরাপদ প্রশ্নোত্তর সেশন লোড হচ্ছে...
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. UNAUTHENTICATED GUARD (Spec requirement: Strictly Required Auth)
  // -------------------------------------------------------------
  if (!user) {
    const nextDestination = currentTab === 'dashboard' ? '/dashboard' : `/${currentTab}`;
    return (
      <AuthLoginView
        nextUrl={nextDestination}
        onSuccessRedirect={(dest) => {
          const tab = dest.replace('/', '');
          if (tab && [
            'dashboard', 'mcq', 'history', 'progress', 'bookmarks',
            'leaderboard', 'notifications', 'help', 'privacy', 'profile', 'settings', 'admin'
          ].includes(tab)) {
            setCurrentTab(tab as NavigationTab);
          } else {
            setCurrentTab('dashboard');
          }
          refreshStoreData();
        }}
      />
    );
  }

  // -------------------------------------------------------------
  // 3. FOCUSED EXAM RUNNER (Distraction-Free Fullscreen, Spec Section 33)
  // -------------------------------------------------------------
  if (activeAttempt) {
    return (
      <LiveExamRunner
        attempt={activeAttempt}
        onFinishExam={(evaluated) => {
          setActiveAttempt(null);
          setViewingResultAttempt(evaluated);
          if (user) {
            evaluated.userId = user.uid;
            saveAttemptToFirestore(evaluated);
          }
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
  // 4. EVALUATION RESULT VIEW
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
  // 5. MASTER APP-SHELL (Left Sidebar + Top Header + Main Content)
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
        isAdmin={isAdmin}
        unreadNotifsCount={unreadNotifsCount}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        profile={currentProfile}
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
          profile={currentProfile}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView
              profile={currentProfile}
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

          {currentTab === 'mcq' && (
            <MCQExamCatalog
              quizzes={quizzes}
              attempts={attempts}
              onStartExam={(quiz) => setInstructionQuiz(quiz)}
              onViewQuizDetails={(quiz) => setInstructionQuiz(quiz)}
              searchQuery={searchQuery}
              onSearchChange={(q) => setSearchQuery(q)}
            />
          )}

          {currentTab === 'history' && (
            <HistoryAndWrongQuestions
              attempts={attempts}
              questions={questions}
              questionKeys={questionKeys}
              initialTab="exams"
              onViewAttemptResult={(att) => setViewingResultAttempt(att)}
              onRetakeQuiz={handleRetakeQuiz}
              onStartCustomWrongPractice={handleStartCustomWrongPractice}
              onNavigateToMCQ={() => setCurrentTab('mcq')}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressView
              attempts={attempts}
              quizzes={quizzes}
              questions={questions}
              streak={currentProfile.streak || 1}
              onPracticeSubject={(subject) => {
                setSearchQuery(subject);
                setCurrentTab('mcq');
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
              onNavigateToExams={() => setCurrentTab('mcq')}
            />
          )}

          {currentTab === 'leaderboard' && (
            <LeaderboardView currentUser={currentProfile} />
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
              profile={currentProfile}
              preferences={preferences}
              userRole={isAdmin ? 'admin' : 'student'}
              onUpdateProfile={(updated) => {
                saveStoredProfile(updated);
                updateUserProfile(updated);
                refreshStoreData();
              }}
              onUpdatePreferences={(updated) => {
                saveStoredPreferences(updated);
                refreshStoreData();
              }}
              onToggleRole={() => {}}
            />
          )}

          {currentTab === 'admin' && isAdmin && (
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
