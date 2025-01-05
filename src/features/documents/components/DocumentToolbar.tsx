'use client';

import React from 'react';

interface DocumentToolbarProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const DocumentToolbar = React.forwardRef<HTMLDivElement, DocumentToolbarProps>(
  ({ children, className = '', ariaLabel = 'Document toolbar' }, ref) => {
    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label={ariaLabel}
        className={`flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md ${className}`}
      >
        {children}
      </div>
    );
  }
);

DocumentToolbar.displayName = 'DocumentToolbar';


