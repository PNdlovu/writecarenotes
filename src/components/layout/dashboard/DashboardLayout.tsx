'use client';

import { useState } from 'react';
import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { LoggedInNav } from '../navbar/LoggedInNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <LoggedInNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
