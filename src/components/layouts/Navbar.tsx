'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import UserMenu from './UserMenu';

interface NavbarProps {
  onMenuButtonClick: () => void;
}

export default function Navbar({ onMenuButtonClick }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                type="button"
                className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                onClick={onMenuButtonClick}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex items-center">
            {session ? (
              <UserMenu />
            ) : (
              <Button onClick={() => signOut()}>Sign Out</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
