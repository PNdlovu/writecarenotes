/**
 * @fileoverview Care Insights Component
 * Displays predictive care insights and behavioral patterns
 */

import React from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button/Button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { useCareAnalytics } from '../../hooks/useCareAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CareInsightsProps {
  residentId: string;
  familyMemberId: string;
}

export const CareInsights: React.FC<CareInsightsProps> = ({
  residentId,
  familyMemberId,
}) => {
  const {
    insights,
    patterns,
    metrics,
    timeRange,
    isLoading,
    setTimeRange,
  } = useCareAnalytics({ residentId });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Care Insights</h2>
          <p className="text-muted-foreground">
            Predictive analytics and behavioral patterns
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Key Insights</TabsTrigger>
          <TabsTrigger value="patterns">Behavioral Patterns</TabsTrigger>
          <TabsTrigger value="metrics">Care Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                  <Badge variant={insight.trend === 'positive' ? 'default' : 'destructive'}>
                    {insight.confidence}% Confidence
                  </Badge>
                </div>
                <div className="mt-4 h-[100px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={insight.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563eb"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {patterns.map((pattern) => (
              <Card key={pattern.id} className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-grow">
                    <h3 className="font-semibold">{pattern.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pattern.description}
                    </p>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Key Observations</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {pattern.observations.map((observation, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {observation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Badge variant={pattern.significance === 'high' ? 'default' : 'secondary'}>
                    {pattern.significance} significance
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{metric.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {metric.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {metric.currentValue}
                        {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
                      </div>
                      <div className={`text-sm ${
                        metric.trend > 0 ? 'text-green-600' :
                        metric.trend < 0 ? 'text-red-600' :
                        'text-muted-foreground'
                      }`}>
                        {metric.trend > 0 ? '↑' : metric.trend < 0 ? '↓' : '→'}
                        {Math.abs(metric.trend)}%
                      </div>
                    </div>
                  </div>
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metric.history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2563eb"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};


