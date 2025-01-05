import { HandoverTask } from '../types/handover';
import { IndexedDBStorage } from '@/lib/storage/indexed-db';
import { NetworkStatus } from '@/lib/network';
import { ImageOptimizer } from '@/lib/media/image-optimizer';
import { VoiceRecorder } from '@/lib/media/voice-recorder';
import { BarcodeScanner } from '@/lib/mobile/barcode-scanner';
import { OfflineMap } from '@/lib/mobile/offline-map';
import { PushNotificationManager } from '@/lib/mobile/push-notifications';

interface MobileTaskView {
  compactTitle: string;
  priorityIcon: string;
  touchFriendly: boolean;
  lazyLoadEnabled?: boolean;
  thumbnailUrl?: string;
}

interface TouchControls {
  minTouchArea: number;
  spacing: number;
  elements: {
    buttons: { width: number; height: number };
    inputs: { height: number };
    lists: { itemHeight: number };
  };
}

interface PushNotification {
  taskId: string;
  type: 'TASK_UPDATE' | 'REMINDER' | 'ALERT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  message?: string;
  data?: any;
}

export class MobileHandoverService {
  private db: IndexedDBStorage;
  private networkStatus: NetworkStatus;
  private imageOptimizer: ImageOptimizer;
  private voiceRecorder: VoiceRecorder;
  private barcodeScanner: BarcodeScanner;
  private offlineMap: OfflineMap;
  private pushManager: PushNotificationManager;
  private pendingUploads: Map<string, Blob>;
  private pendingNotifications: PushNotification[];

  constructor() {
    this.db = new IndexedDBStorage('mobile_handover');
    this.networkStatus = new NetworkStatus();
    this.imageOptimizer = new ImageOptimizer();
    this.voiceRecorder = new VoiceRecorder();
    this.barcodeScanner = new BarcodeScanner();
    this.offlineMap = new OfflineMap();
    this.pushManager = new PushNotificationManager();
    this.pendingUploads = new Map();
    this.pendingNotifications = [];

    this.initializeOfflineSupport();
  }

  adaptTaskForMobile(task: HandoverTask): MobileTaskView {
    return {
      compactTitle: this.truncateTitle(task.title),
      priorityIcon: this.getPriorityIcon(task.priority),
      touchFriendly: true,
      lazyLoadEnabled: true,
      thumbnailUrl: task.resident?.photo 
        ? this.imageOptimizer.getThumbnail(task.resident.photo)
        : undefined,
    };
  }

  getTouchControls(): TouchControls {
    return {
      minTouchArea: 44, // iOS minimum touch target
      spacing: 12,
      elements: {
        buttons: { width: 48, height: 48 },
        inputs: { height: 44 },
        lists: { itemHeight: 72 },
      },
    };
  }

