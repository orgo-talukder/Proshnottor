'use client';

import React, { useState } from 'react';
import AdminAppShell from '../../../../components/shells/AdminAppShell';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Question, QuestionKey } from '../../../../lib/types';
import { UploadCloud, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function AdminImportQuestionsPage() {
  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleJson = `[
  {
    "stem": "What is the unit of force in the SI system?",
    "subject": "Physics",
    "options": ["Newton", "Joule", "Watt", "Pascal"],
    "correctIndex": 0,
    "explanation": "Newton (N) is the SI unit of force."
  }
]`;

  const handleBatchImport = async () => {
    if (!jsonText.trim()) return;
    setError(null);
    setSuccessCount(null);
    setImporting(true);

    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Input must be a valid JSON array of question objects.');
      }

      let count = 0;
      for (const item of parsed) {
        const qId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const question: Question = {
          id: qId,
          stem: item.stem,
          subject: item.subject || 'General',
          options: item.options.map((optText: string, idx: number) => ({
            id: String(idx),
            text: optText,
          })),
          defaultMarks: item.defaultMarks || 1,
        };

        const key: QuestionKey = {
          id: qId,
          correctIndex: item.correctIndex ?? 0,
          correctOptionIds: [String(item.correctIndex ?? 0)],
          explanation: item.explanation || 'Standard solution explanation.',
        };

        await setDoc(doc(db, 'questions', qId), question);
        await setDoc(doc(db, 'questionKeys', qId), key);
        count++;
      }

      setSuccessCount(count);
      setJsonText('');
    } catch (err: any) {
      console.error('Batch import error:', err);
      setError(err?.message || 'Failed to parse or import questions.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminAppShell pageTitle="Bulk Question Import Wizard">
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">Bulk Question Import Wizard</h1>
          <p className="text-xs text-[#A3A3A3]">Batch upload question stems, option sets, and official server keys via JSON array.</p>
        </div>

        {successCount !== null && (
          <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-2xl text-[#22C55E] text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold block">Import Successful!</span>
              <span>Successfully imported {successCount} question items and answer keys into Cloud Firestore.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-2xl text-[#EF4444] text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold block">Import Failed</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#F5F5F5]">JSON Array Data</label>
            <button
              onClick={() => setJsonText(sampleJson)}
              className="text-xs font-semibold text-[#FACC15] hover:underline"
            >
              Load Sample Template
            </button>
          </div>

          <textarea
            rows={12}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste JSON array here..."
            className="w-full bg-[#121212] border border-[#3F3F3F] focus:border-[#FACC15] rounded-xl p-4 text-xs font-mono text-[#F5F5F5] outline-none"
          />

          <button
            onClick={handleBatchImport}
            disabled={importing || !jsonText.trim()}
            className="w-full py-3 px-4 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {importing ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Execute Batch Import to Firestore</span>
              </>
            )}
          </button>
        </div>
      </div>
    </AdminAppShell>
  );
}
