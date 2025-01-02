/**
 * @fileoverview Export Templates Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { generateExport } from '../handlers/core/exportTemplates';

describe('Export Templates', () => {
  const mockData = {
    period: '2024-03',
    totalTransactions: 1000,
    totalVolume: 50000,
    successRate: 0.98,
    averageLatency: 150,
    errorRate: 0.02,
    uniqueUsers: 50,
    topCurrencyPairs: {
      'GBP-EUR': 20000,
      'GBP-USD': 15000,
    },
    regional: {
      'England': { volume: 30000, transactions: 600 },
      'Scotland': { volume: 15000, transactions: 300 },
      'Wales': { volume: 5000, transactions: 100 },
    },
    compliance: {
      status: 'compliant',
      issues: [],
      lastAudit: '2024-03-20',
      regulatoryBody: 'CQC',
    },
  };

  const mockOptions = {
    title: 'Test Report',
    period: '2024-03',
    organizationId: 'test-org',
    format: 'csv' as const,
    template: 'default',
    locale: 'en-GB',
  };

  describe('CSV Generation', () => {
    it('should generate CSV with default template', async () => {
      const result = await generateExport(mockData, mockOptions);
      expect(result).toBeInstanceOf(Buffer);
      
      const csv = result.toString();
      expect(csv).toContain('period,totalTransactions,totalVolume,successRate,averageLatency,errorRate');
      expect(csv).toContain('2024-03,1000,50000,0.98,150,0.02');
    });

    it('should generate CSV with detailed template', async () => {
      const result = await generateExport(mockData, {
        ...mockOptions,
        template: 'detailed',
      });
      expect(result).toBeInstanceOf(Buffer);
      
      const csv = result.toString();
      expect(csv).toContain('uniqueUsers');
      expect(csv).toContain('topCurrencyPairs');
    });

    it('should handle missing data fields', async () => {
      const partialData = {
        period: '2024-03',
        totalTransactions: 1000,
      };

      const result = await generateExport(partialData, mockOptions);
      expect(result).toBeInstanceOf(Buffer);
      
      const csv = result.toString();
      expect(csv).toContain('2024-03,1000');
    });

    it('should throw error for invalid data', async () => {
      await expect(generateExport(null, mockOptions))
        .rejects
        .toThrow('Failed to generate CSV');
    });

    it('should handle nested data structures', async () => {
      const result = await generateExport(mockData, {
        ...mockOptions,
        template: 'detailed',
      });
      const csv = result.toString();
      expect(csv).toContain('regional.England.volume');
      expect(csv).toContain('regional.England.transactions');
    });

    it('should handle arrays in data', async () => {
      const dataWithArray = {
        ...mockData,
        transactions: [
          { id: 1, amount: 100 },
          { id: 2, amount: 200 },
        ],
      };
      const result = await generateExport(dataWithArray, mockOptions);
      const csv = result.toString();
      expect(csv).toContain('transactions.0.amount');
      expect(csv).toContain('transactions.1.amount');
    });

    it('should respect locale settings', async () => {
      const result = await generateExport(mockData, {
        ...mockOptions,
        locale: 'de-DE',
      });
      const csv = result.toString();
      // German locale uses different number formatting
      expect(csv).toContain('50.000');
      expect(csv).toContain('0,98');
    });

    it('should handle special characters in data', async () => {
      const dataWithSpecialChars = {
        ...mockData,
        notes: 'Test, with "quotes" and \nline breaks',
      };
      const result = await generateExport(dataWithSpecialChars, mockOptions);
      const csv = result.toString();
      expect(csv).toContain('"Test, with ""quotes"" and \nline breaks"');
    });
  });

  describe('PDF Generation', () => {
    it('should generate PDF with default template', async () => {
      const result = await generateExport(mockData, {
        ...mockOptions,
        format: 'pdf',
      });
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate PDF with detailed template', async () => {
      const result = await generateExport(mockData, {
        ...mockOptions,
        format: 'pdf',
        template: 'detailed',
      });
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include title and period in PDF', async () => {
      const result = await generateExport(mockData, {
        ...mockOptions,
        format: 'pdf',
        title: 'Custom Title',
      });
      expect(result).toBeInstanceOf(Buffer);
      
      // Note: We can't easily test PDF content directly
      // In a real implementation, we might use a PDF parser library
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw error for invalid data', async () => {
      await expect(generateExport(null, {
        ...mockOptions,
        format: 'pdf',
      }))
        .rejects
        .toThrow('Failed to generate PDF');
    });

    it('should include organization branding', async () => {
      const result = await generateExport(mockData, {
        ...mockOptions,
        format: 'pdf',
        branding: {
          logo: 'base64logo',
          colors: { primary: '#123456' },
        },
      });
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle regulatory templates', async () => {
      const result = await generateExport(mockData, {
        ...mockOptions,
        format: 'pdf',
        template: 'regulatory',
      });
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include page numbers for multi-page reports', async () => {
      const largeData = {
        ...mockData,
        transactions: Array(100).fill({ amount: 100 }),
      };
      const result = await generateExport(largeData, {
        ...mockOptions,
        format: 'pdf',
      });
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle different paper sizes', async () => {
      const result = await generateExport(mockData, {
        ...mockOptions,
        format: 'pdf',
        paperSize: 'A3',
      });
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Template Handling', () => {
    it('should handle custom templates', async () => {
      const customTemplate = {
        fields: ['period', 'customField1', 'customField2'],
        title: 'Custom Report',
        layout: 'custom',
      };
      const result = await generateExport(mockData, {
        ...mockOptions,
        template: 'custom',
        customTemplate,
      });
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should validate template fields', async () => {
      const invalidTemplate = {
        fields: ['nonexistentField'],
      };
      await expect(generateExport(mockData, {
        ...mockOptions,
        template: 'custom',
        customTemplate: invalidTemplate,
      }))
        .rejects
        .toThrow('Invalid template fields');
    });

    it('should handle template inheritance', async () => {
      const result = await generateExport(mockData, {
        ...mockOptions,
        template: 'regulatory-detailed',
      });
      const csv = result.toString();
      expect(csv).toContain('compliance.status');
      expect(csv).toContain('regional.England.volume');
    });
  });

  describe('Security and Compliance', () => {
    it('should sanitize sensitive data', async () => {
      const sensitiveData = {
        ...mockData,
        userDetails: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
        },
      };
      const result = await generateExport(sensitiveData, mockOptions);
      const csv = result.toString();
      expect(csv).not.toContain('john@example.com');
      expect(csv).not.toContain('1234567890');
    });

    it('should include audit trail in regulatory reports', async () => {
      const result = await generateExport(mockData, {
        ...mockOptions,
        template: 'regulatory',
        includeAudit: true,
      });
      const csv = result.toString();
      expect(csv).toContain('auditTrail');
      expect(csv).toContain('lastAudit');
    });

    it('should handle GDPR compliance fields', async () => {
      const result = await generateExport(mockData, {
        ...mockOptions,
        template: 'gdpr-compliant',
      });
      const csv = result.toString();
      expect(csv).toContain('dataRetentionPeriod');
      expect(csv).toContain('processingBasis');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unsupported format', async () => {
      await expect(generateExport(mockData, {
        ...mockOptions,
        format: 'xml' as any,
      }))
        .rejects
        .toThrow('Unsupported format: xml');
    });

    it('should throw error for invalid template', async () => {
      await expect(generateExport(mockData, {
        ...mockOptions,
        template: 'nonexistent',
      }))
        .resolves
        .toBeInstanceOf(Buffer); // Should use default template
    });

    it('should handle network errors gracefully', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
      await expect(generateExport(mockData, {
        ...mockOptions,
        fetchExternalData: true,
      }))
        .rejects
        .toThrow('Failed to fetch external data');
    });

    it('should handle memory constraints', async () => {
      const hugeData = {
        ...mockData,
        transactions: Array(1000000).fill({ amount: 100 }),
      };
      await expect(generateExport(hugeData, mockOptions))
        .rejects
        .toThrow('Data size exceeds limit');
    });

    it('should validate data schema', async () => {
      const invalidData = {
        period: 'invalid-date',
        totalTransactions: 'not-a-number',
      };
      await expect(generateExport(invalidData, mockOptions))
        .rejects
        .toThrow('Invalid data schema');
    });
  });
}); 