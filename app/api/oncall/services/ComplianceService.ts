/**
 * @writecarenotes.com
 * @fileoverview On-Call Compliance Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing compliance requirements specific to on-call operations.
 * Extends core compliance service with on-call specific features.
 */

import { ComplianceReport, Region, AuditRecord, ComplianceStatus } from '../types';
import { ComplianceRepository } from '../repositories/ComplianceRepository';
import { CallRepository } from '../repositories/CallRepository';
import { RecordingRepository } from '../repositories/RecordingRepository';
import { ComplianceService as CoreComplianceService } from '../../../../src/features/compliance/services/ComplianceService';
import { Region as CoreRegion } from '../../../../src/features/compliance/types/compliance.types';

export class OnCallComplianceService {
    private static instance: OnCallComplianceService;
    private complianceRepository: ComplianceRepository;
    private callRepository: CallRepository;
    private recordingRepository: RecordingRepository;
    private coreComplianceService: CoreComplianceService;

    private constructor() {
        this.complianceRepository = ComplianceRepository.getInstance();
        this.callRepository = CallRepository.getInstance();
        this.recordingRepository = RecordingRepository.getInstance();
        this.coreComplianceService = new CoreComplianceService('england' as CoreRegion);
    }

    public static getInstance(): OnCallComplianceService {
        if (!OnCallComplianceService.instance) {
            OnCallComplianceService.instance = new OnCallComplianceService();
        }
        return OnCallComplianceService.instance;
    }

    public async generateAuditReport(params: {
        region: Region;
        startDate: Date;
        endDate: Date;
        includeRecordings?: boolean;
    }): Promise<ComplianceReport> {
        // Get all relevant records
        const [calls, recordings] = await Promise.all([
            this.callRepository.listCalls({
                region: params.region,
                startDate: params.startDate,
                endDate: params.endDate
            }),
            params.includeRecordings ? this.recordingRepository.listRecordings({
                region: params.region,
                startDate: params.startDate,
                endDate: params.endDate
            }) : []
        ]);

        // Generate report using core service
        const report = await this.complianceRepository.createReport({
            type: 'audit',
            region: params.region,
            startDate: params.startDate,
            endDate: params.endDate,
            status: 'pending',
            data: {
                callCount: calls.length,
                recordingCount: recordings.length
            },
            findings: [],
            organizationId: 'TODO' // Get from context
        });

        // Create audit record
        await this.complianceRepository.createAuditRecord({
            type: 'call',
            action: 'generate_report',
            details: {
                reportId: report.id,
                callCount: calls.length,
                recordingCount: recordings.length
            },
            performedBy: 'TODO', // Get from context
            status: 'pending',
            region: params.region,
            organizationId: 'TODO' // Get from context
        });

        return report;
    }

    public async getCallRecords(filters?: {
        region?: Region;
        startDate?: Date;
        endDate?: Date;
        status?: ComplianceStatus;
    }): Promise<AuditRecord[]> {
        return this.complianceRepository.getAuditRecords({
            type: 'call',
            ...filters
        });
    }

    public async getRegionalReports(region: Region): Promise<ComplianceReport[]> {
        return this.complianceRepository.listReports({ region });
    }

    public async validateCompliance(region: Region): Promise<boolean> {
        const result = await this.complianceRepository.getRegionalCompliance(region);
        if (!result.isCompliant) {
            await this.notifyComplianceIssue({
                region,
                issues: result.issues
            });
        }
        return result.isCompliant;
    }

    private async archiveReport(report: ComplianceReport): Promise<void> {
        const updatedReport = await this.complianceRepository.updateReport(report.id, {
            status: 'compliant'
        });
        if (!updatedReport) {
            throw new Error('Failed to update report status');
        }

        await this.complianceRepository.createAuditRecord({
            type: 'call',
            action: 'archive_report',
            details: {
                reportId: report.id
            },
            performedBy: 'TODO', // Get from context
            status: 'compliant',
            region: report.region,
            organizationId: report.organizationId
        });
    }

    private async notifyComplianceIssue(issue: {
        region: Region;
        issues: string[];
    }): Promise<void> {
        // TODO: Implement notification logic
        console.log(`Compliance issues in ${issue.region}:`, issue.issues);
    }
} 