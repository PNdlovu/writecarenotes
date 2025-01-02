/**
 * @writecarenotes.com
 * @fileoverview Medication supplier types
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for medication suppliers and related entities
 */

export type OrderMethod = 'phone' | 'email' | 'portal' | 'fax' | 'edi';

export interface SupplierContact {
  id?: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isMain: boolean;
}

export interface MedicationSupplier {
  id: string;
  name: string;
  accountNumber?: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  orderMethods: OrderMethod[];
  contacts: SupplierContact[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}

export interface SupplierListResponse {
  suppliers: MedicationSupplier[];
  total: number;
}

export interface SupplierCreateInput {
  name: string;
  accountNumber?: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  orderMethods: OrderMethod[];
  contacts: Omit<SupplierContact, 'id'>[];
  notes?: string;
}

export interface SupplierUpdateInput extends Partial<SupplierCreateInput> {
  id: string;
} 