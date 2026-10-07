'use client';

import React, { useEffect, useState } from 'react';
import StudentAppShell from '../../components/shells/StudentAppShell';
import { subscribeToLeaderboard } from '../../lib/firestore-service';
import { UserProfile } from '../../lib/types';
import { Trophy, Flame, Award, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToLeaderboard((list) => {
      setUsers(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <StudentAppShell pageTitle="Examinee Leaderboard">
      <div className="space-y-6">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">Examinee Velocity Ranking</h1>
          <p className="text-xs text-[#A3A3A3]">Rankings based on active streaks and test completions across Bangladesh.</p>
        </div>

        {/* Podium Top 3 */}
        {!loading && users.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto py-2 items-end">
            {/* 2nd Place */}
            <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-4 text-center space-y-2 order-1">
              <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#3F3F3F] text-[#A3A3A3] font-bold text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <span className="text-xs font-bold text-[#F5F5F5] truncate block">{users[1]?.displayName || 'Examinee'}</span>
              <span className="text-[10px] text-[#FACC15] font-semibold flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 fill-[#FACC15]" />
                {users[1]?.streak || 1}d
              </span>
            </div>

            {/* 1st Place */}
            <div className="bg-[#0A0A0A] border-2 border-[#FACC15] rounded-2xl p-5 text-center space-y-2 order-2 relative shadow-xl shadow-[#FACC15]/5">
              <div className="w-12 h-12 rounded-full bg-[#FACC15] text-black font-extrabold text-base flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <span className="text-sm font-bold text-[#F5F5F5] truncate block">{users[0]?.displayName || 'Examinee'}</span>
              <span className="text-xs text-[#FACC15] font-bold flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-[#FACC15]" />
                {users[0]?.streak || 1}d
              </span>
            </div>

            {/* 3rd Place */}
            <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-4 text-center space-y-2 order-3">
              <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#3F3F3F] text-[#A3A3A3] font-bold text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <span className="text-xs font-bold text-[#F5F5F5] truncate block">{users[2]?.displayName || 'Examinee'}</span>
              <span className="text-[10px] text-[#FACC15] font-semibold flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 fill-[#FACC15]" />
                {users[2]?.streak || 1}d
              </span>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#262626] flex items-center justify-between text-xs font-semibold text-[#A3A3A3]">
            <span>Rank & Examinee</span>
            <span>Streak</span>
          </div>

          <div className="divide-y divide-[#262626]">
            {loading ? (
              <div className="p-6 text-center text-xs text-[#A3A3A3]">Loading rankings...</div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#A3A3A3]">No examinees recorded yet.</div>
            ) : (
              users.map((u, idx) => (
                <div key={u.id || idx} className="p-4 flex items-center justify-between hover:bg-[#121212] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-xs font-bold text-[#FACC15] text-center tabular-nums">
                      #{idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#121212] border border-[#3F3F3F] flex items-center justify-center text-xs font-bold text-[#F5F5F5]">
                      {u.displayName?.[0]?.toUpperCase() || 'E'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#F5F5F5] block">{u.displayName || 'Examinee'}</span>
                      <span className="text-[10px] text-[#A3A3A3]">{u.targetExam || 'General'}</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#FACC15] flex items-center gap-1 tabular-nums">
                    <Flame className="w-3.5 h-3.5 fill-[#FACC15]" />
                    {u.streak || 1} Days
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </StudentAppShell>
  );
}
