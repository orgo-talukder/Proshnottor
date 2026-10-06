'use client';

import {
  Question,
  QuestionKey,
  Quiz,
  ExamAttempt,
  ExamEvaluationResult,
  SystemAuditLog,
  Bookmark,
  AppNotification,
  UserProfile,
  ExamPreferences,
} from './types';
import { seedQuestions, seedQuestionKeys, seedQuizzes } from './seedData';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore';

const STORAGE_KEYS = {
  QUESTIONS: 'proshnottor_questions_v1',
  KEYS: 'proshnottor_keys_v1',
  QUIZZES: 'proshnottor_quizzes_v1',
  ATTEMPTS: 'proshnottor_attempts_v1',
  LOGS: 'proshnottor_logs_v1',
  CURRENT_ROLE: 'proshnottor_role_v1',
  FONT_SCALE: 'proshnottor_font_scale_v1',
  BOOKMARKS: 'proshnottor_bookmarks_v1',
  NOTIFICATIONS: 'proshnottor_notifications_v1',
  PROFILE: 'proshnottor_profile_v1',
  PREFERENCES: 'proshnottor_preferences_v1',
};

// Default profile
const defaultProfile: UserProfile = {
  id: 'usr-student-01',
  email: 'argotalukder70@gmail.com',
  displayName: 'Argo Talukder',
  role: 'student',
  institution: 'ঢাকা বিশ্ববিদ্যালয় (University of Dhaka)',
  targetExam: '47th BCS & Job Recruitment',
  district: 'Dhaka',
  streak: 7,
  createdAt: '2026-03-01',
};

// Default notifications
const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'নতুন মক টেস্ট প্রকাশিত হয়েছে',
    message: 'BCS Preliminary Model Test 01 এখন লাইভ। এখনই অংশগ্রহণ করুন।',
    timestamp: '১০ মিনিট আগে',
    read: false,
    type: 'exam',
    linkTab: 'mcq_exam',
  },
  {
    id: 'notif-2',
    title: '৭ দিনের স্ট্রিক সম্পন্ন!',
    message: 'অভিনন্দন! আপনি টানা ৭ দিন সফলভাবে কুইজ অনুশীলন করেছেন।',
    timestamp: '২ ঘণ্টা আগে',
    read: false,
    type: 'streak',
    linkTab: 'progress',
  },
  {
    id: 'notif-3',
    title: 'সিস্টেম আপডেট v2.0',
    message: 'Pure Black OLED ড্যাশবোর্ড এবং রিয়েলটাইম ফায়ারবেস ক্লাউড ব্যাকআপ যুক্ত করা হয়েছে।',
    timestamp: '১ দিন আগে',
    read: true,
    type: 'system',
    linkTab: 'dashboard',
  },
];

// Default preferences
const defaultPreferences: ExamPreferences = {
  hideTimer: false,
  confirmSubmit: true,
  fontScale: 'md',
  soundEnabled: true,
};

// Memory fallback for SSR / Hydration
let memoryQuestions: Question[] = [...seedQuestions];
let memoryKeys: Record<string, QuestionKey> = { ...seedQuestionKeys };
let memoryQuizzes: Quiz[] = [...seedQuizzes];
let memoryAttempts: ExamAttempt[] = [];
let memoryBookmarks: Bookmark[] = [
  {
    id: 'bm-1',
    userId: 'usr-student-01',
    questionId: 'q-math-01',
    subject: 'সাধারণ গণিত',
    topic: 'বীজগণিতিক অনুপাত',
    savedAt: Date.now() - 3600000 * 24,
  },
];
let memoryNotifications: AppNotification[] = [...initialNotifications];
let memoryProfile: UserProfile = { ...defaultProfile };
let memoryPreferences: ExamPreferences = { ...defaultPreferences };
let memoryLogs: SystemAuditLog[] = [
  {
    id: 'log-1',
    action: 'SYSTEM_BOOT',
    user: 'system',
    timestamp: '১০:০০ AM',
    details: 'Pure Black Exam Engine এবং ফায়ারবেস ক্লাউড সিঙ্ক প্রস্তুত হয়েছে',
    level: 'info',
  },
];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getStoredQuestions(): Question[] {
  if (!isBrowser()) return memoryQuestions;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(seedQuestions));
      return seedQuestions;
    }
    return JSON.parse(raw);
  } catch {
    return memoryQuestions;
  }
}

export function saveStoredQuestions(questions: Question[]) {
  memoryQuestions = questions;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.error('Failed to save questions to localStorage', e);
    }
  }
}

