import { prisma } from '@/lib/prisma';
import { Region } from '@/types/regulatory';
import { 
  AuditLog,
  ComplianceCheck,
  SecurityEvent,
  AccessAttempt,
  RegulatoryReport,
  InspectionReadiness
} from '../types';
import { createHmac } from 'crypto';

export class ComplianceAuditService {
  constructor(
    private readonly region: Region,
    private readonly organizationId: string
  ) {}

  async logAuditEvent(
    event: Omit<AuditLog, 'id' | 'timestamp' | 'hash'>
  ): Promise<AuditLog> {
    try {
      // Create tamper-evident hash of the event
      const hash = this.createEventHash(event);

      const auditLog = await prisma.auditLog.create({
        data: {
          ...event,
          organizationId: this.organizationId,
          timestamp: new Date(),
          hash
        }
      });

      // Store hash in secure audit chain
      await this.updateAuditChain(auditLog);

      return auditLog;
    } catch (error) {
      console.error('Error logging audit event:', error);
      throw error;
    }
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await prisma.securityLog.create({
        data: {
          ...event,
          organizationId: this.organizationId,
          timestamp: new Date()
        }
      });

      // If high severity, trigger immediate notification
      if (event.severity === 'HIGH') {
        await this.notifySecurityTeam(event);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
      throw error;
    }
  }

  async trackAccessAttempt(attempt: AccessAttempt): Promise<void> {
    try {
      await prisma.accessLog.create({
        data: {
          ...attempt,
          organizationId: this.organizationId,
          timestamp: new Date()
        }
      });

      // Check for suspicious patterns
      await this.detectSuspiciousActivity(attempt);
    } catch (error) {
      console.error('Error tracking access attempt:', error);
      throw error;
    }
  }

  async performComplianceCheck(): Promise<ComplianceCheck> {
    try {
      const [
        medicationRecords,
        staffRecords,
        controlledDrugs,
        trainingRecords,
        incidents
      ] = await Promise.all([
        this.checkMedicationRecords(),
        this.checkStaffRecords(),
        this.checkControlledDrugs(),
        this.checkTrainingCompliance(),
        this.checkIncidentReporting()
      ]);

      return {
        timestamp: new Date(),
        organizationId: this.organizationId,
        medicationRecords,
        staffRecords,
        controlledDrugs,
        trainingRecords,
        incidents,
        overallCompliance: this.calculateOverallCompliance([
          medicationRecords,
          staffRecords,
          controlledDrugs,
          trainingRecords,
          incidents
        ])
      };
    } catch (error) {
      console.error('Error performing compliance check:', error);
      throw error;
    }
  }

  async generateRegulatoryReport(): Promise<RegulatoryReport> {
    try {
      const complianceCheck = await this.performComplianceCheck();
      const auditLogs = await this.getRelevantAuditLogs();
      const incidents = await this.getIncidentReports();
      const training = await this.getTrainingRecords();

      return {
        timestamp: new Date(),
        organizationId: this.organizationId,
        region: this.region,
        complianceCheck,
        auditSummary: this.summarizeAuditLogs(auditLogs),
        incidentAnalysis: this.analyzeIncidents(incidents),
        trainingCompliance: this.analyzeTrainingCompliance(training),
        recommendations: this.generateRecommendations({
          complianceCheck,
          auditLogs,
          incidents,
          training
        })
      };
    } catch (error) {
      console.error('Error generating regulatory report:', error);
      throw error;
    }
  }

  async assessInspectionReadiness(): Promise<InspectionReadiness> {
    try {
      const [
        complianceCheck,
        documentationStatus,
        staffReadiness,
        environmentChecks,
        outstandingActions
      ] = await Promise.all([
        this.performComplianceCheck(),
        this.checkDocumentation(),
        this.checkStaffReadiness(),
        this.checkEnvironment(),
        this.checkOutstandingActions()
      ]);

      return {
        timestamp: new Date(),
        organizationId: this.organizationId,
        complianceStatus: complianceCheck,
        documentationStatus,
        staffReadiness,
        environmentChecks,
        outstandingActions,
        readinessScore: this.calculateReadinessScore({
          complianceCheck,
          documentationStatus,
          staffReadiness,
          environmentChecks,
          outstandingActions
        }),
        recommendations: this.generateReadinessRecommendations({
          complianceCheck,
          documentationStatus,
          staffReadiness,
          environmentChecks,
          outstandingActions
        })
      };
    } catch (error) {
      console.error('Error assessing inspection readiness:', error);
      throw error;
    }
  }

