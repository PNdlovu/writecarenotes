/**
 * @fileoverview Tests for audit export service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { ExportService } from '../services/exportService';
import { AuditLogEntry } from '../types/audit.types';

describe('ExportService', () => {
  let service: ExportService;
  const mockLogs: AuditLogEntry[] = [
    {
      id: '1',
      entityType: 'CareHome',
      entityId: 'ch123',
      action: 'CREATE',
      actorId: 'user123',
      actorType: 'USER',
      status: 'SUCCESS',
      organizationId: 'org123',
      timestamp: new Date('2024-01-01'),
      changes: {
        before: null,
        after: { name: 'Test Home' },
      },
    },
    {
      id: '2',
      entityType: 'Resident',
      entityId: 'res123',
      action: 'UPDATE',
      actorId: 'user456',
      actorType: 'USER',
      status: 'SUCCESS',
      organizationId: 'org123',
      timestamp: new Date('2024-01-02'),
      changes: {
        before: { status: 'ACTIVE' },
        after: { status: 'INACTIVE' },
      },
    },
  ];

  beforeEach(() => {
    // Reset singleton instance
    (ExportService as any).instance = null;
    service = ExportService.getInstance();
  });

  describe('CSV Export', () => {
    it('should export logs to CSV format', async () => {
      const result = await service.exportToCSV(mockLogs);
      const csv = result.toString();

      // Check headers
      expect(csv).toContain('Timestamp,Action,Entity Type,Entity ID');
      
      // Check data rows
      mockLogs.forEach(log => {
        expect(csv).toContain(log.entityType);
        expect(csv).toContain(log.entityId);
        expect(csv).toContain(log.action);
      });
    });

    it('should handle empty logs array', async () => {
      const result = await service.exportToCSV([]);
      const csv = result.toString();

      // Should only contain headers
      expect(csv.split('\n').length).toBe(1);
      expect(csv).toContain('Timestamp,Action,Entity Type');
    });

    it('should properly escape special characters', async () => {
      const logsWithSpecialChars: AuditLogEntry[] = [{
        ...mockLogs[0],
        details: { note: 'Contains, comma and "quotes"' },
      }];

      const result = await service.exportToCSV(logsWithSpecialChars);
      const csv = result.toString();

      // Check if special characters are properly escaped
      expect(csv).toContain('"Contains, comma and ""quotes"""');
    });
  });

  describe('PDF Export', () => {
    it('should export logs to PDF format', async () => {
      const result = await service.exportToPDF(mockLogs);

      // Check if result is a Buffer
      expect(Buffer.isBuffer(result)).toBe(true);
      
      // Check if buffer contains PDF magic number
      expect(result.slice(0, 4).toString()).toBe('%PDF');
    });

    it('should handle empty logs array', async () => {
      const result = await service.exportToPDF([]);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.slice(0, 4).toString()).toBe('%PDF');
    });

    it('should include all required sections', async () => {
      const result = await service.exportToPDF(mockLogs);
      const pdfContent = result.toString();

      // Check for required sections
      expect(pdfContent).toContain('Audit Log Report');
      expect(pdfContent).toContain('Generated:');
      expect(pdfContent).toContain(`Total Logs: ${mockLogs.length}`);
    });
  });

  describe('Singleton Pattern', () => {
    it('should maintain a single instance', () => {
      const instance1 = ExportService.getInstance();
      const instance2 = ExportService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Error Handling', () => {
    it('should handle PDF generation errors', async () => {
      // Mock a PDF generation error
      jest.spyOn(service as any, 'generatePDF').mockRejectedValue(new Error('PDF Error'));

      await expect(service.exportToPDF(mockLogs)).rejects.toThrow('PDF Error');
    });

    it('should handle CSV generation errors with special characters', async () => {
      const invalidLogs: AuditLogEntry[] = [{
        ...mockLogs[0],
        details: { note: Buffer.from([0xFF, 0xFE]) }, // Invalid UTF-8
      }];

      await expect(service.exportToCSV(invalidLogs)).rejects.toThrow();
    });
  });
}); 


