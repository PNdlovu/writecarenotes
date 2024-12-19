export const notifications = {
  channels: {
    email: {
      enabled: true,
      templates: {
        alert: 'alert-template',
        report: 'report-template',
        reminder: 'reminder-template',
        escalation: 'escalation-template'
      },
      priorities: {
        critical: 'immediate',
        high: '15min',
        medium: '1hour',
        low: '4hours'
      }
    },
    sms: {
      enabled: true,
      templates: {
        alert: 'sms-alert',
        reminder: 'sms-reminder',
        escalation: 'sms-escalation'
      },
      priorities: {
        critical: 'immediate',
        high: '15min',
        medium: 'none',
        low: 'none'
      }
    },
    dashboard: {
      enabled: true,
      display_duration: {
        critical: 'permanent',
        high: '24hours',
        medium: '12hours',
        low: '4hours'
      },
      auto_dismiss: {
        critical: false,
        high: false,
        medium: true,
        low: true
      }
    },
    mobile: {
      enabled: true,
      push_notifications: {
        critical: true,
        high: true,
        medium: true,
        low: false
      },
      quiet_hours: {
        enabled: true,
        start: '22:00',
        end: '07:00',
        override_critical: true
      }
    }
  },
  roles: {
    manager: {
      channels: ['email', 'sms', 'dashboard', 'mobile'],
      priorities: ['critical', 'high', 'medium', 'low']
    },
    nurse: {
      channels: ['sms', 'dashboard', 'mobile'],
      priorities: ['critical', 'high', 'medium']
    },
    care_worker: {
      channels: ['dashboard', 'mobile'],
      priorities: ['critical', 'high']
    },
    admin: {
      channels: ['email', 'dashboard'],
      priorities: ['medium', 'low']
    }
  },
  escalation: {
    rules: [
      {
        condition: 'unacknowledged',
        time: 15, // minutes
        escalate_to: ['manager'],
        channels: ['sms', 'mobile']
      },
      {
        condition: 'unresolved',
        time: 30, // minutes
        escalate_to: ['senior_manager'],
        channels: ['sms', 'mobile', 'email']
      },
      {
        condition: 'critical_unresolved',
        time: 45, // minutes
        escalate_to: ['director'],
        channels: ['sms', 'mobile', 'email']
      }
    ],
    out_of_hours: {
      enabled: true,
      contacts: ['on_call_manager', 'emergency_contact'],
      channels: ['sms', 'mobile']
    }
  },
  compliance: {
    regulatory: {
      cqc: {
        notification_types: ['incident', 'death', 'serious_injury', 'abuse'],
        timeframes: {
          incident: 24,  // hours
          death: 24,     // hours
          serious_injury: 24, // hours
          abuse: 24      // hours
        },
        channels: ['email', 'dashboard'],
        templates: {
          incident: 'cqc-incident-template',
          death: 'cqc-death-template',
          serious_injury: 'cqc-injury-template',
          abuse: 'cqc-abuse-template'
        }
      },
      hiqa: {
        notification_types: ['incident', 'death', 'serious_injury', 'abuse'],
        timeframes: {
          incident: 72,  // hours
          death: 48,     // hours
          serious_injury: 72, // hours
          abuse: 24      // hours
        },
        channels: ['email', 'dashboard'],
        templates: {
          incident: 'hiqa-incident-template',
          death: 'hiqa-death-template',
          serious_injury: 'hiqa-injury-template',
          abuse: 'hiqa-abuse-template'
        }
      }
    }
  }
} 


