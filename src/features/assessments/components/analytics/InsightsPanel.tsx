import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Badge } from "@/components/ui/Badge/Badge";
import { LightbulbIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { AggregationService, AggregatedData } from '../../services/analytics/AggregationService';
import { format } from 'date-fns';

interface InsightsPanelProps {
  data: AggregatedData;
}

export function InsightsPanel({ data }: InsightsPanelProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const aggregationService = AggregationService.getInstance();

  useEffect(() => {
    const newInsights = aggregationService.generateInsights(data);
    setInsights(newInsights);
  }, [data]);

  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) {
      return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    }
    return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          Analytics Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Success Rate</h4>
                {getTrendIcon(data.trends.successRate, 0.95)}
              </div>
              <div className="text-2xl font-bold">
                {(data.trends.successRate * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500">Target: 95%</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Daily Growth</h4>
                {getTrendIcon(data.trends.dailyGrowth)}
              </div>
              <div className="text-2xl font-bold">
                {(data.trends.dailyGrowth * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500">vs. Previous Day</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Monthly Growth</h4>
                {getTrendIcon(data.trends.monthlyGrowth)}
              </div>
              <div className="text-2xl font-bold">
                {(data.trends.monthlyGrowth * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500">vs. Previous Month</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Key Insights</h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg flex items-start gap-2"
                  >
                    <LightbulbIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p>{insight}</p>
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {format(new Date(), 'PPp')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <h4 className="font-medium mb-3">Event Distribution</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium mb-2">By Type</h5>
                <div className="space-y-2">
                  {Object.entries(data.byType).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">{type}</span>
                      <Badge>{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-2">By Status</h5>
                <div className="space-y-2">
                  {Object.entries(data.byStatus).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">{status}</span>
                      <Badge
                        variant={status === 'success' ? 'default' : 'destructive'}
                      >
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
