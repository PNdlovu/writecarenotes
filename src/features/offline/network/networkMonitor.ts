/**
 * @fileoverview Network monitor for tracking online/offline status
 * @version 1.0.0
 * @created 2024-03-21
 */

import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';
import { NetworkError } from '../types/errors';
import { NetworkConfig, NetworkStatus } from '../types';

export class NetworkMonitor {
  private logger: Logger;
  private metrics: Metrics;
  private config: NetworkConfig | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private onStatusChange: ((isOnline: boolean) => void) | null = null;
  private currentStatus: NetworkStatus = {
    isOnline: navigator.onLine,
    lastChecked: Date.now(),
    latency: null,
    type: this.getConnectionType()
  };

  constructor() {
    this.logger = new Logger('NetworkMonitor');
    this.metrics = new Metrics('network');
    this.setupEventListeners();
  }

  /**
   * Initialize network monitor
   */
  initialize(config: NetworkConfig): void {
    this.config = config;
    this.onStatusChange = config.onStatusChange;

    // Start ping interval if configured
    if (config.pingEndpoint && config.pingInterval) {
      this.startPingInterval();
    }

    this.logger.info('Network monitor initialized', { 
      pingEndpoint: config.pingEndpoint,
      pingInterval: config.pingInterval 
    });
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return this.currentStatus.isOnline;
  }

  /**
   * Force network check
   */
  async checkConnection(): Promise<NetworkStatus> {
    if (!this.config?.pingEndpoint) {
      return this.getStatus();
    }

    try {
      const startTime = performance.now();
      const response = await fetch(this.config.pingEndpoint, {
        method: 'HEAD',
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new NetworkError('Ping endpoint returned non-200 status');
      }

      const latency = performance.now() - startTime;
      this.updateStatus(true, latency);
      
      // Record metrics
      this.metrics.recordTiming('ping_latency', latency);
      this.metrics.increment('ping_success', 1);

      return this.getStatus();
    } catch (error) {
      this.updateStatus(false, null);
      this.metrics.increment('ping_failure', 1);
      this.logger.warn('Network check failed', { error });
      return this.getStatus();
    }
  }

  /**
   * Stop network monitoring
   */
  stop(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.removeEventListeners();
    this.logger.info('Network monitor stopped');
  }

  private startPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(
      () => this.checkConnection(),
      this.config?.pingInterval || 30000
    );
  }

  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Listen for connection changes if supported
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', this.handleConnectionChange);
    }
  }

  private removeEventListeners(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if ('connection' in navigator) {
      (navigator as any).connection?.removeEventListener('change', this.handleConnectionChange);
    }
  }

  private handleOnline = (): void => {
    this.logger.info('Browser reported online status');
    this.checkConnection(); // Verify with ping
  };

  private handleOffline = (): void => {
    this.logger.warn('Browser reported offline status');
    this.updateStatus(false, null);
  };

  private handleConnectionChange = (): void => {
    const type = this.getConnectionType();
    this.logger.info('Connection type changed', { type });
    
    this.currentStatus = {
      ...this.currentStatus,
      type
    };

    // Record metrics
    this.metrics.increment('connection_changes', 1, { type });
  };

  private updateStatus(isOnline: boolean, latency: number | null): void {
    const previousStatus = this.currentStatus.isOnline;
    
    this.currentStatus = {
      isOnline,
      lastChecked: Date.now(),
      latency,
      type: this.getConnectionType()
    };

    // Notify if status changed
    if (previousStatus !== isOnline && this.onStatusChange) {
      this.onStatusChange(isOnline);
    }

    // Record metrics
    this.metrics.gauge('online_status', isOnline ? 1 : 0);
    if (latency !== null) {
      this.metrics.gauge('latency', latency);
    }

    this.logger.info('Network status updated', this.currentStatus);
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.effectiveType || connection?.type || 'unknown';
    }
    return 'unknown';
  }
} 