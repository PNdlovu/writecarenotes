/**
 * @fileoverview Care Plan Statistics Component
 * @version 1.1.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { Card } from '@/components/ui/card';
import { useCarePlan } from '../hooks/useCarePlan';

interface CarePlanStatsProps {
  careHomeId: string;
}

export function CarePlanStats({ careHomeId }: CarePlanStatsProps) {
  const { stats, loading, error } = useCarePlan({ careHomeId });

  if (loading) return <div>Loading stats...</div>;
  if (error) return <div>Error loading stats: {error.message}</div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="text-sm font-medium text-muted-foreground">Total Plans</div>
        <div className="text-2xl font-bold">{stats.total}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium text-muted-foreground">Active Plans</div>
        <div className="text-2xl font-bold">{stats.active}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium text-muted-foreground">Archived Plans</div>
        <div className="text-2xl font-bold">{stats.archived}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium text-muted-foreground">Draft Plans</div>
        <div className="text-2xl font-bold">{stats.draft}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
        <div className="text-lg font-medium">
          {new Date(stats.lastUpdated).toLocaleDateString()}
        </div>
      </Card>
    </div>
  );
}


