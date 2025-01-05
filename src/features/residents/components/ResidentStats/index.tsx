'use client';

/**
 * @writecarenotes.com
 * @fileoverview Resident statistics component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying key resident statistics and metrics
 * including total residents, occupancy rates, and care type distribution.
 */

import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icons';

export function ResidentStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icons.medical className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Residents</p>
            <h3 className="text-2xl font-bold">42</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Icons.health className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
            <h3 className="text-2xl font-bold">87%</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Icons.medication className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Care Reviews Due</p>
            <h3 className="text-2xl font-bold">8</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Icons.compliance className="h-6 w-6 text-yellow-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending Assessments</p>
            <h3 className="text-2xl font-bold">5</h3>
          </div>
        </div>
      </Card>
    </div>
  );
} 