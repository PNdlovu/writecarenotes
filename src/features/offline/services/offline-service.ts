class OfflineService {
  private isOnline: boolean = navigator.onLine;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnline(true));
      window.addEventListener('offline', () => this.setOnline(false));
    }
  }

  private setOnline(status: boolean) {
    this.isOnline = status;
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Add methods for handling offline data storage and sync
  async syncData(): Promise<void> {
    // TODO: Implement data syncing when coming back online
  }
}

export const offlineService = new OfflineService();
