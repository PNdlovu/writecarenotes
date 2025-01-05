import { useState, useEffect } from 'react';
import { MetricData } from './visualizations/types';
import { DASHBOARD_CONFIG } from './index';

export interface RegionalMetricsProps {
  organizationId: string;
}

interface QuickStat {
  id: string;
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

export const RegionalMetrics = ({ organizationId }: RegionalMetricsProps) => {
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/stats?organizationId=${organizationId}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [organizationId]);

  if (isLoading) {
    return <div>Loading stats...</div>;
  }

  return (
    <>
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">{stat.label}</h3>
            {stat.icon}
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs ${
              stat.change > 0 ? 'text-green-600' : 
              stat.change < 0 ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {stat.change > 0 ? '↑' : stat.change < 0 ? '↓' : '→'}
              {Math.abs(stat.change)}% from last month
            </p>
          </div>
        </div>
      ))}
    </>
  );
};


