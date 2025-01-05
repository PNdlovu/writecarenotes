import { prisma } from '@/lib/prisma';
import { addMonths, addYears, isBefore } from 'date-fns';
import { sendNotification } from '@/lib/notifications';

interface RetentionRule {
  id: string;
  documentType: string;
  retentionPeriod: number;
  periodUnit: 'MONTHS' | 'YEARS';
  action: 'ARCHIVE' | 'DELETE' | 'REVIEW';
  notifyRoles: string[];
  regulatoryReference?: string;
}

interface LegalHold {
  id: string;
  reason: string;
  appliedBy: string;
  appliedAt: Date;
  expiresAt?: Date;
  documents: string[];
  caseReference?: string;
}

export async function applyRetentionRules(organizationId: string) {
  const rules = await prisma.retentionRule.findMany({
    where: { organizationId },
  });

  for (const rule of rules) {
    const expirationDate = calculateExpirationDate(
      new Date(),
      rule.retentionPeriod,
      rule.periodUnit
    );

    const documents = await prisma.document.findMany({
      where: {
        organizationId,
        type: rule.documentType,
        createdAt: {
          lt: expirationDate,
        },
        legalHold: false,
        status: 'ACTIVE',
      },
    });

    for (const document of documents) {
      await processRetention(document.id, rule);
    }

    // Notify relevant staff
    await notifyRetentionAction(organizationId, rule, documents.length);
  }
}

function calculateExpirationDate(
  date: Date,
  period: number,
  unit: 'MONTHS' | 'YEARS'
): Date {
  return unit === 'MONTHS' ? addMonths(date, -period) : addYears(date, -period);
}

async function processRetention(documentId: string, rule: RetentionRule) {
  switch (rule.action) {
    case 'ARCHIVE':
      await archiveDocument(documentId);
      break;
    case 'DELETE':
      await deleteDocument(documentId);
      break;
    case 'REVIEW':
      await markForReview(documentId);
      break;
  }

  // Log retention action
  await prisma.complianceLog.create({
    data: {
      documentId,
      action: `RETENTION_${rule.action}`,
      details: {
        ruleId: rule.id,
        documentType: rule.documentType,
        retentionPeriod: `${rule.retentionPeriod} ${rule.periodUnit}`,
      },
    },
  });
}

async function archiveDocument(documentId: string) {
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: 'ARCHIVED',
      archivedAt: new Date(),
    },
  });
}

async function deleteDocument(documentId: string) {
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: 'DELETED',
      deletedAt: new Date(),
    },
  });
}

async function markForReview(documentId: string) {
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: 'REVIEW_REQUIRED',
      reviewDue: new Date(),
    },
  });
}

export async function applyLegalHold(hold: Omit<LegalHold, 'id'>) {
  const legalHold = await prisma.legalHold.create({
    data: {
      reason: hold.reason,
      appliedBy: hold.appliedBy,
      appliedAt: hold.appliedAt,
      expiresAt: hold.expiresAt,
      caseReference: hold.caseReference,
    },
  });

  // Apply hold to documents
  await prisma.document.updateMany({
    where: {
      id: {
        in: hold.documents,
      },
    },
    data: {
      legalHold: true,
      legalHoldId: legalHold.id,
    },
  });

  // Notify legal team and compliance officers
  await notifyLegalHold(legalHold.id, 'APPLIED');

  return legalHold;
}

export async function releaseLegalHold(holdId: string, releasedBy: string) {
  const hold = await prisma.legalHold.update({
    where: { id: holdId },
    data: {
      releasedBy,
      releasedAt: new Date(),
      status: 'RELEASED',
    },
  });

  // Release documents
  await prisma.document.updateMany({
    where: {
      legalHoldId: holdId,
    },
    data: {
      legalHold: false,
      legalHoldId: null,
    },
  });

  // Notify legal team and compliance officers
  await notifyLegalHold(holdId, 'RELEASED');

  return hold;
}

export async function getLegalHoldStatus(documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      legalHoldDetails: true,
    },
  });

  if (!document?.legalHold) {
    return null;
  }

  return document.legalHoldDetails;
}

async function notifyRetentionAction(
  organizationId: string,
  rule: RetentionRule,
  documentCount: number
) {
  const staff = await prisma.staff.findMany({
    where: {
      organizationId,
      roles: {
        hasSome: rule.notifyRoles,
      },
    },
  });

  for (const member of staff) {
    await sendNotification({
      userId: member.id,
      title: 'Retention Policy Action',
      message: `${documentCount} documents of type ${rule.documentType} have been processed according to retention policy (${rule.action}).`,
      type: 'RETENTION_ACTION',
    });
  }
}

async function notifyLegalHold(holdId: string, action: 'APPLIED' | 'RELEASED') {
  const hold = await prisma.legalHold.findUnique({
    where: { id: holdId },
    include: {
      documents: true,
    },
  });

  if (!hold) return;

  const legalTeam = await prisma.staff.findMany({
    where: {
      organizationId: hold.documents[0].organizationId,
      roles: {
        hasSome: ['LEGAL_TEAM', 'COMPLIANCE_OFFICER'],
      },
    },
  });

  for (const member of legalTeam) {
    await sendNotification({
      userId: member.id,
      title: `Legal Hold ${action}`,
      message: `Legal hold ${action.toLowerCase()} for case ${
        hold.caseReference || holdId
      }. Affects ${hold.documents.length} documents.`,
      type: 'LEGAL_HOLD',
    });
  }
}


