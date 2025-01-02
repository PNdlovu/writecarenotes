/**
 * @fileoverview Enhanced metrics utility for the financial module
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { MetricData } from '../types';

export class FinancialMetrics {
    private static instance: FinancialMetrics;
    private metricsQueue: MetricData[] = [];
    private readonly flushInterval: number = 60000; // 1 minute
    private readonly maxQueueSize: number = 1000;

    private constructor() {
        this.setupFlushInterval();
    }

    public static getInstance(): FinancialMetrics {
        if (!FinancialMetrics.instance) {
            FinancialMetrics.instance = new FinancialMetrics();
        }
        return FinancialMetrics.instance;
    }

    public recordTransactionMetric(
        amount: number,
        tags: {
            regulatory_body: string;
            transaction_type: string;
            currency: string;
            region?: string;
            funding_type?: string;
        }
    ): void {
        this.queueMetric({
            name: 'financial_transaction',
            value: amount,
            tags,
            timestamp: new Date()
        });
    }

    public recordComplianceMetric(
        regulatoryBody: string,
        checkType: string,
        status: 'passed' | 'failed',
        details?: Record<string, any>
    ): void {
        this.queueMetric({
            name: 'compliance_check',
            value: status === 'passed' ? 1 : 0,
            tags: {
                regulatory_body: regulatoryBody,
                check_type: checkType,
                status,
                ...details
            },
            timestamp: new Date()
        });
    }

    public recordReportGenerationMetric(
        regulatoryBody: string,
        format: string,
        language: string,
        duration: number
    ): void {
        this.queueMetric({
            name: 'report_generation',
            value: duration,
            tags: {
                regulatory_body: regulatoryBody,
                format,
                language
            },
            timestamp: new Date()
        });
    }

    public recordAuditMetric(
        action: string,
        entityType: string,
        regulatoryBody?: string,
        details?: Record<string, any>
    ): void {
        this.queueMetric({
            name: 'audit_action',
            value: 1,
            tags: {
                action,
                entity_type: entityType,
                regulatory_body: regulatoryBody || 'none',
                ...details
            },
            timestamp: new Date()
        });
    }

    public recordPerformanceMetric(
        operation: string,
        duration: number,
        success: boolean,
        details?: Record<string, any>
    ): void {
        this.queueMetric({
            name: 'operation_performance',
            value: duration,
            tags: {
                operation,
                success: success.toString(),
                ...details
            },
            timestamp: new Date()
        });
    }

    public recordRegionalMetric(
        metricName: string,
        value: number,
        region: string,
        details?: Record<string, any>
    ): void {
        this.queueMetric({
            name: `regional_${metricName}`,
            value,
            tags: {
                region,
                ...details
            },
            timestamp: new Date()
        });
    }

    private queueMetric(metric: MetricData): void {
        this.metricsQueue.push(metric);
        
        if (this.metricsQueue.length >= this.maxQueueSize) {
            this.flush();
        }
    }

    private async flush(): Promise<void> {
        if (this.metricsQueue.length === 0) return;

        const metrics = [...this.metricsQueue];
        this.metricsQueue = [];

        try {
            // Group metrics by name for efficient processing
            const groupedMetrics = this.groupMetrics(metrics);

            // Process each group of metrics
            for (const [name, data] of Object.entries(groupedMetrics)) {
                await this.sendMetrics(name, data);
            }
        } catch (error) {
            console.error('Failed to flush metrics:', error);
            // Requeue failed metrics
            this.metricsQueue = [...this.metricsQueue, ...metrics];
        }
    }

    private groupMetrics(metrics: MetricData[]): Record<string, MetricData[]> {
        return metrics.reduce((acc, metric) => {
            if (!acc[metric.name]) {
                acc[metric.name] = [];
            }
            acc[metric.name].push(metric);
            return acc;
        }, {} as Record<string, MetricData[]>);
    }

    private async sendMetrics(name: string, metrics: MetricData[]): Promise<void> {
        // Implementation would depend on your metrics backend
        // Example: Send to Azure Application Insights
        try {
            await fetch('/api/metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    metrics
                }),
            });
        } catch (error) {
            throw new Error(`Failed to send metrics: ${error.message}`);
        }
    }

    private setupFlushInterval(): void {
        setInterval(() => {
            this.flush().catch(error => {
                console.error('Failed to flush metrics:', error);
            });
        }, this.flushInterval);
    }
} 