'use client';

import React from 'react';
import { MarketingNavbar } from './Navbar';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
