'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
}

export function SidebarItem({ name, href, icon: Icon, isActive }: SidebarItemProps) {
  if (!Icon) return null;
  
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{name}</span>
    </Link>
  );
} 