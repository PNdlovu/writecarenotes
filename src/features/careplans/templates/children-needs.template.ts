import { 
    CarePlanTemplate, 
    CarePlanCategory,
    ReviewFrequency,
    CareLevel
} from '../types';
import { CareHomeType } from '@/features/carehome/types/care';
import { Region } from '@/types/region';

export const childrenNeedsTemplate: CarePlanTemplate = {
    id: 'children-needs-template',
    name: 'Children\'s Comprehensive Needs Assessment Care Plan',
    description: 'A comprehensive care plan template for assessing and managing the needs of children in care homes',
    careLevel: CareLevel.STANDARD,
    applicableCareHomeTypes: [CareHomeType.CHILDREN],
    categories: [
        CarePlanCategory.EDUCATIONAL_SUPPORT,
        CarePlanCategory.DEVELOPMENTAL_SUPPORT,
        CarePlanCategory.SAFEGUARDING,
        CarePlanCategory.FAMILY_CONTACT,
        CarePlanCategory.LIFE_SKILLS,
        CarePlanCategory.PLAY_AND_RECREATION,
        CarePlanCategory.TRANSITION_PLANNING,
        CarePlanCategory.MENTAL_HEALTH,
        CarePlanCategory.BEHAVIORAL_SUPPORT,
        CarePlanCategory.THERAPEUTIC_SUPPORT,
        CarePlanCategory.COMMUNICATION_SUPPORT
    ],
    defaultInterventions: [
        {
            category: CarePlanCategory.EDUCATIONAL_SUPPORT,
            description: 'Educational needs assessment and support planning',
            frequency: 'Weekly',
            priority: 'HIGH',
            startDate: new Date(),
            status: 'ACTIVE',
            instructions: 'Assess current educational progress and needs',
            specialistInput: true,
            requiresTraining: false,
            communicationStrategy: 'Regular meetings with education provider',
            successIndicators: ['Improved academic performance', 'Positive feedback from teachers']
        },
        {
            category: CarePlanCategory.DEVELOPMENTAL_SUPPORT,
            description: 'Developmental progress monitoring',
            frequency: 'Daily',
            priority: 'HIGH',
            startDate: new Date(),
            status: 'ACTIVE',
            instructions: 'Monitor and record developmental milestones',
            specialistInput: false,
            requiresTraining: true,
            communicationStrategy: 'Daily progress notes',
            successIndicators: ['Achievement of age-appropriate milestones']
        }
    ],
    defaultObjectives: [
        {
            description: 'Ensure educational needs are fully met',
            status: 'NOT_STARTED',
            category: CarePlanCategory.EDUCATIONAL_SUPPORT,
            priority: 'HIGH',
            measurableOutcomes: [
                'Regular school attendance',
                'Completion of homework',
                'Participation in extra-curricular activities'
            ],
            evidenceRequired: true,
            personCentered: true
        },
        {
            description: 'Support positive social development',
            status: 'NOT_STARTED',
            category: CarePlanCategory.DEVELOPMENTAL_SUPPORT,
            priority: 'HIGH',
            measurableOutcomes: [
                'Positive peer relationships',
                'Participation in group activities',
                'Development of social skills'
            ],
            evidenceRequired: true,
            personCentered: true
        }
    ],
    defaultRisks: [
        {
            category: 'SAFEGUARDING',
            description: 'Regular safeguarding assessment',
            likelihood: 'MEDIUM',
            impact: 'HIGH',
            mitigationSteps: [
                'Regular supervision',
                'Clear communication channels',
                'Staff training on safeguarding'
            ],
            reviewFrequency: ReviewFrequency.MONTHLY,
            triggers: ['Changes in behavior', 'Disclosure of concerns'],
            earlyWarningSignals: ['Withdrawal from activities', 'Changes in mood'],
            escalationProcedure: ['Report to safeguarding lead', 'Document concerns'],
            safeguardingConsiderations: ['Age-appropriate supervision', 'Safe use of technology']
        }
    ],
    reviewFrequency: ReviewFrequency.MONTHLY,
    isActive: true,
    lastUpdated: new Date(),
    updatedBy: 'system',
    version: 1,
    tags: ['children', 'needs-assessment', 'care-planning'],
    requiredAssessments: [
        'Educational Needs Assessment',
        'Developmental Assessment',
        'Mental Health Assessment',
        'Risk Assessment'
    ],
    specialistInputRequired: true,
    evidenceRequirements: [
        'Progress reports',
        'Educational records',
        'Behavioral observations',
        'Professional assessments'
    ],
    safeguardingRequirements: [
        'Regular safeguarding reviews',
        'Risk assessments',
        'Staff training records'
    ],
    mentalCapacityRequirements: [
        'Age-appropriate capacity assessments',
        'Decision-specific assessments'
    ],
    ageGroup: 'CHILD',
    specializedTrainingRequired: [
        'Child protection',
        'Developmental psychology',
        'Therapeutic crisis intervention'
    ],
    qualityIndicators: [
        'Educational progress',
        'Social development',
        'Emotional wellbeing',
        'Physical health'
    ],
    applicableRegions: [Region.UK],
    regulatoryStandards: {
        [Region.UK]: [
            'Children\'s Homes Regulations 2015',
            'Quality Standards for Children\'s Homes'
        ]
    },
    regionalVariations: {
        [Region.UK]: {
            requiredFields: [
                'educationalSupport',
                'behavioralSupport',
                'safeguarding',
                'therapeuticInterventions'
            ],
            additionalAssessments: [
                'Looked After Child Review',
                'Personal Education Plan'
            ],
            reviewFrequencies: {
                'safeguarding': ReviewFrequency.MONTHLY,
                'education': ReviewFrequency.TERMLY,
                'health': ReviewFrequency.QUARTERLY
            },
            mandatoryTraining: [
                'Safeguarding Children',
                'Attachment Theory',
                'Trauma-Informed Care'
            ]
        }
    }
};
