/**
 * @writecarenotes.com
 * @fileoverview Payroll service with offline support
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing payroll operations with offline support.
 * Handles payroll calculations, submissions, and approvals with
 * offline-first capabilities.
 */

import { OfflineService } from '@/lib/offline/offlineService';
import type { PayrollData, PayrollConfig } from '../types';

export class PayrollService {
  private offlineService: OfflineService<PayrollData>;

  constructor() {
    this.offlineService = new OfflineService<PayrollData>({
      storeName: 'payroll',
      onSyncComplete: (event) => {
        console.log('Payroll sync completed:', event);
      },
      onSyncError: (error) => {
        console.error('Payroll sync error:', error);
      }
    });
  }

  async initialize() {
    await this.offlineService.init();
  }

  async submitPayroll(data: PayrollData) {
    return this.offlineService.saveData(data.id, data);
  }

  async getPayroll(id: string) {
    return this.offlineService.getData(id);
  }

  async getAllPayrolls() {
    return this.offlineService.getAll();
  }

  async syncPayroll() {
    return this.offlineService.processSyncQueue();
  }

  async getPayrollConfig(): Promise<PayrollConfig> {
    return this.offlineService.getData('config') as Promise<PayrollConfig>;
  }

  async updatePayrollConfig(config: PayrollConfig) {
    return this.offlineService.saveData('config', config);
  }
}
