import { EmergencyProtocol, EmergencyType } from '../types';

export const protocolTemplates: Record<EmergencyType, EmergencyProtocol> = {
  MEDICAL: {
    id: 'template-medical',
    type: 'MEDICAL',
    title: 'Medical Emergency Response Protocol',
    description: 'Standard protocol for responding to medical emergencies',
    steps: [
      {
        id: 'med-1',
        order: 1,
        title: 'Initial Assessment',
        description: 'Assess resident\'s condition using ABCDE approach',
        isRequired: true,
        timeLimit: 5,
        verificationRequired: true,
        completionCriteria: [
          'Airways checked',
          'Breathing assessed',
          'Circulation checked',
          'Disability evaluated',
          'Exposure considered'
        ]
      },
      {
        id: 'med-2',
        order: 2,
        title: 'Emergency Services Contact',
        description: 'Call emergency services if required',
        isRequired: true,
        timeLimit: 2,
        verificationRequired: true,
        completionCriteria: [
          'Emergency services contacted',
          'Location details provided',
          'Resident condition described'
        ]
      },
      {
        id: 'med-3',
        order: 3,
        title: 'Vital Signs Monitoring',
        description: 'Monitor and record vital signs',
        isRequired: true,
        timeLimit: 5,
        verificationRequired: true,
        completionCriteria: [
          'Blood pressure recorded',
          'Heart rate monitored',
          'Respiratory rate checked',
          'Temperature taken',
          'Oxygen saturation measured'
        ]
      }
    ],
    requiredRoles: ['NURSE', 'SENIOR_CARE_WORKER'],
    autoNotify: ['CARE_HOME_MANAGER', 'CLINICAL_LEAD'],
    escalationPath: ['NURSE_IN_CHARGE', 'CLINICAL_LEAD', 'CARE_HOME_MANAGER'],
    reviewFrequency: 90,
    lastReviewed: new Date(),
    nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },

  MEDICATION: {
    id: 'template-medication',
    type: 'MEDICATION',
    title: 'Medication Emergency Protocol',
    description: 'Protocol for medication-related emergencies',
    steps: [
      {
        id: 'med-err-1',
        order: 1,
        title: 'Stop Administration',
        description: 'Immediately stop any ongoing medication administration',
        isRequired: true,
        timeLimit: 1,
        verificationRequired: true,
        completionCriteria: [
          'Medication administration stopped',
          'Other staff notified',
          'Medication secured'
        ]
      },
      {
        id: 'med-err-2',
        order: 2,
        title: 'Clinical Assessment',
        description: 'Assess resident for adverse reactions',
        isRequired: true,
        timeLimit: 5,
        verificationRequired: true,
        completionCriteria: [
          'Vital signs checked',
          'Adverse reactions documented',
          'Allergic responses checked'
        ]
      },
      {
        id: 'med-err-3',
        order: 3,
        title: 'Contact Healthcare Providers',
        description: 'Notify relevant healthcare providers',
        isRequired: true,
        timeLimit: 10,
        verificationRequired: true,
        completionCriteria: [
          'GP notified',
          'Pharmacy contacted',
          'Poison control contacted if required'
        ]
      }
    ],
    requiredRoles: ['NURSE', 'MEDICATION_MANAGER'],
    autoNotify: ['CLINICAL_LEAD', 'PHARMACY_MANAGER'],
    escalationPath: ['NURSE_IN_CHARGE', 'CLINICAL_LEAD', 'MEDICAL_DIRECTOR'],
    reviewFrequency: 60,
    lastReviewed: new Date(),
    nextReview: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },

  FIRE: {
    id: 'template-fire',
    type: 'FIRE',
    title: 'Fire Emergency Protocol',
    description: 'Protocol for fire emergencies and evacuation',
    steps: [
      {
        id: 'fire-1',
        order: 1,
        title: 'Raise Alarm',
        description: 'Activate fire alarm and notify emergency services',
        isRequired: true,
        timeLimit: 1,
        verificationRequired: true,
        completionCriteria: [
          'Fire alarm activated',
          'Emergency services called',
          'Staff alerted'
        ]
      },
      {
        id: 'fire-2',
        order: 2,
        title: 'Evacuation',
        description: 'Evacuate residents following evacuation plan',
        isRequired: true,
        timeLimit: 15,
        verificationRequired: true,
        completionCriteria: [
          'Residents evacuated',
          'Roll call completed',
          'Assembly point reached'
        ]
      },
      {
        id: 'fire-3',
        order: 3,
        title: 'Containment',
        description: 'If safe, contain fire spread',
        isRequired: false,
        timeLimit: 5,
        verificationRequired: true,
        completionCriteria: [
          'Fire doors closed',
          'Windows closed',
          'Electrical systems isolated'
        ]
      }
    ],
    requiredRoles: ['FIRE_WARDEN', 'SENIOR_CARE_WORKER'],
    autoNotify: ['CARE_HOME_MANAGER', 'MAINTENANCE_MANAGER'],
    escalationPath: ['FIRE_WARDEN', 'CARE_HOME_MANAGER', 'EMERGENCY_SERVICES'],
    reviewFrequency: 30,
    lastReviewed: new Date(),
    nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },

  SECURITY: {
    id: 'template-security',
    type: 'SECURITY',
    title: 'Security Emergency Protocol',
    description: 'Protocol for security breaches and threats',
    steps: [
      {
        id: 'sec-1',
        order: 1,
        title: 'Secure Premises',
        description: 'Implement lockdown procedures',
        isRequired: true,
        timeLimit: 5,
        verificationRequired: true,
        completionCriteria: [
          'Entry points secured',
          'Residents moved to safe areas',
          'Staff positions confirmed'
        ]
      },
      {
        id: 'sec-2',
        order: 2,
        title: 'Alert Authorities',
        description: 'Contact police and security services',
        isRequired: true,
        timeLimit: 3,
        verificationRequired: true,
        completionCriteria: [
          'Police contacted',
          'Security service notified',
          'Incident details provided'
        ]
      },
      {
        id: 'sec-3',
        order: 3,
        title: 'Headcount',
        description: 'Account for all residents and staff',
        isRequired: true,
        timeLimit: 10,
        verificationRequired: true,
        completionCriteria: [
          'Resident headcount completed',
          'Staff headcount completed',
          'Missing persons identified'
        ]
      }
    ],
    requiredRoles: ['SECURITY_OFFICER', 'SENIOR_CARE_WORKER'],
    autoNotify: ['CARE_HOME_MANAGER', 'SECURITY_MANAGER'],
    escalationPath: ['SECURITY_OFFICER', 'CARE_HOME_MANAGER', 'POLICE'],
    reviewFrequency: 60,
    lastReviewed: new Date(),
    nextReview: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },

  NATURAL_DISASTER: {
    id: 'template-natural-disaster',
    type: 'NATURAL_DISASTER',
    title: 'Natural Disaster Protocol',
    description: 'Protocol for natural disasters (flood, storm, etc.)',
    steps: [
      {
        id: 'nat-1',
        order: 1,
        title: 'Risk Assessment',
        description: 'Assess immediate risks and required actions',
        isRequired: true,
        timeLimit: 10,
        verificationRequired: true,
        completionCriteria: [
          'Building safety checked',
          'Environmental hazards identified',
          'Immediate risks documented'
        ]
      },
      {
        id: 'nat-2',
        order: 2,
        title: 'Protective Actions',
        description: 'Implement protective measures',
        isRequired: true,
        timeLimit: 20,
        verificationRequired: true,
        completionCriteria: [
          'Residents moved to safe areas',
          'Emergency supplies distributed',
          'Safety measures implemented'
        ]
      },
      {
        id: 'nat-3',
        order: 3,
        title: 'External Support',
        description: 'Contact emergency services and support agencies',
        isRequired: true,
        timeLimit: 15,
        verificationRequired: true,
        completionCriteria: [
          'Emergency services contacted',
          'Support agencies notified',
          'Resources requested'
        ]
      }
    ],
    requiredRoles: ['EMERGENCY_COORDINATOR', 'SENIOR_CARE_WORKER'],
    autoNotify: ['CARE_HOME_MANAGER', 'MAINTENANCE_MANAGER'],
    escalationPath: ['EMERGENCY_COORDINATOR', 'CARE_HOME_MANAGER', 'EMERGENCY_SERVICES'],
    reviewFrequency: 90,
    lastReviewed: new Date(),
    nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },

  INFRASTRUCTURE: {
    id: 'template-infrastructure',
    type: 'INFRASTRUCTURE',
    title: 'Infrastructure Emergency Protocol',
    description: 'Protocol for infrastructure failures (power, water, etc.)',
    steps: [
      {
        id: 'inf-1',
        order: 1,
        title: 'Impact Assessment',
        description: 'Assess extent and impact of infrastructure failure',
        isRequired: true,
        timeLimit: 10,
        verificationRequired: true,
        completionCriteria: [
          'Affected systems identified',
          'Impact scope determined',
          'Critical needs assessed'
        ]
      },
      {
        id: 'inf-2',
        order: 2,
        title: 'Emergency Systems',
        description: 'Activate backup systems and emergency supplies',
        isRequired: true,
        timeLimit: 15,
        verificationRequired: true,
        completionCriteria: [
          'Backup power activated',
          'Emergency supplies accessed',
          'Critical systems checked'
        ]
      },
      {
        id: 'inf-3',
        order: 3,
        title: 'Service Restoration',
        description: 'Contact service providers and arrange repairs',
        isRequired: true,
        timeLimit: 30,
        verificationRequired: true,
        completionCriteria: [
          'Service providers contacted',
          'Repair timeline established',
          'Alternative arrangements made'
        ]
      }
    ],
    requiredRoles: ['MAINTENANCE_MANAGER', 'FACILITY_COORDINATOR'],
    autoNotify: ['CARE_HOME_MANAGER', 'OPERATIONS_MANAGER'],
    escalationPath: ['MAINTENANCE_MANAGER', 'OPERATIONS_MANAGER', 'EXTERNAL_CONTRACTORS'],
    reviewFrequency: 60,
    lastReviewed: new Date(),
    nextReview: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },

  OTHER: {
    id: 'template-other',
    type: 'OTHER',
    title: 'General Emergency Protocol',
    description: 'Generic protocol for undefined emergencies',
    steps: [
      {
        id: 'other-1',
        order: 1,
        title: 'Situation Assessment',
        description: 'Assess the emergency situation and immediate risks',
        isRequired: true,
        timeLimit: 10,
        verificationRequired: true,
        completionCriteria: [
          'Situation evaluated',
          'Immediate risks identified',
          'Required actions determined'
        ]
      },
      {
        id: 'other-2',
        order: 2,
        title: 'Response Implementation',
        description: 'Implement appropriate response measures',
        isRequired: true,
        timeLimit: 15,
        verificationRequired: true,
        completionCriteria: [
          'Response plan created',
          'Resources allocated',
          'Actions initiated'
        ]
      },
      {
        id: 'other-3',
        order: 3,
        title: 'Communication',
        description: 'Notify relevant parties and maintain communication',
        isRequired: true,
        timeLimit: 10,
        verificationRequired: true,
        completionCriteria: [
          'Key stakeholders notified',
          'Communication channels established',
          'Updates provided'
        ]
      }
    ],
    requiredRoles: ['SENIOR_CARE_WORKER', 'CARE_HOME_MANAGER'],
    autoNotify: ['CARE_HOME_MANAGER', 'CLINICAL_LEAD'],
    escalationPath: ['SENIOR_CARE_WORKER', 'CARE_HOME_MANAGER', 'EMERGENCY_SERVICES'],
    reviewFrequency: 90,
    lastReviewed: new Date(),
    nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  }
};
