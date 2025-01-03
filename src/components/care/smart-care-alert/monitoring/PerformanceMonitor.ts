/**
 * @writecarenotes.com
 * @fileoverview Performance Monitoring Service
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

type MetricName = 
    | 'page-load'
    | 'api-call'
    | 'record-creation'
    | 'staff-assignment'
    | 'notification-delivery'
    | 'offline-sync';

interface PerformanceMetric {
    name: MetricName;
    startTime: number;
    duration: number;
    success: boolean;
    metadata?: Record<string, any>;
}

class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, PerformanceMetric[]> = new Map();
    private observers: Set<(metric: PerformanceMetric) => void> = new Set();

    private constructor() {
        this.setupPerformanceObserver();
    }

    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    private setupPerformanceObserver(): void {
        if (typeof PerformanceObserver !== 'undefined') {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'resource' || entry.entryType === 'navigation') {
                        this.recordMetric({
                            name: 'page-load',
                            startTime: entry.startTime,
                            duration: entry.duration,
                            success: true,
                            metadata: {
                                type: entry.entryType,
                                url: entry instanceof PerformanceResourceTiming ? entry.name : undefined
                            }
                        });
                    }
                }
            });

            observer.observe({ entryTypes: ['resource', 'navigation'] });
        }
    }

    public startMetric(name: MetricName, metadata?: Record<string, any>): string {
        const id = `${name}-${Date.now()}`;
        const metric: PerformanceMetric = {
            name,
            startTime: performance.now(),
            duration: 0,
            success: false,
            metadata
        };

        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name)!.push(metric);

        return id;
    }

    public endMetric(id: string, success: boolean = true): void {
        const [name] = id.split('-');
        const metrics = this.metrics.get(name as MetricName);
        if (!metrics) return;

        const metric = metrics[metrics.length - 1];
        if (!metric) return;

        metric.duration = performance.now() - metric.startTime;
        metric.success = success;

        this.notifyObservers(metric);
        this.sendToAnalytics(metric);
    }

    public recordMetric(metric: PerformanceMetric): void {
        if (!this.metrics.has(metric.name)) {
            this.metrics.set(metric.name, []);
        }
        this.metrics.get(metric.name)!.push(metric);
        this.notifyObservers(metric);
        this.sendToAnalytics(metric);
    }

    public getMetrics(name: MetricName): PerformanceMetric[] {
        return this.metrics.get(name) || [];
    }

    public subscribe(callback: (metric: PerformanceMetric) => void): () => void {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }

    private notifyObservers(metric: PerformanceMetric): void {
        this.observers.forEach(observer => observer(metric));
    }

    private async sendToAnalytics(metric: PerformanceMetric): Promise<void> {
        try {
            await fetch('/api/v1/analytics/performance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    ...metric
                })
            });
        } catch (error) {
            console.error('Failed to send metric to analytics:', error);
            // Store failed metrics for retry
            this.storeFailedMetric(metric);
        }
    }

    private async storeFailedMetric(metric: PerformanceMetric): Promise<void> {
        try {
            const request = indexedDB.open('performance-metrics', 1);
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('failed-metrics')) {
                    db.createObjectStore('failed-metrics', { autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const transaction = db.transaction(['failed-metrics'], 'readwrite');
                const store = transaction.objectStore('failed-metrics');
                store.add({
                    metric,
                    timestamp: Date.now()
                });
            };
        } catch (error) {
            console.error('Failed to store metric locally:', error);
        }
    }

    public async retrySendingFailedMetrics(): Promise<void> {
        try {
            const request = indexedDB.open('performance-metrics', 1);
            
            request.onsuccess = async (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const transaction = db.transaction(['failed-metrics'], 'readwrite');
                const store = transaction.objectStore('failed-metrics');
                
                const failedMetrics = await new Promise<any[]>((resolve) => {
                    const request = store.getAll();
                    request.onsuccess = () => resolve(request.result);
                });

                for (const { metric } of failedMetrics) {
                    try {
                        await this.sendToAnalytics(metric);
                        // Remove successfully sent metric
                        store.delete(metric.id);
                    } catch (error) {
                        console.error('Failed to retry sending metric:', error);
                    }
                }
            };
        } catch (error) {
            console.error('Failed to retry sending metrics:', error);
        }
    }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
