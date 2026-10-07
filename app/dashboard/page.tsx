'use client';

import React from 'react';
import StudentAppShell from '../../components/shells/StudentAppShell';
import DashboardView from '../../components/views/DashboardView';

export default function DashboardPage() {
  return (
    <StudentAppShell pageTitle="Examinee Dashboard">
      <DashboardView />
    </StudentAppShell>
  );
}
