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
  { name: 'Branding', href: '/brand/guidelines' },
];

export function MarketingNavbar() {
  const pathname = usePathname();

  return (
    <ErrorBoundary componentName="Navbar">
      <header className="sticky top-0 w-full py-4 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <nav className="flex items-center justify-between space-x-4" aria-label="Global">
            {/* Logo */}
            <div className="flex lg:flex-1">
              <Link href="/" className="-m-1.5 p-1.5">
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
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex md:gap-x-8 justify-center flex-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4 justify-end lg:flex-1">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">
                  Get started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </ErrorBoundary>
  );
}
