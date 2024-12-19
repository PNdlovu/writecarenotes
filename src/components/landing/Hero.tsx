'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Streamline Your Care Home Management
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Comprehensive care home management solution that helps you provide better care,
            manage resources efficiently, and ensure compliance with regulations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/demo">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Request Demo
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline">Get Started</Button>
            </Link>
            <Link 
              href="/features" 
              className="text-sm font-semibold leading-6 text-foreground hover:text-primary"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </div>
  );
}
