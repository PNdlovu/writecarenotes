'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

interface ComingSoonProps {
  feature: string;
}

export function ComingSoon({ feature }: ComingSoonProps) {
  return (
    <div className="p-6">
      <Alert>
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          The {feature} feature is currently under development. Check back soon!
        </AlertDescription>
      </Alert>
    </div>
  );
}


