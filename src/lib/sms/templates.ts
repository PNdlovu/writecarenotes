interface TemplateData {
  [key: string]: string | number | undefined
}

function replaceTemplateVars(template: string, data: TemplateData): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => 
    String(data[key] ?? match)
  )
}

export const smsTemplates = {
  // Authentication Templates
  twoFactorCode: (data: { code: string }) => replaceTemplateVars(
    'Your Care Home Management verification code is: {{code}}. This code will expire in 10 minutes.',
    data
  ),

  passwordReset: (data: { code: string }) => replaceTemplateVars(
    'Your Care Home Management password reset code is: {{code}}. This code will expire in 1 hour.',
    data
  ),

  // Staff Notifications
  shiftReminder: (data: { name: string, date: string, time: string }) => replaceTemplateVars(
    'Hi {{name}}, reminder: You have a shift scheduled for {{date}} at {{time}}.',
    data
  ),

  shiftCancellation: (data: { name: string, date: string }) => replaceTemplateVars(
    'Hi {{name}}, your shift on {{date}} has been cancelled. Please contact your manager for details.',
    data
  ),

  // Care Home Alerts
  emergencyAlert: (data: { facility: string, message: string }) => replaceTemplateVars(
    'URGENT: {{facility}} - {{message}}. Please respond immediately.',
    data
  ),

  medicationReminder: (data: { resident: string, medication: string, time: string }) => replaceTemplateVars(
    'Medication reminder for {{resident}}: {{medication}} due at {{time}}.',
    data
  ),

  // Compliance Notifications
  complianceAlert: (data: { facility: string, issue: string, deadline: string }) => replaceTemplateVars(
    'Compliance Alert - {{facility}}: {{issue}}. Action required by {{deadline}}.',
    data
  ),

  inspectionNotice: (data: { facility: string, date: string, time: string }) => replaceTemplateVars(
    'Inspection scheduled for {{facility}} on {{date}} at {{time}}. Please ensure all documentation is up to date.',
    data
  ),

  // Family Communications
  familyUpdate: (data: { family: string, resident: string, message: string }) => replaceTemplateVars(
    'Hi {{family}}, update regarding {{resident}}: {{message}}',
    data
  ),

  visitReminder: (data: { visitor: string, resident: string, date: string, time: string }) => replaceTemplateVars(
    'Hi {{visitor}}, reminder of your visit with {{resident}} on {{date}} at {{time}}.',
    data
  ),
}

// Template usage types for TypeScript
export type SMSTemplateType = keyof typeof smsTemplates
export type SMSTemplateData<T extends SMSTemplateType> = Parameters<typeof smsTemplates[T]>[0]

// Helper function to send templated SMS
export function createTemplatedMessage<T extends SMSTemplateType>(
  template: T,
  data: SMSTemplateData<T>
): string {
  const templateFn = smsTemplates[template]
  return templateFn(data as any)
} 


