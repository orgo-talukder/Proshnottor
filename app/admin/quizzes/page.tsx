'use client';

import React, { useEffect, useState } from 'react';
import AdminAppShell from '../../../components/shells/AdminAppShell';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Quiz, Question } from '../../../lib/types';
import { FileText, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Quiz Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'mock' | 'quiz'>('mock');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [negativeRatio, setNegativeRatio] = useState(0.25);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const zSnap = await getDocs(collection(db, 'quizzes'));
      const zList: Quiz[] = [];
      zSnap.forEach((d) => zList.push({ ...(d.data() as Quiz), id: d.id }));

      const qSnap = await getDocs(collection(db, 'questions'));
      const qList: Question[] = [];
      qSnap.forEach((d) => qList.push({ ...(d.data() as Question), id: d.id }));

      setQuizzes(zList);
      setQuestions(qList);
    } catch (err) {
      console.error('Failed to load admin quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || selectedQuestionIds.length === 0) return;
    setSaving(true);

    const quizId = `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newQuiz: Quiz = {
      id: quizId,
      title,
      description,
      type,
      status: 'published',
      questionIds: selectedQuestionIds,
      settings: {
        durationMinutes,
        shuffleQuestions: true,
        showInstantExplanation: false,
        totalMarks: selectedQuestionIds.length,
        negativeRatio,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'quizzes', quizId), newQuiz);
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setSelectedQuestionIds([]);
      fetchData();
    } catch (err) {
      console.error('Failed to create quiz:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test paper?')) return;
    try {
      await deleteDoc(doc(db, 'quizzes', id));
      fetchData();
    } catch (err) {
      console.error('Delete quiz error:', err);
    }
  };

  const toggleQuestionSelect = (qId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  return (
    <AdminAppShell pageTitle="Mock Tests & Quizzes Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
          <div>
            <h1 className="text-xl font-bold text-[#F5F5F5]">Mock Tests & Quizzes Manager</h1>
            <p className="text-xs text-[#A3A3A3]">Publish examination papers and select questions from repository.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Test Paper</span>
          </button>
        </div>

        {/* Quizzes List */}
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl divide-y divide-[#262626]">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#A3A3A3]">Loading test papers...</div>
          ) : quizzes.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#A3A3A3]">No published test papers found.</div>
          ) : (
            quizzes.map((q) => (
              <div key={q.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#121212] border border-[#3F3F3F] text-[#FACC15]">
                      {q.type}
                    </span>
                    <span className="text-xs text-[#A3A3A3] tabular-nums">
                      {q.settings?.durationMinutes || 30} mins
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F5F5F5]">{q.title}</h3>
                  <p className="text-xs text-[#A3A3A3]">{q.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#A3A3A3] tabular-nums">
                    {q.questionIds?.length || 0} Questions
                  </span>

                  <button
                    onClick={() => handleDeleteQuiz(q.id)}
                    className="p-1.5 rounded-lg bg-[#121212] border border-[#262626] text-[#A3A3A3] hover:text-[#EF4444] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Quiz Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-xl w-full bg-[#0A0A0A] border border-[#3F3F3F] rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#F5F5F5]">Create Examination Paper</h3>

            <form onSubmit={handleCreateQuiz} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A3A3A3] mb-1 font-semibold">Test Paper Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Physics & Mechanics Mock Paper"
                  className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl p-2.5 text-[#F5F5F5] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A3A3A3] mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl p-2.5 text-[#F5F5F5] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A3A3A3] mb-1 font-semibold">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-[#121212] border border-[#3F3F3F] rounded-xl p-2 text-[#F5F5F5] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A3A3A3] mb-1 font-semibold">Exam Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#121212] border border-[#3F3F3F] rounded-xl p-2 text-[#FACC15] font-bold outline-none"
                  >
                    <option value="mock">Full Mock Test</option>
                    <option value="quiz">Rapid Topic Quiz</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#A3A3A3] mb-1 font-semibold">
                  Select Questions from Repository ({selectedQuestionIds.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto bg-[#121212] border border-[#3F3F3F] rounded-xl p-2 space-y-1">
                  {questions.map((q) => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleQuestionSelect(q.id)}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-[#FACC15]/20 text-[#FACC15]' : 'hover:bg-[#1A1A1A] text-[#A3A3A3]'
                        }`}
                      >
                        <span className="truncate pr-2 font-medium">{q.stem}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-[#FACC15]" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#121212] border border-[#3F3F3F] text-[#A3A3A3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || selectedQuestionIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#FACC15] text-black font-bold flex items-center gap-1 disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish Test Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminAppShell>
  );
}
