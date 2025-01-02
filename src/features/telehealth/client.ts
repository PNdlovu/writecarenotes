/**
 * @fileoverview Telehealth Client SDK
 * @version 1.0.0
 */

interface TelehealthConfig {
  apiKey: string;
  region: string;
  language?: string;
  serviceType?: 'children' | 'adult-care';
  offline?: {
    enabled: boolean;
    syncInterval?: number;
  };
}

interface ConsultationParams {
  careHomeId: string;
  patientId: string;
  type: 'routine' | 'emergency' | 'followup';
  scheduledTime?: string;
  duration?: number;
  participants?: Array<{
    id: string;
    role: string;
  }>;
  notes?: string;
  safeguardingConcerns?: {
    identified: boolean;
    details?: string;
    actionRequired: boolean;
  };
}

export class TelehealthClient {
  private apiKey: string;
  private region: string;
  private language: string;
  private serviceType: string;
  private offlineEnabled: boolean;

  constructor(config: TelehealthConfig) {
    this.apiKey = config.apiKey;
    this.region = config.region;
    this.language = config.language || 'en-GB';
    this.serviceType = config.serviceType || 'adult-care';
    this.offlineEnabled = config.offline?.enabled || false;
  }

  /**
   * Create a new consultation
   */
  async createConsultation(params: ConsultationParams) {
    try {
      const response = await fetch('/api/telehealth/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'x-region': this.region,
          'accept-language': this.language,
          'x-service-type': this.serviceType
        },
        body: JSON.stringify({
          careHomeId: params.careHomeId,
          data: {
            ...params,
            type: params.type || 'routine',
            scheduledTime: params.scheduledTime || new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      if (this.offlineEnabled && error.name === 'NetworkError') {
        return await this.handleOffline('createConsultation', params);
      }
      throw error;
    }
  }

  /**
   * Initialize a video session
   */
  async startVideoSession(consultationId: string, participants: Array<any>) {
    try {
      const response = await fetch('/api/telehealth/video-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'x-region': this.region,
          'accept-language': this.language
        },
        body: JSON.stringify({
          consultationId,
          participants
        })
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      if (this.offlineEnabled && error.name === 'NetworkError') {
        return await this.handleOffline('startVideoSession', { consultationId, participants });
      }
      throw error;
    }
  }

  /**
   * Upload a document
   */
  async uploadDocument(params: any) {
    try {
      const response = await fetch('/api/telehealth/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'x-region': this.region,
          'accept-language': this.language
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      if (this.offlineEnabled && error.name === 'NetworkError') {
        return await this.handleOffline('uploadDocument', params);
      }
      throw error;
    }
  }

  /**
   * Check service health
   */
  async checkHealth() {
    const response = await fetch('/api/telehealth/health', {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'x-region': this.region
      }
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return await response.json();
  }

  /**
   * Handle offline operations
   */
  private async handleOffline(action: string, data: any) {
    const db = await this.openOfflineDB();
    const tx = db.transaction('offlineQueue', 'readwrite');
    const store = tx.objectStore('offlineQueue');

    const queueItem = {
      id: crypto.randomUUID(),
      action,
      data,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    await store.add(queueItem);

    return {
      status: 'queued',
      id: queueItem.id,
      message: 'Operation queued for offline processing',
      timestamp: queueItem.timestamp
    };
  }

  /**
   * Handle API errors
   */
  private async handleError(response: Response) {
    const error = await response.json();
    const enhancedError = new Error(error.error || 'API Error');
    enhancedError.name = error.code || 'API_ERROR';
    Object.assign(enhancedError, error);
    return enhancedError;
  }

  /**
   * Open IndexedDB for offline support
   */
  private async openOfflineDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TelehealthOfflineDB', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('offlineQueue')) {
          db.createObjectStore('offlineQueue', { keyPath: 'id' });
        }
      };
    });
  }
} 