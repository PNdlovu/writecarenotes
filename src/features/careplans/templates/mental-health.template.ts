import { CarePlanTemplate, ReviewFrequency } from '../types';
import { CARE_STANDARDS } from './index';
import { CulturalCareCategory, LanguagePreference, TransitionType, AdvancedCareDecision, TelehealthService } from '@/types/careplans';
import { CarePlan } from "@/types/careplans";

export const mentalHealthTemplate: CarePlanTemplate & CarePlan = {
    name: 'Mental Health Care Plan',
    description: 'Comprehensive care plan for residents with mental health needs',
    version: 1,
    isActive: true,
    lastUpdated: new Date(),
    updatedBy: 'system',
    reviewFrequency: ReviewFrequency.MONTHLY,
    sections: [
        {
            id: 'mental-health-status',
            title: 'Mental Health Status',
            required: true,
            order: 1
        },
        {
            id: 'crisis-management',
            title: 'Crisis Management',
            required: true,
            order: 2
        },
        {
            id: 'therapeutic-support',
            title: 'Therapeutic Support',
            required: true,
            order: 3
        },
        {
            id: 'medication-management',
            title: 'Medication Management',
            required: true,
            order: 4
        },
        {
            id: 'mental-capacity',
            title: 'Mental Capacity',
            required: true,
            order: 5
        },
        {
            id: 'behavioral-support',
            title: 'Behavioral Support',
            required: true,
            order: 6
        },
        {
            id: 'cultural-care',
            title: 'Cultural Care',
            required: true,
            order: 7
        },
        {
            id: 'transition-plan',
            title: 'Transition Plan',
            required: false,
            order: 8
        },
        {
            id: 'advanced-care',
            title: 'Advanced Care Planning',
            required: false,
            order: 9
        },
        {
            id: 'telehealth',
            title: 'Telehealth Services',
            required: false,
            order: 10
        },
        {
            id: 'visitor-management',
            title: 'Visitor Management',
            required: false,
            order: 11
        },
        {
            id: 'room-preferences',
            title: 'Room Preferences',
            required: false,
            order: 12
        },
        {
            id: 'daily-routines',
            title: 'Daily Routines',
            required: false,
            order: 13
        },
        {
            id: 'social-engagement',
            title: 'Social Engagement',
            required: false,
            order: 14
        },
        {
            id: 'end-of-life-care',
            title: 'End of Life Care',
            required: false,
            order: 15
        },
        {
            id: 'quality-of-life',
            title: 'Quality of Life',
            required: false,
            order: 16
        }
    ],
    defaultInterventions: [
        {
            id: 'mh-assessment',
            category: 'MENTAL_HEALTH',
            description: 'Regular mental health assessment',
            frequency: 'Weekly',
            status: 'Active'
        },
        {
            id: 'crisis-plan',
            category: 'CRISIS_INTERVENTION',
            description: 'Crisis intervention plan',
            frequency: 'As needed',
            status: 'Active',
            instructions: 'Follow crisis protocol and contact mental health team'
        }
    ],
    therapeuticInterventions: [
        {
            type: 'Counseling',
            provider: 'Mental Health Professional',
            frequency: 'Weekly',
            goals: [
                'Improve emotional regulation',
                'Develop coping strategies',
                'Build resilience'
            ]
        },
        {
            type: 'Group Therapy',
            provider: 'Mental Health Team',
            frequency: 'Bi-weekly',
            goals: [
                'Develop social skills',
                'Share experiences',
                'Build support network'
            ]
        }
    ],
    medications: [
        {
            name: 'Example Medication',
            dosage: 'As prescribed',
            frequency: 'As prescribed',
            route: 'As prescribed',
            notes: [
                'Monitor for side effects',
                'Regular medication review required',
                'Document any missed doses'
            ]
        }
    ],
    culturalCare: {
        primaryLanguage: '',
        otherLanguages: [],
        languagePreferences: [
            LanguagePreference.SPOKEN,
            LanguagePreference.WRITTEN
        ],
        culturalPreferences: [
            CulturalCareCategory.LANGUAGE,
            CulturalCareCategory.RELIGION,
            CulturalCareCategory.CUSTOMS
        ],
        dietaryRequirements: [],
        customsAndTraditions: [],
        communicationPreferences: {
            preferredMethod: 'verbal',
            requiresInterpreter: false
        }
    },
    transitionPlan: {
        type: TransitionType.SERVICE_TRANSFER,
        startDate: new Date(),
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        currentService: 'Mental Health Unit',
        targetService: 'Community Care',
        transitionSteps: [
            {
                step: 'Initial Assessment',
                status: 'pending',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                responsiblePerson: ''
            },
            {
                step: 'Care Plan Review',
                status: 'pending',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                responsiblePerson: ''
            },
            {
                step: 'Family Meeting',
                status: 'pending',
                dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
                responsiblePerson: ''
            }
        ],
        riskAssessment: [
            {
                risk: 'Change in Environment',
                mitigation: 'Gradual transition with familiar staff support',
                status: 'active'
            },
            {
                risk: 'Medication Management',
                mitigation: 'Detailed handover and monitoring plan',
                status: 'active'
            }
        ]
    },
    advancedCarePlan: {
        decisions: [
            {
                type: AdvancedCareDecision.TREATMENT_PREFERENCES,
                decision: 'To be completed with resident',
                details: 'Discuss treatment preferences and document',
                dateRecorded: new Date(),
                reviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
                decisionMaker: '',
                witnesses: [],
                documents: []
            }
        ],
        powerOfAttorney: {
            exists: false,
            type: ['health', 'welfare'],
            attorneyDetails: []
        }
    },
    telehealthServices: [
        {
            type: TelehealthService.VIDEO_CONSULTATION,
            provider: 'Mental Health Team',
            schedule: {
                frequency: 'Weekly',
                duration: 60,
                startDate: new Date(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
            },
            equipment: [
                'Tablet/Computer',
                'Internet Connection',
                'Private Room'
            ],
            technicalSupport: {
                contactName: 'IT Support',
                contactNumber: 'To be provided',
                availabilityHours: '9am - 5pm, Monday to Friday'
            },
            outcomes: []
        }
    ],
    mentalCapacity: {
        assessments: [
            {
                decision: 'Example Decision',
                outcome: 'Pending',
                reviewer: 'Mental Health Professional',
                date: new Date().toISOString(),
                nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            }
        ]
    },
    behavioralSupport: {
        triggers: [
            'Environmental changes',
            'Social interactions',
            'Physical discomfort'
        ],
        preventiveStrategies: [
            'Regular routine',
            'Quiet space availability',
            'Clear communication'
        ],
        deescalationTechniques: [
            'Active listening',
            'Calm environment',
            'Redirection'
        ],
        restrictivePractices: {
            approved: [
                'As per individual assessment',
                'Following least restrictive principle'
            ],
            lastReviewed: new Date().toISOString(),
            authorizedBy: 'Mental Health Professional'
        }
    },
    visitorManagement: {
        allowedVisitors: [],
        visitingPreferences: {
            preferredTimes: [],
            maximumVisitors: 2,
            visitLocation: "resident-room"
        },
        visitLog: []
    },
    roomPreferences: {
        currentRoom: "",
        preferences: [],
        environmentalNeeds: {
            temperature: "",
            lighting: "",
            noise: "",
            accessibility: []
        },
        personalItems: []
    },
    dailyRoutines: {
        routineType: "flexible",
        preferences: {
            wakeTime: "",
            bedTime: "",
            mealtimes: [],
            personalCare: {
                preference: "independent",
                specificRequirements: "",
                preferredStaff: []
            }
        },
        schedule: []
    },
    socialEngagement: {
        groupPreference: "small",
        preferredActivities: [],
        activitySchedule: [],
        socialConnections: []
    },
    endOfLifeCare: {
        preferences: {
            place: "",
            religious: "",
            cultural: ""
        },
        contacts: [],
        documents: []
    },
    qualityOfLife: {
        assessments: [],
        goals: [],
        feedback: []
    },
    mentalHealth: {
        diagnosis: {
            primary: "",
            secondary: [],
            history: [],
            notes: ""
        },
        medications: {
            current: [],
            history: [],
            allergies: [],
            sideEffects: []
        },
        symptoms: {
            current: [],
            triggers: [],
            copingStrategies: []
        },
        therapy: {
            type: [],
            frequency: "",
            provider: "",
            goals: []
        },
        crisis: {
            warningSigns: [],
            interventions: [],
            emergencyContacts: [],
            safetyPlan: {
                steps: [],
                contacts: [],
                resources: []
            }
        },
        riskAssessment: {
            selfHarm: {
                risk: "low",
                history: [],
                preventiveMeasures: []
            },
            suicide: {
                risk: "low",
                history: [],
                preventiveMeasures: []
            },
            aggression: {
                risk: "low",
                triggers: [],
                deescalationStrategies: []
            }
        },
        wellbeingPlan: {
            dailyActivities: [],
            supportNetwork: [],
            goals: [],
            progress: []
        }
    },
    regulatoryStandards: {
        ENGLAND: [CARE_STANDARDS.ENGLAND.MENTAL_HEALTH],
        WALES: [CARE_STANDARDS.WALES.MENTAL_HEALTH],
        SCOTLAND: [CARE_STANDARDS.SCOTLAND.MENTAL_HEALTH],
        NORTHERN_IRELAND: [CARE_STANDARDS.NORTHERN_IRELAND.MENTAL_HEALTH],
        IRELAND: [CARE_STANDARDS.IRELAND.MENTAL_HEALTH],
        JERSEY: [CARE_STANDARDS.JERSEY.MENTAL_HEALTH],
        GUERNSEY: [CARE_STANDARDS.GUERNSEY.MENTAL_HEALTH],
        ISLE_OF_MAN: [CARE_STANDARDS.ISLE_OF_MAN.MENTAL_HEALTH]
    }
};
