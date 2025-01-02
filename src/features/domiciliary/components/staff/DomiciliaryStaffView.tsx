/**
 * @writecarenotes.com
 * @fileoverview Domiciliary staff view component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Extends the core staff management module with domiciliary-specific
 * features like route optimization and territory management.
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { StaffManagement } from '@/features/staff';
import { RouteOptimizer } from '../routes/RouteOptimizer';
import type { Staff } from '@/types';

interface DomiciliaryStaffViewProps {
  date?: Date;
}

export const DomiciliaryStaffView = ({ date = new Date() }: DomiciliaryStaffViewProps) => {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  return (
    <div className="space-y-4">
      {/* Core Staff Management */}
      <StaffManagement
        onStaffSelect={setSelectedStaff}
        filters={{
          serviceType: 'DOMICILIARY',
          date
        }}
        additionalTabs={[
          {
            id: 'routes',
            label: 'Routes & Territories',
            content: selectedStaff && (
              <RouteOptimizer
                staffId={selectedStaff.id}
                date={date}
                visits={[]} // Would be populated from visit service
              />
            )
          }
        ]}
      />
    </div>
  );
}; 