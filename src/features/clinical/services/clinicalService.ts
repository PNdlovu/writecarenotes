import { 
  VitalRecord, 
  MedicalHistory, 
  SpecialistReferral, 
  ClinicalAssessment,
  VitalType,
  ReferralStatus 
} from '../types';
import { api } from '@/lib/api';
import { AuditService } from '@/features/audit/services/auditService';

export class ClinicalService {
  private static instance: ClinicalService;
  private auditService: AuditService;

  private constructor() {
    this.auditService = new AuditService();
  }

  public static getInstance(): ClinicalService {
    if (!ClinicalService.instance) {
      ClinicalService.instance = new ClinicalService();
    }
    return ClinicalService.instance;
  }

  // Vitals Management
  async recordVitals(vital: Omit<VitalRecord, 'id'>): Promise<VitalRecord> {
    const response = await api.post<VitalRecord>('/api/clinical/vitals', vital);
    await this.auditService.logActivity(
      'CLINICAL',
      vital.residentId,
      'RECORD_VITALS',
      vital.recordedBy,
      'SYSTEM'
    );
    return response.data;
  }

  async getVitalsHistory(
    residentId: string,
    type?: VitalType,
    startDate?: Date,
    endDate?: Date
  ): Promise<VitalRecord[]> {
    const params = new URLSearchParams({
      residentId,
      ...(type && { type }),
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() })
    });

    const response = await api.get<VitalRecord[]>(`/api/clinical/vitals?${params}`);
    return response.data;
  }

  // Medical History Management
  async addMedicalHistory(history: Omit<MedicalHistory, 'id'>): Promise<MedicalHistory> {
    const response = await api.post<MedicalHistory>('/api/clinical/medical-history', history);
    await this.auditService.logActivity(
      'CLINICAL',
      history.residentId,
      'ADD_MEDICAL_HISTORY',
      history.updatedBy,
      'SYSTEM'
    );
    return response.data;
  }

  async updateMedicalHistory(id: string, updates: Partial<MedicalHistory>): Promise<MedicalHistory> {
    const response = await api.put<MedicalHistory>(`/api/clinical/medical-history/${id}`, updates);
    await this.auditService.logActivity(
      'CLINICAL',
      updates.residentId!,
      'UPDATE_MEDICAL_HISTORY',
      updates.updatedBy!,
      'SYSTEM'
    );
    return response.data;
  }

  async getMedicalHistory(residentId: string): Promise<MedicalHistory[]> {
    const response = await api.get<MedicalHistory[]>(`/api/clinical/medical-history/${residentId}`);
    return response.data;
  }

  // Specialist Referrals
  async createReferral(referral: Omit<SpecialistReferral, 'id'>): Promise<SpecialistReferral> {
    const response = await api.post<SpecialistReferral>('/api/clinical/referrals', referral);
    await this.auditService.logActivity(
      'CLINICAL',
      referral.residentId,
      'CREATE_REFERRAL',
      referral.referredBy,
      'SYSTEM'
    );
    return response.data;
  }

  async updateReferralStatus(
    id: string,
    status: ReferralStatus,
    notes?: string
  ): Promise<SpecialistReferral> {
    const response = await api.put<SpecialistReferral>(`/api/clinical/referrals/${id}/status`, {
      status,
      notes
    });
    await this.auditService.logActivity(
      'CLINICAL',
      response.data.residentId,
      'UPDATE_REFERRAL_STATUS',
      'SYSTEM',
      'SYSTEM'
    );
    return response.data;
  }

  async getReferrals(residentId: string, status?: ReferralStatus): Promise<SpecialistReferral[]> {
    const params = new URLSearchParams({
      residentId,
      ...(status && { status })
    });
    const response = await api.get<SpecialistReferral[]>(`/api/clinical/referrals?${params}`);
    return response.data;
  }

  // Clinical Assessments
  async createAssessment(assessment: Omit<ClinicalAssessment, 'id'>): Promise<ClinicalAssessment> {
    const response = await api.post<ClinicalAssessment>('/api/clinical/assessments', assessment);
    await this.auditService.logActivity(
      'CLINICAL',
      assessment.residentId,
      'CREATE_ASSESSMENT',
      assessment.completedBy,
      'SYSTEM'
    );
    return response.data;
  }

  async getAssessments(
    residentId: string,
    assessmentType?: string
  ): Promise<ClinicalAssessment[]> {
    const params = new URLSearchParams({
      residentId,
      ...(assessmentType && { assessmentType })
    });
    const response = await api.get<ClinicalAssessment[]>(`/api/clinical/assessments?${params}`);
    return response.data;
  }

  async getAssessmentById(id: string): Promise<ClinicalAssessment> {
    const response = await api.get<ClinicalAssessment>(`/api/clinical/assessments/${id}`);
    return response.data;
  }
}
