/**
 * @fileoverview Documentation Service for Medication Management
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { addToSyncQueue } from '@/lib/sync';
import type {
  DocumentationTemplate,
  CarePlan,
  MedicationReview,
  HandoverDocument,
  AssessmentDocument,
} from '../types/documentation';

export class DocumentationService {
  async createTemplate(
    data: Omit<DocumentationTemplate, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<DocumentationTemplate> {
    try {
      const template: DocumentationTemplate = {
        ...data,
        id: uuidv4(),
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store template
      const record = await db.documentationTemplate.create({
        data: template,
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'documentationTemplate',
        data: record,
      });

      return record;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  async updateTemplate(
    templateId: string,
    data: Partial<DocumentationTemplate>
  ): Promise<DocumentationTemplate> {
    try {
      const template = await db.documentationTemplate.update({
        where: { id: templateId },
        data: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'UPDATE',
        entityType: 'documentationTemplate',
        data: template,
      });

      return template;
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  async createCarePlan(
    data: Omit<CarePlan, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<CarePlan> {
    try {
      const carePlan: CarePlan = {
        ...data,
        id: uuidv4(),
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store care plan
      const record = await db.carePlan.create({
        data: carePlan,
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'carePlan',
        data: record,
      });

      return record;
    } catch (error) {
      console.error('Failed to create care plan:', error);
      throw error;
    }
  }

  async updateCarePlan(
    carePlanId: string,
    data: Partial<CarePlan>
  ): Promise<CarePlan> {
    try {
      const carePlan = await db.carePlan.update({
        where: { id: carePlanId },
        data: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'UPDATE',
        entityType: 'carePlan',
        data: carePlan,
      });

      return carePlan;
    } catch (error) {
      console.error('Failed to update care plan:', error);
      throw error;
    }
  }

  async createMedicationReview(
    data: Omit<MedicationReview, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<MedicationReview> {
    try {
      const review: MedicationReview = {
        ...data,
        id: uuidv4(),
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store review
      const record = await db.medicationReview.create({
        data: review,
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'medicationReview',
        data: record,
      });

      return record;
    } catch (error) {
      console.error('Failed to create medication review:', error);
      throw error;
    }
  }

  async updateMedicationReview(
    reviewId: string,
    data: Partial<MedicationReview>
  ): Promise<MedicationReview> {
    try {
      const review = await db.medicationReview.update({
        where: { id: reviewId },
        data: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'UPDATE',
        entityType: 'medicationReview',
        data: review,
      });

      return review;
    } catch (error) {
      console.error('Failed to update medication review:', error);
      throw error;
    }
  }

  async createHandoverDocument(
    data: Omit<HandoverDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<HandoverDocument> {
    try {
      const handover: HandoverDocument = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store handover
      const record = await db.handoverDocument.create({
        data: handover,
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'handoverDocument',
        data: record,
      });

      return record;
    } catch (error) {
      console.error('Failed to create handover document:', error);
      throw error;
    }
  }

  async createAssessment(
    data: Omit<AssessmentDocument, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<AssessmentDocument> {
    try {
      const assessment: AssessmentDocument = {
        ...data,
        id: uuidv4(),
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store assessment
      const record = await db.assessmentDocument.create({
        data: assessment,
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'assessmentDocument',
        data: record,
      });

      return record;
    } catch (error) {
      console.error('Failed to create assessment:', error);
      throw error;
    }
  }

  async updateAssessment(
    assessmentId: string,
    data: Partial<AssessmentDocument>
  ): Promise<AssessmentDocument> {
    try {
      const assessment = await db.assessmentDocument.update({
        where: { id: assessmentId },
        data: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'UPDATE',
        entityType: 'assessmentDocument',
        data: assessment,
      });

      return assessment;
    } catch (error) {
      console.error('Failed to update assessment:', error);
      throw error;
    }
  }

  async getTemplates(
    careHomeId: string,
    options?: {
      type?: DocumentationTemplate['type'];
      status?: DocumentationTemplate['status'];
    }
  ): Promise<DocumentationTemplate[]> {
    try {
      const where: any = { careHomeId };

      if (options?.type) where.type = options.type;
      if (options?.status) where.status = options.status;

      return await db.documentationTemplate.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get templates:', error);
      throw error;
    }
  }

  async getCarePlans(
    residentId: string,
    options?: {
      type?: CarePlan['type'];
      status?: CarePlan['status'];
    }
  ): Promise<CarePlan[]> {
    try {
      const where: any = { residentId };

      if (options?.type) where.type = options.type;
      if (options?.status) where.status = options.status;

      return await db.carePlan.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get care plans:', error);
      throw error;
    }
  }

  async getMedicationReviews(
    residentId: string,
    options?: {
      type?: MedicationReview['type'];
      status?: MedicationReview['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<MedicationReview[]> {
    try {
      const where: any = { residentId };

      if (options?.type) where.type = options.type;
      if (options?.status) where.status = options.status;
      if (options?.startDate || options?.endDate) {
        where.reviewDate = {};
        if (options?.startDate) where.reviewDate.gte = options.startDate;
        if (options?.endDate) where.reviewDate.lte = options.endDate;
      }

      return await db.medicationReview.findMany({
        where,
        orderBy: { reviewDate: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get medication reviews:', error);
      throw error;
    }
  }

  async getHandoverDocuments(
    residentId: string,
    options?: {
      shift?: HandoverDocument['shift'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<HandoverDocument[]> {
    try {
      const where: any = { residentId };

      if (options?.shift) where.shift = options.shift;
      if (options?.startDate || options?.endDate) {
        where.date = {};
        if (options?.startDate) where.date.gte = options.startDate;
        if (options?.endDate) where.date.lte = options.endDate;
      }

      return await db.handoverDocument.findMany({
        where,
        orderBy: { date: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get handover documents:', error);
      throw error;
    }
  }

  async getAssessments(
    residentId: string,
    options?: {
      type?: AssessmentDocument['type'];
      status?: AssessmentDocument['status'];
    }
  ): Promise<AssessmentDocument[]> {
    try {
      const where: any = { residentId };

      if (options?.type) where.type = options.type;
      if (options?.status) where.status = options.status;

      return await db.assessmentDocument.findMany({
        where,
        orderBy: { assessmentDate: 'desc' },
      });
    } catch (error) {
      console.error('Failed to get assessments:', error);
      throw error;
    }
  }
} 


