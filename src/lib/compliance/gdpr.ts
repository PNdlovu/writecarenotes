import { prisma } from '@/lib/prisma';
import { addYears, isBefore } from 'date-fns';

interface DataRetentionPolicy {
  id: string;
  dataType: string;
  retentionPeriodYears: number;
  requiresConsent: boolean;
  legalBasis: string;
  applicableRegulations: string[];
}

interface DataSubjectRequest {
  id: string;
  requestType: 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'RESTRICT' | 'PORTABILITY';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  requestDate: Date;
  completionDate?: Date;
  dataSubjectId: string;
  requestedData: string[];
}

export async function applyRetentionPolicy(
  organizationId: string,
  dataType: string
) {
  const policy = await prisma.dataRetentionPolicy.findFirst({
    where: {
      organizationId,
      dataType,
    },
  });

  if (!policy) {
    throw new Error(`No retention policy found for data type: ${dataType}`);
  }

  const retentionDate = addYears(new Date(), -policy.retentionPeriodYears);

  // Find documents that exceed retention period
  const expiredDocuments = await prisma.document.findMany({
    where: {
      organizationId,
      type: dataType,
      createdAt: {
        lt: retentionDate,
      },
      legalHold: false, // Skip documents on legal hold
    },
  });

  // Archive or delete based on policy
  for (const document of expiredDocuments) {
    if (policy.archiveBeforeDelete) {
      await archiveDocument(document.id);
    } else {
      await deleteDocument(document.id);
    }
  }

  // Log retention action
  await prisma.complianceLog.create({
    data: {
      organizationId,
      action: 'RETENTION_POLICY_APPLIED',
      details: {
        dataType,
        documentsProcessed: expiredDocuments.length,
        retentionPeriodYears: policy.retentionPeriodYears,
      },
    },
  });

  return expiredDocuments.length;
}

async function archiveDocument(documentId: string) {
  // Move document to archive storage
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: 'ARCHIVED',
      archivedAt: new Date(),
    },
  });
}

async function deleteDocument(documentId: string) {
  // Permanently delete document and related data
  await prisma.document.delete({
    where: { id: documentId },
  });
}

export async function handleDataSubjectRequest(request: DataSubjectRequest) {
  switch (request.requestType) {
    case 'ACCESS':
      return await handleAccessRequest(request);
    case 'ERASURE':
      return await handleErasureRequest(request);
    case 'PORTABILITY':
      return await handlePortabilityRequest(request);
    case 'RECTIFICATION':
      return await handleRectificationRequest(request);
    case 'RESTRICT':
      return await handleRestrictionRequest(request);
    default:
      throw new Error('Invalid request type');
  }
}

async function handleAccessRequest(request: DataSubjectRequest) {
  // Gather all requested data for the subject
  const data = await prisma.document.findMany({
    where: {
      dataSubjectId: request.dataSubjectId,
      type: {
        in: request.requestedData,
      },
    },
    include: {
      metadata: true,
      auditTrail: true,
    },
  });

  // Create data export
  const exportData = {
    personalData: data,
    processingPurposes: await getProcessingPurposes(request.dataSubjectId),
    recipients: await getDataRecipients(request.dataSubjectId),
    retentionPeriods: await getRetentionPeriods(request.requestedData),
  };

  // Log access request
  await logDataSubjectRequest(request, 'ACCESS_PROVIDED');

  return exportData;
}

async function handleErasureRequest(request: DataSubjectRequest) {
  // Check for legal obligations that prevent erasure
  const legalObligations = await checkLegalObligations(request.dataSubjectId);
  if (legalObligations.length > 0) {
    await logDataSubjectRequest(request, 'ERASURE_REJECTED', {
      reason: 'Legal obligations prevent erasure',
      obligations: legalObligations,
    });
    return { status: 'REJECTED', reason: 'Legal obligations prevent erasure' };
  }

  // Perform erasure
  await prisma.document.updateMany({
    where: {
      dataSubjectId: request.dataSubjectId,
      type: {
        in: request.requestedData,
      },
      legalHold: false,
    },
    data: {
      status: 'DELETED',
      deletedAt: new Date(),
    },
  });

  // Log erasure
  await logDataSubjectRequest(request, 'ERASURE_COMPLETED');

  return { status: 'COMPLETED' };
}

async function handlePortabilityRequest(request: DataSubjectRequest) {
  // Gather data in machine-readable format
  const data = await prisma.document.findMany({
    where: {
      dataSubjectId: request.dataSubjectId,
      type: {
        in: request.requestedData,
      },
    },
    include: {
      metadata: true,
    },
  });

  // Convert to portable format (e.g., JSON)
  const portableData = {
    subject: {
      id: request.dataSubjectId,
      data: data.map(doc => ({
        type: doc.type,
        content: doc.content,
        metadata: doc.metadata,
        created: doc.createdAt,
      })),
    },
    format: 'JSON',
    schema: '1.0',
  };

  // Log portability request
  await logDataSubjectRequest(request, 'PORTABILITY_PROVIDED');

  return portableData;
}

async function handleRectificationRequest(request: DataSubjectRequest) {
  // Update personal data
  await prisma.document.updateMany({
    where: {
      dataSubjectId: request.dataSubjectId,
      type: {
        in: request.requestedData,
      },
    },
    data: {
      // Update with corrected data
      updatedAt: new Date(),
      status: 'RECTIFIED',
    },
  });

  // Log rectification
  await logDataSubjectRequest(request, 'RECTIFICATION_COMPLETED');

  return { status: 'COMPLETED' };
}

async function handleRestrictionRequest(request: DataSubjectRequest) {
  // Restrict processing of personal data
  await prisma.document.updateMany({
    where: {
      dataSubjectId: request.dataSubjectId,
      type: {
        in: request.requestedData,
      },
    },
    data: {
      processingRestricted: true,
      restrictedAt: new Date(),
    },
  });

  // Log restriction
  await logDataSubjectRequest(request, 'RESTRICTION_APPLIED');

  return { status: 'COMPLETED' };
}

async function logDataSubjectRequest(
  request: DataSubjectRequest,
  outcome: string,
  details?: any
) {
  await prisma.complianceLog.create({
    data: {
      action: 'DATA_SUBJECT_REQUEST',
      details: {
        requestType: request.requestType,
        outcome,
        dataSubjectId: request.dataSubjectId,
        requestedData: request.requestedData,
        ...details,
      },
    },
  });
}

// Helper functions
async function getProcessingPurposes(dataSubjectId: string) {
  return await prisma.processingPurpose.findMany({
    where: {
      dataSubjectId,
    },
  });
}

async function getDataRecipients(dataSubjectId: string) {
  return await prisma.dataRecipient.findMany({
    where: {
      dataSubjectId,
    },
  });
}

async function getRetentionPeriods(dataTypes: string[]) {
  return await prisma.dataRetentionPolicy.findMany({
    where: {
      dataType: {
        in: dataTypes,
      },
    },
  });
}

async function checkLegalObligations(dataSubjectId: string) {
  return await prisma.legalObligation.findMany({
    where: {
      dataSubjectId,
      active: true,
    },
  });
}


