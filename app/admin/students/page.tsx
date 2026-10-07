'use client';

import React, { useEffect, useState } from 'react';
import AdminAppShell from '../../../components/shells/AdminAppShell';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { UserProfile } from '../../../lib/types';
import { Users, ShieldCheck, Flame, Search } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const list: UserProfile[] = [];
        snap.forEach((d) => list.push({ ...(d.data() as UserProfile), id: d.id }));
        setStudents(list);
      } catch (err) {
        console.error('Failed to load student profiles:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  const filtered = students.filter(
    (s) => !searchQuery || s.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminAppShell pageTitle="Registered Student Users">
      <div className="space-y-6">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">Examinee User Accounts</h1>
          <p className="text-xs text-[#A3A3A3]">View registered student accounts, target preferences, and streak activity.</p>
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name or email..."
            className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#FACC15] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F5F5F5] placeholder-[#6B6B6B] outline-none"
          />
        </div>

        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#262626] flex items-center justify-between text-xs font-semibold text-[#A3A3A3]">
            <span>Examinee Profile</span>
            <span>Target & Activity</span>
          </div>

          <div className="divide-y divide-[#262626]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#A3A3A3]">Loading student profiles...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#A3A3A3]">No student records found.</div>
            ) : (
              filtered.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-[#121212] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#121212] border border-[#3F3F3F] flex items-center justify-center text-xs font-bold text-[#FACC15]">
                      {s.displayName?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#F5F5F5]">{s.displayName || 'Student'}</h4>
                      <span className="text-[10px] text-[#A3A3A3] block">{s.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#A3A3A3]">{s.targetExam || 'General'}</span>
                    <span className="font-bold text-[#FACC15] flex items-center gap-1 tabular-nums">
                      <Flame className="w-3.5 h-3.5 fill-[#FACC15]" />
                      {s.streak || 1}d
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminAppShell>
  );
}