export function getStoredQuestionKeys(): Record<string, QuestionKey> {
  if (!isBrowser()) return memoryKeys;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.KEYS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(seedQuestionKeys));
      return seedQuestionKeys;
    }
    return JSON.parse(raw);
  } catch {
    return memoryKeys;
  }
}

export function saveStoredQuestionKeys(keys: Record<string, QuestionKey>) {
  memoryKeys = keys;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(keys));
    } catch (e) {
      console.error('Failed to save keys to localStorage', e);
    }
  }
}

export function getStoredQuizzes(): Quiz[] {
  if (!isBrowser()) return memoryQuizzes;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(seedQuizzes));
      return seedQuizzes;
    }
    return JSON.parse(raw);
  } catch {
    return memoryQuizzes;
  }
}

export function saveStoredQuizzes(quizzes: Quiz[]) {
  memoryQuizzes = quizzes;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
    } catch (e) {
      console.error('Failed to save quizzes to localStorage', e);
    }
  }
}

export function getStoredAttempts(): ExamAttempt[] {
  if (!isBrowser()) return memoryAttempts;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return memoryAttempts;
  }
}

export function saveStoredAttempts(attempts: ExamAttempt[]) {
  memoryAttempts = attempts;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    } catch (e) {
      console.error('Failed to save attempts to localStorage', e);
    }
  }
}

// -------------------------------------------------------------
// Bookmarks Store
// -------------------------------------------------------------

export function getStoredBookmarks(): Bookmark[] {
  if (!isBrowser()) return memoryBookmarks;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(memoryBookmarks));
      return memoryBookmarks;
    }
    return JSON.parse(raw);
  } catch {
    return memoryBookmarks;
  }
}

export function toggleBookmark(questionId: string, subject: string, topic: string): boolean {
  const current = getStoredBookmarks();
  const exists = current.some((b) => b.questionId === questionId);
  let updated: Bookmark[];
  let isSaved = false;

  if (exists) {
    updated = current.filter((b) => b.questionId !== questionId);
    isSaved = false;
  } else {
    const newBm: Bookmark = {
      id: `bm-${Date.now()}`,
      userId: getStoredProfile().id,
      questionId,
      subject,
      topic,
      savedAt: Date.now(),
    };
    updated = [newBm, ...current];
    isSaved = true;
  }

  memoryBookmarks = updated;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }
  return isSaved;
}

export function isQuestionBookmarked(questionId: string): boolean {
  const current = getStoredBookmarks();
  return current.some((b) => b.questionId === questionId);
}

// -------------------------------------------------------------
// Notifications Store
// -------------------------------------------------------------

export function getStoredNotifications(): AppNotification[] {
  if (!isBrowser()) return memoryNotifications;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(memoryNotifications));
      return memoryNotifications;
    }
    return JSON.parse(raw);
  } catch {
    return memoryNotifications;
  }
}

export function markNotificationRead(id: string) {
  const notifs = getStoredNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  memoryNotifications = notifs;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch {}
  }
}

export function markAllNotificationsRead() {
  const notifs = getStoredNotifications().map((n) => ({ ...n, read: true }));
  memoryNotifications = notifs;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch {}
  }
}

// -------------------------------------------------------------
// Profile Store
// -------------------------------------------------------------

export function getStoredProfile(): UserProfile {
  if (!isBrowser()) return memoryProfile;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(memoryProfile));
      return memoryProfile;
    }
    return JSON.parse(raw);
  } catch {
    return memoryProfile;
  }
}

export function saveStoredProfile(profile: UserProfile) {
  memoryProfile = profile;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      addAuditLog('PROFILE_UPDATED', `প্রোফাইল তথ্য আপডেট করা হয়েছে (${profile.displayName})`);
    } catch {}
  }
}

// -------------------------------------------------------------
// Preferences Store
// -------------------------------------------------------------

export function getStoredPreferences(): ExamPreferences {
  if (!isBrowser()) return memoryPreferences;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(memoryPreferences));
      return memoryPreferences;
    }
    return JSON.parse(raw);
  } catch {
    return memoryPreferences;
  }
}

export function saveStoredPreferences(prefs: ExamPreferences) {
  memoryPreferences = prefs;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch {}
  }
}

// -------------------------------------------------------------
// Audit Logs
// -------------------------------------------------------------

