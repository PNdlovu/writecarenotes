/**
 * @fileoverview Analytics service for offline module monitoring
 * @version 1.0.0
 */

import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';

interface SyncAnalytics {
  duration: number;
  operationsCount: number;
  batchesCount: number;
  success: boolean;
}

interface ErrorAnalytics {
  error: string;
  timestamp: number;
}

interface PerformanceMetrics {
  storageUsage: number;
  syncQueueSize: number;
  avgSyncDuration: number;
  compressionRatio: number;
}

export class AnalyticsService {
  private logger: Logger;
  private metrics: Metrics;
  private performanceHistory: PerformanceMetrics[] = [];

  constructor() {
    this.logger = new Logger('AnalyticsService');
    this.metrics = new Metrics('analytics');
  }

  /**
   * Track sync operation
   */
  trackSync(data: SyncAnalytics): void {
    this.metrics.record('sync_operation', {
      duration: data.duration,
      operations: data.operationsCount,
      batches: data.batchesCount,
      success: data.success,
      timestamp: Date.now()
    });

    // Update performance history
    this.updatePerformanceHistory({
      avgSyncDuration: data.duration
    });

    this.logger.info('Sync operation tracked', data);
  }

  /**
   * Track error
   */
  trackError(type: string, data: ErrorAnalytics): void {
    this.metrics.increment('error', {
      type,
      error: data.error,
      timestamp: data.timestamp
    });

    this.logger.error('Error tracked', { type, ...data });
  }

  /**
   * Track storage metrics
   */
  trackStorage(usage: number): void {
    this.metrics.gauge('storage_usage', usage);
    
    // Update performance history
    this.updatePerformanceHistory({
      storageUsage: usage
    });
  }

  /**
   * Track sync queue
   */
  trackSyncQueue(size: number): void {
    this.metrics.gauge('sync_queue_size', size);
    
    // Update performance history
    this.updatePerformanceHistory({
      syncQueueSize: size
    });
  }

  /**
   * Track compression performance
   */
  trackCompression(ratio: number): void {
    this.metrics.gauge('compression_ratio', ratio);
    
    // Update performance history
    this.updatePerformanceHistory({
      compressionRatio: ratio
    });
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): {
    current: PerformanceMetrics;
    history: PerformanceMetrics[];
    trends: {
      storageGrowth: number;
      syncEfficiency: number;
      compressionEfficiency: number;
    };
  } {
    const current = this.performanceHistory[this.performanceHistory.length - 1];
    
    // Calculate trends
    const trends = this.calculateTrends();
    
    return {
      current,
      history: this.performanceHistory,
      trends
    };
  }

  /**
   * Calculate performance trends
   */
  private calculateTrends(): {
    storageGrowth: number;
    syncEfficiency: number;
    compressionEfficiency: number;
  } {
    if (this.performanceHistory.length < 2) {
      return {
        storageGrowth: 0,
        syncEfficiency: 0,
        compressionEfficiency: 0
      };
    }

    const recent = this.performanceHistory.slice(-10);
    
    // Calculate storage growth rate
    const storageGrowth = this.calculateGrowthRate(
      recent.map(m => m.storageUsage)
    );
    
    // Calculate sync efficiency trend
    const syncEfficiency = this.calculateEfficiencyTrend(
      recent.map(m => m.avgSyncDuration)
    );
    
    // Calculate compression efficiency
    const compressionEfficiency = this.calculateEfficiencyTrend(
      recent.map(m => m.compressionRatio)
    );
    
    return {
      storageGrowth,
      syncEfficiency,
      compressionEfficiency
    };
  }

  /**
   * Calculate growth rate
   */
  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    return (last - first) / first;
  }

  /**
   * Calculate efficiency trend
   */
  private calculateEfficiencyTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const last = values[values.length - 1];
    return (last - avg) / avg;
  }

  /**
   * Update performance history
   */
  private updatePerformanceHistory(metrics: Partial<PerformanceMetrics>): void {
    const current = this.performanceHistory[this.performanceHistory.length - 1] || {
      storageUsage: 0,
      syncQueueSize: 0,
      avgSyncDuration: 0,
      compressionRatio: 0
    };
    
    this.performanceHistory.push({
      ...current,
      ...metrics
    });
    
    // Keep last 100 entries
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }
  }
}

export const analyticsService = new AnalyticsService();
