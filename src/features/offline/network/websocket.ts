import { Logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';
import { NetworkError } from '../types/errors';
import { NetworkConfig, NetworkStatus } from '../types';

export class WebSocketClient {
  private ws: globalThis.WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;
  private readonly logger: Logger;

  constructor(
    private readonly url: string,
    private readonly config?: NetworkConfig
  ) {
    this.logger = new Logger({ service: 'WebSocket' });
  }

  connect(): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new globalThis.WebSocket(this.url);

        this.ws.onopen = () => {
          this.logger.info('WebSocket connection established');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onclose = () => {
          this.logger.warn('WebSocket connection closed');
          this.handleDisconnection();
        };

        this.ws.onerror = (error) => {
          this.logger.error('WebSocket error', { error });
          reject(new NetworkError('WebSocket connection error', error));
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };
      } catch (error) {
        this.logger.error('Failed to create WebSocket connection', { error });
        reject(new NetworkError('Failed to create WebSocket connection', error));
      }
    });
  }

  private handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.logger.info('Attempting to reconnect', { attempt: this.reconnectAttempts });
        this.connect().catch((error) => {
          this.logger.error('Reconnection attempt failed', { error });
        });
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    } else {
      this.logger.error('Max reconnection attempts reached');
      metrics.trackEvent('websocket_max_reconnect_attempts');
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      this.logger.debug('Received WebSocket message', { data });
      // Handle different message types
      switch (data.type) {
        case 'sync':
          this.handleSyncMessage(data);
          break;
        case 'status':
          this.handleStatusMessage(data);
          break;
        default:
          this.logger.warn('Unknown message type', { type: data.type });
      }
    } catch (error) {
      this.logger.error('Failed to handle WebSocket message', { error });
    }
  }

  private handleSyncMessage(data: any) {
    // Implement sync message handling
  }

  private handleStatusMessage(data: any) {
    // Implement status message handling
  }

  send(data: any): void {
    if (!this.ws || this.ws.readyState !== globalThis.WebSocket.OPEN) {
      throw new NetworkError('WebSocket is not connected');
    }

    try {
      this.ws.send(JSON.stringify(data));
    } catch (error) {
      this.logger.error('Failed to send WebSocket message', { error });
      throw new NetworkError('Failed to send WebSocket message', error);
    }
  }

  getStatus(): NetworkStatus {
    if (!this.ws) {
      return NetworkStatus.DISCONNECTED;
    }

    switch (this.ws.readyState) {
      case globalThis.WebSocket.CONNECTING:
        return NetworkStatus.CONNECTING;
      case globalThis.WebSocket.OPEN:
        return NetworkStatus.CONNECTED;
      case globalThis.WebSocket.CLOSING:
      case globalThis.WebSocket.CLOSED:
      default:
        return NetworkStatus.DISCONNECTED;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
