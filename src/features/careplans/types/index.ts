import { CareLevel, CareHomeType } from '@/features/carehome/types/care'

export enum CarePlanStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    UNDER_REVIEW = 'UNDER_REVIEW',
    ARCHIVED = 'ARCHIVED'
}

export enum CarePlanCategory {
    // Core Categories
    PERSONAL_CARE = 'PERSONAL_CARE',
    MOBILITY = 'MOBILITY',
    NUTRITION = 'NUTRITION',
    MEDICATION = 'MEDICATION',
    SOCIAL = 'SOCIAL',
    MENTAL_HEALTH = 'MENTAL_HEALTH',
    END_OF_LIFE = 'END_OF_LIFE',

    // Specialized Care Categories
    DEMENTIA_CARE = 'DEMENTIA_CARE',
    PALLIATIVE_CARE = 'PALLIATIVE_CARE',
    REHABILITATION = 'REHABILITATION',
    RESPITE_CARE = 'RESPITE_CARE',
    NURSING_CARE = 'NURSING_CARE',

    // Mental Health Categories
    PSYCHIATRIC_CARE = 'PSYCHIATRIC_CARE',
    BEHAVIORAL_SUPPORT = 'BEHAVIORAL_SUPPORT',
    CRISIS_INTERVENTION = 'CRISIS_INTERVENTION',
    THERAPEUTIC_SUPPORT = 'THERAPEUTIC_SUPPORT',
    ADDICTION_SUPPORT = 'ADDICTION_SUPPORT',
    TRAUMA_INFORMED_CARE = 'TRAUMA_INFORMED_CARE',

    // Disability Support Categories
    PHYSICAL_DISABILITY = 'PHYSICAL_DISABILITY',
    LEARNING_DISABILITY = 'LEARNING_DISABILITY',
    SENSORY_NEEDS = 'SENSORY_NEEDS',
    COMMUNICATION_SUPPORT = 'COMMUNICATION_SUPPORT',
    ASSISTIVE_TECHNOLOGY = 'ASSISTIVE_TECHNOLOGY',
    INDEPENDENT_LIVING = 'INDEPENDENT_LIVING',
    VOCATIONAL_SUPPORT = 'VOCATIONAL_SUPPORT',

    // Children's Care Categories
    EDUCATIONAL_SUPPORT = 'EDUCATIONAL_SUPPORT',
    DEVELOPMENTAL_SUPPORT = 'DEVELOPMENTAL_SUPPORT',
    SAFEGUARDING = 'SAFEGUARDING',
    FAMILY_CONTACT = 'FAMILY_CONTACT',
    LIFE_SKILLS = 'LIFE_SKILLS',
    PLAY_AND_RECREATION = 'PLAY_AND_RECREATION',
    TRANSITION_PLANNING = 'TRANSITION_PLANNING',

    // Holistic Categories
    CULTURAL_NEEDS = 'CULTURAL_NEEDS',
    SPIRITUAL_NEEDS = 'SPIRITUAL_NEEDS',
    ADVOCACY = 'ADVOCACY'
}

export enum ReviewFrequency {
    DAILY = 'DAILY',
    TWICE_DAILY = 'TWICE_DAILY',
    THRICE_DAILY = 'THRICE_DAILY',
    TWICE_WEEKLY = 'TWICE_WEEKLY',
    WEEKLY = 'WEEKLY',
    FORTNIGHTLY = 'FORTNIGHTLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    CUSTOM = 'CUSTOM'
}

export enum InterventionPriority {
    ROUTINE = 'ROUTINE',
    IMPORTANT = 'IMPORTANT',
    URGENT = 'URGENT',
    CRITICAL = 'CRITICAL',
    SAFEGUARDING = 'SAFEGUARDING'
}

