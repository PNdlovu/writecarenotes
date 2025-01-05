/**
 * @writecarenotes.com
 * @fileoverview Medication supplier repository
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Repository for managing medication suppliers in the database
 * with CRUD operations and data validation.
 */

import { db } from '@/lib/db';
import type {
  MedicationSupplier,
  SupplierCreateInput,
  SupplierUpdateInput,
  SupplierListResponse,
} from '../../types/supplier';

export class SupplierRepository {
  /**
   * Get a list of suppliers for an organization
   */
  async getSuppliers(organizationId: string): Promise<SupplierListResponse> {
    const suppliers = await db.medicationSupplier.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        contacts: true,
      },
    });

    const total = await db.medicationSupplier.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });

    return {
      suppliers,
      total,
    };
  }

  /**
   * Get a supplier by ID
   */
  async getSupplierById(id: string): Promise<MedicationSupplier | null> {
    return db.medicationSupplier.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        contacts: true,
      },
    });
  }

  /**
   * Create a new supplier
   */
  async createSupplier(
    organizationId: string,
    data: SupplierCreateInput
  ): Promise<MedicationSupplier> {
    const { contacts, ...supplierData } = data;

    return db.medicationSupplier.create({
      data: {
        ...supplierData,
        organizationId,
        contacts: {
          create: contacts,
        },
      },
      include: {
        contacts: true,
      },
    });
  }

  /**
   * Update a supplier
   */
  async updateSupplier(
    id: string,
    data: SupplierUpdateInput
  ): Promise<MedicationSupplier> {
    const { contacts, ...supplierData } = data;

    // If contacts are provided, update them
    if (contacts) {
      // Delete existing contacts
      await db.supplierContact.deleteMany({
        where: {
          supplierId: id,
        },
      });

      // Create new contacts
      await db.supplierContact.createMany({
        data: contacts.map(contact => ({
          ...contact,
          supplierId: id,
        })),
      });
    }

    return db.medicationSupplier.update({
      where: { id },
      data: supplierData,
      include: {
        contacts: true,
      },
    });
  }

  /**
   * Soft delete a supplier
   */
  async deleteSupplier(id: string): Promise<void> {
    await db.medicationSupplier.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Search suppliers by name or account number
   */
  async searchSuppliers(
    organizationId: string,
    searchTerm: string
  ): Promise<MedicationSupplier[]> {
    return db.medicationSupplier.findMany({
      where: {
        organizationId,
        deletedAt: null,
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            accountNumber: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        contacts: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get suppliers by medication ID
   */
  async getSuppliersByMedicationId(
    medicationId: string
  ): Promise<MedicationSupplier[]> {
    return db.medicationSupplier.findMany({
      where: {
        deletedAt: null,
        medications: {
          some: {
            id: medicationId,
          },
        },
      },
      include: {
        contacts: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Link a supplier to a medication
   */
  async linkSupplierToMedication(
    supplierId: string,
    medicationId: string
  ): Promise<void> {
    await db.medicationSupplier.update({
      where: { id: supplierId },
      data: {
        medications: {
          connect: {
            id: medicationId,
          },
        },
      },
    });
  }

  /**
   * Unlink a supplier from a medication
   */
  async unlinkSupplierFromMedication(
    supplierId: string,
    medicationId: string
  ): Promise<void> {
    await db.medicationSupplier.update({
      where: { id: supplierId },
      data: {
        medications: {
          disconnect: {
            id: medicationId,
          },
        },
      },
    });
  }
} 