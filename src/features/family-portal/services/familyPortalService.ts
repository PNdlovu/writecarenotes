/**
 * @fileoverview Family Portal Service
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Business logic for Family Portal features including validation,
 * error handling, and cross-cutting concerns
 */

import { 
  FamilyMember, 
  CareNote, 
  Visit, 
  Document, 
  Memory,
  EmergencyContact,
  CareTeamMember 
} from '../types';
import { FamilyPortalRepository } from '../database/repositories/familyPortalRepository';
import { DomainError } from '@/lib/errors';
import { validateResidentAccess } from '@/lib/auth';
import { validateSchema } from '@/lib/validation';
import { 
  familyMemberSchema, 
  careNoteSchema, 
  visitSchema,
  documentSchema,
  memorySchema,
  emergencyContactSchema
} from '../types/schemas';

export class FamilyPortalService {
  private repository: FamilyPortalRepository;

  constructor() {
    this.repository = new FamilyPortalRepository();
  }

  // Family Member Management
  async getFamilyMembers(residentId: string, tenantId: string): Promise<FamilyMember[]> {
    try {
      await validateResidentAccess(residentId, tenantId);
      return await this.repository.getFamilyMembers(residentId, tenantId);
    } catch (error) {
      throw new DomainError(
        'Failed to retrieve family members',
        'FAMILY_MEMBERS_RETRIEVAL_ERROR',
        error
      );
    }
  }

  async updateFamilyMember(
    memberId: string, 
    data: Partial<FamilyMember>, 
    tenantId: string
  ): Promise<FamilyMember> {
    try {
      await validateSchema(familyMemberSchema, data);
      return await this.repository.updateFamilyMember(memberId, data, tenantId);
    } catch (error) {
      throw new DomainError(
        'Failed to update family member',
        'FAMILY_MEMBER_UPDATE_ERROR',
        error
      );
    }
  }

  // Care Notes
  async getCareNotes(
    residentId: string,
    tenantId: string,
    filter?: { category?: string; visibility?: string }
  ): Promise<CareNote[]> {
    try {
      await validateResidentAccess(residentId, tenantId);
      return await this.repository.getCareNotes(residentId, tenantId, filter);
    } catch (error) {
      throw new DomainError(
        'Failed to retrieve care notes',
        'CARE_NOTES_RETRIEVAL_ERROR',
        error
      );
    }
  }

  async addCareNote(
    residentId: string,
    note: Omit<CareNote, 'id'>,
    tenantId: string
  ): Promise<CareNote> {
    try {
      await validateResidentAccess(residentId, tenantId);
      await validateSchema(careNoteSchema, note);
      return await this.repository.addCareNote(residentId, note, tenantId);
    } catch (error) {
      throw new DomainError(
        'Failed to add care note',
        'CARE_NOTE_CREATION_ERROR',
        error
      );
    }
  }

  // Visits
  async scheduleVisit(
    residentId: string,
    visit: Omit<Visit, 'id' | 'status'>,
    tenantId: string
  ): Promise<Visit> {
    try {
      await validateResidentAccess(residentId, tenantId);
      await validateSchema(visitSchema, visit);
      return await this.repository.scheduleVisit(residentId, visit, tenantId);
    } catch (error) {
      throw new DomainError(
        'Failed to schedule visit',
        'VISIT_SCHEDULING_ERROR',
        error
      );
    }
  }

  async getVisits(
    residentId: string,
    tenantId: string,
    filter?: { status?: string; from?: Date; to?: Date }
  ): Promise<Visit[]> {
    try {
      await validateResidentAccess(residentId, tenantId);
      return await this.repository.getVisits(residentId, tenantId, filter);
    } catch (error) {
      throw new DomainError(
        'Failed to retrieve visits',
        'VISITS_RETRIEVAL_ERROR',
        error
      );
    }
  }

  // Documents
  async uploadDocument(
    residentId: string,
    document: Omit<Document, 'id' | 'uploadDate' | 'lastModified'>,
    tenantId: string
  ): Promise<Document> {
    try {
      await validateResidentAccess(residentId, tenantId);
      await validateSchema(documentSchema, document);
      return await this.repository.uploadDocument(residentId, document, tenantId);
    } catch (error) {
      throw new DomainError(
        'Failed to upload document',
        'DOCUMENT_UPLOAD_ERROR',
        error
      );
    }
  }