export function addAuditLog(action: string, details: string, level: 'info' | 'warn' | 'security' = 'info') {
  const newLog: SystemAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    user: getStoredUserRole() === 'admin' ? 'Admin' : 'Student (Examinee)',
    timestamp: new Date().toLocaleTimeString('bn-BD'),
    details,
    level,
  };
  memoryLogs = [newLog, ...memoryLogs].slice(0, 50);
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(memoryLogs));
    } catch {}
  }

  // Cloud backup to Firestore
  try {
    if (auth.currentUser) {
      const path = 'logs';
      addDoc(collection(db, path), {
        action: newLog.action,
        user: newLog.user,
        timestamp: newLog.timestamp,
        details: newLog.details,
        level: newLog.level,
        createdAt: new Date().toISOString(),
      }).catch((err) => handleFirestoreError(err, OperationType.CREATE, path));
    }
  } catch {}
}

export function getStoredLogs(): SystemAuditLog[] {
  if (!isBrowser()) return memoryLogs;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return memoryLogs;
}

export function getStoredUserRole(): 'student' | 'admin' {
  if (!isBrowser()) return 'student';
  try {
    const prof = getStoredProfile();
    return prof.role || 'student';
  } catch {
    return 'student';
  }
}

export function setStoredUserRole(role: 'student' | 'admin') {
  if (isBrowser()) {
    try {
      const prof = getStoredProfile();
      const updated = { ...prof, role };
      saveStoredProfile(updated);
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
      addAuditLog('ROLE_SWITCH', `রোল সুইচ করা হয়েছে: ${role === 'admin' ? 'Admin (এডমিন)' : 'Student (শিক্ষার্থী)'}`);
    } catch {}
  }
}

export function getStoredFontScale(): 'sm' | 'md' | 'lg' | 'xl' {
  if (!isBrowser()) return 'md';
  try {
    return getStoredPreferences().fontScale;
  } catch {
    return 'md';
  }
}

export function setStoredFontScale(scale: 'sm' | 'md' | 'lg' | 'xl') {
  if (isBrowser()) {
    try {
      const prefs = getStoredPreferences();
      saveStoredPreferences({ ...prefs, fontScale: scale });
    } catch {}
  }
}

// -------------------------------------------------------------
// Exam Lifecycle & Evaluation Engine
// -------------------------------------------------------------

