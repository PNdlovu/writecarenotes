import { HandoverTask, Staff, NotificationType, NotificationChannel, NotificationPreference } from '../types/handover';

export interface NotificationRule {
  id: string;
  name: string;
  eventType: string;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  enabled: boolean;
}

interface NotificationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

interface NotificationAction {
  type: NotificationType;
  channel: NotificationChannel;
  template: string;
  recipients: string[];
}

export class NotificationService {
  private rules: NotificationRule[] = [];
  private preferences: Map<string, NotificationPreference> = new Map();

  constructor(
    private readonly emailService: any,
    private readonly smsService: any,
    private readonly pushService: any
  ) {}

  async initialize() {
    // Load rules and preferences from storage
    await this.loadRules();
    await this.loadPreferences();
    this.startEventListener();
  }

  private async loadRules() {
    // TODO: Load from database
    this.rules = [
      {
        id: '1',
        name: 'High Priority Task Assignment',
        eventType: 'TASK_ASSIGNED',
        conditions: [
          {
            field: 'priority',
            operator: 'equals',
            value: 'HIGH',
          },
        ],
        actions: [
          {
            type: 'IMMEDIATE',
            channel: 'EMAIL',
            template: 'HIGH_PRIORITY_TASK_ASSIGNED',
            recipients: ['assignee', 'supervisor'],
          },
          {
            type: 'IMMEDIATE',
            channel: 'PUSH',
            template: 'HIGH_PRIORITY_TASK_ASSIGNED',
            recipients: ['assignee'],
          },
        ],
        enabled: true,
      },
    ];
  }

  private async loadPreferences() {
    // TODO: Load from database
    this.preferences = new Map([
      [
        'default',
        {
          channels: {
            email: true,
            sms: false,
            push: true,
          },
          frequency: 'IMMEDIATE',
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '07:00',
          },
        },
      ],
    ]);
  }

  private startEventListener() {
    // Listen for various events
    window.addEventListener('handover:event', this.handleEvent.bind(this));
  }

  private async handleEvent(event: CustomEvent) {
    const { type, data } = event.detail;

    // Find matching rules
    const matchingRules = this.rules.filter(
      (rule) => rule.enabled && rule.eventType === type
    );

    for (const rule of matchingRules) {
      if (this.evaluateConditions(rule.conditions, data)) {
        await this.executeActions(rule.actions, data);
      }
    }
  }

  private evaluateConditions(
    conditions: NotificationCondition[],
    data: any
  ): boolean {
    return conditions.every((condition) => {
      const value = data[condition.field];
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'contains':
          return value?.includes(condition.value);
        case 'greaterThan':
          return value > condition.value;
        case 'lessThan':
          return value < condition.value;
        default:
          return false;
      }
    });
  }

  private async executeActions(actions: NotificationAction[], data: any) {
    for (const action of actions) {
      const recipients = this.resolveRecipients(action.recipients, data);
      const message = this.renderTemplate(action.template, data);

      for (const recipient of recipients) {
        const preferences = this.getRecipientPreferences(recipient);
        if (this.shouldSendNotification(action, preferences)) {
          await this.sendNotification(action.channel, recipient, message);
        }
      }
    }
  }

  private resolveRecipients(recipients: string[], data: any): string[] {
    return recipients.map((recipient) => {
      switch (recipient) {
        case 'assignee':
          return data.assignedTo?.id;
        case 'supervisor':
          return data.assignedTo?.supervisor?.id;
        default:
          return recipient;
      }
    }).filter(Boolean);
  }

  private renderTemplate(template: string, data: any): string {
    // TODO: Use a proper template engine
    return template
      .replace('{{taskName}}', data.name)
      .replace('{{priority}}', data.priority)
      .replace('{{dueDate}}', data.dueDate);
  }

  private getRecipientPreferences(recipientId: string): NotificationPreference {
    return (
      this.preferences.get(recipientId) || this.preferences.get('default')!
    );
  }

  private shouldSendNotification(
    action: NotificationAction,
    preferences: NotificationPreference
  ): boolean {
    // Check if channel is enabled
    if (!preferences.channels[action.channel.toLowerCase()]) {
      return false;
    }

    // Check quiet hours
    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const startTime =
        parseInt(preferences.quietHours.start.replace(':', '')) * 100;
      const endTime = parseInt(preferences.quietHours.end.replace(':', '')) * 100;

      if (currentTime >= startTime || currentTime <= endTime) {
        return false;
      }
    }

    return true;
  }

  private async sendNotification(
    channel: NotificationChannel,
    recipient: string,
    message: string
  ) {
    try {
      switch (channel) {
        case 'EMAIL':
          await this.emailService.send(recipient, message);
          break;
        case 'SMS':
          await this.smsService.send(recipient, message);
          break;
        case 'PUSH':
          await this.pushService.send(recipient, message);
          break;
      }
    } catch (error) {
      console.error(`Failed to send ${channel} notification:`, error);
    }
  }

  // Public API
  async addRule(rule: Omit<NotificationRule, 'id'>): Promise<NotificationRule> {
    const newRule = {
      ...rule,
      id: crypto.randomUUID(),
    };
    this.rules.push(newRule);
    // TODO: Save to database
    return newRule;
  }

  async updateRule(
    ruleId: string,
    updates: Partial<NotificationRule>
  ): Promise<void> {
    const index = this.rules.findIndex((rule) => rule.id === ruleId);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
      // TODO: Save to database
    }
  }

  async deleteRule(ruleId: string): Promise<void> {
    this.rules = this.rules.filter((rule) => rule.id !== ruleId);
    // TODO: Save to database
  }

  async updatePreferences(
    userId: string,
    preferences: NotificationPreference
  ): Promise<void> {
    this.preferences.set(userId, preferences);
    // TODO: Save to database
  }

  getRules(): NotificationRule[] {
    return this.rules;
  }

  getPreferences(userId: string): NotificationPreference {
    return this.getRecipientPreferences(userId);
  }
}
