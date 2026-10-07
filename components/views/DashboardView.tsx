'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  BarChart2,
  FileText,
  Award,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Quiz, ExamAttempt } from '../../lib/types';
import { subscribeToPublishedQuizzes, subscribeToUserAttempts } from '../../lib/firestore-service';

export default function DashboardView() {
  const { user, profile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubQuizzes = subscribeToPublishedQuizzes((liveQuizzes) => {
      setQuizzes(liveQuizzes);
      setLoading(false);
    });

    let unsubAttempts = () => {};
    if (user?.uid) {
      unsubAttempts = subscribeToUserAttempts(user.uid, (liveAttempts) => {
        setAttempts(liveAttempts);
      });
    }

    return () => {
      unsubQuizzes();
      unsubAttempts();
    };
  }, [user]);

  // Calculated Stats
  const completedAttempts = attempts.filter((a) => a.status === 'completed');
  const totalExamsTaken = completedAttempts.length;
  const avgAccuracy =
    completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((acc, a) => acc + (a.accuracy || 0), 0) / completedAttempts.length)
      : 0;
  const avgScore =
    completedAttempts.length > 0
      ? (completedAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / completedAttempts.length).toFixed(1)
      : '0.0';

  const recentAttempt = completedAttempts[0];

  return (
    <div className="space-y-8">
      {/* Header Greeting Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
              Welcome back, {profile?.displayName || 'Examinee'}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121212] border border-[#3F3F3F] text-[#FACC15] text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-[#FACC15]" />
              <span>{profile?.streak || 1}-day streak</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            Target Focus: <span className="text-[#FACC15] font-semibold">{profile?.targetExam || 'BCS & Competitive Exams'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mcq"
            className="px-4 py-2 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-lg shadow-[#FACC15]/10"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Start Practice Drill</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span className="text-xs font-semibold">Exams Completed</span>
            <FileText className="w-4 h-4 text-[#FACC15]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tabular-nums">{totalExamsTaken}</div>
            <div className="text-[11px] text-[#A3A3A3] mt-0.5">Total submitted papers</div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span className="text-xs font-semibold">Average Score</span>
            <Award className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tabular-nums">{avgScore}</div>
            <div className="text-[11px] text-[#A3A3A3] mt-0.5">Points per paper</div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span className="text-xs font-semibold">Accuracy Rate</span>
            <TrendingUp className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tabular-nums">{avgAccuracy}%</div>
            <div className="text-[11px] text-[#A3A3A3] mt-0.5">Correct to total ratio</div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span className="text-xs font-semibold">Active Streak</span>
            <Flame className="w-4 h-4 text-[#FACC15]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tabular-nums">{profile?.streak || 1} Days</div>
            <div className="text-[11px] text-[#A3A3A3] mt-0.5">Consecutive daily drills</div>
          </div>
        </div>
      </div>

      {/* Available Live Mock Tests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#F5F5F5]">Available Mock Examinations</h2>
            <p className="text-xs text-[#A3A3A3]">Select an active test paper to launch the examination player.</p>
          </div>
          <Link href="/mock-tests" className="text-xs font-semibold text-[#FACC15] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-[#0A0A0A] border border-[#262626] animate-pulse" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-8 bg-[#0A0A0A] border border-[#262626] rounded-2xl text-center space-y-3">
            <FileText className="w-8 h-8 text-[#6B6B6B] mx-auto" />
            <h3 className="text-sm font-bold text-[#F5F5F5]">No Published Exams Yet</h3>
            <p className="text-xs text-[#A3A3A3]">Check back soon or explore MCQ practice drills by subject.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.slice(0, 4).map((quiz) => (
              <div
                key={quiz.id}
                className="bg-[#0A0A0A] border border-[#262626] hover:border-[#3F3F3F] rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#121212] border border-[#3F3F3F] text-[#FACC15]">
                      {quiz.type === 'mock' ? 'Mock Test' : 'Quiz'}
                    </span>
                    <span className="text-xs text-[#A3A3A3] flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-[#6B6B6B]" />
                      {quiz.settings?.durationMinutes || 30} mins
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F5F5F5] group-hover:text-[#FACC15] transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-[#A3A3A3] line-clamp-2">{quiz.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#262626]/60">
                  <span className="text-xs text-[#A3A3A3]">{quiz.questionIds?.length || 0} Questions</span>
                  <Link
                    href={`/exam/${quiz.id}/instructions`}
                    className="px-4 py-2 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Start Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Exam Attempt Card */}
      {recentAttempt && (
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F5F5F5]">Latest Attempt Summary</h2>
            <Link href="/history" className="text-xs font-semibold text-[#FACC15] hover:underline">
              View History
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#121212] border border-[#262626]">
            <div>
              <h3 className="text-sm font-bold text-[#F5F5F5]">{recentAttempt.quizTitle}</h3>
              <p className="text-xs text-[#A3A3A3] mt-0.5">
                Submitted on {new Date(recentAttempt.submittedAt || recentAttempt.startedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-[#A3A3A3]">Score</span>
                <div className="text-base font-extrabold text-[#FACC15] tabular-nums">
                  {recentAttempt.score} / {recentAttempt.totalMarks}
                </div>
              </div>

              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-[#A3A3A3]">Accuracy</span>
                <div className="text-base font-extrabold text-[#22C55E] tabular-nums">
                  {recentAttempt.accuracy}%
                </div>
              </div>

              <Link
                href={`/exam/${recentAttempt.quizId}/result?attemptId=${recentAttempt.id}`}
                className="px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#3F3F3F] text-xs font-semibold text-[#F5F5F5] hover:border-[#FACC15] transition-colors"
              >
                Review Answers
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
