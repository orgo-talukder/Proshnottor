'use client';

import React, { useEffect, useState } from 'react';
import StudentAppShell from '../../components/shells/StudentAppShell';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Question } from '../../lib/types';
import { HelpCircle, Search, Filter, Bookmark, Check, X, ArrowRight, RefreshCw } from 'lucide-react';

export default function MCQPracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Practice drill interactive state
  const [userSelections, setUserSelections] = useState<Record<string, string>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadQuestions() {
      try {
        const snap = await getDocs(collection(db, 'questions'));
        const list: Question[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as Question), id: d.id });
        });
        setQuestions(list);
      } catch (err) {
        console.error('Failed to load MCQ practice questions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  const subjects = ['All Subjects', ...Array.from(new Set(questions.map((q) => q.subject).filter(Boolean)))];

  const filteredQuestions = questions.filter((q) => {
    const matchesSubject = selectedSubject === 'All Subjects' || q.subject === selectedSubject;
    const matchesSearch = !searchQuery || q.stem?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const handleSelectOption = (qId: string, optKey: string) => {
    setUserSelections((prev) => ({ ...prev, [qId]: optKey }));
    setShowExplanations((prev) => ({ ...prev, [qId]: true }));
  };

  return (
    <StudentAppShell pageTitle="MCQ Practice Drills">
      <div className="space-y-6">
        {/* Top Header & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
          <div>
            <h1 className="text-xl font-bold text-[#F5F5F5]">Unlimited Subject MCQ Practice</h1>
            <p className="text-xs text-[#A3A3A3]">Interactive instant feedback questions by subject and topic.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search question stems..."
                className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#FACC15] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F5F5] placeholder-[#6B6B6B] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSubject === sub
                  ? 'bg-[#FACC15] text-black font-bold'
                  : 'bg-[#0A0A0A] border border-[#262626] text-[#A3A3A3] hover:text-[#F5F5F5]'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Questions Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-[#0A0A0A] border border-[#262626] animate-pulse" />
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-8 bg-[#0A0A0A] border border-[#262626] rounded-2xl text-center space-y-3 max-w-md mx-auto my-8">
            <HelpCircle className="w-8 h-8 text-[#6B6B6B] mx-auto" />
            <h3 className="text-sm font-bold text-[#F5F5F5]">No Matching Questions</h3>
            <p className="text-xs text-[#A3A3A3]">Try clearing your search filter or selecting another subject.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((q, idx) => {
              const selectedOpt = userSelections[q.id];
              const isAnswered = selectedOpt !== undefined;

              return (
                <div key={q.id} className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#121212] border border-[#3F3F3F] text-[#FACC15]">
                        {q.subject || 'General'}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-[#F5F5F5] leading-relaxed pt-1">
                        {idx + 1}. {q.stem}
                      </h3>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    {q.options?.map((opt, optIdx) => {
                      const optKey = String(optIdx);
                      const isChosen = selectedOpt === optKey;

                      return (
                        <div
                          key={opt.id || optIdx}
                          onClick={() => handleSelectOption(q.id, optKey)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isChosen
                              ? 'bg-[#121212] border-[#FACC15] ring-1 ring-[#FACC15]'
                              : 'bg-[#0A0A0A] border-[#262626] hover:border-[#3F3F3F] hover:bg-[#121212]'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 ${
                              isChosen
                                ? 'bg-[#FACC15] text-black border-[#FACC15]'
                                : 'bg-[#121212] text-[#A3A3A3] border-[#3F3F3F]'
                            }`}
                          >
                            {['A', 'B', 'C', 'D'][optIdx] || optIdx + 1}
                          </div>
                          <span className="text-xs sm:text-sm text-[#F5F5F5] font-medium">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Toggle */}
                  {isAnswered && (
                    <div className="p-3.5 bg-[#121212] border border-[#262626] rounded-xl space-y-1 text-xs text-[#A3A3A3]">
                      <span className="font-bold text-[#FACC15] block">Practice Tip:</span>
                      <p className="leading-relaxed">Selection recorded. Detailed server solution and topic breakdown available in submitted exam result sheets.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentAppShell>
  );
}