  private createEventHash(event: any): string {
    const hmac = createHmac('sha256', process.env.AUDIT_SECRET || '');
    hmac.update(JSON.stringify(event));
    return hmac.digest('hex');
  }

  private async updateAuditChain(auditLog: AuditLog): Promise<void> {
    try {
      const previousLog = await prisma.auditLog.findFirst({
        where: { organizationId: this.organizationId },
        orderBy: { timestamp: 'desc' }
      });

      const chainHash = this.createChainHash(previousLog?.hash || '', auditLog.hash);

      await prisma.auditChain.create({
        data: {
          organizationId: this.organizationId,
          auditLogId: auditLog.id,
          previousLogId: previousLog?.id,
          chainHash,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating audit chain:', error);
      throw error;
    }
  }

  private createChainHash(previousHash: string, currentHash: string): string {
    const hmac = createHmac('sha256', process.env.AUDIT_SECRET || '');
    hmac.update(`${previousHash}${currentHash}`);
    return hmac.digest('hex');
  }

  private async notifySecurityTeam(event: SecurityEvent): Promise<void> {
    try {
      // Send immediate notification for high severity events
      await prisma.notification.create({
        data: {
          organizationId: this.organizationId,
          type: 'SECURITY_ALERT',
          priority: event.severity,
          content: `Security Event: ${event.type}\nDetails: ${event.details}`,
          status: 'UNREAD'
        }
      });

      // Log to security monitoring system
      await prisma.securityMonitoring.create({
        data: {
          organizationId: this.organizationId,
          eventType: event.type,
          severity: event.severity,
          details: event.details,
          timestamp: new Date()
        }
      });

      // If critical, trigger escalation process
      if (event.severity === 'CRITICAL') {
        await this.triggerSecurityEscalation(event);
      }
    } catch (error) {
      console.error('Error notifying security team:', error);
      throw error;
    }
  }

  private async triggerSecurityEscalation(event: SecurityEvent): Promise<void> {
    await prisma.securityEscalation.create({
      data: {
        organizationId: this.organizationId,
        eventId: event.id,
        status: 'INITIATED',
        priority: 'CRITICAL',
        timestamp: new Date()
      }
    });
  }

  private async detectSuspiciousActivity(attempt: AccessAttempt): Promise<void> {
    try {
      // Check for multiple failed attempts
      const recentAttempts = await prisma.accessLog.count({
        where: {
          organizationId: this.organizationId,
          userId: attempt.userId,
          success: false,
          timestamp: {
            gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
          }
        }
      });

      if (recentAttempts >= 5) {
        await this.lockUserAccount(attempt.userId);
        await this.notifySecurityTeam({
          type: 'SUSPICIOUS_ACCESS',
          severity: 'HIGH',
          details: `Multiple failed access attempts for user ${attempt.userId}`,
          timestamp: new Date()
        });
      }

      // Check for unusual access patterns
      await this.checkAccessPatterns(attempt);
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      throw error;
    }
  }

  private async lockUserAccount(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'LOCKED',
        lockReason: 'Multiple failed access attempts',
        lockedAt: new Date()
      }
    });
  }

  private async checkAccessPatterns(attempt: AccessAttempt): Promise<void> {
    const unusualPatterns = await this.analyzeAccessPatterns(attempt);
    if (unusualPatterns.length > 0) {
      await this.notifySecurityTeam({
        type: 'UNUSUAL_ACCESS_PATTERN',
        severity: 'MEDIUM',
        details: `Unusual access patterns detected: ${unusualPatterns.join(', ')}`,
        timestamp: new Date()
      });
    }
  }

