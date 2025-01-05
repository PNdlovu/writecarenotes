/**
 * @fileoverview Security service for threat detection and monitoring
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

import { Logger } from '../logger';
import { prisma } from '../prisma';

const logger = new Logger({ service: 'security' });

interface ThreatAssessment {
  ip: string;
  threatScore: number;
  isSuspicious: boolean;
  reasons: string[];
}

interface SecurityMetrics {
  failedAttempts: number;
  successRate: number;
  uniqueIPs: number;
  suspiciousActivities: number;
  averageResponseTime: number;
}

export class SecurityService {
  private static readonly THREAT_SCORE_THRESHOLD = 70;
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly MONITORING_WINDOW = 15 * 60 * 1000; // 15 minutes

  static async assessThreat(ip: string): Promise<ThreatAssessment> {
    const assessment: ThreatAssessment = {
      ip,
      threatScore: 0,
      isSuspicious: false,
      reasons: []
    };

    try {
      // Check recent failed attempts from this IP
      const recentFailures = await prisma.authLog.count({
        where: {
          ip,
          success: false,
          createdAt: {
            gte: new Date(Date.now() - this.MONITORING_WINDOW)
          }
        }
      });

      if (recentFailures >= this.MAX_FAILED_ATTEMPTS) {
        assessment.threatScore += 40;
        assessment.reasons.push('Multiple failed login attempts');
      }

      // Check if IP is accessing multiple accounts
      const uniqueAccounts = await prisma.authLog.count({
        where: {
          ip,
          createdAt: {
            gte: new Date(Date.now() - this.MONITORING_WINDOW)
          }
        },
        distinct: ['userId']
      });

      if (uniqueAccounts > 3) {
        assessment.threatScore += 30;
        assessment.reasons.push('Multiple account access attempts');
      }

      // TODO: Implement IP geolocation check
      // TODO: Implement known malicious IP check
      // TODO: Implement behavior pattern analysis

      assessment.isSuspicious = assessment.threatScore >= this.THREAT_SCORE_THRESHOLD;

      if (assessment.isSuspicious) {
        logger.security('Suspicious activity detected', {
          ip,
          threatScore: assessment.threatScore,
          reasons: assessment.reasons,
          severity: 'high'
        });
      }

      return assessment;
    } catch (error) {
      logger.error('Error assessing threat', error as Error);
      throw error;
    }
  }

  static async getSecurityMetrics(timeframe: number = this.MONITORING_WINDOW): Promise<SecurityMetrics> {
    const since = new Date(Date.now() - timeframe);

    try {
      const [totalAttempts, failedAttempts, uniqueIPs, suspiciousActivities] = await Promise.all([
        prisma.authLog.count({
          where: { createdAt: { gte: since } }
        }),
        prisma.authLog.count({
          where: {
            success: false,
            createdAt: { gte: since }
          }
        }),
        prisma.authLog.count({
          where: { createdAt: { gte: since } },
          distinct: ['ip']
        }),
        prisma.authLog.count({
          where: {
            success: false,
            createdAt: { gte: since },
            error: { not: null }
          }
        })
      ]);

      // Calculate average response time (mock implementation)
      const averageResponseTime = 150; // ms

      return {
        failedAttempts,
        successRate: totalAttempts ? ((totalAttempts - failedAttempts) / totalAttempts) * 100 : 100,
        uniqueIPs,
        suspiciousActivities,
        averageResponseTime
      };
    } catch (error) {
      logger.error('Error getting security metrics', error as Error);
      throw error;
    }
  }

  static async enforceRateLimit(ip: string): Promise<boolean> {
    try {
      const attempts = await prisma.authLog.count({
        where: {
          ip,
          createdAt: {
            gte: new Date(Date.now() - 60000) // 1 minute
          }
        }
      });

      return attempts <= 10; // Max 10 attempts per minute
    } catch (error) {
      logger.error('Error enforcing rate limit', error as Error);
      return false;
    }
  }
} 


