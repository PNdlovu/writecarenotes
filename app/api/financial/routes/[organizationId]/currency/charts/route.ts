/**
 * @fileoverview Currency Charts Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * API routes for currency chart data
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Redis } from '@/lib/redis';
import { Metrics } from '@/lib/metrics';
import { Logger } from '@/lib/logger';
import { DateRange, PeriodGranularity } from '@/features/financial/core/types';

const logger = new Logger('currency-charts');
const redis = new Redis();
const metrics = new Metrics('currency_charts');

interface ChartData {
  type: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

interface ChartOptions {
  period: DateRange;
  granularity: PeriodGranularity;
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  metric: string;
  compare?: string[];
  limit?: number;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId === params.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const options: ChartOptions = {
      period: searchParams.get('period') || new Date().toISOString().slice(0, 7),
      granularity: (searchParams.get('granularity') || 'day') as PeriodGranularity,
      type: (searchParams.get('type') || 'line') as 'line' | 'bar' | 'pie' | 'doughnut',
      metric: searchParams.get('metric') || 'volume',
      compare: searchParams.get('compare')?.split(','),
      limit: parseInt(searchParams.get('limit') || '10', 10),
    };

    // Try to get cached chart data
    const cacheKey = `chart:${params.organizationId}:${JSON.stringify(options)}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const chartData = await generateChartData(params.organizationId, options);

    // Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(chartData), 'EX', 300);

    return NextResponse.json(chartData);
  } catch (error) {
    logger.error('Failed to generate chart data', error);
    return NextResponse.json(
      { error: 'Failed to generate chart data' },
      { status: 500 }
    );
  }
}

async function generateChartData(
  organizationId: string,
  options: ChartOptions
): Promise<ChartData> {
  switch (options.metric) {
    case 'volume':
      return generateVolumeChart(organizationId, options);
    case 'transactions':
      return generateTransactionsChart(organizationId, options);
    case 'errors':
      return generateErrorsChart(organizationId, options);
    case 'performance':
      return generatePerformanceChart(organizationId, options);
    case 'regional':
      return generateRegionalChart(organizationId, options);
    default:
      throw new Error(`Unsupported metric: ${options.metric}`);
  }
}

async function generateVolumeChart(
  organizationId: string,
  options: ChartOptions
): Promise<ChartData> {
  const volumeData = await metrics.getTimeSeries(
    METRIC_KEYS.CONVERSION_AMOUNT,
    { organizationId },
    options.granularity,
    options.period
  );

  const labels = Object.keys(volumeData);
  const data = Object.values(volumeData);

  return {
    type: options.type,
    labels,
    datasets: [{
      label: 'Conversion Volume',
      data,
      borderColor: '#4CAF50',
      fill: false,
    }],
  };
}

async function generateTransactionsChart(
  organizationId: string,
  options: ChartOptions
): Promise<ChartData> {
  const transactionData = await metrics.getTimeSeries(
    METRIC_KEYS.CONVERSION_COUNT,
    { organizationId },
    options.granularity,
    options.period
  );

  const labels = Object.keys(transactionData);
  const data = Object.values(transactionData);

  return {
    type: options.type,
    labels,
    datasets: [{
      label: 'Transaction Count',
      data,
      borderColor: '#2196F3',
      fill: false,
    }],
  };
}

async function generateErrorsChart(
  organizationId: string,
  options: ChartOptions
): Promise<ChartData> {
  const errorData = await metrics.getGroupedTimeSeries(
    METRIC_KEYS.API_ERROR,
    'errorType',
    { organizationId },
    options.granularity,
    options.period
  );

  const datasets = Object.entries(errorData).map(([errorType, data], index) => ({
    label: errorType,
    data: Object.values(data),
    borderColor: getChartColor(index),
    fill: false,
  }));

  return {
    type: options.type,
    labels: Object.keys(Object.values(errorData)[0] || {}),
    datasets,
  };
}

async function generatePerformanceChart(
  organizationId: string,
  options: ChartOptions
): Promise<ChartData> {
  const [latency, success] = await Promise.all([
    metrics.getTimeSeries(
      'currency_conversion_duration',
      { organizationId },
      options.granularity,
      options.period
    ),
    metrics.getSuccessRateTimeSeries(
      { organizationId },
      options.granularity,
      options.period
    ),
  ]);

  return {
    type: options.type,
    labels: Object.keys(latency),
    datasets: [
      {
        label: 'Average Latency (ms)',
        data: Object.values(latency),
        borderColor: '#FFC107',
        fill: false,
      },
      {
        label: 'Success Rate (%)',
        data: Object.values(success).map(rate => rate * 100),
        borderColor: '#4CAF50',
        fill: false,
      },
    ],
  };
}

async function generateRegionalChart(
  organizationId: string,
  options: ChartOptions
): Promise<ChartData> {
  const regionalData = await metrics.getGroupedSum(
    METRIC_KEYS.CONVERSION_AMOUNT,
    'region',
    { organizationId, period: options.period }
  );

  const sortedData = Object.entries(regionalData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, options.limit);

  return {
    type: options.type,
    labels: sortedData.map(([region]) => region),
    datasets: [{
      label: 'Volume by Region',
      data: sortedData.map(([, value]) => value),
      backgroundColor: sortedData.map((_, index) => getChartColor(index)),
    }],
  };
}

function getChartColor(index: number): string {
  const colors = [
    '#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0',
    '#00BCD4', '#FF9800', '#795548', '#607D8B', '#E91E63',
  ];
  return colors[index % colors.length];
} 