import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  ClipboardList,
  Bell,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
} from 'lucide-react';

const modules = [
  {
    name: 'Resident Management',
    href: '/features/modules/residents',
    icon: Users,
  },
  {
    name: 'Staff Scheduling',
    href: '/features/modules/scheduling',
    icon: Calendar,
  },
  {
    name: 'Care Planning',
    href: '/features/modules/care-plans',
    icon: ClipboardList,
  },
  {
    name: 'Incident Reporting',
    href: '/features/modules/incidents',
    icon: Bell,
  },
  {
    name: 'Documentation',
    href: '/features/modules/documents',
    icon: FileText,
  },
  {
    name: 'Communication',
    href: '/features/modules/communication',
    icon: MessageSquare,
  },
  {
    name: 'Property Management',
    href: '/features/modules/property',
    icon: Building2,
  },
  {
    name: 'Settings',
    href: '/features/modules/settings',
    icon: Settings,
  },
];

export function ModuleNavigation() {
  const pathname = usePathname();

  return (
    <nav className="overflow-x-auto py-4 bg-background border-b">
      <div className="container px-4">
        <div className="flex space-x-4">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = pathname === module.href;
            
            return (
              <Link
                key={module.href}
                href={module.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap",
                  "hover:bg-primary/10",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{module.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