  async saveTaskLocally(task: HandoverTask): Promise<void> {
    try {
      await this.db.set(`task_${task.id}`, {
        ...task,
        offlineSync: {
          status: 'PENDING',
          lastSyncedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error saving task locally:', error);
      throw error;
    }
  }

  async getLocalTask(taskId: string): Promise<HandoverTask | null> {
    try {
      return await this.db.get(`task_${taskId}`);
    } catch (error) {
      console.error('Error getting local task:', error);
      return null;
    }
  }

  async queueImageUpload(taskId: string, image: Blob): Promise<void> {
    try {
      const optimizedImage = await this.imageOptimizer.optimize(image);
      this.pendingUploads.set(taskId, optimizedImage);
      await this.db.set(`image_${taskId}`, optimizedImage);
    } catch (error) {
      console.error('Error queuing image upload:', error);
      throw error;
    }
  }

  async getPendingUploads(): Promise<string[]> {
    return Array.from(this.pendingUploads.keys());
  }

  async optimizeImagesForMobile(task: HandoverTask): Promise<HandoverTask & { lazyLoadEnabled: boolean; thumbnailUrl?: string }> {
    if (task.resident?.photo) {
      const thumbnailUrl = await this.imageOptimizer.getThumbnail(task.resident.photo);
      return {
        ...task,
        resident: {
          ...task.resident,
          photo: thumbnailUrl,
        },
        lazyLoadEnabled: true,
        thumbnailUrl,
      };
    }
    return { ...task, lazyLoadEnabled: true };
  }

  async getTasksPage(page: number, pageSize: number = 20): Promise<{ tasks: HandoverTask[]; hasMore: boolean }> {
    try {
      const start = (page - 1) * pageSize;
      const tasks = await this.db.getAll();
      const paginatedTasks = tasks.slice(start, start + pageSize);
      return {
        tasks: paginatedTasks,
        hasMore: tasks.length > start + pageSize,
      };
    } catch (error) {
      console.error('Error getting tasks page:', error);
      return { tasks: [], hasMore: false };
    }
  }

  async scanBarcode(): Promise<{ success: boolean; code?: string }> {
    try {
      const code = await this.barcodeScanner.scan();
      return { success: true, code };
    } catch (error) {
      console.error('Error scanning barcode:', error);
      return { success: false };
    }
  }

  async recordVoiceNote(taskId: string, audio: Blob): Promise<{ success: boolean; duration?: number }> {
    try {
      const compressedAudio = await this.voiceRecorder.compressAudio(audio);
      await this.db.set(`voice_${taskId}`, compressedAudio);
      const duration = await this.voiceRecorder.getDuration(compressedAudio);
      return { success: true, duration };
    } catch (error) {
      console.error('Error recording voice note:', error);
      return { success: false };
    }
  }

  async getOfflineMap(location: { lat: number; lng: number }): Promise<{ cached: boolean; lastUpdated?: Date }> {
    try {
      const map = await this.offlineMap.getMap(location);
      return {
        cached: true,
        lastUpdated: map.lastUpdated,
      };
    } catch (error) {
      console.error('Error getting offline map:', error);
      return { cached: false };
    }
  }

  async registerPushNotifications(token: string): Promise<{ success: boolean; deviceId?: string }> {
    try {
      const registration = await this.pushManager.register(token);
      return {
        success: true,
        deviceId: registration.deviceId,
      };
    } catch (error) {
      console.error('Error registering push notifications:', error);
      return { success: false };
    }
  }

  async queueNotification(notification: PushNotification): Promise<void> {
    try {
      this.pendingNotifications.push(notification);
      await this.db.set(`notification_${notification.taskId}`, notification);
    } catch (error) {
      console.error('Error queuing notification:', error);
      throw error;
    }
  }

  async getPendingNotifications(): Promise<PushNotification[]> {
    return this.pendingNotifications;
  }

  private initializeOfflineSupport(): void {
    window.addEventListener('online', this.syncPendingData.bind(this));
    this.setupPeriodicSync();
  }

  private async syncPendingData(): Promise<void> {
    if (this.networkStatus.isOnline) {
      await this.syncPendingUploads();
      await this.syncPendingNotifications();
    }
  }

  private async syncPendingUploads(): Promise<void> {
    for (const [taskId, image] of this.pendingUploads) {
      try {
        await this.uploadImage(taskId, image);
        this.pendingUploads.delete(taskId);
        await this.db.delete(`image_${taskId}`);
      } catch (error) {
        console.error(`Error syncing image for task ${taskId}:`, error);
      }
    }
  }

  private async syncPendingNotifications(): Promise<void> {
    while (this.pendingNotifications.length > 0) {
      const notification = this.pendingNotifications.shift();
      if (notification) {
        try {
          await this.pushManager.send(notification);
          await this.db.delete(`notification_${notification.taskId}`);
        } catch (error) {
          console.error(`Error syncing notification for task ${notification.taskId}:`, error);
          this.pendingNotifications.unshift(notification);
          break;
        }
      }
    }
  }

  private setupPeriodicSync(): void {
    setInterval(() => {
      this.syncPendingData();
    }, 5 * 60 * 1000); // Sync every 5 minutes
  }

  private truncateTitle(title: string, maxLength: number = 50): string {
    return title.length > maxLength
      ? `${title.substring(0, maxLength - 3)}...`
      : title;
  }

  private getPriorityIcon(priority: string): string {
    const icons = {
      HIGH: '🔴',
      MEDIUM: '🟡',
      LOW: '🟢',
      URGENT: '⚡',
    };
    return icons[priority as keyof typeof icons] || '⚪';
  }

  private async uploadImage(taskId: string, image: Blob): Promise<void> {
    // Implementation for uploading image to server
    // This would typically use a fetch or axios call
  }
}
