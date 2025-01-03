/**
 * @writecarenotes.com
 * @fileoverview Tests for On-Call Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { OnCallStaffService } from '../../../../app/api/oncall/services/StaffService';
import { OnCallComplianceService } from '../../../../app/api/oncall/services/ComplianceService';
import { StaffMember, Region } from '../../../../app/api/oncall/types';

describe('OnCallStaffService', () => {
    let staffService: OnCallStaffService;

    beforeEach(() => {
        staffService = OnCallStaffService.getInstance();
    });

    describe('updateOnCallAvailability', () => {
        it('should update staff availability status', async () => {
            const staffId = '123';
            const status = 'available';

            const result = await staffService.updateOnCallAvailability(staffId, status);

            expect(result).toBeDefined();
            expect(result.status).toBe(status);
        });

        it('should throw error if staff not found', async () => {
            const staffId = 'invalid-id';
            const status = 'available';

            await expect(staffService.updateOnCallAvailability(staffId, status))
                .rejects.toThrow('Staff member not found');
        });
    });

    describe('listAvailableOnCallStaff', () => {
        it('should return available staff for region', async () => {
            const params = {
                region: 'england' as Region,
                date: new Date()
            };

            const result = await staffService.listAvailableOnCallStaff(params);

            expect(Array.isArray(result)).toBe(true);
            result.forEach(staff => {
                expect(staff.status).toBe('available');
                expect(staff.region).toBe(params.region);
            });
        });

        it('should filter by qualifications if specified', async () => {
            const params = {
                region: 'england' as Region,
                qualifications: ['nursing', 'medication']
            };

            const result = await staffService.listAvailableOnCallStaff(params);

            expect(Array.isArray(result)).toBe(true);
            result.forEach(staff => {
                expect(staff.qualifications).toEqual(
                    expect.arrayContaining(params.qualifications)
                );
            });
        });
    });
});

describe('OnCallComplianceService', () => {
    let complianceService: OnCallComplianceService;

    beforeEach(() => {
        complianceService = OnCallComplianceService.getInstance();
    });

    describe('generateAuditReport', () => {
        it('should generate audit report for specified period', async () => {
            const params = {
                region: 'england' as Region,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-31'),
                includeRecordings: true
            };

            const result = await complianceService.generateAuditReport(params);

            expect(result).toBeDefined();
            expect(result.type).toBe('audit');
            expect(result.region).toBe(params.region);
            expect(result.startDate).toEqual(params.startDate);
            expect(result.endDate).toEqual(params.endDate);
        });
    });

    describe('validateCompliance', () => {
        it('should validate regional compliance', async () => {
            const region = 'england' as Region;

            const result = await complianceService.validateCompliance(region);

            expect(typeof result).toBe('boolean');
        });
    });
});