  private async analyzeAccessPatterns(attempt: AccessAttempt): Promise<string[]> {
    const patterns = [];
    
    // Check for access outside normal hours
    if (this.isOutsideNormalHours(attempt.timestamp)) {
      patterns.push('Access outside normal hours');
    }

    // Check for access from unusual location
    if (await this.isUnusualLocation(attempt)) {
      patterns.push('Access from unusual location');
    }

    // Check for rapid access from different locations
    if (await this.isRapidLocationChange(attempt)) {
      patterns.push('Rapid location change');
    }

    return patterns;
  }

  private isOutsideNormalHours(timestamp: Date): boolean {
    const hour = timestamp.getHours();
    return hour < 6 || hour > 22; // Assuming normal hours are 6 AM to 10 PM
  }

  private async isUnusualLocation(attempt: AccessAttempt): Promise<boolean> {
    const userLocations = await prisma.accessLog.findMany({
      where: {
        userId: attempt.userId,
        success: true,
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: { ipAddress: true }
    });

    return !userLocations.some(log => log.ipAddress === attempt.ipAddress);
  }

  private async isRapidLocationChange(attempt: AccessAttempt): Promise<boolean> {
    const lastAccess = await prisma.accessLog.findFirst({
      where: {
        userId: attempt.userId,
        success: true,
        id: { not: attempt.id }
      },
      orderBy: { timestamp: 'desc' }
    });

    if (!lastAccess) return false;

    const timeDiff = attempt.timestamp.getTime() - lastAccess.timestamp.getTime();
    const locationChanged = lastAccess.ipAddress !== attempt.ipAddress;

    return locationChanged && timeDiff < 30 * 60 * 1000; // Less than 30 minutes
  }

  private async checkMedicationRecords(): Promise<any> {
    const [
      marAccuracy,
      stockAccuracy,
      administrationCompliance,
      controlledDrugsCompliance
    ] = await Promise.all([
      this.checkMARAccuracy(),
      this.checkStockAccuracy(),
      this.checkAdministrationCompliance(),
      this.checkControlledDrugsCompliance()
    ]);

    return {
      marAccuracy,
      stockAccuracy,
      administrationCompliance,
      controlledDrugsCompliance,
      overallScore: this.calculateComplianceScore([
        marAccuracy,
        stockAccuracy,
        administrationCompliance,
        controlledDrugsCompliance
      ])
    };
  }

  private async checkMARAccuracy(): Promise<any> {
    const marEntries = await prisma.marEntry.findMany({
      where: {
        organizationId: this.organizationId,
        timestamp: {
          gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) // Last 28 days
        }
      },
      include: {
        medication: true,
        resident: true
      }
    });

    const issues = [];
    let accuracy = 100;

    for (const entry of marEntries) {
      // Check for missing signatures
      if (!entry.signature) {
        issues.push({
          type: 'MISSING_SIGNATURE',
          marEntry: entry.id,
          severity: 'HIGH'
        });
        accuracy -= 5;
      }

      // Check for missing witness signatures for controlled drugs
      if (entry.medication.isControlled && !entry.witnessSignature) {
        issues.push({
          type: 'MISSING_WITNESS',
          marEntry: entry.id,
          severity: 'HIGH'
        });
        accuracy -= 5;
      }

      // Check for late administrations
      if (this.isLateAdministration(entry)) {
        issues.push({
          type: 'LATE_ADMINISTRATION',
          marEntry: entry.id,
          severity: 'MEDIUM'
        });
        accuracy -= 2;
      }
    }

    return {
      accuracy: Math.max(0, accuracy),
      issues,
      totalChecked: marEntries.length
    };
  }

  private isLateAdministration(entry: any): boolean {
    const scheduledTime = new Date(entry.scheduledTime);
    const actualTime = new Date(entry.timestamp);
    const diffMinutes = (actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60);
    return diffMinutes > 60; // More than 1 hour late
  }