  async getDocuments(
    residentId: string,
    tenantId: string,
    filter?: { type?: string; status?: string }
  ): Promise<Document[]> {
    try {
      await validateResidentAccess(residentId, tenantId);
      return await this.repository.getDocuments(residentId, tenantId, filter);
    } catch (error) {
      throw new DomainError(
        'Failed to retrieve documents',
        'DOCUMENTS_RETRIEVAL_ERROR',
        error
      );
    }
  }

  // Memories
  async createMemory(
    residentId: string,
    memory: Omit<Memory, 'id'>,
    tenantId: string
  ): Promise<Memory> {
    try {
      await validateResidentAccess(residentId, tenantId);
      await validateSchema(memorySchema, memory);
      return await this.repository.createMemory(residentId, memory, tenantId);
    } catch (error) {
      throw new DomainError(
        'Failed to create memory',
        'MEMORY_CREATION_ERROR',
        error
      );
    }
  }

  async getMemories(
    residentId: string,
    tenantId: string,
    filter?: { tags?: string[]; from?: Date; to?: Date }
  ): Promise<Memory[]> {
    try {
      await validateResidentAccess(residentId, tenantId);
      return await this.repository.getMemories(residentId, tenantId, filter);
    } catch (error) {
      throw new DomainError(
        'Failed to retrieve memories',
        'MEMORIES_RETRIEVAL_ERROR',
        error
      );
    }
  }

  // Emergency Contacts
  async getEmergencyContacts(
    residentId: string,
    tenantId: string
  ): Promise<EmergencyContact[]> {
    try {
      await validateResidentAccess(residentId, tenantId);
      return await this.repository.getEmergencyContacts(residentId, tenantId);
    } catch (error) {
      throw new DomainError(
        'Failed to retrieve emergency contacts',
        'EMERGENCY_CONTACTS_RETRIEVAL_ERROR',
        error
      );
    }
  }

  async updateEmergencyContact(
    contactId: string,
    data: Partial<EmergencyContact>,
    tenantId: string
  ): Promise<EmergencyContact> {
    try {
      await validateSchema(emergencyContactSchema, data);
      return await this.repository.updateEmergencyContact(contactId, data, tenantId);
    } catch (error) {
      throw new DomainError(
        'Failed to update emergency contact',
        'EMERGENCY_CONTACT_UPDATE_ERROR',
        error
      );
    }
  }

  // Care Team
  async getCareTeam(
    residentId: string,
    tenantId: string
  ): Promise<CareTeamMember[]> {
    try {
      await validateResidentAccess(residentId, tenantId);
      return await this.repository.getCareTeam(residentId, tenantId);
    } catch (error) {
      throw new DomainError(
        'Failed to retrieve care team',
        'CARE_TEAM_RETRIEVAL_ERROR',
        error
      );
    }
  }

  async getCareTeamMember(
    memberId: string,
    tenantId: string
  ): Promise<CareTeamMember> {
    try {
      return await this.repository.getCareTeamMember(memberId, tenantId);
    } catch (error) {
      throw new DomainError(
        'Failed to retrieve care team member',
        'CARE_TEAM_MEMBER_RETRIEVAL_ERROR',
        error
      );
    }
  }

  // Analytics
  async getVisitMetrics(
    residentId: string,
    tenantId: string,
    timeframe: { from: Date; to: Date }
  ) {
    try {
      await validateResidentAccess(residentId, tenantId);
      return await this.repository.getVisitMetrics(residentId, tenantId, timeframe);
    } catch (error) {
      throw new DomainError(
        'Failed to retrieve visit metrics',
        'VISIT_METRICS_RETRIEVAL_ERROR',
        error
      );
    }
  }

  async getCommunicationMetrics(
    residentId: string,
    tenantId: string,
    timeframe: { from: Date; to: Date }
  ) {
    try {
      await validateResidentAccess(residentId, tenantId);
      return await this.repository.getCommunicationMetrics(residentId, tenantId, timeframe);
    } catch (error) {
      throw new DomainError(
        'Failed to retrieve communication metrics',
        'COMMUNICATION_METRICS_RETRIEVAL_ERROR',
        error
      );
    }
  }

  async getFamilyEngagementMetrics(
    residentId: string,
    tenantId: string,
    timeframe: { from: Date; to: Date }
  ) {
    try {
      await validateResidentAccess(residentId, tenantId);
      return await this.repository.getFamilyEngagementMetrics(residentId, tenantId, timeframe);
    } catch (error) {
      throw new DomainError(
        'Failed to retrieve family engagement metrics',
        'FAMILY_ENGAGEMENT_METRICS_RETRIEVAL_ERROR',
        error
      );
    }
  }
}


