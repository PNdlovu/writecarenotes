'use client';

import { DashboardNav } from "@/components/shell/dashboard-nav";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("@/components/layouts/Sidebar"), {
  ssr: false,
});

export default function EnglandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }>
        <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <Sidebar />
          </aside>
          <main className="flex w-full flex-col overflow-hidden">
            <div className="flex-1 min-h-[calc(100vh-4rem)]">
              {children}
            </div>
          </main>
        </div>
      </Suspense>
    </div>
  );
}
