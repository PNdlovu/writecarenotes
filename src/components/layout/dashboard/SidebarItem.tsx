/**
 * @writecarenotes.com
 * @fileoverview Individual sidebar navigation item component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
  isActive: boolean;
  color?: string;
  bgColor?: string;
}

export function SidebarItem({ 
  name, 
  href, 
  icon: Icon, 
  description,
  isActive,
  color = 'text-muted-foreground',
  bgColor = 'bg-transparent'
}: SidebarItemProps) {
  if (!Icon) return null;
  
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
        isActive ? "bg-accent-foreground/10" : bgColor
      )}>
        <Icon className={cn(
          "h-5 w-5 shrink-0",
          isActive ? "text-accent-foreground" : color
        )} />
      </div>
      <div className="flex flex-col">
        <span className="truncate">{name}</span>
        <span className="text-xs text-muted-foreground truncate hidden group-hover:block">
          {description}
        </span>
      </div>
    </Link>
  );
} 