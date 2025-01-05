/**
 * @writecarenotes.com
 * @fileoverview Tests for Stock Management Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Test suite for medication stock management, including inventory tracking,
 * automatic reordering, and controlled drugs management.
 */

import { StockManagementService } from '../stock/StockManagementService';
import { Region } from '@/features/compliance/types/compliance.types';
import { StockLevel, OrderPriority, StorageCondition } from '@/features/medications/types';

// Mock external services
jest.mock('@/lib/pharmacy-api');
jest.mock('@/lib/storage-monitor');
jest.mock('@/lib/temperature-monitor');

describe('StockManagementService', () => {
  let service: StockManagementService;
  const mockOrganizationId = 'org123';
  const mockLocationId = 'loc456';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StockManagementService({
      organizationId: mockOrganizationId,
      locationId: mockLocationId,
      region: Region.ENGLAND
    });
  });

  describe('Stock Level Monitoring', () => {
    const mockMedication = {
      id: 'med123',
      name: 'Paracetamol',
      strength: '500mg',
      form: 'tablet',
      currentStock: 100,
      minimumLevel: 50,
      reorderLevel: 75,
      maximumLevel: 200,
      location: 'main-cabinet',
      isControlledDrug: false
    };

    it('should check stock levels correctly', async () => {
      const stockLevel = await service.checkStockLevel(mockMedication.id);
      expect(stockLevel).toEqual({
        medication: mockMedication,
        status: StockLevel.NORMAL,
        daysRemaining: expect.any(Number)
      });
    });

    it('should trigger reorder when below threshold', async () => {
      const lowStockMed = { ...mockMedication, currentStock: 40 };
      const reorderSpy = jest.spyOn(service as any, 'initiateReorder');
      
      await service.checkStockLevel(lowStockMed.id);
      expect(reorderSpy).toHaveBeenCalledWith(
        lowStockMed.id,
        expect.any(Number),
        OrderPriority.NORMAL
      );
    });

    it('should handle multiple storage locations', async () => {
      const locations = await service.getStorageLocations(mockMedication.id);
      expect(locations).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          type: expect.any(String),
          currentStock: expect.any(Number)
        })
      ]));
    });
  });

  describe('Controlled Drugs Management', () => {
    const mockControlledDrug = {
      id: 'cd123',
      name: 'Morphine',
      strength: '10mg',
      form: 'ampoule',
      schedule: 2,
      currentStock: 50,
      minimumLevel: 20,
      location: 'cd-cabinet',
      isControlledDrug: true
    };

    it('should enforce double signature for CD transactions', async () => {
      const transaction = {
        medicationId: mockControlledDrug.id,
        quantity: 2,
        type: 'administration',
        witness: 'user789'
      };

      await expect(service.recordCDTransaction(transaction, null))
        .rejects
        .toThrow('Witness signature required for controlled drugs');
    });

    it('should maintain running balance for CDs', async () => {
      const transaction = {
        medicationId: mockControlledDrug.id,
        quantity: 2,
        type: 'administration',
        witness: 'user789',
        authorizedBy: 'user123'
      };

      const result = await service.recordCDTransaction(transaction);
      expect(result).toEqual({
        success: true,
        newBalance: 48,
        lastChecked: expect.any(Date)
      });
    });

    it('should enforce storage conditions for CDs', async () => {
      const conditions = await service.verifyStorageConditions('cd-cabinet');
      expect(conditions).toEqual({
        compliant: true,
        temperature: expect.any(Number),
        humidity: expect.any(Number),
        securityStatus: 'LOCKED'
      });
    });
  });

  describe('Stock Reconciliation', () => {
    it('should identify discrepancies', async () => {
      const reconciliation = await service.reconcileStock(mockLocationId);
      expect(reconciliation).toEqual({
        completed: true,
        discrepancies: expect.any(Array),
        lastReconciled: expect.any(Date)
      });
    });

    it('should handle stock adjustments', async () => {
      const adjustment = {
        medicationId: 'med123',
        expectedStock: 100,
        actualStock: 98,
        reason: 'Breakage',
        notes: 'Two tablets found broken in container'
      };

      const result = await service.recordStockAdjustment(adjustment);
      expect(result).toEqual({
        success: true,
        adjustmentId: expect.any(String),
        newStock: 98
      });
    });

    it('should require approval for large adjustments', async () => {
      const largeAdjustment = {
        medicationId: 'med123',
        expectedStock: 100,
        actualStock: 50,
        reason: 'Count error',
        notes: 'Large discrepancy found during audit'
      };

      await expect(service.recordStockAdjustment(largeAdjustment))
        .rejects
        .toThrow('Large adjustment requires manager approval');
    });
  });

  describe('Storage Conditions', () => {
    it('should monitor temperature-sensitive medications', async () => {
      const storageCheck = await service.checkStorageConditions([
        { id: 'fridge1', type: StorageCondition.REFRIGERATED },
        { id: 'cabinet1', type: StorageCondition.ROOM_TEMPERATURE }
      ]);

      expect(storageCheck).toEqual({
        compliant: true,
        locations: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            temperature: expect.any(Number),
            humidity: expect.any(Number),
            status: expect.any(String)
          })
        ])
      });
    });

    it('should alert on storage condition violations', async () => {
      jest.spyOn(service as any, 'checkTemperature')
        .mockResolvedValueOnce(9); // Above fridge temperature

      const alertSpy = jest.spyOn(service as any, 'raiseStorageAlert');
      await service.checkStorageConditions([
        { id: 'fridge1', type: StorageCondition.REFRIGERATED }
      ]);

      expect(alertSpy).toHaveBeenCalledWith(
        'fridge1',
        expect.objectContaining({
          type: 'TEMPERATURE_VIOLATION',
          severity: 'HIGH'
        })
      );
    });
  });

  describe('Automatic Reordering', () => {
    const mockOrder = {
      medicationId: 'med123',
      quantity: 100,
      priority: OrderPriority.NORMAL
    };

    it('should calculate correct reorder quantity', async () => {
      const quantity = await service.calculateReorderQuantity('med123');
      expect(quantity).toEqual({
        recommended: expect.any(Number),
        minimum: expect.any(Number),
        maximum: expect.any(Number),
        daysSupply: expect.any(Number)
      });
    });

    it('should handle emergency orders', async () => {
      const emergencyOrder = { ...mockOrder, priority: OrderPriority.URGENT };
      const result = await service.placeOrder(emergencyOrder);
      expect(result).toEqual({
        success: true,
        orderId: expect.any(String),
        expedited: true
      });
    });

    it('should consolidate orders for same supplier', async () => {
      const orders = [
        { ...mockOrder, medicationId: 'med123' },
        { ...mockOrder, medicationId: 'med456' }
      ];

      const result = await service.consolidateOrders(orders);
      expect(result).toEqual({
        consolidated: true,
        orderCount: 2,
        suppliers: expect.any(Array)
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle supplier API errors', async () => {
      jest.spyOn(service as any, 'contactSupplier')
        .mockRejectedValueOnce(new Error('API Error'));

      const result = await service.placeOrder(mockOrder);
      expect(result).toEqual({
        success: false,
        error: 'Failed to contact supplier',
        fallbackUsed: true
      });
    });

    it('should retry failed stock updates', async () => {
      const updateSpy = jest.spyOn(service as any, 'updateStockLevel')
        .mockRejectedValueOnce(new Error('DB Error'))
        .mockResolvedValueOnce(true);

      await service.recordStockMovement({
        medicationId: 'med123',
        quantity: 5,
        type: 'administration'
      });

      expect(updateSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Reporting', () => {
    it('should generate stock level reports', async () => {
      const report = await service.generateStockReport(mockLocationId);
      expect(report).toEqual({
        locationId: mockLocationId,
        timestamp: expect.any(Date),
        medications: expect.any(Array),
        lowStock: expect.any(Array),
        expiringStock: expect.any(Array)
      });
    });

    it('should track stock movement history', async () => {
      const history = await service.getStockMovementHistory('med123');
      expect(history).toEqual(expect.arrayContaining([
        expect.objectContaining({
          date: expect.any(Date),
          type: expect.any(String),
          quantity: expect.any(Number),
          balance: expect.any(Number)
        })
      ]));
    });
  });
}); 