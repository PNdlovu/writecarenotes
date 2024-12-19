import { addMinutes, isAfter, parseISO } from 'date-fns';
import { db } from '@/lib/db';
import { eq, and, lt, gt } from 'drizzle-orm';
import { medications, medicationAdministrations } from '@/lib/db/schema/medication';
import { notifications } from '@/lib/db/schema/notification';

export interface MedicationAlert {
  residentId: number;
  residentName: string;
  medicationId: number;
  medicationName: string;
  scheduledTime: Date;
  status: 'UPCOMING' | 'DUE' | 'OVERDUE';
  requiresDoubleSignature: boolean;
  isControlled: boolean;
  isPRN: boolean;
  allergyWarnings: string[];
  contraindications: string[];
}

const ALERT_THRESHOLDS = {
  UPCOMING: 30, // minutes before
  OVERDUE: 30, // minutes after
  CRITICAL: 60, // minutes after for controlled substances
};

export async function checkMedicationAlerts() {
  const now = new Date();
  const upcomingTime = addMinutes(now, ALERT_THRESHOLDS.UPCOMING);
  const overdueTime = addMinutes(now, -ALERT_THRESHOLDS.OVERDUE);
  const criticalTime = addMinutes(now, -ALERT_THRESHOLDS.CRITICAL);

  // Get all active medications with additional safety checks
  const activeMedications = await db.query.medications.findMany({
    where: and(
      lt(medications.startDate, now),
      or(
        eq(medications.endDate, null),
        gt(medications.endDate, now)
      )
    ),
    with: {
      resident: {
        with: {
          allergies: true,
          conditions: true
        }
      },
      administrations: {
        where: and(
          gt(medicationAdministrations.scheduledTime, overdueTime),
          lt(medicationAdministrations.scheduledTime, upcomingTime)
        ),
      },
      contraindications: true,
      signatures: {
        where: and(
          gt(medicationSignatures.timestamp, criticalTime),
          lt(medicationSignatures.timestamp, now)
        )
      }
    },
  });

  const alerts: MedicationAlert[] = [];

  for (const medication of activeMedications) {
    // Calculate today's administration times
    const todaysTimes = medication.times.map(time => {
      const [hours, minutes] = time.split(':');
      const scheduledTime = new Date();
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return scheduledTime;
    });

    for (const scheduledTime of todaysTimes) {
      // Check if this administration has already been recorded
      const administered = medication.administrations.some(
        admin => admin.status === 'GIVEN' &&
          Math.abs(admin.scheduledTime.getTime() - scheduledTime.getTime()) < 24 * 60 * 60 * 1000
      );

      if (!administered) {
        let status: MedicationAlert['status'];
        
        if (isAfter(scheduledTime, upcomingTime)) {
          status = 'UPCOMING';
        } else if (isAfter(scheduledTime, now)) {
          status = 'DUE';
        } else if (isAfter(now, overdueTime)) {
          status = 'OVERDUE';
        } else {
          continue; // Skip if outside our alert window
        }

        // Check for allergies and contraindications
        const allergyWarnings = medication.resident.allergies
          .filter(allergy => medication.ingredients.some(i => i.includes(allergy.substance)))
          .map(allergy => `Allergy to ${allergy.substance}`);

        const contraindications = medication.contraindications
          .filter(contra => medication.resident.conditions.some(c => c.name === contra.condition))
          .map(contra => `Contraindicated with ${contra.condition}`);

        // Add safety-enhanced alerts
        alerts.push({
          residentId: medication.residentId,
          residentName: medication.resident.name,
          medicationId: medication.id,
          medicationName: medication.name,
          scheduledTime,
          status,
          requiresDoubleSignature: medication.riskLevel === 'HIGH',
          isControlled: medication.isControlled,
          isPRN: medication.isPRN,
          allergyWarnings,
          contraindications,
        });
      }
    }
  }

  // Create notifications for alerts
  for (const alert of alerts) {
    const existingNotification = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.type, 'MEDICATION'),
        eq(notifications.status, 'PENDING'),
        eq(notifications.metadata.medicationId, alert.medicationId),
        eq(notifications.metadata.scheduledTime, alert.scheduledTime.toISOString())
      ),
    });

    if (!existingNotification) {
      await db.insert(notifications).values({
        type: 'MEDICATION',
        status: 'PENDING',
        priority: alert.status === 'OVERDUE' ? 'HIGH' : 'MEDIUM',
        title: `Medication ${alert.status.toLowerCase()}`,
        message: `${alert.medicationName} for ${alert.residentName} is ${alert.status.toLowerCase()}`,
        metadata: {
          residentId: alert.residentId,
          medicationId: alert.medicationId,
          scheduledTime: alert.scheduledTime.toISOString(),
          status: alert.status,
        },
      });
    }
  }

  return alerts;
}

export async function markNotificationHandled(notificationId: number) {
  await db
    .update(notifications)
    .set({ status: 'HANDLED' })
    .where(eq(notifications.id, notificationId));
}

// Function to be called by a cron job
export async function processMedicationNotifications() {
  try {
    const alerts = await checkMedicationAlerts();
    console.log(`Processed ${alerts.length} medication alerts`);
    return alerts;
  } catch (error) {
    console.error('Error processing medication notifications:', error);
    throw error;
  }
}