  private async checkStockAccuracy(): Promise<any> {
    const stockChecks = await prisma.stockCheck.findMany({
      where: {
        organizationId: this.organizationId,
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        medication: true
      }
    });

    const issues = [];
    let accuracy = 100;

    for (const check of stockChecks) {
      const discrepancy = Math.abs(check.expectedQuantity - check.actualQuantity);
      
      if (discrepancy > 0) {
        issues.push({
          type: 'STOCK_DISCREPANCY',
          stockCheck: check.id,
          discrepancy,
          severity: check.medication.isControlled ? 'HIGH' : 'MEDIUM'
        });
        accuracy -= check.medication.isControlled ? 10 : 5;
      }
    }

    return {
      accuracy: Math.max(0, accuracy),
      issues,
      totalChecked: stockChecks.length
    };
  }

  private async checkAdministrationCompliance(): Promise<any> {
    const administrations = await prisma.medicationAdministration.findMany({
      where: {
        organizationId: this.organizationId,
        timestamp: {
          gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) // Last 28 days
        }
      },
      include: {
        medication: true,
        resident: true,
        staff: true
      }
    });

    const issues = [];
    let compliance = 100;

    for (const admin of administrations) {
      // Check for proper documentation
      if (!admin.notes && admin.status !== 'ADMINISTERED') {
        issues.push({
          type: 'MISSING_DOCUMENTATION',
          administration: admin.id,
          severity: 'MEDIUM'
        });
        compliance -= 3;
      }

      // Check for proper authorization
      if (!this.isAuthorizedToAdminister(admin)) {
        issues.push({
          type: 'UNAUTHORIZED_ADMINISTRATION',
          administration: admin.id,
          severity: 'HIGH'
        });
        compliance -= 10;
      }

      // Check for proper procedures
      if (!this.followedProcedures(admin)) {
        issues.push({
          type: 'PROCEDURE_VIOLATION',
          administration: admin.id,
          severity: 'HIGH'
        });
        compliance -= 5;
      }
    }

