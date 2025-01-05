/**
 * @writecarenotes.com
 * @fileoverview Temperature monitoring service for medication storage
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive service for monitoring and managing temperature conditions
 * in medication storage locations, including logging, alerts, and compliance
 * reporting capabilities.
 */

import { db } from '@/lib/db';
import { addToSyncQueue } from '@/lib/sync';
import type {
  TemperatureReading,
  TemperatureAlert,
  StorageLocation,
  TemperatureLog,
  AlertConfig,
  ComplianceReport,
} from '../types/temperature';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export class TemperatureMonitoringService {
  /**
   * Temperature Reading Management
   */
  async logReading(
    organizationId: string,
    reading: TemperatureReading
  ): Promise<TemperatureLog> {
    const log = await db.temperatureLog.create({
      data: {
        ...reading,
        organizationId,
      },
    });

    await addToSyncQueue({
      type: 'CREATE',
      entity: 'temperatureLog',
      data: log,
    });

    return log;
  }

  async getReadings(
    organizationId: string,
    locationId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<TemperatureLog[]> {
    return db.temperatureLog.findMany({
      where: {
        organizationId,
        locationId,
        ...(options?.startDate && options?.endDate && {
          timestamp: {
            gte: startOfDay(options.startDate),
            lte: endOfDay(options.endDate),
          },
        }),
      },
      orderBy: {
        timestamp: 'desc',
      },
      skip: options?.offset || 0,
      take: options?.limit || 100,
    });
  }

  /**
   * Storage Location Management
   */
  async createLocation(
    organizationId: string,
    location: Omit<StorageLocation, 'id' | 'organizationId'>
  ): Promise<StorageLocation> {
    const storageLocation = await db.storageLocation.create({
      data: {
        ...location,
        organizationId,
      },
    });

    await addToSyncQueue({
      type: 'CREATE',
      entity: 'storageLocation',
      data: storageLocation,
    });

    return storageLocation;
  }

  async updateLocation(
    id: string,
    data: Partial<StorageLocation>
  ): Promise<StorageLocation> {
    const location = await db.storageLocation.update({
      where: { id },
      data,
    });

    await addToSyncQueue({
      type: 'UPDATE',
      entity: 'storageLocation',
      data: location,
    });

    return location;
  }

  async getLocations(organizationId: string): Promise<StorageLocation[]> {
    return db.storageLocation.findMany({
      where: { organizationId },
      include: {
        latestReading: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  /**
   * Alert Management
   */
  async checkAlerts(
    organizationId: string,
    locationId: string
  ): Promise<TemperatureAlert[]> {
    const [location, latestReading] = await Promise.all([
      db.storageLocation.findUnique({
        where: { id: locationId },
      }),
      db.temperatureLog.findFirst({
        where: { locationId },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    if (!location || !latestReading) return [];

    const alerts: TemperatureAlert[] = [];

    // Check temperature excursions
    if (
      latestReading.temperature > location.maxTemperature ||
      latestReading.temperature < location.minTemperature
    ) {
      alerts.push({
        type: 'TEMPERATURE_EXCURSION',
        locationId,
        timestamp: latestReading.timestamp,
        reading: latestReading.temperature,
        threshold: latestReading.temperature > location.maxTemperature
          ? location.maxTemperature
          : location.minTemperature,
        message: `Temperature excursion detected in ${location.name}`,
      });
    }

    // Check humidity if monitored
    if (location.monitorHumidity && latestReading.humidity) {
      if (
        latestReading.humidity > location.maxHumidity ||
        latestReading.humidity < location.minHumidity
      ) {
        alerts.push({
          type: 'HUMIDITY_EXCURSION',
          locationId,
          timestamp: latestReading.timestamp,
          reading: latestReading.humidity,
          threshold: latestReading.humidity > location.maxHumidity
            ? location.maxHumidity
            : location.minHumidity,
          message: `Humidity excursion detected in ${location.name}`,
        });
      }
    }

    // Record alerts
    for (const alert of alerts) {
      await db.temperatureAlert.create({
        data: {
          ...alert,
          organizationId,
        },
      });

      await addToSyncQueue({
        type: 'CREATE',
        entity: 'temperatureAlert',
        data: alert,
      });
    }

    return alerts;
  }

  async getAlerts(
    organizationId: string,
    options?: {
      locationId?: string;
      startDate?: Date;
      endDate?: Date;
      type?: 'TEMPERATURE_EXCURSION' | 'HUMIDITY_EXCURSION';
      status?: 'ACTIVE' | 'RESOLVED';
      limit?: number;
      offset?: number;
    }
  ): Promise<TemperatureAlert[]> {
    return db.temperatureAlert.findMany({
      where: {
        organizationId,
        ...(options?.locationId && { locationId: options.locationId }),
        ...(options?.type && { type: options.type }),
        ...(options?.status && { status: options.status }),
        ...(options?.startDate && options?.endDate && {
          timestamp: {
            gte: startOfDay(options.startDate),
            lte: endOfDay(options.endDate),
          },
        }),
      },
      orderBy: {
        timestamp: 'desc',
      },
      skip: options?.offset || 0,
      take: options?.limit || 50,
      include: {
        location: true,
      },
    });
  }

  /**
   * Alert Configuration
   */
  async updateAlertConfig(
    organizationId: string,
    config: AlertConfig
  ): Promise<AlertConfig> {
    const alertConfig = await db.alertConfig.upsert({
      where: {
        organizationId,
      },
      update: config,
      create: {
        ...config,
        organizationId,
      },
    });

    await addToSyncQueue({
      type: 'UPSERT',
      entity: 'alertConfig',
      data: alertConfig,
    });

    return alertConfig;
  }

  async getAlertConfig(organizationId: string): Promise<AlertConfig | null> {
    return db.alertConfig.findUnique({
      where: { organizationId },
    });
  }

  /**
   * Compliance Reporting
   */
  async generateComplianceReport(
    organizationId: string,
    locationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    const [location, readings, alerts] = await Promise.all([
      db.storageLocation.findUnique({
        where: { id: locationId },
      }),
      this.getReadings(organizationId, locationId, { startDate, endDate }),
      this.getAlerts(organizationId, {
        locationId,
        startDate,
        endDate,
      }),
    ]);

    if (!location) {
      throw new Error('Location not found');
    }

    const temperatureExcursions = alerts.filter(
      (a) => a.type === 'TEMPERATURE_EXCURSION'
    );
    const humidityExcursions = alerts.filter(
      (a) => a.type === 'HUMIDITY_EXCURSION'
    );

    const totalReadings = readings.length;
    const excursionDuration = this.calculateExcursionDuration(alerts);
    const compliancePercentage = this.calculateCompliancePercentage(
      totalReadings,
      alerts.length
    );

    return {
      locationId,
      locationName: location.name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalReadings,
      temperatureExcursions: temperatureExcursions.length,
      humidityExcursions: humidityExcursions.length,
      excursionDuration,
      compliancePercentage,
      temperatureRange: {
        min: Math.min(...readings.map((r) => r.temperature)),
        max: Math.max(...readings.map((r) => r.temperature)),
      },
      ...(location.monitorHumidity && {
        humidityRange: {
          min: Math.min(...readings.filter((r) => r.humidity).map((r) => r.humidity!)),
          max: Math.max(...readings.filter((r) => r.humidity).map((r) => r.humidity!)),
        },
      }),
    };
  }

  /**
   * Helper Methods
   */
  private calculateExcursionDuration(alerts: TemperatureAlert[]): number {
    return alerts.reduce((total, alert) => {
      if (alert.resolvedAt) {
        const duration = new Date(alert.resolvedAt).getTime() - new Date(alert.timestamp).getTime();
        return total + duration;
      }
      return total;
    }, 0);
  }

  private calculateCompliancePercentage(
    totalReadings: number,
    totalExcursions: number
  ): number {
    if (totalReadings === 0) return 100;
    return ((totalReadings - totalExcursions) / totalReadings) * 100;
  }
} 