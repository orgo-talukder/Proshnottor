'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import AppSidebar from './AppSidebar';
import TopHeader from './TopHeader';
import DashboardView from './DashboardView';
import MCQExamCatalog from './MCQExamCatalog';
import ExamInstructionsModal from './ExamInstructionsModal';
import LiveExamRunner from './LiveExamRunner';
import ExamResultView from './ExamResultView';
import HistoryAndWrongQuestions from './HistoryAndWrongQuestions';
import ProgressView from './ProgressView';
import BookmarksView from './BookmarksView';
import LeaderboardView from './LeaderboardView';
import NotificationsView from './NotificationsView';
import HelpAndPrivacyView from './HelpAndPrivacyView';
import ProfileAndSettingsView from './ProfileAndSettingsView';
import AdminPortal from './AdminPortal';
import AuthLoginView from './AuthLoginView';
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
import {
  getStoredLogs,
  getStoredProfile,
  saveStoredProfile,
  getStoredPreferences,
  saveStoredPreferences,
  getStoredNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  startExamAttempt,
} from '../lib/store';
import {
  subscribeToPublishedQuizzes,
  subscribeToUserAttempts,
  subscribeToUserBookmarks,
  subscribeToAllQuestions,
  subscribeToAllQuestionKeys,
  subscribeToUserProfile,
  syncUserProfileInFirestore,
  ensureFirestoreInitialSeed,
  saveAttemptToFirestore,
  toggleBookmarkInFirestore,
} from '../lib/firestore-service';

interface AppMasterShellProps {
  initialTab?: NavigationTab;
  initialExamId?: string;
}