export enum AssessmentType {
    INITIAL = 'INITIAL',
    ROUTINE = 'ROUTINE',
    INCIDENT_RELATED = 'INCIDENT_RELATED',
    CONDITION_CHANGE = 'CONDITION_CHANGE',
    SAFEGUARDING = 'SAFEGUARDING',
    MENTAL_CAPACITY = 'MENTAL_CAPACITY',
    BEHAVIORAL = 'BEHAVIORAL',
    EDUCATIONAL = 'EDUCATIONAL',
    THERAPEUTIC = 'THERAPEUTIC',
    DISCHARGE = 'DISCHARGE'
}

export enum Region {
    ENGLAND = 'ENGLAND',
    SCOTLAND = 'SCOTLAND',
    WALES = 'WALES',
    NORTHERN_IRELAND = 'NORTHERN_IRELAND',
    IRELAND = 'IRELAND'
}

export enum RegulatoryBody {
    // England
    CQC = 'CQC', // Care Quality Commission

    // Scotland
    CARE_INSPECTORATE = 'CARE_INSPECTORATE', // Scottish Care Inspectorate

    // Wales
    CIW = 'CIW', // Care Inspectorate Wales

    // Northern Ireland
    RQIA = 'RQIA', // Regulation and Quality Improvement Authority

    // Ireland
    HIQA = 'HIQA' // Health Information and Quality Authority
}

export enum RegulatoryCategoryUK {
    // CQC Categories (England)
    SAFE = 'SAFE',
    EFFECTIVE = 'EFFECTIVE',
    CARING = 'CARING',
    RESPONSIVE = 'RESPONSIVE',
    WELL_LED = 'WELL_LED',

    // Additional Categories for Other Regions
    ENVIRONMENT = 'ENVIRONMENT',
    STAFFING = 'STAFFING',
    MANAGEMENT = 'MANAGEMENT',
    QUALITY_OF_LIFE = 'QUALITY_OF_LIFE',
    CARE_AND_SUPPORT = 'CARE_AND_SUPPORT',
    LEADERSHIP = 'LEADERSHIP'
}

export interface CarePlanObjective {
    id: string
    description: string
    targetDate?: Date
    achievedDate?: Date
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'DISCONTINUED'
    notes?: string
    category: CarePlanCategory
    priority: InterventionPriority
    measurableOutcomes?: string[]
    evidenceRequired?: boolean
    personCentered?: boolean
    consentObtained?: boolean
    supportNeeded?: string[]
    restrictions?: string[]
}

export interface CarePlanIntervention {
    id: string
    category: CarePlanCategory
    description: string
    frequency: string
    priority: InterventionPriority
    assignedTo?: string[]
    startDate: Date
    endDate?: Date
    status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED'
    instructions?: string
    contraindications?: string[]
    requiredResources?: string[]
    specialistInput?: boolean
    specialistDetails?: {
        role: string
        name?: string
        organization?: string
        recommendations?: string[]
        lastContact?: Date
        nextContact?: Date
        reports?: string[]
    }
    requiresTraining?: boolean
    trainingDetails?: string
    safeguardingConsiderations?: string[]
    riskAssessment?: string
    adaptations?: string[]
    equipmentNeeded?: string[]
    communicationStrategy?: string
    successIndicators?: string[]
    contingencyPlan?: string
}

export interface TherapeuticIntervention {
    type: string
    provider: string
    frequency: string
    goals: string[]
    progress: string[]
    nextSession?: Date
    lastSession?: Date
    notes?: string
}

export interface EducationalSupport {
    educationalSetting?: string
    currentLevel?: string
    supportNeeded?: string[]
    educationalGoals?: string[]
    progressReports?: Array<{
        date: Date
        summary: string
        achievements: string[]
        challenges: string[]
        recommendations: string[]
    }>
    specialProvisions?: string[]
    ehcPlan?: boolean
}

export interface BehavioralSupport {
    triggers?: string[]
    preventiveStrategies?: string[]
    deescalationTechniques?: string[]
    positiveReinforcementStrategies?: string[]
    restrictivePractices?: {
        approved: string[]
        lastReviewed: Date
        reviewFrequency: ReviewFrequency
        authorizedBy: string
    }
}

