import { ConsentRequest, ParentalConsent } from '../types/consent';

export interface NotificationPayload {
  type: 'CONSENT_REQUEST' | 'CONSENT_REMINDER' | 'CONSENT_EXPIRING' | 'CONSENT_APPROVED' | 'CONSENT_DENIED';
  title: string;
  body: string;
  data: {
    requestId: string;
    residentId: string;
    medicationId: string;
    action?: string;
  };
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  reminderFrequency: 'DAILY' | 'WEEKLY' | 'NONE';
}

class ConsentNotificationService {
  private async sendPushNotification(
    userId: string,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      // Implementation would use a push notification service (e.g., Firebase Cloud Messaging)
      return true;
    } catch (error) {
      console.error('Push notification failed:', error);
      return false;
    }
  }

  private async sendEmail(
    email: string,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      // Implementation would use an email service (e.g., SendGrid)
      return true;
    } catch (error) {
      console.error('Email notification failed:', error);
      return false;
    }
  }

  private async sendSMS(
    phoneNumber: string,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      // Implementation would use an SMS service (e.g., Twilio)
      return true;
    } catch (error) {
      console.error('SMS notification failed:', error);
      return false;
    }
  }

  public async notifyNewRequest(
    request: ConsentRequest,
    preferences: NotificationPreferences
  ): Promise<void> {
    const payload: NotificationPayload = {
      type: 'CONSENT_REQUEST',
      title: 'New Medication Consent Request',
      body: 'A new medication consent request requires your attention.',
      data: {
        requestId: request.familyPortalRequestId,
        residentId: request.residentId,
        medicationId: request.medicationId,
        action: 'VIEW_REQUEST',
      },
    };

    if (preferences.push) {
      await this.sendPushNotification(request.requestedBy.id, payload);
    }

    if (preferences.email) {
      await this.sendEmail(request.requestedBy.email || '', payload);
    }

    if (preferences.sms) {
      await this.sendSMS(request.requestedBy.contactNumber || '', payload);
    }
  }

  public async sendReminder(
    consent: ParentalConsent,
    preferences: NotificationPreferences
  ): Promise<void> {
    const payload: NotificationPayload = {
      type: 'CONSENT_REMINDER',
      title: 'Medication Consent Reminder',
      body: 'You have a pending medication consent request awaiting your review.',
      data: {
        requestId: consent.familyPortalRequestId,
        residentId: consent.residentId,
        medicationId: consent.medicationId,
        action: 'VIEW_REQUEST',
      },
    };

    if (preferences.push) {
      await this.sendPushNotification(consent.consentGivenBy.id, payload);
    }

    if (preferences.email) {
      await this.sendEmail(consent.consentGivenBy.email || '', payload);
    }

    if (preferences.sms) {
      await this.sendSMS(consent.consentGivenBy.contactNumber || '', payload);
    }
  }

  public async notifyExpiring(
    consent: ParentalConsent,
    daysUntilExpiry: number
  ): Promise<void> {
    const payload: NotificationPayload = {
      type: 'CONSENT_EXPIRING',
      title: 'Medication Consent Expiring Soon',
      body: `Your medication consent will expire in ${daysUntilExpiry} days.`,
      data: {
        requestId: consent.familyPortalRequestId,
        residentId: consent.residentId,
        medicationId: consent.medicationId,
        action: 'RENEW_CONSENT',
      },
    };

    await this.sendPushNotification(consent.consentGivenBy.id, payload);
    await this.sendEmail(consent.consentGivenBy.email || '', payload);
  }

  public async notifyStatusChange(
    consent: ParentalConsent,
    status: 'APPROVED' | 'DENIED'
  ): Promise<void> {
    const payload: NotificationPayload = {
      type: status === 'APPROVED' ? 'CONSENT_APPROVED' : 'CONSENT_DENIED',
      title: `Medication Consent ${status === 'APPROVED' ? 'Approved' : 'Denied'}`,
      body: `The medication consent request has been ${status.toLowerCase()}.`,
      data: {
        requestId: consent.familyPortalRequestId,
        residentId: consent.residentId,
        medicationId: consent.medicationId,
        action: 'VIEW_DETAILS',
      },
    };

    await this.sendPushNotification(consent.consentGivenBy.id, payload);
    await this.sendEmail(consent.consentGivenBy.email || '', payload);
  }
}

export const consentNotifications = new ConsentNotificationService();


