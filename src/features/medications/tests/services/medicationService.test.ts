import { medicationService } from '../../services/medicationService';
import { tenantService } from '../../services/tenantService';
import { auditService } from '../../services/auditService';
import { 
  clearMocks, 
  createTestMedication, 
  createTestTenant,
  mockPrismaResponse,
  expectAuditLog
} from '../setup';

describe('MedicationService', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('list', () => {
    it('should return medications for a resident', async () => {
      const tenant = createTestTenant();
      const medications = [
        createTestMedication(),
        createTestMedication({ id: 'med_124' })
      ];

      mockPrismaResponse('tenant', 'findUnique', tenant);
      mockPrismaResponse('medication', 'findMany', medications);

      const result = await medicationService.list({
        residentId: 'resident_123',
        tenantId: 'tenant_123'
      });

      expect(result).toEqual(medications);
      expectAuditLog({
        activity: 'LIST_MEDICATIONS',
        tenantId: 'tenant_123'
      });
    });

    it('should handle empty results', async () => {
      const tenant = createTestTenant();
      mockPrismaResponse('tenant', 'findUnique', tenant);
      mockPrismaResponse('medication', 'findMany', []);

      const result = await medicationService.list({
        residentId: 'resident_123',
        tenantId: 'tenant_123'
      });

      expect(result).toEqual([]);
    });

    it('should throw error for invalid tenant', async () => {
      mockPrismaResponse('tenant', 'findUnique', null);

      await expect(
        medicationService.list({
          residentId: 'resident_123',
          tenantId: 'invalid_tenant'
        })
      ).rejects.toThrow('Invalid tenant');
    });
  });

  describe('create', () => {
    it('should create a new medication', async () => {
      const tenant = createTestTenant();
      const medication = createTestMedication();

      mockPrismaResponse('tenant', 'findUnique', tenant);
      mockPrismaResponse('medication', 'create', medication);

      const result = await medicationService.create({
        name: 'Test Medication',
        dosage: '10mg',
        frequency: 'daily',
        residentId: 'resident_123',
        tenantId: 'tenant_123'
      });

      expect(result).toEqual(medication);
      expectAuditLog({
        activity: 'CREATE_MEDICATION',
        tenantId: 'tenant_123'
      });
    });

    it('should validate required fields', async () => {
      await expect(
        medicationService.create({
          name: '',
          dosage: '10mg',
          frequency: 'daily',
          residentId: 'resident_123',
          tenantId: 'tenant_123'
        })
      ).rejects.toThrow('Name is required');
    });

    it('should check tenant subscription limits', async () => {
      const tenant = createTestTenant({
        subscriptionTier: 'basic',
        settings: {
          medicationSettings: {
            maxMedicationTypes: 5
          }
        }
      });

      mockPrismaResponse('tenant', 'findUnique', tenant);
      mockPrismaResponse('medication', 'count', 5);

      await expect(
        medicationService.create({
          name: 'Test Medication',
          dosage: '10mg',
          frequency: 'daily',
          residentId: 'resident_123',
          tenantId: 'tenant_123'
        })
      ).rejects.toThrow('Medication limit reached');
    });
  });

  describe('update', () => {
    it('should update an existing medication', async () => {
      const tenant = createTestTenant();
      const medication = createTestMedication();
      const updatedMedication = {
        ...medication,
        dosage: '20mg'
      };

      mockPrismaResponse('tenant', 'findUnique', tenant);
      mockPrismaResponse('medication', 'findUnique', medication);
      mockPrismaResponse('medication', 'update', updatedMedication);

      const result = await medicationService.update('med_123', {
        dosage: '20mg'
      });

      expect(result).toEqual(updatedMedication);
      expectAuditLog({
        activity: 'UPDATE_MEDICATION',
        tenantId: 'tenant_123'
      });
    });

    it('should throw error for non-existent medication', async () => {
      const tenant = createTestTenant();
      mockPrismaResponse('tenant', 'findUnique', tenant);
      mockPrismaResponse('medication', 'findUnique', null);

      await expect(
        medicationService.update('invalid_med', {
          dosage: '20mg'
        })
      ).rejects.toThrow('Medication not found');
    });
  });

  describe('delete', () => {
    it('should delete an existing medication', async () => {
      const tenant = createTestTenant();
      const medication = createTestMedication();

      mockPrismaResponse('tenant', 'findUnique', tenant);
      mockPrismaResponse('medication', 'findUnique', medication);
      mockPrismaResponse('medication', 'delete', medication);

      await medicationService.delete('med_123');

      expectAuditLog({
        activity: 'DELETE_MEDICATION',
        tenantId: 'tenant_123'
      });
    });

    it('should throw error for non-existent medication', async () => {
      const tenant = createTestTenant();
      mockPrismaResponse('tenant', 'findUnique', tenant);
      mockPrismaResponse('medication', 'findUnique', null);

      await expect(
        medicationService.delete('invalid_med')
      ).rejects.toThrow('Medication not found');
    });
  });
});