    return {
      compliance: Math.max(0, compliance),
      issues,
      totalChecked: administrations.length
    };
  }

  private isAuthorizedToAdminister(administration: any): boolean {
    return administration.staff.qualifications.some(
      (q: any) => q.type === 'MEDICATION_ADMINISTRATION' && q.status === 'ACTIVE'
    );
  }

  private followedProcedures(administration: any): boolean {
    // Check if all required steps were followed
    const requiredSteps = [
      'IDENTITY_CHECK',
      'ALLERGY_CHECK',
      'RIGHT_MEDICATION',
      'RIGHT_DOSE',
      'RIGHT_TIME',
      'RIGHT_ROUTE'
    ];

    return requiredSteps.every(step => 
      administration.procedureChecks?.includes(step)
    );
  }

  private async checkControlledDrugsCompliance(): Promise<any> {
    const [registers, checks, witnesses] = await Promise.all([
      this.checkControlledDrugsRegister(),
      this.checkControlledDrugsChecks(),
      this.checkControlledDrugsWitnesses()
    ]);

    return {
      registerAccuracy: registers.accuracy,
      checksCompliance: checks.compliance,
      witnessCompliance: witnesses.compliance,
      issues: [
        ...registers.issues,
        ...checks.issues,
        ...witnesses.issues
      ],
      overallCompliance: this.calculateComplianceScore([
        registers.accuracy,
        checks.compliance,
        witnesses.compliance
      ])
    };
  }

  private async checkControlledDrugsRegister(): Promise<any> {
    const registerEntries = await prisma.controlledDrugsRegister.findMany({
      where: {
        organizationId: this.organizationId,
        timestamp: {
          gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        medication: true,
        staff: true,
        witness: true
      }
    });

    const issues = [];
    let accuracy = 100;

    for (const entry of registerEntries) {
      if (!entry.witness) {
        issues.push({
          type: 'MISSING_WITNESS',
          entry: entry.id,
          severity: 'HIGH'
        });
        accuracy -= 10;
      }

      if (!this.isBalanceCorrect(entry)) {
        issues.push({
          type: 'INCORRECT_BALANCE',
          entry: entry.id,
          severity: 'HIGH'
        });
        accuracy -= 10;
      }

      if (!entry.reason) {
        issues.push({
          type: 'MISSING_REASON',
          entry: entry.id,
          severity: 'MEDIUM'
        });
        accuracy -= 5;
      }
    }

    return {
      accuracy: Math.max(0, accuracy),
      issues,
      totalChecked: registerEntries.length
    };
  }

  private isBalanceCorrect(entry: any): boolean {
    return entry.balance === entry.previousBalance + entry.received - entry.administered;
  }

  private async checkControlledDrugsChecks(): Promise<any> {
    const checks = await prisma.controlledDrugsCheck.findMany({
      where: {
        organizationId: this.organizationId,
        timestamp: {
          gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const issues = [];
    let compliance = 100;

    // Check frequency of checks
    const checksByDate = checks.reduce((acc: any, check: any) => {
      const date = check.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const dates = Object.keys(checksByDate);
    for (const date of dates) {
      if (checksByDate[date] < 2) { // Minimum 2 checks per day
        issues.push({
          type: 'INSUFFICIENT_CHECKS',
          date,
          severity: 'HIGH'
        });
        compliance -= 10;
      }
    }

    return {
      compliance: Math.max(0, compliance),
      issues,
      totalChecked: checks.length
    };
  }

  private async checkControlledDrugsWitnesses(): Promise<any> {
    const witnesses = await prisma.controlledDrugsWitness.findMany({
      where: {
        organizationId: this.organizationId,
        timestamp: {
          gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        staff: true
      }
    });

    const issues = [];
    let compliance = 100;

    for (const witness of witnesses) {
      if (!this.isQualifiedWitness(witness.staff)) {
        issues.push({
          type: 'UNQUALIFIED_WITNESS',
          witness: witness.id,
          severity: 'HIGH'
        });
        compliance -= 10;
      }

      if (this.hasWitnessedTooMany(witness)) {
        issues.push({
          type: 'EXCESSIVE_WITNESSING',
          witness: witness.id,
          severity: 'MEDIUM'
        });
        compliance -= 5;
      }
    }

    return {
      compliance: Math.max(0, compliance),
      issues,
      totalChecked: witnesses.length
    };
  }

  private isQualifiedWitness(staff: any): boolean {
    return staff.qualifications.some(
      (q: any) => q.type === 'CONTROLLED_DRUGS_WITNESS' && q.status === 'ACTIVE'
    );
  }

  private hasWitnessedTooMany(witness: any): boolean {
    // Check if staff member has witnessed more than 10 transactions in a shift
    return witness.witnessCount > 10;
  }

  private calculateComplianceScore(scores: number[]): number {
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private async getRelevantAuditLogs(): Promise<AuditLog[]> {
    // Implementation for retrieving relevant audit logs
    return [];
  }

  private async getIncidentReports(): Promise<any[]> {
    // Implementation for retrieving incident reports
    return [];
  }

  private async getTrainingRecords(): Promise<any[]> {
    // Implementation for retrieving training records
    return [];
  }

  private summarizeAuditLogs(logs: AuditLog[]): any {
    // Implementation for summarizing audit logs
    return {};
  }

  private analyzeIncidents(incidents: any[]): any {
    // Implementation for analyzing incidents
    return {};
  }

  private analyzeTrainingCompliance(records: any[]): any {
    // Implementation for analyzing training compliance
    return {};
  }

  private generateRecommendations(data: any): string[] {
    // Implementation for generating recommendations
    return [];
  }

  private async checkDocumentation(): Promise<any> {
    // Implementation for documentation checks
    return {};
  }

  private async checkStaffReadiness(): Promise<any> {
    // Implementation for staff readiness checks
    return {};
  }

  private async checkEnvironment(): Promise<any> {
    // Implementation for environment checks
    return {};
  }

  private async checkOutstandingActions(): Promise<any> {
    // Implementation for checking outstanding actions
    return {};
  }

  private calculateReadinessScore(data: any): number {
    // Implementation for calculating readiness score
    return 0;
  }

  private generateReadinessRecommendations(data: any): string[] {
    // Implementation for generating readiness recommendations
    return [];
  }
} 


