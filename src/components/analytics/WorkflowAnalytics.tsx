import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const STATUS_COLORS = {
  DRAFT: '#9CA3AF',
  IN_REVIEW: '#60A5FA',
  APPROVED: '#34D399',
  REJECTED: '#F87171',
};

export function WorkflowAnalytics() {
  const [period, setPeriod] = React.useState('30d');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['workflow-analytics', period],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/workflows?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow analytics');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflow Analytics</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
            <SelectItem value="1y">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workflow Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Completion Rates</CardTitle>
            <CardDescription>
              Number of documents processed by each workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.workflowCompletionRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [value, 'Documents']}
                  />
                  <Bar dataKey="documentsCount" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Average Approval Times */}
        <Card>
          <CardHeader>
            <CardTitle>Average Approval Times</CardTitle>
            <CardDescription>
              Time taken to complete each workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.workflowCompletionRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) =>
                      [
                        formatDistanceToNow(new Date(value)),
                        'Average Time',
                      ]
                    }
                  />
                  <Bar dataKey="averageApprovalTime" fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Document Status Distribution</CardTitle>
            <CardDescription>
              Distribution of document statuses across workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      value,
                      index,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius =
                        25 + innerRadius + (outerRadius - innerRadius);
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#888"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                        >
                          {`${analytics.statusDistribution[index].status} (${value})`}
                        </text>
                      );
                    }}
                  >
                    {analytics.statusDistribution.map((entry: any, index: number) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Approvers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Approvers</CardTitle>
            <CardDescription>
              Users with most approval decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.userApprovalStats.sort(
                    (a: any, b: any) => b.decisionsCount - a.decisionsCount
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="decisionsCount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


