/**
 * @fileoverview Notifications Service for Care Home Alerts
 * @version 1.0.0
 * @created 2024-03-21
 */

import { logger } from './logger';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

interface NotificationConfig {
  email: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    from: string;
  };
  sms: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
}

export class NotificationService {
  private static instance: NotificationService;
  private emailTransporter: nodemailer.Transporter;
  private smsClient: twilio.Twilio;
  private config: NotificationConfig;

  private constructor() {
    // Load config from environment variables
    this.config = {
      email: {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        },
        from: process.env.SMTP_FROM || 'alerts@writecarenotes.com'
      },
      sms: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        fromNumber: process.env.TWILIO_FROM_NUMBER || ''
      }
    };

    this.initializeEmailTransporter();
    this.initializeSMSClient();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private initializeEmailTransporter(): void {
    this.emailTransporter = nodemailer.createTransport({
      host: this.config.email.host,
      port: this.config.email.port,
      secure: this.config.email.secure,
      auth: {
        user: this.config.email.auth.user,
        pass: this.config.email.auth.pass
      }
    });
  }

  private initializeSMSClient(): void {
    this.smsClient = twilio(
      this.config.sms.accountSid,
      this.config.sms.authToken
    );
  }

  public async sendEmail(
    to: string[],
    subject: string,
    text: string,
    html?: string
  ): Promise<void> {
    try {
      const info = await this.emailTransporter.sendMail({
        from: this.config.email.from,
        to: to.join(', '),
        subject,
        text,
        html: html || text
      });

      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to
      });
    } catch (error) {
      logger.error('Failed to send email', { error, to, subject });
      throw error;
    }
  }

  public async sendSMS(
    to: string[],
    message: string
  ): Promise<void> {
    try {
      const promises = to.map(number =>
        this.smsClient.messages.create({
          body: message,
          from: this.config.sms.fromNumber,
          to: number
        })
      );

      await Promise.all(promises);
      logger.info('SMS sent successfully', { to });
    } catch (error) {
      logger.error('Failed to send SMS', { error, to, message });
      throw error;
    }
  }

  public async formatAlertMessage(alert: {
    metric: string;
    value: number;
    threshold: number;
    severity: string;
    timestamp: number;
  }): Promise<{
    subject: string;
    text: string;
    html: string;
  }> {
    const subject = `[${alert.severity.toUpperCase()}] Care Home Alert: ${this.formatMetricName(alert.metric)}`;
    
    const text = `
Alert Details:
-------------
Metric: ${this.formatMetricName(alert.metric)}
Current Value: ${alert.value}
Threshold: ${alert.threshold}
Severity: ${alert.severity.toUpperCase()}
Time: ${new Date(alert.timestamp).toLocaleString()}

Please take appropriate action based on your care home's procedures.
    `.trim();

    const html = `
<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
  <h2 style="color: ${this.getSeverityColor(alert.severity)};">
    Care Home Alert: ${this.formatMetricName(alert.metric)}
  </h2>
  
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
    <p><strong>Metric:</strong> ${this.formatMetricName(alert.metric)}</p>
    <p><strong>Current Value:</strong> ${alert.value}</p>
    <p><strong>Threshold:</strong> ${alert.threshold}</p>
    <p><strong>Severity:</strong> 
      <span style="color: ${this.getSeverityColor(alert.severity)};">
        ${alert.severity.toUpperCase()}
      </span>
    </p>
    <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
  </div>

  <p style="margin-top: 20px;">
    Please take appropriate action based on your care home's procedures.
  </p>
</div>
    `.trim();

    return { subject, text, html };
  }

  private formatMetricName(metric: string): string {
    return metric
      .split('.')
      .map(part => part
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      )
      .join(' - ');
  }

  private getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '#dc3545';
      case 'high':
        return '#fd7e14';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }
} 
