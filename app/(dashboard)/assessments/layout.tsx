/**
 * WriteCareNotes.com
 * @fileoverview Assessments Layout
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { ModuleNavigation } from '@/components/ui/ModuleNavigation';
import { ModuleHero } from '@/components/ui/ModuleHero';

export default function AssessmentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <ModuleHero title="Assessments" description="Manage resident assessments and evaluations" />
      <ModuleNavigation module="assessments" />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
} 