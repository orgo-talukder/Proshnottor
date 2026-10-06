'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Medal, Award, Flame, Star, Sparkles, UserCheck } from 'lucide-react';
import { UserProfile } from '../lib/types';
import { subscribeToLeaderboard } from '../lib/firestore-service';

interface LeaderboardViewProps {
  currentUser: UserProfile;
}

interface DynamicLeaderboardEntry {
  rank: number;
  uid: string;
  name: string;
  email: string;
  scorePct: number;
  totalExams: number;
  streak: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardView({ currentUser }: LeaderboardViewProps) {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'overall'>('weekly');
  const [cloudUsers, setCloudUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real Firestore users in real-time
  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((users) => {
      setCloudUsers(users);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Compute live rankings
  const leaderboardList: DynamicLeaderboardEntry[] = useMemo(() => {
    // Build combined user list ensuring current user is present
    const userMap = new Map<string, DynamicLeaderboardEntry>();

    cloudUsers.forEach((u) => {
      const avgScore =
        u.totalExamsTaken && u.totalExamsTaken > 0 && typeof u.totalScore === 'number'
          ? Math.round(u.totalScore / u.totalExamsTaken)
          : (u.averageAccuracy || 0);

      userMap.set(u.uid || u.email, {
        rank: 0,
        uid: u.uid || u.email,
        name: u.displayName || u.email?.split('@')[0] || 'শিক্ষার্থী',
        email: u.email,
        scorePct: avgScore,
        totalExams: u.totalExamsTaken || 0,
        streak: u.streak || 1,
        isCurrentUser: Boolean(
          (u.uid && u.uid === currentUser.uid) || (u.email && u.email === currentUser.email)
        ),
      });
    });

    // Ensure current user is in map
    if (currentUser && !userMap.has(currentUser.uid || currentUser.email)) {
      userMap.set(currentUser.uid || currentUser.email, {
        rank: 0,
        uid: currentUser.uid || currentUser.id || currentUser.email,
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'আপনি (You)',
        email: currentUser.email,
        scorePct: currentUser.averageAccuracy || 0,
        totalExams: currentUser.totalExamsTaken || 0,
        streak: currentUser.streak || 1,
        isCurrentUser: true,
      });
    }

    // Sort by Streak desc, then Score desc, then Total Exams desc
    const sorted = Array.from(userMap.values()).sort((a, b) => {
      if (b.streak !== a.streak) return b.streak - a.streak;
      if (b.scorePct !== a.scorePct) return b.scorePct - a.scorePct;
      return b.totalExams - a.totalExams;
    });

    return sorted.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  }, [cloudUsers, currentUser]);

  // Current user's standing
  const myStanding = useMemo(() => {
    const found = leaderboardList.find((e) => e.isCurrentUser);
    if (found) return found;
    return {
      rank: 1,
      name: currentUser.displayName || 'আপনি',
      scorePct: currentUser.averageAccuracy || 0,
      streak: currentUser.streak || 1,
      totalExams: currentUser.totalExamsTaken || 0,
    };
  }, [leaderboardList, currentUser]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
            Leaderboard Rankings
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            শীর্ষ মেধাবী পরীক্ষার্থীদের লাইভ র‍্যাঙ্কিং ও ধারাবাহিক পারফরম্যান্স তালিকা (Cloud Firestore Live Data)।
          </p>
        </div>

        {/* Period Selector (Weekly, Monthly, Overall) */}
        <div className="flex items-center gap-1 p-1 bg-[#0A0A0A] border border-[#262626] rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              period === 'weekly' ? 'bg-[#1C1C1C] text-[#FACC15]' : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            সাপ্তাহিক (Weekly)
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              period === 'monthly' ? 'bg-[#1C1C1C] text-[#FACC15]' : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            মাসিক (Monthly)
          </button>
          <button
            onClick={() => setPeriod('overall')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              period === 'overall' ? 'bg-[#1C1C1C] text-[#FACC15]' : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            সর্বকালীন (Overall)
          </button>
        </div>
      </div>

      {/* Your Standing Banner */}
      <div className="rounded-2xl border border-[#FACC15]/30 bg-[#0F0E08] p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-[#FACC15] text-black font-extrabold flex items-center justify-center text-sm shadow">
            #{myStanding.rank}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FACC15]">
              আপনার অবস্থান (Your Position)
            </span>
            <h3 className="text-sm font-bold text-[#F5F5F5]">{myStanding.name}</h3>
            <p className="text-xs text-[#A3A3A3]">
              গড় স্কোর: {myStanding.scorePct}% · স্ট্রিক: {myStanding.streak} দিন · মোট পরীক্ষা: {myStanding.totalExams} টি
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-[#FACC15] bg-[#FACC15]/10 px-3 py-1.5 rounded-lg border border-[#FACC15]/30 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Rank #{myStanding.rank}</span>
        </span>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] overflow-hidden">
        <div className="p-4 border-b border-[#262626] bg-[#0F0F0F] flex items-center justify-between text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
          <div className="w-16">Rank</div>
          <div className="flex-1">Student / Examinee</div>
          <div className="hidden sm:block w-24 text-right">Streak</div>
          <div className="w-24 text-right">Score / Exams</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#6B6B6B] space-y-2">
            <div className="h-6 w-6 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>লাইভ লিডারবোর্ড লোড হচ্ছে...</p>
          </div>
        ) : leaderboardList.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B6B6B]">
            কোনো পরীক্ষার্থীর তথ্য পাওয়া যায়নি।
          </div>
        ) : (
          <div className="divide-y divide-[#1C1C1C]">
            {leaderboardList.map((user) => {
              return (
                <div
                  key={user.uid || user.email}
                  className={`p-4 flex items-center justify-between text-xs transition-colors ${
                    user.isCurrentUser ? 'bg-[#12120A] border-l-2 border-[#FACC15]' : 'hover:bg-[#121212]'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="w-16 flex items-center">
                    {user.rank === 1 ? (
                      <span className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center border border-amber-500/40">
                        🥇 1
                      </span>
                    ) : user.rank === 2 ? (
                      <span className="h-7 w-7 rounded-lg bg-slate-400/20 text-slate-200 font-bold flex items-center justify-center border border-slate-400/40">
                        🥈 2
                      </span>
                    ) : user.rank === 3 ? (
                      <span className="h-7 w-7 rounded-lg bg-amber-700/20 text-amber-500 font-bold flex items-center justify-center border border-amber-700/40">
                        🥉 3
                      </span>
                    ) : (
                      <span className="h-7 w-7 rounded-lg bg-[#141414] text-[#A3A3A3] font-bold font-mono flex items-center justify-center">
                        #{user.rank}
                      </span>
                    )}
                  </div>

                  {/* Name & Email */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#F5F5F5] truncate">
                        {user.name}
                      </span>
                      {user.isCurrentUser && (
                        <span className="text-[10px] font-bold bg-[#FACC15] text-black px-1.5 py-0.2 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A3A3A3] truncate font-mono">
                      {user.email ? `${user.email.substring(0, 3)}***@${user.email.split('@')[1] || ''}` : 'বিসিএস পরীক্ষার্থী'}
                    </p>
                  </div>

                  {/* Streak */}
                  <div className="hidden sm:flex w-24 justify-end items-center gap-1 text-[#A3A3A3] font-mono">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                    <span>{user.streak}d</span>
                  </div>

                  {/* Score */}
                  <div className="w-24 text-right">
                    <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                      {user.scorePct}%
                    </span>
                    <span className="text-[10px] text-[#6B6B6B] block">
                      {user.totalExams} tests
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
