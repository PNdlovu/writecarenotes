import { childrenNeedsTemplate } from './children-needs.template';
import { mentalHealthTemplate } from './mental-health.template';
import { CarePlanTemplate, ReviewFrequency } from '../types';
import { CareType } from '@/features/carehome/types/care';
import { Region } from '@/types/region';

// Regional regulatory bodies
export const REGULATORY_BODIES = {
    ENGLAND: 'CQC',
    WALES: 'CIW',
    SCOTLAND: 'CARE_INSPECTORATE',
    NORTHERN_IRELAND: 'RQIA',
    IRELAND: 'HIQA',
    JERSEY: 'JCC',
    GUERNSEY: 'CARE_COMMISSION',
    ISLE_OF_MAN: 'REGISTRATION_AND_INSPECTION_UNIT'
} as const;

// Regional care standards
export const CARE_STANDARDS = {
    ENGLAND: {
        RESIDENTIAL: 'Care Quality Commission Fundamental Standards',
        NURSING: 'Care Quality Commission Fundamental Standards',
        DEMENTIA: 'NICE Guidelines on Dementia Care',
        CHILDREN: 'Children\'s Homes Regulations 2015',
        MENTAL_HEALTH: 'NICE Guidelines on Mental Health Care'
    },
    WALES: {
        RESIDENTIAL: 'Regulation and Inspection of Social Care (Wales) Act 2016',
        NURSING: 'Regulation and Inspection of Social Care (Wales) Act 2016',
        DEMENTIA: 'Welsh Government\'s Dementia Action Plan',
        CHILDREN: 'Regulation and Inspection of Social Care (Wales) Act 2016',
        MENTAL_HEALTH: 'Welsh Government\'s Mental Health Strategy'
    },
    SCOTLAND: {
        RESIDENTIAL: 'Health and Social Care Standards',
        NURSING: 'Health and Social Care Standards',
        DEMENTIA: 'Scotland\'s National Dementia Strategy',
        CHILDREN: 'Health and Social Care Standards',
        MENTAL_HEALTH: 'Scotland\'s Mental Health Strategy'
    },
    NORTHERN_IRELAND: {
        RESIDENTIAL: 'Residential Care Homes Minimum Standards',
        NURSING: 'Nursing Homes Minimum Standards',
        DEMENTIA: 'Care Standards for Nursing Homes',
        CHILDREN: 'Children\'s Homes Minimum Standards',
        MENTAL_HEALTH: 'Northern Ireland\'s Mental Health Strategy'
    },
    IRELAND: {
        RESIDENTIAL: 'National Standards for Residential Care Settings',
        NURSING: 'National Standards for Residential Care Settings',
        DEMENTIA: 'National Standards for Residential Care Settings for Older People',
        CHILDREN: 'National Standards for Children\'s Residential Centres',
        MENTAL_HEALTH: 'Ireland\'s Mental Health Strategy'
    },
    JERSEY: {
        RESIDENTIAL: 'Jersey Care Commission Standards',
        NURSING: 'Jersey Care Commission Standards',
        DEMENTIA: 'Jersey Care Commission Standards',
        CHILDREN: 'Jersey Care Commission Standards for Children\'s Homes',
        MENTAL_HEALTH: 'Jersey\'s Mental Health Strategy'
    },
    GUERNSEY: {
        RESIDENTIAL: 'Guernsey Care Standards',
        NURSING: 'Guernsey Care Standards',
        DEMENTIA: 'Guernsey Care Standards',
        CHILDREN: 'Children\'s Services Standards',
        MENTAL_HEALTH: 'Guernsey\'s Mental Health Strategy'
    },
    ISLE_OF_MAN: {
        RESIDENTIAL: 'Isle of Man Minimum Standards',
        NURSING: 'Isle of Man Minimum Standards',
        DEMENTIA: 'Isle of Man Minimum Standards',
        CHILDREN: 'Isle of Man Standards for Children\'s Homes',
        MENTAL_HEALTH: 'Isle of Man\'s Mental Health Strategy'
    }
} as const;

