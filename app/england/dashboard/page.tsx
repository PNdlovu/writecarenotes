import { Metadata } from "next";
import { DashboardShell } from "@/components/shell/dashboard-shell";
import { DashboardHeader } from "@/components/shell/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Users,
  FileText,
  Bell,
  Calendar,
  Building2,
  Settings,
  Bed,
  Pill,
  Stethoscope,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Care Home Management Dashboard",
};

const modules = [
  {
    title: "Residents",
    description: "Manage resident profiles and care plans",
    icon: Users,
    href: "/england/features/resident",
  },
  {
    title: "Staff Scheduling",
    description: "Manage staff rotas and schedules",
    icon: Calendar,
    href: "/england/features/schedule",
  },
  {
    title: "Care Planning",
    description: "Create and manage care plans",
    icon: FileText,
    href: "/england/features/careplans",
  },
  {
    title: "Bed Management",
    description: "Manage beds and occupancy",
    icon: Bed,
    href: "/england/features/bed-management",
  },
  {
    title: "Medications",
    description: "Track and manage medications",
    icon: Pill,
    href: "/england/features/medications",
  },
  {
    title: "Clinical",
    description: "Clinical records and assessments",
    icon: Stethoscope,
    href: "/england/features/clinical",
  },
  {
    title: "Documents",
    description: "Manage important documents",
    icon: FolderOpen,
    href: "/england/features/documents",
  },
  {
    title: "Family Portal",
    description: "Keep families connected and informed",
    icon: Users,
    href: "/england/features/family-portal",
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/england/dashboard");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Welcome, ${session.user?.name || 'User'}`}
        text="Access your care home management dashboard."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card
              key={module.title}
              className="transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer group"
            >
              <Link href={module.href} className="block">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {module.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
