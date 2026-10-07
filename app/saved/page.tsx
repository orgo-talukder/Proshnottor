'use client';

import React, { useEffect, useState } from 'react';
import StudentAppShell from '../../components/shells/StudentAppShell';
import { useAuth } from '../../lib/auth-context';
import { subscribeToUserBookmarks } from '../../lib/firestore-service';
import { Bookmark, HelpCircle } from 'lucide-react';

export default function SavedQuestionsPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToUserBookmarks(user.uid, (list) => {
      setBookmarks(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  return (
    <StudentAppShell pageTitle="Bookmarked Questions">
      <div className="space-y-6">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">Saved Revision Items</h1>
          <p className="text-xs text-[#A3A3A3]">Questions flagged for revision during practice drills and mock tests.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-[#0A0A0A] border border-[#262626] animate-pulse" />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="p-8 bg-[#0A0A0A] border border-[#262626] rounded-2xl text-center space-y-3 max-w-md mx-auto my-8">
            <Bookmark className="w-8 h-8 text-[#6B6B6B] mx-auto" />
            <h3 className="text-sm font-bold text-[#F5F5F5]">No Saved Questions</h3>
            <p className="text-xs text-[#A3A3A3]">Flag items for review during tests to save them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bm) => (
              <div key={bm.id} className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#262626] space-y-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#121212] border border-[#3F3F3F] text-[#FACC15]">
                  {bm.subject || 'General'}
                </span>
                <p className="text-xs font-semibold text-[#F5F5F5] pt-1">
                  Question ID: {bm.questionId}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentAppShell>
  );
}
