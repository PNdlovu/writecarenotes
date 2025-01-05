/**
 * @writecarenotes.com
 * @fileoverview Tests for Medication Regulatory Reporting Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Test suite for the RegulatoryReportingService, covering report generation,
 * analytics, and compliance tracking across different regions.
 */

import { RegulatoryReportingService } from '../regional/RegulatoryReportingService';
import { Region } from '@/features/compliance/types/compliance.types';
import { RegionalConfigService } from '../regional/RegionalConfigService';
import { LocalizationService } from '../regional/LocalizationService';

// Mock external services
jest.mock('../regional/RegionalConfigService');
jest.mock('../regional/LocalizationService');
jest.mock('node-fetch');

describe('RegulatoryReportingService', () => {
  let service: RegulatoryReportingService;
  const mockOrganizationId = 'org123';
  const mockStartDate = new Date('2024-01-01');
  const mockEndDate = new Date('2024-03-31');

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Initialize service with England region
    service = new RegulatoryReportingService(Region.ENGLAND);
  });

  describe('Report Generation', () => {
    const mockIncident = {
      id: 'inc123',
      date: new Date(),
      type: 'MEDICATION_ERROR',
      severity: 'HIGH',
      description: 'Wrong medication administered',
      actions: ['Resident monitored', 'GP contacted'],
      witnesses: ['Staff A', 'Staff B'],
      notifiedAuthorities: ['CQC']
    };

    it('should generate incident report with correct format', async () => {
      const reportId = await service.generateIncidentReport(mockIncident);
      expect(reportId).toBe(mockIncident.id);
      expect(fetch).toHaveBeenCalledWith(
        '/api/compliance/reports',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should handle incident report generation failure', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      await expect(service.generateIncidentReport(mockIncident))
        .rejects
        .toThrow('Failed to generate incident report');
    });
  });

  describe('Cross-Regional Analytics', () => {
    const mockAnalyticsResponse = {
      incidents: [],
      errors: [],
      audits: [{
        auditDate: new Date(),
        findings: [
          { priority: 'HIGH', status: 'COMPLIANT' },
          { priority: 'HIGH', status: 'NON_COMPLIANT' }
        ],
        controlledDrugsAudit: { discrepancies: 2 }
      }]
    };

    beforeEach(() => {
      (fetch as jest.Mock).mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAnalyticsResponse)
        })
      );
    });

    it('should calculate cross-regional analytics correctly', async () => {
      const analytics = await service.getCrossRegionalAnalytics(
        mockOrganizationId,
        mockStartDate,
        mockEndDate
      );

      expect(analytics).toHaveProperty('overallComplianceRate');
      expect(analytics).toHaveProperty('regionComparison');
      expect(analytics).toHaveProperty('trends');
    });

    it('should handle analytics fetch failure gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      await expect(service.getCrossRegionalAnalytics(
        mockOrganizationId,
        mockStartDate,
        mockEndDate
      )).rejects.toThrow('Failed to generate cross-regional analytics');
    });

    it('should calculate compliance rate correctly', async () => {
      const analytics = await service.getCrossRegionalAnalytics(
        mockOrganizationId,
        mockStartDate,
        mockEndDate
      );
      
      const englandMetrics = analytics.regionComparison[Region.ENGLAND];
      expect(englandMetrics.complianceRate).toBe(50); // 1 compliant out of 2 findings
    });
  });

  describe('Regional Framework Handling', () => {
    it.each([
      [Region.ENGLAND, 'CQC Fundamental Standards'],
      [Region.WALES, 'CIW Regulatory Framework'],
      [Region.SCOTLAND, 'Care Inspectorate Health and Social Care Standards'],
      [Region.NORTHERN_IRELAND, 'RQIA Standards'],
      [Region.IRELAND, 'HIQA National Standards']
    ])('should return correct framework for %s', (region, expected) => {
      service = new RegulatoryReportingService(region);
      const framework = (service as any).getRegionalFramework();
      expect(framework).toBe(expected);
    });

    it('should throw error for unsupported region', () => {
      service = new RegulatoryReportingService('INVALID_REGION' as Region);
      expect(() => (service as any).getRegionalFramework())
        .toThrow('Unsupported region');
    });
  });

  describe('Reporting Requirements', () => {
    it.each([
      [Region.ENGLAND, ['Regulation 12: Safe Care and Treatment', 'Regulation 17: Good Governance']],
      [Region.WALES, ['Regulation 58: Medicines', 'Regulation 60: Records']],
      [Region.SCOTLAND, ['Standard 4.27: Medication Management', 'Standard 4.23: Record Keeping']],
      [Region.NORTHERN_IRELAND, ['Standard 28: Medicines Management', 'Standard 37: Record Keeping']],
      [Region.IRELAND, ['Standard 2.6: Medication Management', 'Standard 2.8: Record Keeping']]
    ])('should return correct requirements for %s', (region, expected) => {
      service = new RegulatoryReportingService(region);
      const requirements = (service as any).getReportingRequirements();
      expect(requirements).toEqual(expected);
    });

    it('should throw error for unsupported region requirements', () => {
      service = new RegulatoryReportingService('INVALID_REGION' as Region);
      expect(() => (service as any).getReportingRequirements())
        .toThrow('Unsupported region');
    });
  });

  describe('Date Handling', () => {
    it('should correctly split date range into months', () => {
      const months = (service as any).getMonthsBetweenDates(
        new Date('2024-01-01'),
        new Date('2024-03-31')
      );
      expect(months).toHaveLength(3);
      expect(months[0][0].getMonth()).toBe(0); // January
      expect(months[2][1].getMonth()).toBe(2); // March
    });

    it('should handle single month date range', () => {
      const months = (service as any).getMonthsBetweenDates(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );
      expect(months).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors in fetchIncidents', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      const incidents = await (service as any).fetchIncidents(
        mockOrganizationId,
        Region.ENGLAND,
        mockStartDate,
        mockEndDate
      );
      expect(incidents).toEqual([]);
    });

    it('should handle API errors in fetchErrors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      const errors = await (service as any).fetchErrors(
        mockOrganizationId,
        Region.ENGLAND,
        mockStartDate,
        mockEndDate
      );
      expect(errors).toEqual([]);
    });

    it('should handle API errors in fetchAudits', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      const audits = await (service as any).fetchAudits(
        mockOrganizationId,
        Region.ENGLAND,
        mockStartDate,
        mockEndDate
      );
      expect(audits).toEqual([]);
    });
  });
}); 