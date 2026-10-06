'use client';

import {
  Question,
  QuestionKey,
  Quiz,
  ExamAttempt,
  ExamEvaluationResult,
  SystemAuditLog,
} from './types';
import { seedQuestions, seedQuestionKeys, seedQuizzes } from './seedData';

const STORAGE_KEYS = {
  QUESTIONS: 'proshnottor_questions_v1',
  KEYS: 'proshnottor_keys_v1',
  QUIZZES: 'proshnottor_quizzes_v1',
  ATTEMPTS: 'proshnottor_attempts_v1',
  LOGS: 'proshnottor_logs_v1',
  CURRENT_ROLE: 'proshnottor_role_v1',
  FONT_SCALE: 'proshnottor_font_scale_v1',
};

// Memory fallback for SSR / Hydration
let memoryQuestions: Question[] = [...seedQuestions];
let memoryKeys: Record<string, QuestionKey> = { ...seedQuestionKeys };
let memoryQuizzes: Quiz[] = [...seedQuizzes];
let memoryAttempts: ExamAttempt[] = [];
let memoryLogs: SystemAuditLog[] = [
  {
    id: 'log-1',
    action: 'SYSTEM_BOOT',
    user: 'system',
    timestamp: new Date().toLocaleTimeString('bn-BD'),
    details: 'Pure Black Exam Engine এবং ডাটাবেস প্রস্তুত হয়েছে',
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
    } catch {
      // ignore
    }
  }
}

export function getStoredLogs(): SystemAuditLog[] {
  if (!isBrowser()) return memoryLogs;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return memoryLogs;
}

export function getStoredUserRole(): 'student' | 'admin' {
  if (!isBrowser()) return 'student';
  try {
    return (localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) as 'student' | 'admin') || 'student';
  } catch {
    return 'student';
  }
}

export function setStoredUserRole(role: 'student' | 'admin') {
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
      addAuditLog('ROLE_SWITCH', `ইউজার রোল পরিবর্তিত হয়েছে: ${role === 'admin' ? 'অ্যাডমিন' : 'শিক্ষার্থী'}`);
    } catch {
      // ignore
    }
  }
}

export function getStoredFontScale(): 'sm' | 'md' | 'lg' | 'xl' {
  if (!isBrowser()) return 'md';
  try {
    return (localStorage.getItem(STORAGE_KEYS.FONT_SCALE) as any) || 'md';
  } catch {
    return 'md';
  }
}

export function setStoredFontScale(scale: 'sm' | 'md' | 'lg' | 'xl') {
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.FONT_SCALE, scale);
    } catch {
      // ignore
    }
  }
}

// -------------------------------------------------------------
// Exam Lifecycle & Evaluation Engine
// -------------------------------------------------------------

export function startExamAttempt(quiz: Quiz, userName = 'শিক্ষার্থী'): ExamAttempt {
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
    userId: 'usr-student-01',
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
      // Check if selected matches correct options
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

  return attempt;
}
