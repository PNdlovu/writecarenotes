import { CareAllowanceCalculator } from '../care-allowances';
import { Region } from '../types';

describe('CareAllowanceCalculator', () => {
  let calculator: CareAllowanceCalculator;

  describe('England allowances', () => {
    beforeEach(() => {
      calculator = new CareAllowanceCalculator(Region.ENGLAND);
    });

    it('should calculate night shift premium', () => {
      const result = calculator.calculateAllowances({
        qualifications: [],
        shiftHours: {
          regular: 30,
          night: 10
        },
        period: 'WEEKLY'
      });

      expect(result.totalAllowance).toBeGreaterThan(0);
      expect(result.breakdown).toContainEqual(
        expect.objectContaining({
          name: 'Night Shift Premium',
          amount: expect.any(Number),
          applied: true
        })
      );
    });

    it('should calculate NVQ Level 2 allowance', () => {
      const result = calculator.calculateAllowances({
        qualifications: [{
          name: 'NVQ Level 2 Health and Social Care',
          validFrom: new Date('2023-01-01'),
          validUntil: undefined
        }],
        shiftHours: {
          regular: 40,
          night: 0
        },
        period: 'WEEKLY'
      });

      expect(result.totalAllowance).toBeGreaterThan(0);
      expect(result.breakdown).toContainEqual(
        expect.objectContaining({
          name: 'NVQ Level 2 Qualification',
          amount: expect.any(Number),
          applied: true
        })
      );
    });
  });

  describe('Scotland allowances', () => {
    beforeEach(() => {
      calculator = new CareAllowanceCalculator(Region.SCOTLAND);
    });

    it('should calculate SVQ Level 2 allowance', () => {
      const result = calculator.calculateAllowances({
        qualifications: [{
          name: 'SVQ Level 2 Social Services and Healthcare',
          validFrom: new Date('2023-01-01'),
          validUntil: undefined
        }],
        shiftHours: {
          regular: 40,
          night: 0
        },
        period: 'WEEKLY'
      });

      expect(result.totalAllowance).toBeGreaterThan(0);
      expect(result.breakdown).toContainEqual(
        expect.objectContaining({
          name: 'SVQ Level 2 Qualification',
          amount: expect.any(Number),
          applied: true
        })
      );
    });
  });

  describe('Ireland allowances', () => {
    beforeEach(() => {
      calculator = new CareAllowanceCalculator(Region.IRELAND);
    });

    it('should calculate QQI Level 5 allowance', () => {
      const result = calculator.calculateAllowances({
        qualifications: [{
          name: 'QQI Level 5 Healthcare Support',
          validFrom: new Date('2023-01-01'),
          validUntil: undefined
        }],
        shiftHours: {
          regular: 40,
          night: 0
        },
        period: 'WEEKLY'
      });

      expect(result.totalAllowance).toBeGreaterThan(0);
      expect(result.breakdown).toContainEqual(
        expect.objectContaining({
          name: 'QQI Level 5 Qualification',
          amount: expect.any(Number),
          applied: true
        })
      );
    });
  });

  describe('Multiple qualifications', () => {
    beforeEach(() => {
      calculator = new CareAllowanceCalculator(Region.ENGLAND);
    });

    it('should apply highest qualification allowance only', () => {
      const result = calculator.calculateAllowances({
        qualifications: [
          {
            name: 'NVQ Level 2 Health and Social Care',
            validFrom: new Date('2023-01-01'),
            validUntil: undefined
          },
          {
            name: 'NVQ Level 3 Health and Social Care',
            validFrom: new Date('2023-06-01'),
            validUntil: undefined
          }
        ],
        shiftHours: {
          regular: 40,
          night: 0
        },
        period: 'WEEKLY'
      });

      const level2Allowance = result.breakdown.find(a => a.name === 'NVQ Level 2 Qualification');
      const level3Allowance = result.breakdown.find(a => a.name === 'NVQ Level 3 Qualification');

      expect(level2Allowance?.applied).toBe(false);
      expect(level3Allowance?.applied).toBe(true);
      expect(level3Allowance?.amount).toBeGreaterThan(level2Allowance?.amount || 0);
    });
  });

  describe('Expired qualifications', () => {
    beforeEach(() => {
      calculator = new CareAllowanceCalculator(Region.ENGLAND);
    });

    it('should not apply allowance for expired qualification', () => {
      const result = calculator.calculateAllowances({
        qualifications: [{
          name: 'NVQ Level 2 Health and Social Care',
          validFrom: new Date('2020-01-01'),
          validUntil: new Date('2023-01-01')
        }],
        shiftHours: {
          regular: 40,
          night: 0
        },
        period: 'WEEKLY'
      });

      const qualificationAllowance = result.breakdown.find(a => 
        a.name === 'NVQ Level 2 Qualification'
      );

      expect(qualificationAllowance?.applied).toBe(false);
    });
  });

  describe('Period calculations', () => {
    beforeEach(() => {
      calculator = new CareAllowanceCalculator(Region.ENGLAND);
    });

    it('should calculate monthly allowances correctly', () => {
      const weeklyResult = calculator.calculateAllowances({
        qualifications: [],
        shiftHours: {
          regular: 30,
          night: 10
        },
        period: 'WEEKLY'
      });

      const monthlyResult = calculator.calculateAllowances({
        qualifications: [],
        shiftHours: {
          regular: 120,
          night: 40
        },
        period: 'MONTHLY'
      });

      // Monthly should be approximately 4.33 times weekly
      expect(monthlyResult.totalAllowance)
        .toBeCloseTo(weeklyResult.totalAllowance * 4.33, 1);
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      calculator = new CareAllowanceCalculator(Region.ENGLAND);
    });

    it('should handle zero hours', () => {
      const result = calculator.calculateAllowances({
        qualifications: [],
        shiftHours: {
          regular: 0,
          night: 0
        },
        period: 'WEEKLY'
      });

      expect(result.totalAllowance).toBe(0);
      expect(result.breakdown.every(a => a.applied === false)).toBe(true);
    });

    it('should handle invalid period', () => {
      expect(() => {
        calculator.calculateAllowances({
          qualifications: [],
          shiftHours: {
            regular: 40,
            night: 0
          },
          period: 'INVALID' as any
        });
      }).toThrow();
    });

    it('should handle negative hours', () => {
      expect(() => {
        calculator.calculateAllowances({
          qualifications: [],
          shiftHours: {
            regular: -10,
            night: 0
          },
          period: 'WEEKLY'
        });
      }).toThrow();
    });
  });
}); 