import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ReportingService, HandoverReport } from '../../services/reporting-service';
import { PrintService } from '../../services/print-service';
import { HandoverSession, HandoverTask, Staff } from '../../types/handover';
import { ComplianceService } from '../../services/compliance-service';

describe('Reporting Integration Tests', () => {
  let reportingService: ReportingService;
  let printService: PrintService;
  let complianceService: ComplianceService;
  let mockSession: HandoverSession;

  beforeEach(() => {
    reportingService = new ReportingService();
    printService = new PrintService();
    complianceService = new ComplianceService();

    // Setup mock session data
    mockSession = {
      id: 'test-session-1',
      shiftType: 'DAY',
      startTime: new Date('2024-01-01T08:00:00'),
      endTime: new Date('2024-01-01T16:00:00'),
      department: 'Residential Care',
      status: 'IN_PROGRESS',
      outgoingStaff: [
        { id: 'staff-1', name: 'John Doe', role: 'Nurse' },
        { id: 'staff-2', name: 'Jane Smith', role: 'Care Worker' },
      ],
      incomingStaff: [
        { id: 'staff-3', name: 'Alice Brown', role: 'Nurse' },
        { id: 'staff-4', name: 'Bob Wilson', role: 'Care Worker' },
      ],
      tasks: [
        {
          id: 'task-1',
          title: 'Medication Round',
          status: 'COMPLETED',
          priority: 'HIGH',
          category: 'CLINICAL_CARE',
          assignedTo: { id: 'staff-1', name: 'John Doe', role: 'Nurse' },
          completedAt: new Date('2024-01-01T10:00:00'),
        },
        {
          id: 'task-2',
          title: 'Morning Care',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          category: 'PERSONAL_CARE',
          assignedTo: { id: 'staff-2', name: 'Jane Smith', role: 'Care Worker' },
        },
      ],
      qualityChecks: [
        {
          id: 'check-1',
          type: 'MEDICATION_REVIEW',
          status: 'PASSED',
          checkedBy: { id: 'staff-1', name: 'John Doe', role: 'Nurse' },
          timestamp: new Date('2024-01-01T11:00:00'),
        },
        {
          id: 'check-2',
          type: 'RESIDENT_COUNT',
          status: 'PENDING',
          checkedBy: { id: 'staff-2', name: 'Jane Smith', role: 'Care Worker' },
          timestamp: new Date('2024-01-01T12:00:00'),
        },
      ],
      notes: [],
      attachments: [],
      createdAt: new Date('2024-01-01T08:00:00'),
      updatedAt: new Date('2024-01-01T12:00:00'),
    };
  });

  describe('Report Generation', () => {
    it('should generate complete session report', async () => {
      const report = await reportingService.generateSessionReport(mockSession);

      expect(report).toBeDefined();
      expect(report.sessionId).toBe(mockSession.id);
      expect(report.tasks.total).toBe(mockSession.tasks.length);
      expect(report.quality.totalChecks).toBe(mockSession.qualityChecks.length);
      expect(report.staff.totalStaff).toBe(
        mockSession.outgoingStaff.length + mockSession.incomingStaff.length
      );
    });

    it('should calculate correct task metrics', async () => {
      const report = await reportingService.generateSessionReport(mockSession);

      expect(report.tasks.completed).toBe(1);
      expect(report.tasks.inProgress).toBe(1);
      expect(report.tasks.pending).toBe(0);
      expect(report.tasks.byCategory['CLINICAL_CARE']).toBe(1);
      expect(report.tasks.byCategory['PERSONAL_CARE']).toBe(1);
    });

    it('should calculate correct quality metrics', async () => {
      const report = await reportingService.generateSessionReport(mockSession);

      expect(report.quality.passed).toBe(1);
      expect(report.quality.pending).toBe(1);
      expect(report.quality.failed).toBe(0);
    });

    it('should calculate correct staff metrics', async () => {
      const report = await reportingService.generateSessionReport(mockSession);

      expect(report.staff.tasksPerStaff['staff-1']).toBe(1);
      expect(report.staff.tasksPerStaff['staff-2']).toBe(1);
      expect(report.staff.completionRates['staff-1']).toBe(1);
      expect(report.staff.completionRates['staff-2']).toBe(0);
    });
  });

  describe('Print Generation', () => {
    it('should generate PDF for daily handover', async () => {
      const blob = await printService.printHandoverSession(mockSession, 'daily-handover');

      expect(blob).toBeDefined();
      expect(blob.type).toBe('application/pdf');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should generate Excel export', async () => {
      const report = await reportingService.generateSessionReport(mockSession);
      const blob = await printService.exportToExcel(report);

      expect(blob).toBeDefined();
      expect(blob.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should handle missing data in templates', async () => {
      const incompleteSession = {
        ...mockSession,
        tasks: [],
        qualityChecks: [],
      };

      const blob = await printService.printHandoverSession(
        incompleteSession,
        'daily-handover'
      );

      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('Compliance Integration', () => {
    it('should include compliance data in reports', async () => {
      const report = await reportingService.generateSessionReport(mockSession);

      expect(report.compliance).toBeDefined();
      expect(report.compliance.overallCompliance).toBeGreaterThanOrEqual(0);
      expect(report.compliance.overallCompliance).toBeLessThanOrEqual(1);
    });

    it('should validate compliance before report generation', async () => {
      const validateSpy = jest.spyOn(complianceService, 'validateSession');
      await reportingService.generateSessionReport(mockSession);

      expect(validateSpy).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid session data', async () => {
      const invalidSession = { ...mockSession, id: undefined };

      await expect(
        reportingService.generateSessionReport(invalidSession as HandoverSession)
      ).rejects.toThrow();
    });

    it('should handle missing staff data', async () => {
      const sessionWithoutStaff = {
        ...mockSession,
        outgoingStaff: [],
        incomingStaff: [],
      };

      const report = await reportingService.generateSessionReport(
        sessionWithoutStaff as HandoverSession
      );

      expect(report.staff.totalStaff).toBe(0);
      expect(Object.keys(report.staff.tasksPerStaff)).toHaveLength(0);
    });

    it('should handle template not found', async () => {
      await expect(
        printService.printHandoverSession(mockSession, 'non-existent-template')
      ).rejects.toThrow('Template not found');
    });
  });
});
