/**
 * @writecarenotes.com
 * @fileoverview Medication supplier service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing medication suppliers with business logic
 * and validation rules.
 */

import { SupplierRepository } from './repositories/supplierRepository';
import type {
  MedicationSupplier,
  SupplierCreateInput,
  SupplierUpdateInput,
  SupplierListResponse,
  OrderMethod,
} from '../types/supplier';

export class SupplierService {
  private repository: SupplierRepository;

  constructor() {
    this.repository = new SupplierRepository();
  }

  /**
   * Get a list of suppliers for an organization
   */
  async getSuppliers(organizationId: string): Promise<SupplierListResponse> {
    return this.repository.getSuppliers(organizationId);
  }

  /**
   * Get a supplier by ID
   */
  async getSupplierById(id: string): Promise<MedicationSupplier | null> {
    return this.repository.getSupplierById(id);
  }

  /**
   * Create a new supplier
   */
  async createSupplier(
    organizationId: string,
    data: SupplierCreateInput
  ): Promise<MedicationSupplier> {
    // Validate that at least one contact is marked as main
    const hasMainContact = data.contacts.some(contact => contact.isMain);
    if (!hasMainContact) {
      throw new Error('At least one contact must be marked as main');
    }

    // Validate that only one contact is marked as main
    const mainContactCount = data.contacts.filter(contact => contact.isMain).length;
    if (mainContactCount > 1) {
      throw new Error('Only one contact can be marked as main');
    }

    // Validate order methods
    if (!data.orderMethods.length) {
      throw new Error('At least one order method is required');
    }

    return this.repository.createSupplier(organizationId, data);
  }

  /**
   * Update a supplier
   */
  async updateSupplier(
    id: string,
    data: SupplierUpdateInput
  ): Promise<MedicationSupplier> {
    // Get existing supplier
    const existing = await this.repository.getSupplierById(id);
    if (!existing) {
      throw new Error('Supplier not found');
    }

    // If contacts are being updated, validate them
    if (data.contacts) {
      const hasMainContact = data.contacts.some(contact => contact.isMain);
      if (!hasMainContact) {
        throw new Error('At least one contact must be marked as main');
      }

      const mainContactCount = data.contacts.filter(contact => contact.isMain).length;
      if (mainContactCount > 1) {
        throw new Error('Only one contact can be marked as main');
      }
    }

    // If order methods are being updated, validate them
    if (data.orderMethods && !data.orderMethods.length) {
      throw new Error('At least one order method is required');
    }

    return this.repository.updateSupplier(id, data);
  }

  /**
   * Delete a supplier
   */
  async deleteSupplier(id: string): Promise<void> {
    // Get existing supplier
    const existing = await this.repository.getSupplierById(id);
    if (!existing) {
      throw new Error('Supplier not found');
    }

    await this.repository.deleteSupplier(id);
  }

  /**
   * Search suppliers by name or account number
   */
  async searchSuppliers(
    organizationId: string,
    searchTerm: string
  ): Promise<MedicationSupplier[]> {
    return this.repository.searchSuppliers(organizationId, searchTerm);
  }

  /**
   * Get suppliers by medication ID
   */
  async getSuppliersByMedicationId(
    medicationId: string
  ): Promise<MedicationSupplier[]> {
    return this.repository.getSuppliersByMedicationId(medicationId);
  }

  /**
   * Link a supplier to a medication
   */
  async linkSupplierToMedication(
    supplierId: string,
    medicationId: string
  ): Promise<void> {
    // Get existing supplier
    const existing = await this.repository.getSupplierById(supplierId);
    if (!existing) {
      throw new Error('Supplier not found');
    }

    await this.repository.linkSupplierToMedication(supplierId, medicationId);
  }

  /**
   * Unlink a supplier from a medication
   */
  async unlinkSupplierFromMedication(
    supplierId: string,
    medicationId: string
  ): Promise<void> {
    // Get existing supplier
    const existing = await this.repository.getSupplierById(supplierId);
    if (!existing) {
      throw new Error('Supplier not found');
    }

    await this.repository.unlinkSupplierFromMedication(supplierId, medicationId);
  }

  /**
   * Get order method label
   */
  getOrderMethodLabel(method: OrderMethod): string {
    const labels: Record<OrderMethod, string> = {
      phone: 'Phone',
      email: 'Email',
      portal: 'Online Portal',
      fax: 'Fax',
      edi: 'EDI',
    };

    return labels[method] || method;
  }
} 