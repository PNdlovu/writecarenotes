'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/error/components/ErrorBoundary';

export function MarketingNavbar() {
  const pathname = usePathname();
  const isPublicLanding = pathname === '/';

  return (
    <ErrorBoundary componentName="MarketingNavbar">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt="Write Care Notes"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="font-bold">Write Care Notes</span>
            </Link>
          </div>
          {!isPublicLanding && (
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <nav className="flex items-center space-x-6">
                <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
                  About
                </Link>
                <Link href="/pricing" className="text-sm font-medium transition-colors hover:text-primary">
                  Pricing
                </Link>
                <Link href="/demo" className="text-sm font-medium transition-colors hover:text-primary">
                  Request Demo
                </Link>
              </nav>
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </ErrorBoundary>
  );
}
