/**
 * @writecarenotes.com
 * @fileoverview Network monitoring service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Monitors network connectivity and provides status updates
 */

import { Logger, logger } from '@/lib/logger';

interface NetworkConfig {
  pingEndpoint: string;
  pingInterval: number;
  timeout: number;
}

interface NetworkStatus {
  isOnline: boolean;
  lastChecked: number;
  latency: number | null;
  type: string;
}

interface NetworkMetrics {
  recordLatency(value: number): void;
  recordOnlineStatus(isOnline: boolean): void;
  recordPingFailure(): void;
}

class BasicMetrics implements NetworkMetrics {
  private logger: Logger;
  private metrics: Record<string, number> = {
    latency: 0,
    onlineStatus: 0,
    pingFailures: 0
  };

  constructor() {
    this.logger = new Logger('NetworkMetrics');
  }

  recordLatency(value: number): void {
    this.metrics.latency = value;
    this.logger.debug('network.latency', { value });
  }

  recordOnlineStatus(isOnline: boolean): void {
    this.metrics.onlineStatus = isOnline ? 1 : 0;
    this.logger.debug('network.online_status', { value: this.metrics.onlineStatus });
  }

  recordPingFailure(): void {
    this.metrics.pingFailures++;
    this.logger.debug('network.ping_failure', { value: this.metrics.pingFailures });
  }
}

const isClient = typeof window !== 'undefined';

export class NetworkMonitor {
  private config: NetworkConfig;
  private status: NetworkStatus;
  private checkInterval: NodeJS.Timeout | null;
  private metrics: NetworkMetrics;
  private logger: Logger;
  private onStatusChange?: (isOnline: boolean) => void;

  constructor(config: Partial<NetworkConfig> = {}) {
    this.logger = new Logger('NetworkMonitor');
    const defaultEndpoint = isClient ? new URL('/api/health', window.location.origin).toString() : '/api/health';
    
    this.config = {
      pingEndpoint: defaultEndpoint,
      pingInterval: 30000,
      timeout: 5000,
      ...config
    };

    this.status = {
      isOnline: isClient ? navigator.onLine : false,
      lastChecked: 0,
      latency: null,
      type: 'unknown'
    };

    this.checkInterval = null;
    this.metrics = new BasicMetrics();

    if (isClient) {
      this.setupEventListeners();
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));
  }

  private handleOnlineStatus(isOnline: boolean): void {
    void this.updateStatus(isOnline, null);
  }

  async checkConnection(): Promise<void> {
    if (!isClient) return;

    const startTime = Date.now();

    try {
      const response = await fetch(this.config.pingEndpoint, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });

      const latency = Date.now() - startTime;
      this.metrics.recordLatency(latency);

      await this.updateStatus(response.ok, latency);
    } catch (error) {
      this.logger.warn('Network check failed', { error });
      this.metrics.recordPingFailure();
      await this.updateStatus(false, null);
    }
  }

  private async updateStatus(isOnline: boolean, latency: number | null): Promise<void> {
    const previousStatus = this.status.isOnline;
    
    this.status = {
      isOnline,
      lastChecked: Date.now(),
      latency,
      type: this.getConnectionType()
    };

    this.logger.info('Network status updated', this.status);
    this.metrics.recordOnlineStatus(isOnline);

    if (previousStatus !== isOnline && this.onStatusChange) {
      this.onStatusChange(isOnline);
    }
  }

  private getConnectionType(): string {
    if (isClient && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      return conn?.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  start(onStatusChange?: (isOnline: boolean) => void): void {
    if (!isClient || this.checkInterval) return;

    this.onStatusChange = onStatusChange;
    void this.checkConnection();

    this.checkInterval = setInterval(() => {
      void this.checkConnection();
    }, this.config.pingInterval);
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getStatus(): NetworkStatus {
    return { ...this.status };
  }
}

export const networkMonitor = new NetworkMonitor();