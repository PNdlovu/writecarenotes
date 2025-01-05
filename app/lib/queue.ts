/**
 * @fileoverview Background Job Processing Service
 * @version 1.0.0
 * @created 2024-03-21
 */

import Bull, { Queue, Job } from 'bull';
import { logger } from './logger';
import { metrics } from './metrics';
import { CacheService } from './cache';

interface JobData {
  type: string;
  payload: any;
  organizationId: string;
  userId: string;
}

interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
}

class QueueService {
  private static instance: QueueService;
  private queues: Map<string, Queue>;
  private cache: CacheService;

  private constructor() {
    this.queues = new Map();
    this.cache = CacheService.getInstance();
    this.initializeQueues();
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  private initializeQueues() {
    // Initialize queues for different job types
    this.createQueue('reports', 5);
    this.createQueue('sync', 2);
    this.createQueue('exports', 3);
    this.createQueue('notifications', 10);
  }

  private createQueue(name: string, concurrency: number): Queue {
    const queue = new Bull(name, process.env.REDIS_URL!, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    });

    // Add queue processors
    queue.process(concurrency, async (job: Job<JobData>) => {
      const startTime = Date.now();
      logger.info(`Processing ${name} job`, { jobId: job.id, type: job.data.type });

      try {
        const result = await this.processJob(name, job);
        
        metrics.recordTiming(`queue.${name}.duration`, Date.now() - startTime);
        metrics.increment(`queue.${name}.success`);
        
        return result;
      } catch (error) {
        metrics.increment(`queue.${name}.error`);
        logger.error(`Error processing ${name} job`, {
          jobId: job.id,
          error,
          type: job.data.type
        });
        throw error;
      }
    });

    // Add event listeners
    queue.on('completed', (job: Job<JobData>) => {
      logger.info(`${name} job completed`, { jobId: job.id, type: job.data.type });
    });

    queue.on('failed', (job: Job<JobData>, error: Error) => {
      logger.error(`${name} job failed`, {
        jobId: job.id,
        error,
        type: job.data.type,
        attempts: job.attemptsMade
      });
    });

    queue.on('error', (error: Error) => {
      logger.error(`${name} queue error`, { error });
      metrics.increment(`queue.${name}.error`);
    });

    this.queues.set(name, queue);
    return queue;
  }

  private async processJob(queueName: string, job: Job<JobData>): Promise<JobResult> {
    const { type, payload, organizationId } = job.data;

    switch (queueName) {
      case 'reports':
        return this.processReportJob(type, payload, organizationId);
      case 'sync':
        return this.processSyncJob(type, payload, organizationId);
      case 'exports':
        return this.processExportJob(type, payload, organizationId);
      case 'notifications':
        return this.processNotificationJob(type, payload, organizationId);
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }

  private async processReportJob(type: string, payload: any, organizationId: string): Promise<JobResult> {
    // Implementation for report generation jobs
    try {
      // Process report generation
      // Store result in cache
      const cacheKey = `report:${organizationId}:${type}:${payload.id}`;
      await this.cache.set(cacheKey, { status: 'completed', data: {} });
      
      return { success: true, data: {} };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async processSyncJob(type: string, payload: any, organizationId: string): Promise<JobResult> {
    // Implementation for third-party sync jobs
    try {
      // Process sync with external systems
      return { success: true, data: {} };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async processExportJob(type: string, payload: any, organizationId: string): Promise<JobResult> {
    // Implementation for data export jobs
    try {
      // Process data export
      return { success: true, data: {} };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async processNotificationJob(type: string, payload: any, organizationId: string): Promise<JobResult> {
    // Implementation for notification jobs
    try {
      // Process notifications
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async addJob(
    queueName: string,
    type: string,
    payload: any,
    organizationId: string,
    userId: string,
    options: Bull.JobOptions = {}
  ): Promise<Job<JobData>> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.add({
      type,
      payload,
      organizationId,
      userId
    }, options);

    logger.info(`Added job to ${queueName} queue`, {
      jobId: job.id,
      type,
      organizationId
    });

    metrics.increment(`queue.${queueName}.added`);
    return job;
  }

  public async getJobStatus(queueName: string, jobId: string): Promise<any> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = await job.progress();

    return {
      id: job.id,
      state,
      progress,
      data: job.data,
      attempts: job.attemptsMade,
      timestamp: job.timestamp
    };
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const checks = await Promise.all(
        Array.from(this.queues.entries()).map(async ([name, queue]) => {
          const isPaused = await queue.isPaused();
          const counts = await queue.getJobCounts();
          return !isPaused && counts.active < queue.concurrency;
        })
      );

      return checks.every(check => check);
    } catch (error) {
      logger.error('Queue health check failed:', error);
      return false;
    }
  }
} 
