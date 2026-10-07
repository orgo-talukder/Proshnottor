'use client';

import React, { useEffect, useState } from 'react';
import AdminAppShell from '../../../components/shells/AdminAppShell';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ScrollText, ShieldCheck } from 'lucide-react';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const snap = await getDocs(collection(db, 'logs'));
        const list: any[] = [];
        snap.forEach((d) => list.push({ ...(d.data() as any), id: d.id }));
        setLogs(list);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  return (
    <AdminAppShell pageTitle="System Audit Logs">
      <div className="space-y-6">
        <div className="border-b border-[#262626] pb-4">
          <h1 className="text-xl font-bold text-[#F5F5F5]">System Audit Stream</h1>
          <p className="text-xs text-[#A3A3A3]">Security events, administrative actions, and exam submission audit trails.</p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#262626] flex items-center justify-between text-xs font-semibold text-[#A3A3A3]">
            <span>Event & Action</span>
            <span>Timestamp</span>
          </div>

          <div className="divide-y divide-[#262626]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#A3A3A3]">Loading audit stream...</div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#A3A3A3]">No audit logs recorded yet.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-[#121212] transition-colors text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#F5F5F5]">{log.action || 'SECURITY_EVENT'}</span>
                    <p className="text-[11px] text-[#A3A3A3]">{log.details || log.message || 'System operation executed.'}</p>
                  </div>
                  <span className="text-[10px] text-[#6B6B6B] tabular-nums">{log.timestamp || 'Just now'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminAppShell>
  );
}
