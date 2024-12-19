/**
 * @fileoverview Local Storage Repository for offline support
 * @version 1.0.0
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { 
  CarePlan, 
  CarePlanTemplate, 
  CarePlanStats,
  CarePlanFilters 
} from '@/features/careplans/types/careplan.types';

interface CarePlanDB extends DBSchema {
  careplans: {
    key: string;
    value: CarePlan;
    indexes: {
      'by-resident': string;
      'by-carehome': string;
      'by-sync-status': string;
    };
  };
  templates: {
    key: string;
    value: CarePlanTemplate;
    indexes: {
      'by-language': string;
      'by-region': string;
    };
  };
}

export class LocalStorageRepository {
  private dbName: string;
  private db: IDBPDatabase<CarePlanDB>;

  constructor(dbName: string) {
    this.dbName = dbName;
    this.initDB();
  }

  private async initDB() {
    this.db = await openDB<CarePlanDB>(this.dbName, 1, {
      upgrade(db) {
        const carePlanStore = db.createObjectStore('careplans', { keyPath: 'id' });
        carePlanStore.createIndex('by-resident', 'residentId');
        carePlanStore.createIndex('by-carehome', 'careHomeId');
        carePlanStore.createIndex('by-sync-status', 'syncStatus');

        const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
        templateStore.createIndex('by-language', 'language');
        templateStore.createIndex('by-region', 'region');
      },
    });
  }

  async save(id: string, carePlan: CarePlan): Promise<void> {
    await this.db.put('careplans', carePlan);
  }

  async saveCarePlans(carePlans: CarePlan[]): Promise<void> {
    const tx = this.db.transaction('careplans', 'readwrite');
    await Promise.all([
      ...carePlans.map(plan => tx.store.put(plan)),
      tx.done
    ]);
  }

  async get(id: string): Promise<CarePlan | undefined> {
    return await this.db.get('careplans', id);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete('careplans', id);
  }

  async getCarePlansByResident(residentId: string): Promise<CarePlan[]> {
    return await this.db.getAllFromIndex('careplans', 'by-resident', residentId);
  }

  async getCarePlansByCareHome(careHomeId: string, filters?: CarePlanFilters): Promise<CarePlan[]> {
    const plans = await this.db.getAllFromIndex('careplans', 'by-carehome', careHomeId);
    
    if (!filters) return plans;

    return plans.filter(plan => {
      if (filters.status && plan.status !== filters.status) return false;
      if (filters.language && plan.language !== filters.language) return false;
      if (filters.region && plan.region !== filters.region) return false;
      if (filters.fromDate && new Date(plan.createdAt) < new Date(filters.fromDate)) return false;
      if (filters.toDate && new Date(plan.createdAt) > new Date(filters.toDate)) return false;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          plan.title.toLowerCase().includes(searchLower) ||
          plan.description.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }

  async getPendingSync(): Promise<CarePlan[]> {
    return await this.db.getAllFromIndex('careplans', 'by-sync-status', 'pending');
  }

  async updateSyncStatus(id: string, status: 'synced' | 'error'): Promise<void> {
    const plan = await this.get(id);
    if (plan) {
      plan.syncStatus = status;
      await this.save(id, plan);
    }
  }

  async getCarePlanStats(careHomeId: string): Promise<CarePlanStats> {
    const plans = await this.getCarePlansByCareHome(careHomeId);
    
    return {
      total: plans.length,
      active: plans.filter(p => p.status === 'active').length,
      archived: plans.filter(p => p.status === 'archived').length,
      draft: plans.filter(p => p.status === 'draft').length,
      lastUpdated: new Date().toISOString()
    };
  }

  async getCarePlanTemplates(isActive: boolean): Promise<CarePlanTemplate[]> {
    const templates = await this.db.getAll('templates');
    return templates.filter(t => t.isActive === isActive);
  }

  async saveTemplate(template: CarePlanTemplate): Promise<void> {
    await this.db.put('templates', template);
  }

  async saveTemplates(templates: CarePlanTemplate[]): Promise<void> {
    const tx = this.db.transaction('templates', 'readwrite');
    await Promise.all([
      ...templates.map(template => tx.store.put(template)),
      tx.done
    ]);
  }
}


