/**
 * @fileoverview Accounting Module Offline Sync Implementation
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Handles offline synchronization for accounting operations with conflict resolution
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Database Schema
interface AccountingDBSchema extends DBSchema {
  journalEntries: {
    key: string;
    value: {
      id: string;
      data: any;
      status: 'pending' | 'synced' | 'error';
      timestamp: number;
      retryCount: number;
    };
    indexes: { 'by-status': string };
  };
  accounts: {
    key: string;
    value: {
      id: string;
      data: any;
      lastSynced: number;
    };
  };
}

// Validation Schemas
const OfflineJournalEntrySchema = z.object({
  id: z.string().uuid(),
  date: z.string().datetime(),
  description: z.string(),
  entries: z.array(z.object({
    accountId: z.string().uuid(),
    debit: z.number().optional(),
    credit: z.number().optional(),
    description: z.string().optional()
  })).min(2),
  metadata: z.record(z.any()).optional()
});

export class AccountingSync {
  private db: IDBPDatabase<AccountingDBSchema>;
  private syncInProgress: boolean = false;
  private maxRetries: number = 3;

  constructor() {
    this.initDatabase();
  }

  /**
   * Initialize IndexedDB database
   */
  private async initDatabase() {
    this.db = await openDB<AccountingDBSchema>('accounting-offline', 1, {
      upgrade(db) {
        // Journal Entries Store
        const journalStore = db.createObjectStore('journalEntries', {
          keyPath: 'id'
        });
        journalStore.createIndex('by-status', 'status');

        // Accounts Store
        db.createObjectStore('accounts', {
          keyPath: 'id'
        });
      }
    });
  }

  /**
   * Queue a journal entry for sync
   */
  async queueJournalEntry(entry: any) {
    try {
      // Validate entry
      const validated = OfflineJournalEntrySchema.parse({
        ...entry,
        id: entry.id || uuidv4()
      });

      // Store in IndexedDB
      await this.db.add('journalEntries', {
        id: validated.id,
        data: validated,
        status: 'pending',
        timestamp: Date.now(),
        retryCount: 0
      });

      // Trigger sync if online
      if (navigator.onLine) {
        this.syncPendingEntries();
      }

      return validated.id;
    } catch (error) {
      console.error('Failed to queue journal entry:', error);
      throw new Error('Failed to queue journal entry for sync');
    }
  }

  /**
   * Sync pending entries when online
   */
  async syncPendingEntries() {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const tx = this.db.transaction('journalEntries', 'readwrite');
      const index = tx.store.index('by-status');
      const pendingEntries = await index.getAll('pending');

      for (const entry of pendingEntries) {
        try {
          // Attempt to sync with server
          await this.syncEntry(entry);

          // Update status to synced
          await tx.store.put({
            ...entry,
            status: 'synced'
          });
        } catch (error) {
          console.error(`Failed to sync entry ${entry.id}:`, error);

          // Update retry count and status
          const newStatus = entry.retryCount >= this.maxRetries ? 'error' : 'pending';
          await tx.store.put({
            ...entry,
            status: newStatus,
            retryCount: entry.retryCount + 1
          });
        }
      }

      await tx.done;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync a single entry with conflict resolution
   */
  private async syncEntry(entry: any) {
    // Get server version if exists
    const serverEntry = await this.fetchServerEntry(entry.id);

    if (serverEntry) {
      // Handle conflict
      if (serverEntry.timestamp > entry.timestamp) {
        throw new Error('Server has newer version');
      }
    }

    // Send to server
    await this.sendToServer(entry.data);
  }

  /**
   * Fetch entry from server
   */
  private async fetchServerEntry(id: string) {
    try {
      const response = await fetch(`/api/accounting/ledger/entries/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  /**
   * Send entry to server
   */
  private async sendToServer(data: any) {
    const response = await fetch('/api/accounting/ledger/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to sync with server');
    }

    return response.json();
  }

  /**
   * Get offline entries
   */
  async getOfflineEntries() {
    return this.db.getAll('journalEntries');
  }

  /**
   * Clear synced entries
   */
  async clearSyncedEntries() {
    const tx = this.db.transaction('journalEntries', 'readwrite');
    const index = tx.store.index('by-status');
    const syncedEntries = await index.getAllKeys('synced');

    for (const key of syncedEntries) {
      await tx.store.delete(key);
    }

    await tx.done;
  }

  /**
   * Handle online status change
   */
  handleOnline = () => {
    this.syncPendingEntries();
  }

  /**
   * Initialize online/offline listeners
   */
  initListeners() {
    window.addEventListener('online', this.handleOnline);
    return () => {
      window.removeEventListener('online', this.handleOnline);
    };
  }
}

// Export singleton instance
export const accountingSync = new AccountingSync(); 