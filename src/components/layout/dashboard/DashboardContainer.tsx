'use client';

interface DashboardContainerProps {
  children?: React.ReactNode;
}

export function DashboardContainer({ children }: DashboardContainerProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6 container mx-auto max-w-7xl">
      {children}
    </div>
  );
}
