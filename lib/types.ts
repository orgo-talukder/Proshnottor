export type QuestionType = 'mcq_single' | 'mcq_multi' | 'true_false' | 'numeric';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ExamType = 'quiz' | 'mock';
export type ResultMode = 'immediate' | 'after_submit' | 'after_close' | 'manual';

export type PaletteState =
  | 'not_visited'
  | 'not_answered'
  | 'answered'
  | 'marked_for_review'
  | 'answered_and_marked';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  stem: string; // Markdown + LaTeX with $...$ or $$...$$
  options: QuestionOption[];
  type: QuestionType;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  defaultMarks: number;
  language: 'bn' | 'en';
}

export interface QuestionKey {
  questionId: string;
  correctOptionIds: string[];
  explanation: string; // Explanations with math equations
}

export interface QuizSettings {
  durationMinutes: number;
  totalMarks: number;
  negativeRatio: number; // e.g. 0.25
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  resultMode: ResultMode;
  passPercentage: number;
  maxAttempts: number | null;
}

export interface Quiz {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: ExamType;
  subject: string;
  difficulty: Difficulty;
  settings: QuizSettings;
  questionIds: string[];
  totalQuestions: number;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
}

export interface ExamAnswerState {
  selected: string[];
  visited: boolean;
  markedForReview: boolean;
  timeSpentMs: number;
  answeredAt?: number;
}

export interface ExamEvaluationResult {
  score: number;
  totalMarks: number;
  percentage: number;
  correct: number;
  wrong: number;
  unattempted: number;
  accuracy: number;
  timeTakenSec: number;
  rank?: number;
  topicBreakdown: Record<string, { correct: number; total: number; marks: number }>;
  perQuestion: Record<
    string,
    {
      selected: string[];
      correctOptionIds: string[];
      isCorrect: boolean;
      marksAwarded: number;
      explanation: string;
    }
  >;
}

export interface ExamAttempt {
  id: string;
  token: string;
  userId: string;
  userName: string;
  quizId: string;
  quizTitle: string;
  quizType: ExamType;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  startedAt: number;
  expiresAt: number;
  submittedAt?: number;
  status: 'in_progress' | 'submitted' | 'auto_submitted' | 'evaluated';
  submitReason?: 'manual' | 'timeout';
  questionOrder: string[];
  answers: Record<string, ExamAnswerState>;
  result?: ExamEvaluationResult;
}

export interface SystemAuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  level: 'info' | 'warn' | 'security';
}