export function startExamAttempt(quiz: Quiz, userName = 'Argo Talukder'): ExamAttempt {
  const now = Date.now();
  const durationMs = quiz.settings.durationMinutes * 60 * 1000;
  const token = `e-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

  // Determine question order (shuffle if requested)
  let order = [...quiz.questionIds];
  if (quiz.settings.shuffleQuestions) {
    order = order.sort(() => Math.random() - 0.5);
  }

  // Initialize empty answers map
  const answers: Record<string, any> = {};
  for (const qId of order) {
    answers[qId] = {
      selected: [],
      visited: false,
      markedForReview: false,
      timeSpentMs: 0,
    };
  }

  // Mark first question visited
  if (order.length > 0) {
    answers[order[0]].visited = true;
  }

  const attempt: ExamAttempt = {
    id: `att-${Date.now()}`,
    token,
    userId: getStoredProfile().id,
    userName,
    quizId: quiz.id,
    quizTitle: quiz.title,
    quizType: quiz.type,
    totalQuestions: order.length,
    totalMarks: quiz.settings.totalMarks || order.length,
    durationMinutes: quiz.settings.durationMinutes,
    startedAt: now,
    expiresAt: now + durationMs,
    status: 'in_progress',
    questionOrder: order,
    answers,
  };

  const attempts = getStoredAttempts();
  saveStoredAttempts([attempt, ...attempts]);
  addAuditLog('EXAM_STARTED', `পরীক্ষা শুরু হয়েছে: ${quiz.title} (টোকেন: ${token})`);

  // Async Firestore backup
  if (auth.currentUser) {
    const path = `attempts/${attempt.id}`;
    setDoc(doc(db, 'attempts', attempt.id), {
      ...attempt,
      cloudSyncedAt: new Date().toISOString(),
    }).catch((err) => handleFirestoreError(err, OperationType.WRITE, path));
  }

  return attempt;
}

export function updateAttemptAnswer(
  attemptId: string,
  questionId: string,
  selected: string[],
  markedForReview?: boolean,
  visited = true
): ExamAttempt | null {
  const attempts = getStoredAttempts();
  const idx = attempts.findIndex((a) => a.id === attemptId);
  if (idx === -1) return null;

  const attempt = { ...attempts[idx] };
  const currentAnswer = attempt.answers[questionId] || {
    selected: [],
    visited: false,
    markedForReview: false,
    timeSpentMs: 0,
  };

  attempt.answers[questionId] = {
    ...currentAnswer,
    selected,
    visited: true,
    markedForReview: markedForReview !== undefined ? markedForReview : currentAnswer.markedForReview,
    answeredAt: Date.now(),
  };

  attempts[idx] = attempt;
  saveStoredAttempts(attempts);
  return attempt;
}

export function evaluateAttempt(attemptId: string, reason: 'manual' | 'timeout' = 'manual'): ExamAttempt | null {
  const attempts = getStoredAttempts();
  const idx = attempts.findIndex((a) => a.id === attemptId);
  if (idx === -1) return null;

  const attempt = { ...attempts[idx] };
  const quizzes = getStoredQuizzes();
  const quiz = quizzes.find((q) => q.id === attempt.quizId);
  const negativeRatio = quiz ? quiz.settings.negativeRatio : 0.25;
  const questions = getStoredQuestions();
  const keys = getStoredQuestionKeys();

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  let rawScore = 0;

  const topicBreakdown: Record<string, { correct: number; total: number; marks: number }> = {};
  const perQuestion: Record<string, any> = {};

  for (const qId of attempt.questionOrder) {
    const qObj = questions.find((q) => q.id === qId);
    const keyObj = keys[qId];
    const userAns = attempt.answers[qId];
    const userSelected = userAns?.selected || [];
    const correctOptions = keyObj?.correctOptionIds || [];

    const topic = qObj?.topic || 'সাধারণ';
    if (!topicBreakdown[topic]) {
      topicBreakdown[topic] = { correct: 0, total: 0, marks: 0 };
    }
    topicBreakdown[topic].total += 1;

    let isCorrect = false;
    let marksAwarded = 0;

    if (userSelected.length === 0) {
      unattemptedCount += 1;
      isCorrect = false;
      marksAwarded = 0;
    } else {
      const sortedUser = [...userSelected].sort().join(',');
      const sortedCorrect = [...correctOptions].sort().join(',');

      if (sortedUser === sortedCorrect) {
        isCorrect = true;
        marksAwarded = qObj?.defaultMarks || 1;
        correctCount += 1;
        rawScore += marksAwarded;
        topicBreakdown[topic].correct += 1;
        topicBreakdown[topic].marks += marksAwarded;
      } else {
        isCorrect = false;
        const penalty = (qObj?.defaultMarks || 1) * negativeRatio;
        marksAwarded = -penalty;
        wrongCount += 1;
        rawScore -= penalty;
      }
    }

    perQuestion[qId] = {
      selected: userSelected,
      correctOptionIds: correctOptions,
      isCorrect,
      marksAwarded,
      explanation: keyObj?.explanation || 'এই প্রশ্নের জন্য কোনো অতিরিক্ত ব্যাখ্যা সংজ্ঞায়িত নেই।',
    };
  }

  const finalScore = Math.max(0, Math.round(rawScore * 100) / 100);
  const totalMarks = attempt.totalMarks || attempt.totalQuestions;
  const percentage = Math.round((finalScore / totalMarks) * 100);
  const attemptedCount = correctCount + wrongCount;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const timeTakenSec = Math.max(1, Math.round((Date.now() - attempt.startedAt) / 1000));

  const result: ExamEvaluationResult = {
    score: finalScore,
    totalMarks,
    percentage,
    correct: correctCount,
    wrong: wrongCount,
    unattempted: unattemptedCount,
    accuracy,
    timeTakenSec,
    topicBreakdown,
    perQuestion,
  };

  attempt.status = 'evaluated';
  attempt.submitReason = reason;
  attempt.submittedAt = Date.now();
  attempt.result = result;

  attempts[idx] = attempt;
  saveStoredAttempts(attempts);
  addAuditLog(
    'EXAM_SUBMITTED',
    `পরীক্ষা জমা দেওয়া হয়েছে (${reason}): ${attempt.quizTitle} - প্রাপ্ত স্কোর: ${finalScore}/${totalMarks}`
  );

  // Sync evaluated attempt to Firestore
  if (auth.currentUser) {
    const path = `attempts/${attempt.id}`;
    setDoc(doc(db, 'attempts', attempt.id), {
      ...attempt,
      submittedAt: attempt.submittedAt,
      result: attempt.result,
      cloudSyncedAt: new Date().toISOString(),
    }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, path));
  }

  return attempt;
}
