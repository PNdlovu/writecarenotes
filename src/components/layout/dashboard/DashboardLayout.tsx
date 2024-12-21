'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import UserMenu from './UserMenu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Navbar onMenuButtonClick={() => setSidebarOpen(true)}>
          <UserMenu />
        </Navbar>
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
