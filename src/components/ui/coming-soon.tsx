'use client';

import { Clock } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="rounded-full bg-muted p-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground max-w-md">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
