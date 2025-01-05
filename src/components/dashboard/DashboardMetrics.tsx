'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface MetricCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: string;
}

function MetricCard({ title, value, description, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-2xl">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardMetricsProps {
  metrics: {
    overview: Array<{
      label: string;
      value: number;
    }>;
  };
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const icons = {
    'Total Residents': '👥',
    'Total Staff': '👨‍⚕️',
    'Active Care Plans': '📋',
    'Upcoming Activities': '📅',
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.overview.map((metric) => (
        <MetricCard
          key={metric.label}
          title={metric.label}
          value={metric.value}
          icon={icons[metric.label as keyof typeof icons]}
        />
      ))}
    </div>
  );
}


