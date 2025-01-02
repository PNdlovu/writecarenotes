import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { AnalyticsEvent } from '../../components/analytics/types';

export interface AggregatedData {
  daily: Record<string, number>;
  hourly: Record<string, number>;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  trends: {
    dailyGrowth: number;
    weeklyGrowth: number;
    monthlyGrowth: number;
    successRate: number;
  };
}

export interface TimeSeriesData {
  timestamp: number;
  value: number;
}

export class AggregationService {
  private static instance: AggregationService;

  private constructor() {}

  static getInstance(): AggregationService {
    if (!AggregationService.instance) {
      AggregationService.instance = new AggregationService();
    }
    return AggregationService.instance;
  }

  aggregateEvents(events: AnalyticsEvent[]): AggregatedData {
    const now = new Date();
    const daily: Record<string, number> = {};
    const hourly: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    // Initialize daily data for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(now, i), 'yyyy-MM-dd');
      daily[date] = 0;
    }

    // Initialize hourly data for the last 24 hours
    for (let i = 0; i < 24; i++) {
      const hour = format(subDays(now, i), 'HH:00');
      hourly[hour] = 0;
    }

    events.forEach(event => {
      // Daily aggregation
      const day = format(event.timestamp, 'yyyy-MM-dd');
      daily[day] = (daily[day] || 0) + 1;

      // Hourly aggregation
      const hour = format(event.timestamp, 'HH:00');
      hourly[hour] = (hourly[hour] || 0) + 1;

      // Type aggregation
      byType[event.type] = (byType[event.type] || 0) + 1;

      // Status aggregation
      const status = event.data?.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    // Calculate trends
    const trends = this.calculateTrends(events);

    return {
      daily,
      hourly,
      byType,
      byStatus,
      trends
    };
  }

  calculateMovingAverage(data: TimeSeriesData[], windowSize: number): TimeSeriesData[] {
    if (data.length < windowSize) return data;

    const result: TimeSeriesData[] = [];
    for (let i = windowSize - 1; i < data.length; i++) {
      const windowSum = data
        .slice(i - windowSize + 1, i + 1)
        .reduce((sum, item) => sum + item.value, 0);
      
      result.push({
        timestamp: data[i].timestamp,
        value: windowSum / windowSize
      });
    }
    return result;
  }

  detectAnomalies(data: TimeSeriesData[], stdDevThreshold = 2): TimeSeriesData[] {
    if (data.length < 2) return [];

    // Calculate mean and standard deviation
    const values = data.map(d => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Detect anomalies
    return data.filter(point => 
      Math.abs(point.value - mean) > stdDev * stdDevThreshold
    );
  }

  private calculateTrends(events: AnalyticsEvent[]) {
    const now = new Date();
    const dayAgo = subDays(now, 1);
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    const dailyEvents = events.filter(e => 
      isWithinInterval(e.timestamp, { start: startOfDay(dayAgo), end: endOfDay(now) })
    ).length;

    const weeklyEvents = events.filter(e => 
      isWithinInterval(e.timestamp, { start: startOfDay(weekAgo), end: endOfDay(now) })
    ).length;

    const monthlyEvents = events.filter(e => 
      isWithinInterval(e.timestamp, { start: startOfDay(monthAgo), end: endOfDay(now) })
    ).length;

    const successEvents = events.filter(e => 
      e.data?.status === 'success' || e.type === 'sync_complete'
    ).length;

    return {
      dailyGrowth: dailyEvents / events.length,
      weeklyGrowth: weeklyEvents / events.length,
      monthlyGrowth: monthlyEvents / events.length,
      successRate: successEvents / events.length
    };
  }

  generateInsights(aggregatedData: AggregatedData): string[] {
    const insights: string[] = [];

    // Analyze daily patterns
    const dailyValues = Object.values(aggregatedData.daily);
    const avgDaily = dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length;
    const maxDaily = Math.max(...dailyValues);
    const minDaily = Math.min(...dailyValues);

    if (maxDaily > avgDaily * 2) {
      insights.push(`Unusually high activity detected on some days (${maxDaily} events vs avg ${avgDaily.toFixed(1)})`);
    }

    if (minDaily < avgDaily * 0.5) {
      insights.push(`Unusually low activity detected on some days (${minDaily} events vs avg ${avgDaily.toFixed(1)})`);
    }

    // Analyze success rate
    if (aggregatedData.trends.successRate < 0.95) {
      insights.push(`Success rate is below target: ${(aggregatedData.trends.successRate * 100).toFixed(1)}%`);
    }

    // Analyze growth trends
    if (aggregatedData.trends.dailyGrowth > aggregatedData.trends.weeklyGrowth * 1.5) {
      insights.push('Significant increase in daily activity compared to weekly average');
    }

    if (aggregatedData.trends.monthlyGrowth < aggregatedData.trends.weeklyGrowth * 0.8) {
      insights.push('Declining trend in monthly activity');
    }

    return insights;
  }
}
