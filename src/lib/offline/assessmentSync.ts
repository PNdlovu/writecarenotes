import { openDB, DBSchema } from 'idb';
import { Assessment } from '@/types/assessment';

interface AssessmentDB extends DBSchema {
  assessments: {
    key: string;
    value: Assessment & {
      syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
      lastModified: number;
      offlineCreated?: boolean;
    };
    indexes: {
      'by-status': string;
      'by-resident': string;
      'by-date': number;
    };
  };
  templates: {
    key: string;
    value: {
      template: any;
      version: number;
      lastUpdated: number;
    };
  };
}

class AssessmentSyncManager {
  private db: Promise<any>;
  private syncInProgress: boolean = false;

  constructor() {
    this.db = openDB<AssessmentDB>('assessments-offline', 1, {
      upgrade(db) {
        // Assessments store
        const assessmentStore = db.createObjectStore('assessments', {
          keyPath: 'id',
        });
        assessmentStore.createIndex('by-status', 'syncStatus');
        assessmentStore.createIndex('by-resident', 'residentId');
        assessmentStore.createIndex('by-date', 'lastModified');

        // Templates store
        db.createObjectStore('templates', { keyPath: 'id' });
      },
    });
  }

  async saveAssessment(assessment: Assessment): Promise<void> {
    const db = await this.db;
    await db.put('assessments', {
      ...assessment,
      syncStatus: navigator.onLine ? 'SYNCED' : 'PENDING',
      lastModified: Date.now(),
      offlineCreated: !navigator.onLine,
    });
  }

  async getOfflineAssessments(): Promise<Assessment[]> {
    const db = await this.db;
    return db.getAllFromIndex('assessments', 'by-status', 'PENDING');
  }

  async syncAssessments(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return;

    try {
      this.syncInProgress = true;
      const pendingAssessments = await this.getOfflineAssessments();

      for (const assessment of pendingAssessments) {
        try {
          // Attempt to sync with server
          await fetch('/api/assessments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assessment),
          });

          // Update sync status
          const db = await this.db;
          await db.put('assessments', {
            ...assessment,
            syncStatus: 'SYNCED',
            lastModified: Date.now(),
          });
        } catch (error) {
          console.error('Failed to sync assessment:', error);
          // Mark as failed but keep for retry
          const db = await this.db;
          await db.put('assessments', {
            ...assessment,
            syncStatus: 'FAILED',
            lastModified: Date.now(),
          });
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  async downloadTemplates(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      const response = await fetch('/api/assessment-templates');
      const templates = await response.json();

      const db = await this.db;
      for (const template of templates) {
        await db.put('templates', {
          ...template,
          lastUpdated: Date.now(),
        });
      }
    } catch (error) {
      console.error('Failed to download templates:', error);
    }
  }

  async getLocalTemplate(templateId: string): Promise<any> {
    const db = await this.db;
    return db.get('templates', templateId);
  }

  // Listen for online/offline events
  setupSyncListeners(): void {
    window.addEventListener('online', () => {
      this.syncAssessments();
      this.downloadTemplates();
    });

    // Periodic sync every 15 minutes when online
    setInterval(() => {
      if (navigator.onLine) {
        this.syncAssessments();
      }
    }, 15 * 60 * 1000);
  }
}


