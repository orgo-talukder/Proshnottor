'use client';

import React, { useState, useMemo } from 'react';
import { Bookmark, Trash2, BookOpen, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Bookmark as BookmarkType, Question, QuestionKey } from '../lib/types';
import MathText from './MathText';

interface BookmarksViewProps {
  bookmarks: BookmarkType[];
  questions: Question[];
  questionKeys: Record<string, QuestionKey>;
  onRemoveBookmark: (questionId: string) => void;
  onNavigateToExams: () => void;
}

export default function BookmarksView({
  bookmarks,
  questions,
  questionKeys,
  onRemoveBookmark,
  onNavigateToExams,
}: BookmarksViewProps) {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Match bookmarks to question objects
  const bookmarkedQuestions = useMemo(() => {
    return bookmarks
      .map((bm) => {
        const q = questions.find((item) => item.id === bm.questionId);
        return {
          bookmark: bm,
          question: q,
          key: q ? questionKeys[q.id] : undefined,
        };
      })
      .filter((item) => item.question !== undefined);
  }, [bookmarks, questions, questionKeys]);

  // Unique subjects
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    bookmarkedQuestions.forEach((item) => {
      if (item.question) set.add(item.question.subject);
    });
    return Array.from(set);
  }, [bookmarkedQuestions]);

  // Filter
  const filtered = useMemo(() => {
    return bookmarkedQuestions.filter((item) => {
      if (subjectFilter !== 'all' && item.question?.subject !== subjectFilter) return false;
      return true;
    });
  }, [bookmarkedQuestions, subjectFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
            Saved Bookmarks
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            Items saved for revision and deliberate practice ({bookmarks.length} saved).
          </p>
        </div>

        {availableSubjects.length > 0 && (
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-[#262626] bg-[#0A0A0A] text-xs text-[#F5F5F5] outline-none focus:border-[#FACC15]"
          >
            <option value="all">All Subjects</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-12 text-center max-w-md mx-auto">
          <Bookmark className="h-10 w-10 text-[#6B6B6B] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#F5F5F5]">No Saved Bookmarks Yet</h3>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Flag questions during exams or solution reviews to save them here for quick revision.
          </p>
          <button
            onClick={onNavigateToExams}
            className="mt-4 h-9 px-4 rounded-xl bg-[#262626] text-xs font-semibold text-white hover:bg-[#333] transition-colors"
          >
            Explore MCQ Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(({ bookmark, question, key }, idx) => {
            if (!question) return null;

            return (
              <div
                key={bookmark.id}
                className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 space-y-4 hover:border-[#3F3F3F] transition-colors"
              >
                {/* Top tags */}
                <div className="flex items-center justify-between text-xs border-b border-[#1C1C1C] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#FACC15] font-bold">#{idx + 1}</span>
                    <span className="font-semibold text-[#FACC15]">{question.subject}</span>
                    <span className="text-[#444]">·</span>
                    <span className="text-[#A3A3A3]">{question.topic}</span>
                  </div>

                  <button
                    onClick={() => onRemoveBookmark(question.id)}
                    className="flex items-center gap-1 text-[11px] text-[#A3A3A3] hover:text-[#EF4444] transition-colors"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                {/* Question Stem */}
                <div className="text-sm text-[#F5F5F5] font-medium leading-relaxed">
                  <MathText text={question.stem} />
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {question.options.map((opt) => {
                    const isCorrect = key?.correctOptionIds.includes(opt.id);

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          isCorrect
                            ? 'border-emerald-800 bg-emerald-950/30 text-emerald-300 font-semibold'
                            : 'border-[#262626] bg-[#000000] text-[#A3A3A3]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono uppercase font-bold text-[11px]">{opt.id}.</span>
                          <MathText text={opt.text} />
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="h-3 w-3" /> Correct Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {key?.explanation && (
                  <div className="rounded-xl border border-[#262626] bg-[#121212] p-3.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#FACC15] mb-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Detailed Explanation:</span>
                    </div>
                    <div className="text-[#CCCCCC] leading-relaxed">
                      <MathText text={key.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
