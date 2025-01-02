import { Subject } from 'rxjs';

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  metric: string;
  value: number;
  threshold: number;
  acknowledged: boolean;
}

export interface AlertThreshold {
  metric: string;
  warning: number;
  error: number;
  enabled: boolean;
}

export class AlertService {
  private static instance: AlertService;
  private alerts: Alert[] = [];
  private thresholds: AlertThreshold[] = [
    {
      metric: 'syncDuration',
      warning: 5000, // 5 seconds
      error: 10000,  // 10 seconds
      enabled: true
    },
    {
      metric: 'errorRate',
      warning: 0.05, // 5%
      error: 0.1,    // 10%
      enabled: true
    },
    {
      metric: 'storageGrowth',
      warning: 1024 * 1024 * 100, // 100MB
      error: 1024 * 1024 * 500,   // 500MB
      enabled: true
    },
    {
      metric: 'syncQueue',
      warning: 50,   // 50 items
      error: 100,    // 100 items
      enabled: true
    }
  ];

  private alertSubject = new Subject<Alert>();

  private constructor() {}

  static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  subscribe(callback: (alert: Alert) => void) {
    return this.alertSubject.subscribe(callback);
  }

  getAlerts(acknowledged: boolean = false): Alert[] {
    return this.alerts
      .filter(alert => alert.acknowledged === acknowledged)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  acknowledgeAlert(id: string) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      this.alertSubject.next({ ...alert });
    }
  }

  clearAlerts() {
    this.alerts = [];
    this.alertSubject.next(null);
  }

  checkThreshold(metric: string, value: number): void {
    const threshold = this.thresholds.find(t => t.metric === metric);
    if (!threshold || !threshold.enabled) return;

    let type: Alert['type'] | null = null;
    if (value >= threshold.error) {
      type = 'error';
    } else if (value >= threshold.warning) {
      type = 'warning';
    }

    if (type) {
      const alert: Alert = {
        id: `${metric}-${Date.now()}`,
        type,
        message: this.getAlertMessage(metric, value, type),
        timestamp: Date.now(),
        metric,
        value,
        threshold: type === 'error' ? threshold.error : threshold.warning,
        acknowledged: false
      };

      this.alerts.push(alert);
      this.alertSubject.next(alert);
    }
  }

  updateThreshold(metric: string, update: Partial<AlertThreshold>) {
    const index = this.thresholds.findIndex(t => t.metric === metric);
    if (index !== -1) {
      this.thresholds[index] = { ...this.thresholds[index], ...update };
    }
  }

  private getAlertMessage(metric: string, value: number, type: Alert['type']): string {
    const messages = {
      syncDuration: `Sync duration ${type === 'error' ? 'critically high' : 'elevated'} at ${(value / 1000).toFixed(2)}s`,
      errorRate: `Error rate ${type === 'error' ? 'critically high' : 'elevated'} at ${(value * 100).toFixed(1)}%`,
      storageGrowth: `Storage growth ${type === 'error' ? 'critically high' : 'elevated'} at ${(value / 1024 / 1024).toFixed(1)}MB`,
      syncQueue: `Sync queue ${type === 'error' ? 'critically high' : 'elevated'} with ${value} items`
    };

    return messages[metric] || `${metric} ${type === 'error' ? 'critically high' : 'elevated'} at ${value}`;
  }
}
