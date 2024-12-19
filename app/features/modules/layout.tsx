import { Breadcrumbs } from "@/components/features/Breadcrumbs";
import { ModuleNavigation } from "@/components/features/ModuleNavigation";

export default function ModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ModuleNavigation />
      <div className="container mx-auto px-4">
        <Breadcrumbs />
      </div>
      <main>{children}</main>
    </div>
  );
}