// Template factory based on care type and region
export function createCarePlanTemplate(
    careType: CareType,
    region: Region,
    ageGroup: 'CHILD' | 'ADULT' | 'ELDERLY'
): CarePlanTemplate {
    // Base template structure
    const baseTemplate: Partial<CarePlanTemplate> = {
        reviewFrequency: ReviewFrequency.MONTHLY,
        isActive: true,
        version: 1,
        lastUpdated: new Date(),
        updatedBy: 'system',
        applicableRegions: [region],
    };

    // For children's homes, use the existing children's template
    if (ageGroup === 'CHILD') {
        return {
            ...childrenNeedsTemplate,
            ...baseTemplate,
            regulatoryStandards: {
                [region]: [CARE_STANDARDS[region].CHILDREN]
            }
        };
    }

    // For mental health care, use the mental health template
    if (careType === 'MENTAL_HEALTH') {
        return {
            ...mentalHealthTemplate,
            ...baseTemplate,
            regulatoryStandards: {
                [region]: [
                    ...mentalHealthTemplate.regulatoryStandards[region],
                    CARE_STANDARDS[region].MENTAL_HEALTH || CARE_STANDARDS[region].RESIDENTIAL
                ]
            }
        };
    }

    // For other care types, create specific templates
    const templates: Record<CareType, Partial<CarePlanTemplate>> = {
        RESIDENTIAL: {
            name: 'Residential Care Plan',
            description: 'Comprehensive care plan for residential care',
            specialistInputRequired: false,
        },
        NURSING: {
            name: 'Nursing Care Plan',
            description: 'Comprehensive care plan with nursing interventions',
            specialistInputRequired: true,
            specializedTrainingRequired: ['Nursing Care', 'Clinical Skills']
        },
        DEMENTIA: {
            name: 'Dementia Care Plan',
            description: 'Specialized care plan for dementia support',
            specialistInputRequired: true,
            specializedTrainingRequired: ['Dementia Care', 'Behavioral Management']
        },
        PALLIATIVE: {
            name: 'Palliative Care Plan',
            description: 'End of life care planning and support',
            specialistInputRequired: true,
            specializedTrainingRequired: ['Palliative Care', 'Pain Management']
        },
        RESPITE: {
            name: 'Respite Care Plan',
            description: 'Short-term care support plan',
            specialistInputRequired: false,
        },
        CONVALESCENT: {
            name: 'Convalescent Care Plan',
            description: 'Recovery and rehabilitation focused care plan',
            specialistInputRequired: true,
            specializedTrainingRequired: ['Rehabilitation', 'Recovery Support']
        },
        PHYSICAL_DISABILITY: {
            name: 'Physical Disability Support Plan',
            description: 'Specialized care plan for physical disabilities',
            specialistInputRequired: true,
            specializedTrainingRequired: ['Physical Disability Support', 'Moving and Handling']
        },
        LEARNING_DISABILITY: {
            name: 'Learning Disability Support Plan',
            description: 'Specialized care plan for learning disabilities',
            specialistInputRequired: true,
            specializedTrainingRequired: ['Learning Disability Support', 'Communication Skills']
        },
        MENTAL_HEALTH: {
            name: 'Mental Health Care Plan',
            description: 'Mental health focused care and support plan',
            specialistInputRequired: true,
            specializedTrainingRequired: ['Mental Health Support', 'Crisis Management']
        },
        SENSORY_IMPAIRMENT: {
            name: 'Sensory Support Care Plan',
            description: 'Specialized care plan for sensory impairments',
            specialistInputRequired: true,
            specializedTrainingRequired: ['Sensory Support', 'Communication Aids']
        },
        DUAL_REGISTERED: {
            name: 'Comprehensive Care Plan',
            description: 'Combined residential and nursing care plan',
            specialistInputRequired: true,
            specializedTrainingRequired: ['Nursing Care', 'Residential Support']
        }
    };

    return {
        ...baseTemplate,
        ...templates[careType],
        regulatoryStandards: {
            [region]: [CARE_STANDARDS[region][careType] || CARE_STANDARDS[region].RESIDENTIAL]
        }
    } as CarePlanTemplate;
}
