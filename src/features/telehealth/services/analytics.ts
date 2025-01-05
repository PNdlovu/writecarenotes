/**
 * @fileoverview Analytics Service for Telehealth
 * @version 1.0.0
 * @created 2024-12-14
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { TelehealthServiceError } from './enhancedTelehealth';

interface ConsultationMetrics {
  totalConsultations: number;
  averageDuration: number;
  completionRate: number;
  cancellationRate: number;
  byType: Record<string, number>;
  byUrgency: Record<string, number>;
}

interface ProviderMetrics {
  providerId: string;
  consultationCount: number;
  averageRating: number;
  responseTime: number;
  completionRate: number;
  specialties: string[];
}

interface UsageReport {
  id: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate: string;
  metrics: {
    consultations: ConsultationMetrics;
    providers: ProviderMetrics[];
    technicalStats: {
      videoQuality: {
        averageBitrate: number;
        averageFrameRate: number;
        disconnections: number;
      };
      documentStats: {
        totalDocuments: number;
        signedDocuments: number;
        averageSigningTime: number;
      };
    };
  };
  generatedAt: string;
}

export class TelehealthAnalytics {
  async generateUsageReport(
    startDate: string,
    endDate: string,
    period: UsageReport['period']
  ): Promise<UsageReport> {
    try {
      const [
        consultationMetrics,
        providerMetrics,
        technicalStats,
      ] = await Promise.all([
        this.calculateConsultationMetrics(startDate, endDate),
        this.calculateProviderMetrics(startDate, endDate),
        this.calculateTechnicalStats(startDate, endDate),
      ]);

      const report: UsageReport = {
        id: uuidv4(),
        period,
        startDate,
        endDate,
        metrics: {
          consultations: consultationMetrics,
          providers: providerMetrics,
          technicalStats,
        },
        generatedAt: new Date().toISOString(),
      };

      await db.usageReport.create({
        data: report,
      });

      return report;
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to generate usage report',
        'REPORT_GENERATION_FAILED',
        error
      );
    }
  }

  private async calculateConsultationMetrics(
    startDate: string,
    endDate: string
  ): Promise<ConsultationMetrics> {
    try {
      const consultations = await db.consultationRequest.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const total = consultations.length;
      const completed = consultations.filter(c => c.status === 'COMPLETED').length;
      const cancelled = consultations.filter(c => c.status === 'CANCELLED').length;

      const byType = consultations.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byUrgency = consultations.reduce((acc, curr) => {
        acc[curr.urgency] = (acc[curr.urgency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalConsultations: total,
        averageDuration: await this.calculateAverageDuration(consultations),
        completionRate: (completed / total) * 100,
        cancellationRate: (cancelled / total) * 100,
        byType,
        byUrgency,
      };
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to calculate consultation metrics',
        'METRICS_CALCULATION_FAILED',
        error
      );
    }
  }

  private async calculateAverageDuration(
    consultations: any[]
  ): Promise<number> {
    const completedConsultations = consultations.filter(
      c => c.status === 'COMPLETED' && c.startTime && c.endTime
    );

    if (completedConsultations.length === 0) return 0;

    const totalDuration = completedConsultations.reduce((sum, curr) => {
      const duration =
        new Date(curr.endTime).getTime() - new Date(curr.startTime).getTime();
      return sum + duration;
    }, 0);

    return totalDuration / completedConsultations.length / 1000; // Convert to seconds
  }

  private async calculateProviderMetrics(
    startDate: string,
    endDate: string
  ): Promise<ProviderMetrics[]> {
    try {
      const providers = await db.provider.findMany({
        where: {
          consultations: {
            some: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
        include: {
          consultations: true,
          specialties: true,
        },
      });

      return providers.map(provider => ({
        providerId: provider.id,
        consultationCount: provider.consultations.length,
        averageRating: this.calculateAverageRating(provider.consultations),
        responseTime: this.calculateAverageResponseTime(provider.consultations),
        completionRate: this.calculateCompletionRate(provider.consultations),
        specialties: provider.specialties.map(s => s.name),
      }));
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to calculate provider metrics',
        'PROVIDER_METRICS_FAILED',
        error
      );
    }
  }

  private calculateAverageRating(consultations: any[]): number {
    const ratedConsultations = consultations.filter(c => c.rating);
    if (ratedConsultations.length === 0) return 0;
    
    const totalRating = ratedConsultations.reduce(
      (sum, curr) => sum + curr.rating,
      0
    );
    return totalRating / ratedConsultations.length;
  }

  private calculateAverageResponseTime(consultations: any[]): number {
    const respondedConsultations = consultations.filter(
      c => c.requestedAt && c.respondedAt
    );
    if (respondedConsultations.length === 0) return 0;

    const totalResponseTime = respondedConsultations.reduce((sum, curr) => {
      const responseTime =
        new Date(curr.respondedAt).getTime() -
        new Date(curr.requestedAt).getTime();
      return sum + responseTime;
    }, 0);

    return totalResponseTime / respondedConsultations.length / 1000; // Convert to seconds
  }

  private calculateCompletionRate(consultations: any[]): number {
    if (consultations.length === 0) return 0;
    const completed = consultations.filter(c => c.status === 'COMPLETED').length;
    return (completed / consultations.length) * 100;
  }

  private async calculateTechnicalStats(
    startDate: string,
    endDate: string
  ): Promise<UsageReport['metrics']['technicalStats']> {
    try {
      const videoSessions = await db.videoSession.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const documents = await db.document.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      return {
        videoQuality: {
          averageBitrate: this.calculateAverageBitrate(videoSessions),
          averageFrameRate: this.calculateAverageFrameRate(videoSessions),
          disconnections: this.countDisconnections(videoSessions),
        },
        documentStats: {
          totalDocuments: documents.length,
          signedDocuments: documents.filter(d => d.status === 'SIGNED').length,
          averageSigningTime: await this.calculateAverageSigningTime(documents),
        },
      };
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to calculate technical stats',
        'TECHNICAL_STATS_FAILED',
        error
      );
    }
  }

  private calculateAverageBitrate(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    const totalBitrate = sessions.reduce(
      (sum, curr) => sum + (curr.quality?.bitrate || 0),
      0
    );
    return totalBitrate / sessions.length;
  }

  private calculateAverageFrameRate(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    const totalFrameRate = sessions.reduce(
      (sum, curr) => sum + (curr.quality?.frameRate || 0),
      0
    );
    return totalFrameRate / sessions.length;
  }

  private countDisconnections(sessions: any[]): number {
    return sessions.reduce(
      (count, curr) =>
        count +
        (curr.participants?.filter(
          (p: any) => p.connectionStatus === 'DISCONNECTED'
        ).length || 0),
      0
    );
  }

  private async calculateAverageSigningTime(documents: any[]): Promise<number> {
    const signedDocuments = documents.filter(
      d => d.status === 'SIGNED' && d.createdAt && d.signedAt
    );
    if (signedDocuments.length === 0) return 0;

    const totalSigningTime = signedDocuments.reduce((sum, curr) => {
      const signingTime =
        new Date(curr.signedAt).getTime() - new Date(curr.createdAt).getTime();
      return sum + signingTime;
    }, 0);

    return totalSigningTime / signedDocuments.length / 1000; // Convert to seconds
  }
}


