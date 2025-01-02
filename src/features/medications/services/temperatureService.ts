/**
 * @writecarenotes.com
 * @fileoverview Temperature monitoring service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for monitoring medication storage temperatures
 * including alerts and compliance reporting.
 */

import { db } from '@/lib/db';
import type { 
  TemperatureLog, 
  StorageLocation, 
  TemperatureAlert 
} from '../types/stockAnalytics';

export class TemperatureService {
  /**
   * Get storage locations
   */
  async getStorageLocations(
    organizationId: string
  ): Promise<StorageLocation[]> {
    return db.storageLocation.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get location by ID
   */
  async getLocationById(id: string): Promise<StorageLocation | null> {
    return db.storageLocation.findUnique({
      where: { id },
    });
  }

  /**
   * Create storage location
   */
  async createLocation(
    organizationId: string,
    data: Omit<StorageLocation, 'id' | 'currentTemp' | 'currentHumidity' | 'lastChecked' | 'status'>
  ): Promise<StorageLocation> {
    return db.storageLocation.create({
      data: {
        ...data,
        organizationId,
        status: 'NORMAL',
      },
    });
  }

  /**
   * Update storage location
   */
  async updateLocation(
    id: string,
    data: Partial<Omit<StorageLocation, 'id' | 'status'>>
  ): Promise<StorageLocation> {
    return db.storageLocation.update({
      where: { id },
      data,
    });
  }

  /**
   * Record temperature reading
   */
  async recordTemperature(
    locationId: string,
    temperature: number,
    humidity?: number
  ): Promise<TemperatureLog> {
    // Get location settings
    const location = await this.getLocationById(locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    // Check if reading is within limits
    const isAlert = 
      temperature < location.minTemp ||
      temperature > location.maxTemp ||
      (humidity !== undefined &&
        location.minHumidity !== undefined &&
        location.maxHumidity !== undefined &&
        (humidity < location.minHumidity || humidity > location.maxHumidity));

    // Create temperature log
    const log = await db.temperatureLog.create({
      data: {
        locationId,
        temperature,
        humidity,
        isAlert,
      },
    });

    // Update location current readings
    await db.storageLocation.update({
      where: { id: locationId },
      data: {
        currentTemp: temperature,
        currentHumidity: humidity,
        lastChecked: new Date(),
        status: isAlert ? 'ALERT' : 'NORMAL',
      },
    });

    // Create alerts if needed
    if (isAlert) {
      if (temperature < location.minTemp) {
        await this.createAlert(locationId, 'LOW_TEMP', temperature, location.minTemp);
      }
      if (temperature > location.maxTemp) {
        await this.createAlert(locationId, 'HIGH_TEMP', temperature, location.maxTemp);
      }
      if (
        humidity !== undefined &&
        location.minHumidity !== undefined &&
        location.maxHumidity !== undefined
      ) {
        if (humidity < location.minHumidity) {
          await this.createAlert(locationId, 'LOW_HUMIDITY', humidity, location.minHumidity);
        }
        if (humidity > location.maxHumidity) {
          await this.createAlert(locationId, 'HIGH_HUMIDITY', humidity, location.maxHumidity);
        }
      }
    }

    return log;
  }

  /**
   * Create temperature alert
   */
  private async createAlert(
    locationId: string,
    type: TemperatureAlert['type'],
    value: number,
    threshold: number
  ): Promise<TemperatureAlert> {
    return db.temperatureAlert.create({
      data: {
        locationId,
        type,
        value,
        threshold,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Get temperature logs
   */
  async getTemperatureLogs(
    locationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TemperatureLog[]> {
    return db.temperatureLog.findMany({
      where: {
        locationId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(locationId: string): Promise<TemperatureAlert[]> {
    return db.temperatureAlert.findMany({
      where: {
        locationId,
        status: 'ACTIVE',
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(
    id: string,
    userId: string
  ): Promise<TemperatureAlert> {
    return db.temperatureAlert.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedById: userId,
        acknowledgedAt: new Date(),
      },
    });
  }

  /**
   * Resolve alert
   */
  async resolveAlert(
    id: string,
    userId: string,
    resolution: string
  ): Promise<TemperatureAlert> {
    return db.temperatureAlert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedById: userId,
        resolvedAt: new Date(),
        resolution,
      },
    });
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    locationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalReadings: number;
    alertReadings: number;
    alertPercentage: number;
    maxTemperature: number;
    minTemperature: number;
    avgTemperature: number;
    maxHumidity?: number;
    minHumidity?: number;
    avgHumidity?: number;
    alerts: TemperatureAlert[];
  }> {
    const logs = await this.getTemperatureLogs(locationId, startDate, endDate);
    const alerts = await db.temperatureAlert.findMany({
      where: {
        locationId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    const temperatures = logs.map(log => log.temperature);
    const humidities = logs
      .filter(log => log.humidity !== undefined)
      .map(log => log.humidity!);

    return {
      totalReadings: logs.length,
      alertReadings: logs.filter(log => log.isAlert).length,
      alertPercentage: (logs.filter(log => log.isAlert).length / logs.length) * 100,
      maxTemperature: Math.max(...temperatures),
      minTemperature: Math.min(...temperatures),
      avgTemperature: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      ...(humidities.length > 0 && {
        maxHumidity: Math.max(...humidities),
        minHumidity: Math.min(...humidities),
        avgHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
      }),
      alerts,
    };
  }
} 