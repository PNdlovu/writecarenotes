/**
 * @fileoverview Currency Alerts Handler
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Anomaly detection and alerting for currency operations
 */

import { Redis } from '@/lib/redis';
import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';
import { Notifications } from '@/lib/notifications';
import { SupportedCurrency } from './types';

const logger = new Logger('currency-alerts');
const redis = new Redis();
const metrics = new Metrics('currency_alerts');
const notifications = new Notifications();

const ALERT_THRESHOLDS = {
  ERROR_RATE: 0.1, // 10% error rate
  LATENCY: 1000, // 1 second
  RATE_LIMIT: 0.2, // 20% of requests rate limited
  CONVERSION_VOLUME: 0.5, // 50% change in volume
  EXCHANGE_RATE: 0.05, // 5% change in rate
} as const;

interface AlertConfig {
  enabled: boolean;
  channels: string[];
  thresholds: {
    errorRate?: number;
    latency?: number;
    rateLimit?: number;
    conversionVolume?: number;
    exchangeRate?: number;
  };
}

export async function checkForAnomalies(organizationId: string): Promise<void> {
  try {
    const config = await getAlertConfig(organizationId);
    if (!config.enabled) return;

    const [
      errorRateAnomaly,
      latencyAnomaly,
      rateLimitAnomaly,
      volumeAnomaly,
      rateAnomaly,
    ] = await Promise.all([
      checkErrorRateAnomaly(organizationId, config),
      checkLatencyAnomaly(organizationId, config),
      checkRateLimitAnomaly(organizationId, config),
      checkVolumeAnomaly(organizationId, config),
      checkExchangeRateAnomaly(organizationId, config),
    ]);

    const anomalies = [
      errorRateAnomaly,
      latencyAnomaly,
      rateLimitAnomaly,
      volumeAnomaly,
      rateAnomaly,
    ].filter(Boolean);

    if (anomalies.length > 0) {
      await sendAlerts(organizationId, anomalies, config);
    }
  } catch (error) {
    logger.error('Failed to check for anomalies', error);
  }
}

async function checkErrorRateAnomaly(
  organizationId: string,
  config: AlertConfig
): Promise<string | null> {
  const threshold = config.thresholds.errorRate || ALERT_THRESHOLDS.ERROR_RATE;
  const period = new Date().toISOString().slice(0, 7);

  const stats = await metrics.getCount(METRIC_KEYS.API_ERROR, { organizationId, period });
  const total = await metrics.getCount(METRIC_KEYS.CONVERSION_COUNT, { organizationId, period });

  const errorRate = stats / total;
  if (errorRate > threshold) {
    return `High error rate detected: ${(errorRate * 100).toFixed(2)}% (threshold: ${(threshold * 100).toFixed(2)}%)`;
  }

  return null;
}

async function checkLatencyAnomaly(
  organizationId: string,
  config: AlertConfig
): Promise<string | null> {
  const threshold = config.thresholds.latency || ALERT_THRESHOLDS.LATENCY;
  const period = new Date().toISOString().slice(0, 7);

  const stats = await metrics.getPercentile('currency_conversion_duration', 95, { organizationId, period });
  if (stats > threshold) {
    return `High latency detected: ${stats.toFixed(2)}ms (threshold: ${threshold}ms)`;
  }

  return null;
}

async function checkRateLimitAnomaly(
  organizationId: string,
  config: AlertConfig
): Promise<string | null> {
  const threshold = config.thresholds.rateLimit || ALERT_THRESHOLDS.RATE_LIMIT;
  const period = new Date().toISOString().slice(0, 7);

  const rateLimited = await metrics.getCount(METRIC_KEYS.RATE_LIMIT, { organizationId, period });
  const total = await metrics.getCount(METRIC_KEYS.CONVERSION_COUNT, { organizationId, period });

  const rateLimitRate = rateLimited / total;
  if (rateLimitRate > threshold) {
    return `High rate limiting detected: ${(rateLimitRate * 100).toFixed(2)}% (threshold: ${(threshold * 100).toFixed(2)}%)`;
  }

  return null;
}

async function checkVolumeAnomaly(
  organizationId: string,
  config: AlertConfig
): Promise<string | null> {
  const threshold = config.thresholds.conversionVolume || ALERT_THRESHOLDS.CONVERSION_VOLUME;
  const currentPeriod = new Date().toISOString().slice(0, 7);
  
  // Get previous period
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const previousPeriod = date.toISOString().slice(0, 7);

  const [currentVolume, previousVolume] = await Promise.all([
    metrics.getSum(METRIC_KEYS.CONVERSION_AMOUNT, { organizationId, period: currentPeriod }),
    metrics.getSum(METRIC_KEYS.CONVERSION_AMOUNT, { organizationId, period: previousPeriod }),
  ]);

  const change = Math.abs((currentVolume - previousVolume) / previousVolume);
  if (change > threshold) {
    return `Unusual conversion volume change: ${(change * 100).toFixed(2)}% (threshold: ${(threshold * 100).toFixed(2)}%)`;
  }

  return null;
}

async function checkExchangeRateAnomaly(
  organizationId: string,
  config: AlertConfig
): Promise<string | null> {
  const threshold = config.thresholds.exchangeRate || ALERT_THRESHOLDS.EXCHANGE_RATE;
  const rates = await getLatestExchangeRates();
  const previousRates = await getPreviousExchangeRates();

  const anomalies = [];
  for (const [pair, rate] of Object.entries(rates)) {
    const previousRate = previousRates[pair];
    if (!previousRate) continue;

    const change = Math.abs((rate - previousRate) / previousRate);
    if (change > threshold) {
      anomalies.push(`${pair}: ${(change * 100).toFixed(2)}% change`);
    }
  }

  if (anomalies.length > 0) {
    return `Unusual exchange rate changes detected:\n${anomalies.join('\n')}`;
  }

  return null;
}

async function sendAlerts(
  organizationId: string,
  anomalies: string[],
  config: AlertConfig
): Promise<void> {
  const message = {
    title: 'Currency Operation Anomalies Detected',
    body: anomalies.join('\n\n'),
    severity: 'warning',
    timestamp: new Date().toISOString(),
    metadata: {
      organizationId,
      service: 'currency',
      anomalyCount: anomalies.length,
    },
  };

  for (const channel of config.channels) {
    try {
      await notifications.send(channel, message);
      logger.info('Alert sent successfully', { channel });
    } catch (error) {
      logger.error('Failed to send alert', { channel, error });
    }
  }
}

async function getAlertConfig(organizationId: string): Promise<AlertConfig> {
  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId },
    select: {
      alertSettings: true,
    },
  });

  return {
    enabled: settings?.alertSettings?.enabled ?? true,
    channels: settings?.alertSettings?.channels ?? ['email', 'slack'],
    thresholds: settings?.alertSettings?.thresholds ?? ALERT_THRESHOLDS,
  };
}

async function getLatestExchangeRates(): Promise<Record<string, number>> {
  const data = await redis.get('latest_exchange_rates');
  return data ? JSON.parse(data) : {};
}

async function getPreviousExchangeRates(): Promise<Record<string, number>> {
  const data = await redis.get('previous_exchange_rates');
  return data ? JSON.parse(data) : {};
} 