export interface CarePlanReview {
    id: string
    reviewDate: Date
    reviewedBy: string
    reviewType: AssessmentType
    changes: Array<{
        field: string
        previousValue: any
        newValue: any
        reason: string
        impact?: 'LOW' | 'MEDIUM' | 'HIGH'
    }>
    outcome: 'NO_CHANGES' | 'MINOR_CHANGES' | 'MAJOR_CHANGES'
    nextReviewDate: Date
    notes?: string
    involvedParties?: string[]
    residentFeedback?: string
    familyFeedback?: string
    recommendations?: string[]
    safeguardingConcerns?: string[]
    mentalCapacityConsiderations?: string[]
    bestInterestDecisions?: string[]
    advocacyInvolvement?: boolean
}

export interface CarePlanProgress {
    id: string
    date: Date
    recordedBy: string
    category: CarePlanCategory
    description: string
    outcome: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
    followUpRequired: boolean
    followUpNotes?: string
    evidenceAttached?: boolean
    evidenceType?: string[]
    residentMood?: string
    residentEngagement?: 'HIGH' | 'MEDIUM' | 'LOW'
    staffObservations?: string
    metrics?: Record<string, any>
    behavioralNotes?: string
    interventionsUsed?: string[]
    medicationEffectiveness?: string
    sideEffectsObserved?: string[]
    communicationEffectiveness?: string
    independenceLevel?: string
}

export interface CarePlanRisk {
    id: string
    category: string
    description: string
    likelihood: 'LOW' | 'MEDIUM' | 'HIGH'
    impact: 'LOW' | 'MEDIUM' | 'HIGH'
    mitigationSteps: string[]
    reviewFrequency: ReviewFrequency
    lastReviewed?: Date
    nextReview?: Date
    triggers?: string[]
    earlyWarningSignals?: string[]
    escalationProcedure?: string[]
    preventiveMeasures?: string[]
    requiredEquipment?: string[]
    specialistAssessmentNeeded?: boolean
    specialistDetails?: {
        type: string
        name?: string
        date?: Date
        recommendations?: string[]
    }
    safeguardingConsiderations?: string[]
    restrictivePractices?: string[]
    mentalCapacityConsiderations?: string[]
    environmentalAdaptations?: string[]
}

export interface RegulatoryCompliance {
    region: Region
    regulatoryBody: RegulatoryBody
    registrationNumber: string
    lastInspection?: Date
    nextInspectionDue?: Date
    ratings?: Record<RegulatoryCategoryUK, string>
    requirements?: Array<{
        category: RegulatoryCategoryUK
        description: string
        dueDate: Date
        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
        evidence?: string[]
    }>
    improvementPlan?: Array<{
        category: RegulatoryCategoryUK
        action: string
        responsible: string
        deadline: Date
        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
        evidence?: string[]
    }>
    notifications?: Array<{
        type: string
        date: Date
        sentTo: RegulatoryBody
        acknowledgement?: string
        outcome?: string
    }>
}

