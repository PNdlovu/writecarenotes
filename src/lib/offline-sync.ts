import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { toast } from '@/components/ui/use-toast';

interface MedicationAction {
  id: string;
  type: 'administration' | 'monitoring' | 'order';
  data: any;
  timestamp: Date;
  synced: boolean;
}

interface OfflineDB extends DBSchema {
  actions: {
    key: string;
    value: MedicationAction;
    indexes: { 'by-timestamp': Date };
  };
  medications: {
    key: string;
    value: any;
    indexes: { 'by-resident': string };
  };
}

export class OfflineSync {
  private static instance: OfflineSync;
  private db: IDBPDatabase<OfflineDB> | null = null;
  private syncInProgress = false;

  private constructor() {}

  public static getInstance(): OfflineSync {
    if (!OfflineSync.instance) {
      OfflineSync.instance = new OfflineSync();
    }
    return OfflineSync.instance;
  }

  async initialize() {
    if (this.db) return;

    try {
      this.db = await openDB<OfflineDB>('medication-offline-db', 1, {
        upgrade(db) {
          // Actions store
          const actionStore = db.createObjectStore('actions', {
            keyPath: 'id',
          });
          actionStore.createIndex('by-timestamp', 'timestamp');

          // Medications store
          const medicationStore = db.createObjectStore('medications', {
            keyPath: 'id',
          });
          medicationStore.createIndex('by-resident', 'residentId');
        },
      });

      // Start listening for online/offline events
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());

      // Initial sync if online
      if (navigator.onLine) {
        this.sync();
      }
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
      toast({
        variant: 'destructive',
        title: 'Offline Support Error',
        description: 'Failed to initialize offline storage',
      });
    }
  }

  private async handleOnline() {
    toast({
      title: 'Back Online',
      description: 'Syncing pending changes...',
    });
    await this.sync();
  }

  private handleOffline() {
    toast({
      variant: 'destructive',
      title: 'Offline Mode',
      description: 'Changes will be synced when back online',
    });
  }

  async recordAction(action: Omit<MedicationAction, 'id' | 'timestamp' | 'synced'>) {
    if (!this.db) await this.initialize();

    const fullAction: MedicationAction = {
      id: crypto.randomUUID(),
      ...action,
      timestamp: new Date(),
      synced: false,
    };

    await this.db?.add('actions', fullAction);

    if (navigator.onLine) {
      this.sync();
    }
  }

  async cacheMedication(medicationData: any) {
    if (!this.db) await this.initialize();

    await this.db?.put('medications', medicationData);
  }

  async getCachedMedication(id: string): Promise<any | null> {
    if (!this.db) await this.initialize();

    return await this.db?.get('medications', id) || null;
  }

  async getCachedMedicationsByResident(residentId: string): Promise<any[]> {
    if (!this.db) await this.initialize();

    return await this.db?.getAllFromIndex('medications', 'by-resident', residentId) || [];
  }

  private async sync() {
    if (this.syncInProgress || !navigator.onLine || !this.db) return;

    this.syncInProgress = true;
    const tx = this.db.transaction('actions', 'readwrite');
    const store = tx.objectStore('actions');
    const unsyncedActions = await store.index('by-timestamp').getAll();

    try {
      for (const action of unsyncedActions) {
        if (action.synced) continue;

        // Attempt to sync the action with the server
        const success = await this.syncAction(action);
        
        if (success) {
          // Mark action as synced
          await store.put({
            ...action,
            synced: true,
          });
        }
      }

      toast({
        title: 'Sync Complete',
        description: 'All changes have been synchronized',
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: 'Some changes could not be synchronized',
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncAction(action: MedicationAction): Promise<boolean> {
    try {
      const endpoint = this.getEndpointForAction(action.type);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action.data),
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to sync action ${action.id}:`, error);
      return false;
    }
  }

  private getEndpointForAction(type: MedicationAction['type']): string {
    switch (type) {
      case 'administration':
        return '/api/medications/administration';
      case 'monitoring':
        return '/api/medications/monitoring';
      case 'order':
        return '/api/medications/orders';
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }
}


