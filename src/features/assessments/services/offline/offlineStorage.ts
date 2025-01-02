import { Assessment } from '../../types/assessment.types';
import { Visit } from '../../types/visit.types';
import localforage from 'localforage';
import { EncryptionService } from './encryption';
import { CompressionService } from './compression';
import { ConflictResolver, ConflictResolutionStrategy } from './conflictResolver';

// Configure offline storage
const offlineStore = localforage.createInstance({
  name: 'wsapp-offline',
  storeName: 'assessments'
});

interface OfflineChange {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'ASSESSMENT' | 'VISIT';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineStorage {
  private static instance: OfflineStorage;
  private encryptionService: EncryptionService;
  private conflictResolver: ConflictResolver;
  private compressionService: CompressionService;

  private constructor() {
    this.encryptionService = EncryptionService.getInstance();
    this.conflictResolver = ConflictResolver.getInstance();
    this.compressionService = CompressionService.getInstance();
    // Initialize offline storage
  }

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  // Assessment Methods
  async saveAssessment(assessment: Assessment): Promise<void> {
    const sensitiveFields: (keyof Assessment)[] = ['medicalHistory', 'medications', 'personalInfo'];
    const compressibleFields: (keyof Assessment)[] = ['notes', 'assessmentData', 'recommendations'];
    
    // First compress large fields
    const compressedAssessment = this.compressionService.compressFields(
      assessment,
      compressibleFields
    );
    
    // Then encrypt sensitive fields
    const encryptedAssessment = this.encryptionService.encryptFields(
      compressedAssessment,
      sensitiveFields
    );
    
    const key = `assessment_${assessment.id}`;
    await offlineStore.setItem(key, encryptedAssessment);
    await this.trackChange({
      id: assessment.id,
      type: 'UPDATE',
      entityType: 'ASSESSMENT',
      data: encryptedAssessment,
      timestamp: Date.now(),
      synced: false
    });
  }

  async getAssessment(id: string): Promise<Assessment | null> {
    const key = `assessment_${id}`;
    const encryptedAssessment = await offlineStore.getItem(key);
    if (!encryptedAssessment) return null;

    const sensitiveFields: (keyof Assessment)[] = ['medicalHistory', 'medications', 'personalInfo'];
    const compressibleFields: (keyof Assessment)[] = ['notes', 'assessmentData', 'recommendations'];
    
    // First decrypt sensitive fields
    const decryptedAssessment = this.encryptionService.decryptFields(
      encryptedAssessment,
      sensitiveFields
    );
    
    // Then decompress large fields
    return this.compressionService.decompressFields(
      decryptedAssessment,
      compressibleFields
    );
  }

  async getAllAssessments(): Promise<Assessment[]> {
    const assessments: Assessment[] = [];
    await offlineStore.iterate(async (value, key) => {
      if (key.startsWith('assessment_')) {
        const sensitiveFields: (keyof Assessment)[] = ['medicalHistory', 'medications', 'personalInfo'];
        const compressibleFields: (keyof Assessment)[] = ['notes', 'assessmentData', 'recommendations'];
        
        // First decrypt sensitive fields
        const decryptedAssessment = this.encryptionService.decryptFields(
          value,
          sensitiveFields
        );
        
        // Then decompress large fields
        assessments.push(await this.compressionService.decompressFields(
          decryptedAssessment,
          compressibleFields
        ));
      }
    });
    return assessments;
  }

  // Visit Methods
  async saveVisit(visit: Visit): Promise<void> {
    const key = `visit_${visit.id}`;
    await offlineStore.setItem(key, visit);
    await this.trackChange({
      id: visit.id,
      type: 'UPDATE',
      entityType: 'VISIT',
      data: visit,
      timestamp: Date.now(),
      synced: false
    });
  }

  async getVisit(id: string): Promise<Visit | null> {
    const key = `visit_${id}`;
    return await offlineStore.getItem(key);
  }

  async getAllVisits(): Promise<Visit[]> {
    const visits: Visit[] = [];
    await offlineStore.iterate((value, key) => {
      if (key.startsWith('visit_')) {
        visits.push(value as Visit);
      }
    });
    return visits;
  }

  // Change Tracking
  private async trackChange(change: OfflineChange): Promise<void> {
    const changes = await this.getPendingChanges();
    changes.push(change);
    await offlineStore.setItem('pending_changes', changes);
  }

  async getPendingChanges(): Promise<OfflineChange[]> {
    const changes = await offlineStore.getItem<OfflineChange[]>('pending_changes');
    return changes || [];
  }

  async markChangeSynced(changeId: string): Promise<void> {
    const changes = await this.getPendingChanges();
    const updatedChanges = changes.map(change => 
      change.id === changeId ? { ...change, synced: true } : change
    );
    await offlineStore.setItem('pending_changes', updatedChanges);
  }

  // Data Sync
  async syncPendingChanges(): Promise<void> {
    const changes = await this.getPendingChanges();
    const unsynced = changes.filter(change => !change.synced);

    for (const change of unsynced) {
      try {
        // Implement sync logic here based on change type
        await this.markChangeSynced(change.id);
      } catch (error) {
        console.error(`Failed to sync change ${change.id}:`, error);
      }
    }
  }

  // Conflict Resolution
  async resolveConflict<T extends Assessment | Visit>(
    clientData: T,
    serverData: T,
    strategy?: ConflictResolutionStrategy
  ): Promise<T> {
    const metadata = this.conflictResolver.detectConflicts(clientData, serverData);
    return await this.conflictResolver.resolveConflict(clientData, serverData, metadata, strategy);
  }

  // Storage Management
  async clearStorage(): Promise<void> {
    await offlineStore.clear();
  }

  async getStorageSize(): Promise<number> {
    let size = 0;
    await offlineStore.iterate((value) => {
      size += new Blob([JSON.stringify(value)]).size;
    });
    return size;
  }
}
