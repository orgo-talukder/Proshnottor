'use client';

import React, { useState } from 'react';
import { Trophy, Medal, Award, Flame, Star, Sparkles } from 'lucide-react';
import { UserProfile } from '../lib/types';

interface LeaderboardViewProps {
  currentUser: UserProfile;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  institution: string;
  scorePct: number;
  totalExams: number;
  streak: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardView({ currentUser }: LeaderboardViewProps) {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'overall'>('weekly');

  const mockLeaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      name: 'Tanvir Hossain',
      institution: 'BUET (Electrical & Electronic)',
      scorePct: 96,
      totalExams: 38,
      streak: 19,
    },
    {
      rank: 2,
      name: 'Nusrat Jahan',
      institution: 'Dhaka Medical College',
      scorePct: 94,
      totalExams: 35,
      streak: 15,
    },
    {
      rank: 3,
      name: 'Argo Talukder',
      institution: currentUser.institution || 'University of Dhaka',
      scorePct: 91,
      totalExams: 28,
      streak: currentUser.streak || 7,
      isCurrentUser: true,
    },
    {
      rank: 4,
      name: 'Shafiqul Islam',
      institution: 'Jahangirnagar University',
      scorePct: 88,
      totalExams: 25,
      streak: 12,
    },
    {
      rank: 5,
      name: 'Farhana Ahmed',
      institution: 'Rajshahi University',
      scorePct: 86,
      totalExams: 22,
      streak: 9,
    },
    {
      rank: 6,
      name: 'Rakibul Hasan',
      institution: 'Khulna University',
      scorePct: 84,
      totalExams: 20,
      streak: 8,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
            Leaderboard Rankings
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            শীর্ষ মেধাবী পরীক্ষার্থীদের র‍্যাঙ্কিং ও ধারাবাহিক পারফরম্যান্স তালিকা।
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
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              period === 'monthly' ? 'bg-[#1C1C1C] text-[#FACC15]' : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod('overall')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              period === 'overall' ? 'bg-[#1C1C1C] text-[#FACC15]' : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            Overall
          </button>
        </div>
      </div>

      {/* Your Standing Banner */}
      <div className="rounded-2xl border border-[#FACC15]/30 bg-[#0F0E08] p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-[#FACC15] text-black font-extrabold flex items-center justify-center text-sm shadow">
            #3
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FACC15]">
              আপনার অবস্থান (Your Position)
            </span>
            <h3 className="text-sm font-bold text-[#F5F5F5]">{currentUser.displayName}</h3>
            <p className="text-xs text-[#A3A3A3]">
              স্কোর: ৯১% · স্ট্রিক: {currentUser.streak || 7} দিন
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-[#FACC15] bg-[#FACC15]/10 px-3 py-1 rounded-lg border border-[#FACC15]/30">
          Top 1% Percentile
        </span>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] overflow-hidden">
        <div className="p-4 border-b border-[#262626] bg-[#0F0F0F] flex items-center justify-between text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
          <div className="w-16">Rank</div>
          <div className="flex-1">Student / Examinee</div>
          <div className="hidden sm:block w-24 text-right">Streak</div>
          <div className="w-20 text-right">Score</div>
        </div>

        <div className="divide-y divide-[#1C1C1C]">
          {mockLeaderboard.map((user) => {
            const isTop3 = user.rank <= 3;

            return (
              <div
                key={user.rank}
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

                {/* Name & Institution */}
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
                  <p className="text-[11px] text-[#A3A3A3] truncate">{user.institution}</p>
                </div>

                {/* Streak */}
                <div className="hidden sm:flex w-24 justify-end items-center gap-1 text-[#A3A3A3] font-mono">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  <span>{user.streak}d</span>
                </div>

                {/* Score */}
                <div className="w-20 text-right">
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
      </div>
    </div>
  );
}
