import { prisma } from '@/lib/prisma';
import { addDays, addMonths, addYears, isBefore } from 'date-fns';
import { sendNotification } from '@/lib/notifications';

interface ReviewSchedule {
  documentId: string;
  reviewFrequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  lastReviewDate: Date;
  nextReviewDate: Date;
  reviewers: string[]; // Staff IDs
}

interface ExpirationConfig {
  documentId: string;
  expirationDate: Date;
  warningDays: number; // Days before expiration to send warning
  notifyUsers: string[]; // Staff IDs to notify
}

export async function scheduleDocumentReview(
  documentId: string,
  frequency: ReviewSchedule['reviewFrequency'],
  reviewers: string[]
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  const lastReviewDate = new Date();
  const nextReviewDate = calculateNextReviewDate(lastReviewDate, frequency);

  await prisma.documentReview.create({
    data: {
      documentId,
      frequency,
      lastReviewDate,
      nextReviewDate,
      reviewers: {
        connect: reviewers.map(id => ({ id })),
      },
    },
  });

  // Schedule reminders
  await scheduleReviewReminders(documentId, nextReviewDate, reviewers);
}

export async function setDocumentExpiration(
  documentId: string,
  expirationDate: Date,
  warningDays: number,
  notifyUsers: string[]
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  await prisma.documentExpiration.create({
    data: {
      documentId,
      expirationDate,
      warningDays,
      notifyUsers: {
        connect: notifyUsers.map(id => ({ id })),
      },
    },
  });

  // Schedule expiration warnings
  const warningDate = addDays(expirationDate, -warningDays);
  await scheduleExpirationWarning(documentId, warningDate, expirationDate, notifyUsers);
}

function calculateNextReviewDate(
  lastReviewDate: Date,
  frequency: ReviewSchedule['reviewFrequency']
): Date {
  switch (frequency) {
    case 'MONTHLY':
      return addMonths(lastReviewDate, 1);
    case 'QUARTERLY':
      return addMonths(lastReviewDate, 3);
    case 'SEMI_ANNUAL':
      return addMonths(lastReviewDate, 6);
    case 'ANNUAL':
      return addYears(lastReviewDate, 1);
    default:
      throw new Error('Invalid review frequency');
  }
}

async function scheduleReviewReminders(
  documentId: string,
  reviewDate: Date,
  reviewers: string[]
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { name: true },
  });

  // Schedule reminders at different intervals
  const reminderDates = [
    { days: 30, sent: false },
    { days: 14, sent: false },
    { days: 7, sent: false },
    { days: 1, sent: false },
  ];

  for (const reminder of reminderDates) {
    const reminderDate = addDays(reviewDate, -reminder.days);
    
    await prisma.documentReminder.create({
      data: {
        documentId,
        type: 'REVIEW',
        dueDate: reminderDate,
        status: 'PENDING',
        assignedTo: reviewers,
      },
    });
  }
}

async function scheduleExpirationWarning(
  documentId: string,
  warningDate: Date,
  expirationDate: Date,
  notifyUsers: string[]
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { name: true },
  });

  // Create warning reminder
  await prisma.documentReminder.create({
    data: {
      documentId,
      type: 'EXPIRATION_WARNING',
      dueDate: warningDate,
      status: 'PENDING',
      assignedTo: notifyUsers,
    },
  });

  // Create expiration reminder
  await prisma.documentReminder.create({
    data: {
      documentId,
      type: 'EXPIRED',
      dueDate: expirationDate,
      status: 'PENDING',
      assignedTo: notifyUsers,
    },
  });
}

// Function to check and process document reviews and expirations
export async function processDocumentSchedules() {
  const now = new Date();

  // Process reviews
  const pendingReviews = await prisma.documentReview.findMany({
    where: {
      nextReviewDate: {
        lte: now,
      },
      status: 'PENDING',
    },
    include: {
      document: true,
      reviewers: true,
    },
  });

  for (const review of pendingReviews) {
    // Send notifications to reviewers
    for (const reviewer of review.reviewers) {
      await sendNotification({
        userId: reviewer.id,
        title: 'Document Review Required',
        message: `The document "${review.document.name}" is due for review.`,
        type: 'DOCUMENT_REVIEW',
      });
    }
  }

  // Process expirations
  const pendingExpirations = await prisma.documentExpiration.findMany({
    where: {
      expirationDate: {
        lte: now,
      },
      status: 'ACTIVE',
    },
    include: {
      document: true,
      notifyUsers: true,
    },
  });

  for (const expiration of pendingExpirations) {
    // Update document status
    await prisma.document.update({
      where: { id: expiration.documentId },
      data: { status: 'EXPIRED' },
    });

    // Send notifications
    for (const user of expiration.notifyUsers) {
      await sendNotification({
        userId: user.id,
        title: 'Document Expired',
        message: `The document "${expiration.document.name}" has expired.`,
        type: 'DOCUMENT_EXPIRED',
      });
    }
  }
}

// Function to handle clinical document expirations
export async function processClinicalDocumentSchedules() {
  const now = new Date();

  // Get clinical documents approaching expiration
  const clinicalDocuments = await prisma.document.findMany({
    where: {
      type: 'CLINICAL',
      status: 'ACTIVE',
      expiration: {
        expirationDate: {
          lte: addDays(now, 30), // Look ahead 30 days
        },
      },
    },
    include: {
      expiration: {
        include: {
          notifyUsers: true,
        },
      },
    },
  });

  for (const document of clinicalDocuments) {
    const daysUntilExpiration = Math.ceil(
      (document.expiration!.expirationDate.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Determine notification urgency
    let urgency: 'NORMAL' | 'URGENT' = 'NORMAL';
    if (daysUntilExpiration <= 7) {
      urgency = 'URGENT';
    }

    // Notify clinical staff
    for (const user of document.expiration!.notifyUsers) {
      await sendNotification({
        userId: user.id,
        title: `Clinical Document ${daysUntilExpiration <= 0 ? 'Expired' : 'Expiring'}`,
        message: `Clinical document "${document.name}" ${
          daysUntilExpiration <= 0
            ? 'has expired'
            : `will expire in ${daysUntilExpiration} days`
        }.`,
        type: 'CLINICAL_DOCUMENT_EXPIRATION',
        urgency,
      });
    }
  }
}