export default function AppMasterShell({
  initialTab = 'dashboard',
  initialExamId,
}: AppMasterShellProps) {
  const { user, profile: authProfile, isAdmin, loading: authLoading, logout, updateUserProfile } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Live Cloud Firestore Data State
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionKeys, setQuestionKeys] = useState<Record<string, QuestionKey>>({});
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [cloudProfile, setCloudProfile] = useState<UserProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
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

  // Active profile with Cloud Firestore live sync
  const currentProfile: UserProfile = useMemo(() => {
    if (cloudProfile) return cloudProfile;
    if (authProfile) return authProfile;
    if (user) {
      return {
        id: user.uid,
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'শিক্ষার্থী',
        role: isAdmin ? 'admin' : 'student',
        streak: 1,
        totalExamsTaken: attempts.filter((a) => a.status === 'evaluated').length,
        totalScore: attempts
          .filter((a) => a.status === 'evaluated' && a.result)
          .reduce((acc, curr) => acc + (curr.result?.percentage || 0), 0),
        averageAccuracy: 0,
        weakAreas: [],
        lastActiveDate: '',
        createdAt: '',
      };
    }
    return getStoredProfile();
  }, [cloudProfile, authProfile, user, attempts, isAdmin]);

  // Refresh local store data
  const refreshStoreData = useCallback(() => {
    setLogs(getStoredLogs());
    setNotifications(getStoredNotifications());
    setPreferences(getStoredPreferences());
    setCurrentTime(Date.now());
  }, []);

  // Update browser URL without full reload
  const navigateToTab = (tab: NavigationTab, pushHistory = true) => {
    setCurrentTab(tab);
    setSearchQuery('');
    setInstructionQuiz(null);

    if (pushHistory && typeof window !== 'undefined') {
      const targetPath = tab === 'dashboard' ? '/dashboard' : `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab }, '', targetPath);
      }
    }
  };

  // Open exam and sync URL
  const openExamModal = (quiz: Quiz, pushHistory = true) => {
    setInstructionQuiz(quiz);
    if (pushHistory && typeof window !== 'undefined') {
      const targetPath = `/mcq/${quiz.id}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab: 'mcq', examId: quiz.id }, '', targetPath);
      }
    }
  };

  // Close exam modal and restore URL
  const closeExamModal = () => {
    setInstructionQuiz(null);
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/mcq/')) {
        window.history.pushState({ tab: 'mcq' }, '', '/mcq');
      }
    }
  };

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const pathname = window.location.pathname;

      // Check for /mcq/[examId]
      const mcqMatch = pathname.match(/^\/mcq\/(.+)$/);
      if (mcqMatch) {
        const examId = mcqMatch[1];
        const found = quizzes.find((q) => q.id === examId || q.slug === examId);
        setCurrentTab('mcq');
        if (found) setInstructionQuiz(found);
        return;
      }

      const cleanPath = pathname.replace(/^\//, '') as NavigationTab;
      if ([
        'dashboard', 'mcq', 'history', 'progress', 'bookmarks',
        'leaderboard', 'notifications', 'help', 'privacy', 'profile', 'settings', 'admin'
      ].includes(cleanPath)) {
        setCurrentTab(cleanPath);
        setInstructionQuiz(null);
      } else if (!cleanPath) {
        setCurrentTab('dashboard');
        setInstructionQuiz(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [quizzes]);

  // Real-time Firestore Subscriptions & Auto-seed initialization
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    async function initRealtimeFirestore() {
      refreshStoreData();

      // Deep link tab inspection
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const mcqMatch = pathname.match(/^\/mcq\/(.+)$/);
        const examId = initialExamId || (mcqMatch ? mcqMatch[1] : null);

        if (examId) {
          setCurrentTab('mcq');
        } else if (initialTab && initialTab !== 'dashboard') {
          setCurrentTab(initialTab);
        } else {
          const cleanPath = pathname.replace(/^\//, '') as NavigationTab;
          if ([
            'dashboard', 'mcq', 'history', 'progress', 'bookmarks',
            'leaderboard', 'notifications', 'help', 'privacy', 'profile', 'settings', 'admin'
          ].includes(cleanPath)) {
            setCurrentTab(cleanPath);
          }
        }
      }

      try {
        // 1. Ensure Firestore has initial exams & questions if empty
        await ensureFirestoreInitialSeed();

        // 2. Real-time published quizzes listener
        const unsubQuizzes = subscribeToPublishedQuizzes((liveQuizzes) => {
          setQuizzes(liveQuizzes);
          setDataLoading(false);

          // Deep link match if examId was present in URL
          if (typeof window !== 'undefined') {
            const pathname = window.location.pathname;
            const mcqMatch = pathname.match(/^\/mcq\/(.+)$/);
            const examId = initialExamId || (mcqMatch ? mcqMatch[1] : null);
            if (examId) {
              const found = liveQuizzes.find((q) => q.id === examId || q.slug === examId);
              if (found) {
                setInstructionQuiz(found);
                setCurrentTab('mcq');
              }
            }
          }
        });
        unsubs.push(unsubQuizzes);

        // 3. Real-time questions and answer keys listener
        const unsubQuestions = subscribeToAllQuestions((liveQuestions) => {
          setQuestions(liveQuestions);
        });
        unsubs.push(unsubQuestions);

        const unsubKeys = subscribeToAllQuestionKeys((liveKeys) => {
          setQuestionKeys(liveKeys);
        });
        unsubs.push(unsubKeys);

        // 4. Real-time user specific attempts, bookmarks, and profile
        if (user) {
          syncUserProfileInFirestore(user.uid, user.email || '', user.displayName || '');

          const unsubAttempts = subscribeToUserAttempts(user.uid, (liveAttempts) => {
            setAttempts(liveAttempts);
          });
          unsubs.push(unsubAttempts);

          const unsubBookmarks = subscribeToUserBookmarks(user.uid, (liveBookmarks) => {
            setBookmarks(liveBookmarks);
          });
          unsubs.push(unsubBookmarks);

          const unsubProfile = subscribeToUserProfile(user.uid, (liveProfile) => {
            if (liveProfile) setCloudProfile(liveProfile);
          });
          unsubs.push(unsubProfile);
        }
      } catch (err) {
        console.warn('Real-time Firestore initialization error:', err);
        setDataLoading(false);
      }
    }

    initRealtimeFirestore();

    return () => {
      unsubs.forEach((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [user, initialTab, initialExamId, refreshStoreData]);

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
  const handleDiscardAttempt = async (attemptId: string) => {
    const updated = attempts.filter((a) => a.id !== attemptId);
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
      attempt.userName = user.displayName || user.email?.split('@')[0] || 'শিক্ষার্থী';
      saveAttemptToFirestore(attempt);
    }
    setActiveAttempt(attempt);
    setInstructionQuiz(null);
  };

  // Retake exam
  const handleRetakeQuiz = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (quiz) {
      openExamModal(quiz);
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
    navigateToTab('dashboard');
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
    const nextDestination = typeof window !== 'undefined' ? window.location.pathname : (currentTab === 'dashboard' ? '/dashboard' : `/${currentTab}`);
    return (
      <AuthLoginView
        nextUrl={nextDestination}
        onSuccessRedirect={(dest) => {
          const tab = dest.replace('/', '') as NavigationTab;
          if (tab && [
            'dashboard', 'mcq', 'history', 'progress', 'bookmarks',
            'leaderboard', 'notifications', 'help', 'privacy', 'profile', 'settings', 'admin'
          ].includes(tab)) {
            navigateToTab(tab);
          } else {
            navigateToTab('dashboard');
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
        onFinishExam={async (evaluated) => {
          setActiveAttempt(null);
          setViewingResultAttempt(evaluated);
          if (user) {
            evaluated.userId = user.uid;
            await saveAttemptToFirestore(evaluated);

            // Update user profile stats in Firestore
            const completed = [...attempts, evaluated].filter((a) => a.status === 'evaluated' && a.result);
            const totalScore = completed.reduce((acc, curr) => acc + (curr.result?.percentage || 0), 0);
            const avgAcc = completed.length > 0
              ? Math.round(completed.reduce((acc, curr) => acc + (curr.result?.accuracy || 0), 0) / completed.length)
              : 0;

            await syncUserProfileInFirestore(user.uid, user.email || '', user.displayName || '', '', {
              totalExamsTaken: completed.length,
              totalScore,
              averageAccuracy: avgAcc,
            });
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
          navigateToTab('dashboard');
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
        onSelectTab={(tab) => navigateToTab(tab)}
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
          onSelectTab={(tab) => navigateToTab(tab)}
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
              onNavigateTab={(tab) => navigateToTab(tab)}
              onStartExam={(quiz) => openExamModal(quiz)}
              onViewQuizDetails={(quiz) => openExamModal(quiz)}
              onViewAttemptResult={(att) => setViewingResultAttempt(att)}
              onDiscardAttempt={handleDiscardAttempt}
            />
          )}

          {currentTab === 'mcq' && (
            <MCQExamCatalog
              quizzes={quizzes}
              attempts={attempts}
              loading={dataLoading}
              onStartExam={(quiz) => openExamModal(quiz)}
              onViewQuizDetails={(quiz) => openExamModal(quiz)}
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
              onNavigateToMCQ={() => navigateToTab('mcq')}
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
                navigateToTab('mcq');
              }}
            />
          )}

          {currentTab === 'bookmarks' && (
            <BookmarksView
              bookmarks={bookmarks}
              questions={questions}
              questionKeys={questionKeys}
              onRemoveBookmark={async (qId) => {
                if (user) {
                  await toggleBookmarkInFirestore(user.uid, qId, '', '');
                }
                refreshStoreData();
              }}
              onNavigateToExams={() => navigateToTab('mcq')}
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
              onNavigateTab={(tab) => navigateToTab(tab)}
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
        onClose={closeExamModal}
        onProceedToStart={(quiz) => handleStartExam(quiz)}
      />
    </div>
  );
}
