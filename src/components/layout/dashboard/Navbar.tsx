'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccessibilitySettings } from '@/components/theme/accessibility-settings';
import { UserMenu } from './UserMenu';

interface NavbarProps {
  onMenuButtonClick: () => void;
  children?: React.ReactNode;
}

export default function Navbar({ onMenuButtonClick, children }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={onMenuButtonClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <img
              src="/logo.svg"
              alt="Write Care Notes"
              className="h-6 w-6"
            />
            <span className="hidden font-bold sm:inline-block">
              Write Care Notes
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <AccessibilitySettings />
          {session?.user && <UserMenu />}
        </div>
      </div>
    </nav>
  );
}
