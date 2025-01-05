import { createStaffSchema } from '@/lib/validation/staffSchema';
import { Region } from '@prisma/client';

describe('Staff Schema Validation', () => {
  describe('Base Fields', () => {
    const baseData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+44 1234567890',
      role: 'Care Worker',
      regulatoryBody: 'CQC',
    };

    it('should validate correct base data', () => {
      const schema = createStaffSchema('england');
      const result = schema.safeParse(baseData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const schema = createStaffSchema('england');
      const result = schema.safeParse({ ...baseData, email: 'invalid-email' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone number', () => {
      const schema = createStaffSchema('england');
      const result = schema.safeParse({ ...baseData, phone: '123' });
      expect(result.success).toBe(false);
    });
  });

  describe('England Validation', () => {
    const englandData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+44 1234567890',
      role: 'Care Worker',
      regulatoryBody: 'CQC',
      cqcNumber: '1-123456789',
      dbsNumber: '001234567890',
    };

    it('should validate correct England data', () => {
      const schema = createStaffSchema('england');
      const result = schema.safeParse(englandData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid CQC number', () => {
      const schema = createStaffSchema('england');
      const result = schema.safeParse({ ...englandData, cqcNumber: '123' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid DBS number', () => {
      const schema = createStaffSchema('england');
      const result = schema.safeParse({ ...englandData, dbsNumber: '123' });
      expect(result.success).toBe(false);
    });
  });

  describe('Wales Validation', () => {
    const walesData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+44 1234567890',
      role: 'Care Worker',
      regulatoryBody: 'CIW',
      scwNumber: 'W-1234567',
      dbsNumber: '001234567890',
    };

    it('should validate correct Wales data', () => {
      const schema = createStaffSchema('wales');
      const result = schema.safeParse(walesData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid SCW number', () => {
      const schema = createStaffSchema('wales');
      const result = schema.safeParse({ ...walesData, scwNumber: '123' });
      expect(result.success).toBe(false);
    });
  });

  describe('Scotland Validation', () => {
    const scotlandData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+44 1234567890',
      role: 'Care Worker',
      regulatoryBody: 'CI',
      ssscNumber: '12345678',
      pvgNumber: '123456789012',
    };

    it('should validate correct Scotland data', () => {
      const schema = createStaffSchema('scotland');
      const result = schema.safeParse(scotlandData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid SSSC number', () => {
      const schema = createStaffSchema('scotland');
      const result = schema.safeParse({ ...scotlandData, ssscNumber: '123' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid PVG number', () => {
      const schema = createStaffSchema('scotland');
      const result = schema.safeParse({ ...scotlandData, pvgNumber: '123' });
      expect(result.success).toBe(false);
    });
  });

  describe('Belfast Validation', () => {
    const belfastData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+44 1234567890',
      role: 'Care Worker',
      regulatoryBody: 'RQIA',
      nisccNumber: '1234567N',
      accessniNumber: '1234567890',
    };

    it('should validate correct Belfast data', () => {
      const schema = createStaffSchema('belfast');
      const result = schema.safeParse(belfastData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid NISCC number', () => {
      const schema = createStaffSchema('belfast');
      const result = schema.safeParse({ ...belfastData, nisccNumber: '123' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid AccessNI number', () => {
      const schema = createStaffSchema('belfast');
      const result = schema.safeParse({ ...belfastData, accessniNumber: '123' });
      expect(result.success).toBe(false);
    });
  });

  describe('Dublin Validation', () => {
    const dublinData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+44 1234567890',
      role: 'Care Worker',
      regulatoryBody: 'HIQA',
      coruNumber: 'SW123456',
      gardaNumber: 'NVB123456',
    };

    it('should validate correct Dublin data', () => {
      const schema = createStaffSchema('dublin');
      const result = schema.safeParse(dublinData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid CORU number', () => {
      const schema = createStaffSchema('dublin');
      const result = schema.safeParse({ ...dublinData, coruNumber: '123' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid Garda number', () => {
      const schema = createStaffSchema('dublin');
      const result = schema.safeParse({ ...dublinData, gardaNumber: '123' });
      expect(result.success).toBe(false);
    });
  });
});


