import { AssessmentTemplate } from '../types';
import { ASSESSMENT_TYPES, NEEDS_ASSESSMENT_SECTIONS } from '../types/assessment.types';

export const needsAssessmentTemplate: AssessmentTemplate = {
  id: 'needs-assessment-template',
  title: 'Comprehensive Needs Assessment',
  type: ASSESSMENT_TYPES.NEEDS_ASSESSMENT,
  category: 'Care Planning',
  description: 'A comprehensive assessment of a child\'s needs in care home settings',
  version: '1.0.0',
  status: 'ACTIVE',
  frequency: {
    value: 3,
    unit: 'MONTHS'
  },
  sections: [
    {
      title: 'Physical Health',
      order: 1,
      questions: [
        {
          text: 'Current medical conditions and diagnoses',
          type: 'text',
          required: true
        },
        {
          text: 'Current medications and treatments',
          type: 'text',
          required: true
        },
        {
          text: 'Dietary requirements and allergies',
          type: 'text',
          required: true
        }
      ]
    },
    {
      title: 'Mental Health',
      order: 2,
      questions: [
        {
          text: 'Current mental health status',
          type: 'text',
          required: true
        },
        {
          text: 'History of trauma or significant life events',
          type: 'text',
          required: true
        },
        {
          text: 'Current therapeutic interventions',
          type: 'text',
          required: true
        }
      ]
    },
    {
      title: 'Educational Needs',
      order: 3,
      questions: [
        {
          text: 'Current educational placement',
          type: 'text',
          required: true
        },
        {
          text: 'Learning difficulties or special educational needs',
          type: 'text',
          required: true
        },
        {
          text: 'Educational support requirements',
          type: 'text',
          required: true
        }
      ]
    },
    {
      title: 'Social and Developmental Needs',
      order: 4,
      questions: [
        {
          text: 'Peer relationships and social skills',
          type: 'text',
          required: true
        },
        {
          text: 'Cultural and identity needs',
          type: 'text',
          required: true
        },
        {
          text: 'Developmental milestones and progress',
          type: 'text',
          required: true
        }
      ]
    },
    {
      title: 'Life Skills',
      order: 5,
      questions: [
        {
          text: 'Independent living skills assessment',
          type: 'text',
          required: true
        },
        {
          text: 'Self-care abilities',
          type: 'text',
          required: true
        },
        {
          text: 'Areas requiring support or development',
          type: 'text',
          required: true
        }
      ]
    },
    {
      title: 'Safety and Risk Management',
      order: 6,
      questions: [
        {
          text: 'Current risk assessment summary',
          type: 'text',
          required: true
        },
        {
          text: 'Safety measures in place',
          type: 'text',
          required: true
        },
        {
          text: 'Specific concerns or vulnerabilities',
          type: 'text',
          required: true
        }
      ]
    },
    {
      title: 'Communication Needs',
      order: 7,
      questions: [
        {
          text: 'Primary language and communication method',
          type: 'text',
          required: true
        },
        {
          text: 'Communication support requirements',
          type: 'text',
          required: true
        },
        {
          text: 'Interpreter or specialist support needed',
          type: 'text',
          required: true
        }
      ]
    },
    {
      title: 'Therapeutic Support',
      order: 8,
      questions: [
        {
          text: 'Current therapeutic interventions',
          type: 'text',
          required: true
        },
        {
          text: 'Therapeutic goals and progress',
          type: 'text',
          required: true
        },
        {
          text: 'Additional therapeutic needs identified',
          type: 'text',
          required: true
        }
      ]
    }
  ],
  metadata: {
    requiresWitnessing: true,
    attachmentsRequired: true,
    complianceLevel: 'ENHANCED',
    applicableRegions: ['ALL'],
    tags: ['needs-assessment', 'care-planning', 'child-care'],
    customFields: {
      ofstedCompliant: true,
      careInspectorateCompliant: true
    }
  },
  createdBy: {
    id: 'system',
    name: 'System Template'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};
