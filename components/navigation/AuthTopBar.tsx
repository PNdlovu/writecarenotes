/**
 * @writecarenotes.com
 * @fileoverview Simplified top bar for authentication pages
 * @version 1.0.0
 * @created 2025-01-03
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';

export function AuthTopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="WriteCareNotes Logo"
            width={180}
            height={48}
            className="h-12 w-auto"
            priority
          />
        </Link>
        
        <Link
          href="/auth/signup"
          className="rounded-lg bg-[#34B5B5] px-4 py-2 text-sm font-medium text-white hover:bg-[#2A9090] focus:outline-none focus:ring-2 focus:ring-[#34B5B5] focus:ring-offset-2"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}