export interface CarePlan {
    id: string
    residentId: string
    careHomeId: string
    careHomeType: CareHomeType
    status: CarePlanStatus
    careLevel: CareLevel
    startDate: Date
    endDate?: Date
    objectives: CarePlanObjective[]
    interventions: CarePlanIntervention[]
    risks: CarePlanRisk[]
    reviews: CarePlanReview[]
    progress: CarePlanProgress[]
    primaryNurse: string
    keyWorker: string
    reviewFrequency: ReviewFrequency
    customReviewSchedule?: string
    lastReviewDate?: Date
    nextReviewDate: Date
    approvedBy?: string
    approvedDate?: Date
    version: number
    notes?: string
    tags?: string[]
    fundingSource?: string
    fundingDetails?: Record<string, any>
    externalServices?: Array<{
        serviceType: string
        provider: string
        frequency: string
        contact: string
        notes?: string
    }>
    preferences: {
        cultural?: Record<string, any>
        dietary?: Record<string, any>
        social?: Record<string, any>
        spiritual?: Record<string, any>
        daily?: Record<string, any>
        communication?: Record<string, any>
        activities?: Record<string, any>
    }
    communicationNeeds?: {
        preferredLanguage: string
        interpreterRequired?: boolean
        communicationAids?: string[]
        specialInstructions?: string
        signLanguage?: string
        pictorialAids?: boolean
        technologyAids?: string[]
    }
    therapeuticInterventions?: TherapeuticIntervention[]
    educationalSupport?: EducationalSupport
    behavioralSupport?: BehavioralSupport
    mentalCapacity?: {
        assessments: Array<{
            date: Date
            decision: string
            outcome: string
            reviewer: string
            nextReview: Date
        }>
        bestInterestDecisions?: string[]
        advocateDetails?: {
            name: string
            organization: string
            contact: string
            appointmentDate: Date
        }
    }
    safeguarding?: {
        concerns: Array<{
            date: Date
            description: string
            action: string
            status: string
            reviewDate: Date
        }>
        restrictivePractices?: string[]
        riskManagement?: string[]
    }
    transitionPlan?: {
        goals: string[]
        timeline: string
        supportNeeded: string[]
        progressReviews: Array<{
            date: Date
            progress: string
            challenges: string[]
            adjustments: string[]
        }>
    }
    region: Region
    regulatoryCompliance?: RegulatoryCompliance
    nationalCareStandards?: Array<{
        standard: string
        evidence: string[]
        lastReviewed: Date
        nextReview: Date
        status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT'
    }>
    statutoryNotifications?: Array<{
        type: string
        date: Date
        sentTo: RegulatoryBody
        acknowledgement?: string
        outcome?: string
    }>
    inspectionReadiness?: {
        lastAudit: Date
        nextAudit: Date
        outstandingActions: Array<{
            category: RegulatoryCategoryUK
            action: string
            deadline: Date
            status: string
        }>
        evidenceFolder?: string
    }
}

export interface CarePlanTemplate {
    id: string
    name: string
    description: string
    careLevel: CareLevel
    applicableCareHomeTypes: CareHomeType[]
    categories: CarePlanCategory[]
    defaultInterventions: Omit<CarePlanIntervention, 'id'>[]
    defaultObjectives: Omit<CarePlanObjective, 'id'>[]
    defaultRisks: Omit<CarePlanRisk, 'id'>[]
    reviewFrequency: ReviewFrequency
    customReviewSchedule?: string
    isActive: boolean
    lastUpdated: Date
    updatedBy: string
    version: number
    tags?: string[]
    requiredAssessments?: string[]
    specialistInputRequired?: boolean
    fundingCategory?: string
    regulatoryCompliance?: Record<string, any>
    evidenceRequirements?: string[]
    safeguardingRequirements?: string[]
    mentalCapacityRequirements?: string[]
    restrictivePracticeGuidance?: string[]
    ageGroup?: 'CHILD' | 'ADULT' | 'ELDERLY'
    specializedTrainingRequired?: string[]
    qualityIndicators?: string[]
    applicableRegions: Region[]
    regulatoryStandards?: Record<Region, string[]>
    regionalVariations?: Record<Region, {
        requiredFields: string[]
        additionalAssessments?: string[]
        reviewFrequencies?: Record<string, ReviewFrequency>
        mandatoryTraining?: string[]
    }>
}

export interface CarePlanAudit {
    id: string
    carePlanId: string
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REVIEW' | 'APPROVE' | 'SAFEGUARDING'
    performedBy: string
    performedAt: Date
    changes?: Record<string, any>
    reason?: string
    careHomeType: CareHomeType
    regulatoryReference?: string
    evidenceAttached?: boolean
    safeguardingRelated?: boolean
    restrictivePracticeRelated?: boolean
    mentalCapacityRelated?: boolean
    region: Region
    regulatoryBody?: RegulatoryBody
    statutoryNotification?: boolean
    regulatoryCategory?: RegulatoryCategoryUK
    inspectionRelated?: boolean
}


