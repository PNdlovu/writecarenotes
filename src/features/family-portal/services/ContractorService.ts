import { db } from '@/lib/db';
import { ContractorVisit, WorkPermit, RiskAssessment } from '@prisma/client';

export class ContractorService {
  async createVisit(data: {
    contractorId: string;
    date: Date;
    duration: number;
    purpose: string;
    workArea: string[];
    workPermit?: WorkPermit;
    riskAssessment: RiskAssessment;
    documents: { type: string; url: string }[];
  }): Promise<ContractorVisit> {
    return db.contractorVisit.create({
      data: {
        ...data,
        status: 'scheduled',
      },
    });
  }

  async verifyWorkPermit(permitId: string): Promise<boolean> {
    const permit = await db.workPermit.findUnique({
      where: { id: permitId },
    });
    
    if (!permit) return false;
    
    const now = new Date();
    return new Date(permit.validUntil) > now;
  }

  async updateRiskAssessment(visitId: string, assessment: RiskAssessment): Promise<ContractorVisit> {
    return db.contractorVisit.update({
      where: { id: visitId },
      data: {
        riskAssessment: assessment,
      },
    });
  }

  async getContractorHistory(contractorId: string): Promise<ContractorVisit[]> {
    return db.contractorVisit.findMany({
      where: { contractorId },
      include: {
        workPermit: true,
        riskAssessment: true,
        documents: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async getActiveContractors(): Promise<ContractorVisit[]> {
    const now = new Date();
    return db.contractorVisit.findMany({
      where: {
        date: { lte: now },
        endTime: { gte: now },
        status: 'checked_in',
      },
      include: {
        contractor: true,
        workArea: true,
      },
    });
  }
}


