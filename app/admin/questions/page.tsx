'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminAppShell from '../../../components/shells/AdminAppShell';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Question, QuestionKey } from '../../../lib/types';
import { FileQuestion, Plus, Trash2, Edit3, Search, UploadCloud, CheckCircle2 } from 'lucide-react';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [keysMap, setKeysMap] = useState<Record<string, QuestionKey>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State for adding single question
  const [showAddModal, setShowAddModal] = useState(false);
  const [stem, setStem] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchQuestionsAndKeys = async () => {
    try {
      const qSnap = await getDocs(collection(db, 'questions'));
      const qList: Question[] = [];
      qSnap.forEach((d) => qList.push({ ...(d.data() as Question), id: d.id }));

      const kSnap = await getDocs(collection(db, 'questionKeys'));
      const kMap: Record<string, QuestionKey> = {};
      kSnap.forEach((d) => (kMap[d.id] = d.data() as QuestionKey));

      setQuestions(qList);
      setKeysMap(kMap);
    } catch (err) {
      console.error('Failed to load admin questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const qSnap = await getDocs(collection(db, 'questions'));
        const qList: Question[] = [];
        qSnap.forEach((d) => qList.push({ ...(d.data() as Question), id: d.id }));

        const kSnap = await getDocs(collection(db, 'questionKeys'));
        const kMap: Record<string, QuestionKey> = {};
        kSnap.forEach((d) => (kMap[d.id] = d.data() as QuestionKey));

        setQuestions(qList);
        setKeysMap(kMap);
      } catch (err) {
        console.error('Failed to load admin questions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stem || !opt0 || !opt1) return;
    setSaving(true);

    const qId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newQuestion: Question = {
      id: qId,
      stem,
      subject,
      options: [
        { id: '0', text: opt0 },
        { id: '1', text: opt1 },
        { id: '2', text: opt2 || 'None of the above' },
        { id: '3', text: opt3 || 'All of the above' },
      ],
      defaultMarks: 1,
    };

    const newKey: QuestionKey = {
      id: qId,
      correctIndex,
      correctOptionIds: [String(correctIndex)],
      explanation: explanation || 'Standard solution explanation.',
    };

    try {
      await setDoc(doc(db, 'questions', qId), newQuestion);
      await setDoc(doc(db, 'questionKeys', qId), newKey);
      setShowAddModal(false);
      setStem('');
      setOpt0('');
      setOpt1('');
      setOpt2('');
      setOpt3('');
      setExplanation('');
      fetchQuestionsAndKeys();
    } catch (err) {
      console.error('Failed to save question:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteDoc(doc(db, 'questions', qId));
      await deleteDoc(doc(db, 'questionKeys', qId));
      fetchQuestionsAndKeys();
    } catch (err) {
      console.error('Delete question error:', err);
    }
  };

  const filtered = questions.filter(
    (q) => !searchQuery || q.stem?.toLowerCase().includes(searchQuery.toLowerCase()) || q.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminAppShell pageTitle="Question Repository">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
          <div>
            <h1 className="text-xl font-bold text-[#F5F5F5]">Question Repository</h1>
            <p className="text-xs text-[#A3A3A3]">Manage item stems, options, and official server answer keys.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Single Question</span>
            </button>
            <Link
              href="/admin/questions/import"
              className="px-4 py-2 rounded-xl bg-[#121212] border border-[#3F3F3F] hover:border-[#FACC15] text-[#FACC15] font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Bulk CSV Import</span>
            </Link>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stems or subjects..."
            className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#FACC15] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F5F5F5] placeholder-[#6B6B6B] outline-none"
          />
        </div>

        {/* Questions Table */}
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#262626] flex items-center justify-between text-xs font-semibold text-[#A3A3A3]">
            <span>Question Item Stem</span>
            <span>Subject & Key</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-[#262626]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#A3A3A3]">Loading question bank...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#A3A3A3]">No questions found in repository.</div>
            ) : (
              filtered.map((q) => {
                const keyObj = keysMap[q.id];
                const correctIdx = keyObj?.correctIndex ?? 0;

                return (
                  <div key={q.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#121212] transition-colors">
                    <div className="space-y-1 max-w-xl">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#121212] border border-[#3F3F3F] text-[#FACC15]">
                        {q.subject || 'General'}
                      </span>
                      <h4 className="text-xs font-bold text-[#F5F5F5]">{q.stem}</h4>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-[#22C55E] font-semibold bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-1 rounded-lg">
                        Key: {['A', 'B', 'C', 'D'][correctIdx] || correctIdx + 1}
                      </span>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg bg-[#121212] border border-[#262626] text-[#A3A3A3] hover:text-[#EF4444] hover:border-[#EF4444] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Single Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-xl w-full bg-[#0A0A0A] border border-[#3F3F3F] rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#F5F5F5]">Create Single Question Item</h3>

            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A3A3A3] mb-1 font-semibold">Subject Name</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Physics / General Knowledge"
                  className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl px-3 py-2 text-[#F5F5F5] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A3A3A3] mb-1 font-semibold">Question Stem Text</label>
                <textarea
                  required
                  rows={3}
                  value={stem}
                  onChange={(e) => setStem(e.target.value)}
                  placeholder="Enter the question stem text..."
                  className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl p-3 text-[#F5F5F5] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A3A3A3] mb-1">Option A</label>
                  <input
                    type="text"
                    required
                    value={opt0}
                    onChange={(e) => setOpt0(e.target.value)}
                    className="w-full bg-[#121212] border border-[#3F3F3F] rounded-xl p-2 text-[#F5F5F5] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#A3A3A3] mb-1">Option B</label>
                  <input
                    type="text"
                    required
                    value={opt1}
                    onChange={(e) => setOpt1(e.target.value)}
                    className="w-full bg-[#121212] border border-[#3F3F3F] rounded-xl p-2 text-[#F5F5F5] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#A3A3A3] mb-1">Option C</label>
                  <input
                    type="text"
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    className="w-full bg-[#121212] border border-[#3F3F3F] rounded-xl p-2 text-[#F5F5F5] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#A3A3A3] mb-1">Option D</label>
                  <input
                    type="text"
                    value={opt3}
                    onChange={(e) => setOpt3(e.target.value)}
                    className="w-full bg-[#121212] border border-[#3F3F3F] rounded-xl p-2 text-[#F5F5F5] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A3A3A3] mb-1 font-semibold">Correct Option Key</label>
                <select
                  value={correctIndex}
                  onChange={(e) => setCorrectIndex(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-[#3F3F3F] rounded-xl p-2 text-[#FACC15] font-bold outline-none"
                >
                  <option value={0}>Option A (Index 0)</option>
                  <option value={1}>Option B (Index 1)</option>
                  <option value={2}>Option C (Index 2)</option>
                  <option value={3}>Option D (Index 3)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A3A3A3] mb-1 font-semibold">Official Explanation</label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Detailed solution breakdown..."
                  className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl p-2 text-[#F5F5F5] outline-none"
                />
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
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#FACC15] text-black font-bold flex items-center gap-1"
                >
                  {saving ? 'Saving...' : 'Save Question Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminAppShell>
  );
}
