/**
 * WriteCareNotes.com
 * @fileoverview Marketing Navbar Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/error/components/ErrorBoundary';
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Resources', href: '/resources' },
  { name: 'Support', href: '/support' },
  { name: 'Branding', href: '/assets/brand/guidelines' },
];

export function MarketingNavbar() {
  const pathname = usePathname();

  return (
    <ErrorBoundary componentName="MarketingNavbar">
      <header className="sticky top-0 w-full py-4 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between" aria-label="Global">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="sr-only">Write Care Notes</span>
              <Image
                src="/images/logo.png"
                alt="Write Care Notes Logo"
                width={200}
                height={45}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-base text-gray-600 hover:text-gray-900",
                    pathname === item.href && "text-gray-900"
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {/* Sign In Button */}
              <Button asChild variant="outline">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>
    </ErrorBoundary>
  );
}
