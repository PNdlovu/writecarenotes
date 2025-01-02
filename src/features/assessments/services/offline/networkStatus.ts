type NetworkCallback = () => void;

export class NetworkStatus {
  private static instance: NetworkStatus;
  private onlineCallbacks: NetworkCallback[] = [];
  private offlineCallbacks: NetworkCallback[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.notifyOnline());
      window.addEventListener('offline', () => this.notifyOffline());
    }
  }

  static getInstance(): NetworkStatus {
    if (!NetworkStatus.instance) {
      NetworkStatus.instance = new NetworkStatus();
    }
    return NetworkStatus.instance;
  }

  isOnline(): boolean {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true; // Default to online for SSR
  }

  onOnline(callback: NetworkCallback): void {
    this.onlineCallbacks.push(callback);
  }

  onOffline(callback: NetworkCallback): void {
    this.offlineCallbacks.push(callback);
  }

  private notifyOnline(): void {
    this.onlineCallbacks.forEach(callback => callback());
  }

  private notifyOffline(): void {
    this.offlineCallbacks.forEach(callback => callback());
  }

  // Remove callback listeners
  removeOnlineCallback(callback: NetworkCallback): void {
    this.onlineCallbacks = this.onlineCallbacks.filter(cb => cb !== callback);
  }

  removeOfflineCallback(callback: NetworkCallback): void {
    this.offlineCallbacks = this.offlineCallbacks.filter(cb => cb !== callback);
  }
}
