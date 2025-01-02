/**
 * @writecarenotes.com
 * @fileoverview Queue service for managing background tasks and job processing
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Queue service for managing background tasks, job processing, and offline
 * operation queues. Supports prioritization, retry logic, and persistence.
 */

import { Logger } from './logger';
import { metrics } from './metrics';

export interface QueueJob<T = any> {
  id: string;
  type: string;
  data: T;
  priority?: number;
  attempts?: number;
  maxAttempts?: number;
  createdAt: Date;
  scheduledFor?: Date;
}

export class QueueService {
  private logger: Logger;
  private jobs: Map<string, QueueJob>;
  private processing: boolean;

  constructor() {
    this.logger = new Logger('QueueService');
    this.jobs = new Map();
    this.processing = false;
  }

  /**
   * Add a job to the queue
   */
  async enqueue<T>(job: Omit<QueueJob<T>, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const queueJob: QueueJob<T> = {
      ...job,
      id,
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: job.maxAttempts || 3
    };

    this.jobs.set(id, queueJob);
    metrics.increment('queue.jobs_enqueued');
    this.logger.info('Job enqueued', { id, type: job.type });
    
    return id;
  }

  /**
   * Get the current queue size
   */
  size(): number {
    return this.jobs.size;
  }

  /**
   * Check if the queue is healthy
   */
  isHealthy(): boolean {
    return !this.processing || this.jobs.size < 1000;
  }

  /**
   * Get queue metrics
   */
  getMetrics() {
    return {
      size: this.jobs.size,
      processing: this.processing
    };
  }
}

// Create and export default queue service instance
export const queueService = new QueueService(); 