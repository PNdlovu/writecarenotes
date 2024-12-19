/**
 * @fileoverview Device Integration Service for Care Home Medical Devices
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

interface DeviceReading {
  id: string;
  deviceId: string;
  type: 'VITAL_SIGNS' | 'BLOOD_GLUCOSE' | 'BLOOD_PRESSURE' | 'WEIGHT' | 'TEMPERATURE' | 'OXYGEN';
  value: number;
  unit: string;
  timestamp: string;
  metadata: {
    residentId: string;
    careHomeId: string;
    recordedBy: string;
    deviceModel?: string;
    deviceSerial?: string;
    batteryLevel?: number;
  };
}

interface DeviceAlert {
  id: string;
  deviceId: string;
  type: 'OUT_OF_RANGE' | 'DEVICE_ERROR' | 'BATTERY_LOW' | 'CALIBRATION_NEEDED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  timestamp: string;
  metadata: {
    residentId?: string;
    careHomeId: string;
    value?: number;
    threshold?: number;
    deviceModel?: string;
    deviceSerial?: string;
  };
}

interface DeviceConfig {
  id: string;
  deviceId: string;
  type: string;
  settings: {
    thresholds?: {
      low?: number;
      high?: number;
      unit: string;
    };
    calibration?: {
      lastCalibrated: string;
      nextCalibration: string;
      calibratedBy: string;
    };
    maintenance?: {
      lastMaintenance: string;
      nextMaintenance: string;
      maintenanceBy: string;
    };
  };
  metadata: {
    careHomeId: string;
    deviceModel: string;
    deviceSerial: string;
    manufacturer: string;
    lastUpdated: string;
    updatedBy: string;
  };
}

export class DeviceIntegration {
  private devices: Map<string, WebSocket | null> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 5000;

  async connectDevice(deviceId: string, config: DeviceConfig): Promise<void> {
    try {
      // Check if device is already connected
      if (this.devices.get(deviceId)) {
        console.log(`Device ${deviceId} is already connected`);
        return;
      }

      // Initialize WebSocket connection
      const ws = new WebSocket(`ws://device-gateway/${deviceId}`);
      
      ws.onopen = () => {
        console.log(`Connected to device ${deviceId}`);
        this.devices.set(deviceId, ws);
        this.reconnectAttempts.set(deviceId, 0);
        
        // Send device configuration
        ws.send(JSON.stringify({
          type: 'CONFIG',
          data: config,
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleDeviceMessage(deviceId, data);
      };

      ws.onerror = (error) => {
        console.error(`Device ${deviceId} connection error:`, error);
        this.handleDeviceError(deviceId, error);
      };

      ws.onclose = () => {
        console.log(`Device ${deviceId} disconnected`);
        this.handleDeviceDisconnect(deviceId);
      };
    } catch (error) {
      console.error(`Failed to connect device ${deviceId}:`, error);
      throw error;
    }
  }

  private async handleDeviceMessage(deviceId: string, data: any): Promise<void> {
    try {
      switch (data.type) {
        case 'READING':
          await this.processDeviceReading({
            id: crypto.randomUUID(),
            deviceId,
            ...data.reading,
            timestamp: new Date().toISOString(),
          });
          break;

        case 'ALERT':
          await this.processDeviceAlert({
            id: crypto.randomUUID(),
            deviceId,
            ...data.alert,
            timestamp: new Date().toISOString(),
          });
          break;

        case 'STATUS':
          await this.updateDeviceStatus(deviceId, data.status);
          break;

        default:
          console.warn(`Unknown message type from device ${deviceId}:`, data);
      }
    } catch (error) {
      console.error(`Failed to process message from device ${deviceId}:`, error);
    }
  }

  private async processDeviceReading(reading: DeviceReading): Promise<void> {
    try {
      // Store reading in database
      await fetch('/api/devices/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reading),
      });

      // Check thresholds and generate alerts if needed
      await this.checkReadingThresholds(reading);
    } catch (error) {
      console.error('Failed to process device reading:', error);
      // Store for retry when online
      this.storeForRetry('reading', reading);
    }
  }

  private async processDeviceAlert(alert: DeviceAlert): Promise<void> {
    try {
      // Store alert in database
      await fetch('/api/devices/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });

      // Trigger notifications based on severity
      if (alert.severity === 'HIGH') {
        await this.triggerUrgentNotification(alert);
      }
    } catch (error) {
      console.error('Failed to process device alert:', error);
      // Store for retry when online
      this.storeForRetry('alert', alert);
    }
  }

  private async checkReadingThresholds(reading: DeviceReading): Promise<void> {
    try {
      const response = await fetch(`/api/devices/config/${reading.deviceId}`);
      if (!response.ok) return;

      const config: DeviceConfig = await response.json();
      const thresholds = config.settings.thresholds;

      if (!thresholds) return;

      if (reading.value < (thresholds.low || -Infinity) || 
          reading.value > (thresholds.high || Infinity)) {
        await this.processDeviceAlert({
          id: crypto.randomUUID(),
          deviceId: reading.deviceId,
          type: 'OUT_OF_RANGE',
          severity: 'HIGH',
          message: `Reading out of range: ${reading.value} ${reading.unit}`,
          timestamp: new Date().toISOString(),
          metadata: {
            ...reading.metadata,
            value: reading.value,
            threshold: reading.value < (thresholds.low || -Infinity) ? thresholds.low : thresholds.high,
          },
        });
      }
    } catch (error) {
      console.error('Failed to check reading thresholds:', error);
    }
  }

  private async triggerUrgentNotification(alert: DeviceAlert): Promise<void> {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DEVICE_ALERT',
          severity: alert.severity,
          title: `Device Alert: ${alert.type}`,
          message: alert.message,
          metadata: {
            deviceId: alert.deviceId,
            ...alert.metadata,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to trigger urgent notification:', error);
    }
  }

  private async updateDeviceStatus(deviceId: string, status: any): Promise<void> {
    try {
      await fetch(`/api/devices/status/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status),
      });
    } catch (error) {
      console.error('Failed to update device status:', error);
    }
  }

  private handleDeviceError(deviceId: string, error: any): void {
    console.error(`Device ${deviceId} error:`, error);
    this.devices.set(deviceId, null);
    this.attemptReconnect(deviceId);
  }

  private handleDeviceDisconnect(deviceId: string): void {
    this.devices.set(deviceId, null);
    this.attemptReconnect(deviceId);
  }

  private async attemptReconnect(deviceId: string): Promise<void> {
    const attempts = this.reconnectAttempts.get(deviceId) || 0;
    
    if (attempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error(`Max reconnection attempts reached for device ${deviceId}`);
      return;
    }

    this.reconnectAttempts.set(deviceId, attempts + 1);
    
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/devices/config/${deviceId}`);
        if (!response.ok) throw new Error('Failed to fetch device config');
        
        const config: DeviceConfig = await response.json();
        await this.connectDevice(deviceId, config);
      } catch (error) {
        console.error(`Failed to reconnect device ${deviceId}:`, error);
      }
    }, this.RECONNECT_DELAY * Math.pow(2, attempts));
  }

  private storeForRetry(type: 'reading' | 'alert', data: DeviceReading | DeviceAlert): void {
    const key = `deviceIntegration_${type}Queue`;
    const queue = JSON.parse(localStorage.getItem(key) || '[]');
    queue.push(data);
    localStorage.setItem(key, JSON.stringify(queue));
  }

  async processRetryQueue(): Promise<void> {
    const types: ('reading' | 'alert')[] = ['reading', 'alert'];
    
    for (const type of types) {
      const key = `deviceIntegration_${type}Queue`;
      const queue = JSON.parse(localStorage.getItem(key) || '[]');
      if (queue.length === 0) continue;

      const newQueue = [];
      for (const item of queue) {
        try {
          if (type === 'reading') {
            await this.processDeviceReading(item as DeviceReading);
          } else {
            await this.processDeviceAlert(item as DeviceAlert);
          }
        } catch (error) {
          newQueue.push(item);
        }
      }

      localStorage.setItem(key, JSON.stringify(newQueue));
    }
  }
} 


