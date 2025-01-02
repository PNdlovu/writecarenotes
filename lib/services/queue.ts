/**
 * @writecarenotes.com
 * @fileoverview Background job queue service
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Bull-based background job queue service for handling long-running tasks.
 */

import Queue from 'bull';
import { logger } from './logger';
import { elasticsearch } from './elasticsearch';
import { prisma } from '@/lib/prisma';

// Queue configurations
const defaultConfig = {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true
  }
};

// Define queues
export const queues = {
  indexing: new Queue('article-indexing', defaultConfig),
  export: new Queue('article-export', defaultConfig),
  notification: new Queue('notification', defaultConfig),
  cleanup: new Queue('cleanup', defaultConfig)
};

// Process indexing jobs
queues.indexing.process(async (job) => {
  const { articleId, operation } = job.data;

  try {
    logger.info('Processing indexing job', {
      articleId,
      operation,
      jobId: job.id
    });

    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { id: articleId },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    if (!article) {
      throw new Error('Article not found');
    }

    switch (operation) {
      case 'index':
        await elasticsearch.indexArticle(article);
        break;
      case 'remove':
        await elasticsearch.removeArticle(articleId);
        break;
      default:
        throw new Error('Invalid operation');
    }

    logger.info('Indexing job completed', {
      articleId,
      operation,
      jobId: job.id
    });
  } catch (error) {
    logger.error('Indexing job failed', {
      error,
      articleId,
      operation,
      jobId: job.id
    });
    throw error;
  }
});

// Process export jobs
queues.export.process(async (job) => {
  const { articleId, format, userId } = job.data;

  try {
    logger.info('Processing export job', {
      articleId,
      format,
      userId,
      jobId: job.id
    });

    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { id: articleId },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!article) {
      throw new Error('Article not found');
    }

    // Generate export
    const content = await generateExport(article, format);

    // Store export result
    const result = await prisma.knowledgeBaseExport.create({
      data: {
        articleId,
        userId,
        format,
        content,
        status: 'COMPLETED'
      }
    });

    // Add to activity log
    await prisma.knowledgeBaseActivity.create({
      data: {
        type: 'EXPORT',
        articleId,
        userId,
        metadata: {
          format,
          exportId: result.id
        }
      }
    });

    logger.info('Export job completed', {
      articleId,
      format,
      userId,
      jobId: job.id
    });

    return result;
  } catch (error) {
    logger.error('Export job failed', {
      error,
      articleId,
      format,
      userId,
      jobId: job.id
    });
    throw error;
  }
});

// Process notification jobs
queues.notification.process(async (job) => {
  const { type, userId, data } = job.data;

  try {
    logger.info('Processing notification job', {
      type,
      userId,
      jobId: job.id
    });

    // Send notification based on type
    switch (type) {
      case 'ARTICLE_PUBLISHED':
        // Implement notification logic
        break;
      case 'COMMENT_ADDED':
        // Implement notification logic
        break;
      default:
        throw new Error('Invalid notification type');
    }

    logger.info('Notification job completed', {
      type,
      userId,
      jobId: job.id
    });
  } catch (error) {
    logger.error('Notification job failed', {
      error,
      type,
      userId,
      jobId: job.id
    });
    throw error;
  }
});

// Process cleanup jobs
queues.cleanup.process(async (job) => {
  const { type } = job.data;

  try {
    logger.info('Processing cleanup job', {
      type,
      jobId: job.id
    });

    switch (type) {
      case 'expired_exports':
        // Clean up expired exports
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() - 7);

        await prisma.knowledgeBaseExport.deleteMany({
          where: {
            createdAt: {
              lt: expiryDate
            }
          }
        });
        break;

      case 'orphaned_files':
        // Clean up orphaned files
        break;

      default:
        throw new Error('Invalid cleanup type');
    }

    logger.info('Cleanup job completed', {
      type,
      jobId: job.id
    });
  } catch (error) {
    logger.error('Cleanup job failed', {
      error,
      type,
      jobId: job.id
    });
    throw error;
  }
});

// Error handling for all queues
Object.values(queues).forEach(queue => {
  queue.on('error', error => {
    logger.error('Queue error', { error, queue: queue.name });
  });

  queue.on('failed', (job, error) => {
    logger.error('Job failed', {
      error,
      queue: queue.name,
      jobId: job.id,
      data: job.data
    });
  });
});

// Helper function for export generation
async function generateExport(article: any, format: string): Promise<string> {
  // Implementation depends on format
  switch (format) {
    case 'pdf':
      // Generate PDF
      break;
    case 'word':
      // Generate Word document
      break;
    case 'markdown':
      // Generate Markdown
      break;
    default:
      throw new Error('Unsupported format');
  }

  return ''; // Placeholder
}

// Queue helper functions
export const queueHelpers = {
  async addIndexingJob(
    articleId: string,
    operation: 'index' | 'remove'
  ) {
    return queues.indexing.add(
      { articleId, operation },
      { 
        priority: operation === 'remove' ? 1 : 2,
        attempts: 5
      }
    );
  },

  async addExportJob(
    articleId: string,
    format: string,
    userId: string
  ) {
    return queues.export.add(
      { articleId, format, userId },
      { 
        priority: 3,
        attempts: 3,
        timeout: 5 * 60 * 1000 // 5 minutes
      }
    );
  },

  async addNotificationJob(
    type: string,
    userId: string,
    data: any
  ) {
    return queues.notification.add(
      { type, userId, data },
      { 
        priority: 4,
        attempts: 3
      }
    );
  },

  async addCleanupJob(type: string) {
    return queues.cleanup.add(
      { type },
      {
        priority: 5,
        attempts: 2,
        repeat: {
          cron: '0 0 * * *' // Daily at midnight
        }
      }
    );
  },

  async getQueueStatus() {
    const status = await Promise.all(
      Object.entries(queues).map(async ([name, queue]) => {
        const [
          active,
          waiting,
          completed,
          failed
        ] = await Promise.all([
          queue.getActiveCount(),
          queue.getWaitingCount(),
          queue.getCompletedCount(),
          queue.getFailedCount()
        ]);

        return {
          name,
          active,
          waiting,
          completed,
          failed
        };
      })
    );

    return status;
  }
}; 