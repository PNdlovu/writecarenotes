import React from 'react';
import { ErrorBoundary } from '@/error/components/ErrorBoundary';
import { Sidebar } from '@/navigation/components/Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ErrorBoundary componentName="DashboardLayout">
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">
            <ErrorBoundary componentName="DashboardContent">
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}


