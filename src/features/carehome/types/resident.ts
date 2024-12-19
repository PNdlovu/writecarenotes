import { CareLevel } from './care'

export enum ResidentStatus {
    ACTIVE = 'ACTIVE',
    TEMPORARY = 'TEMPORARY',
    HOSPITAL = 'HOSPITAL',
    DISCHARGED = 'DISCHARGED',
    DECEASED = 'DECEASED'
}

export enum MobilityLevel {
    INDEPENDENT = 'INDEPENDENT',
    WALKING_AID = 'WALKING_AID',
    WHEELCHAIR = 'WHEELCHAIR',
    BED_BOUND = 'BED_BOUND'
}

export enum DietaryRequirement {
    REGULAR = 'REGULAR',
    SOFT = 'SOFT',
    PUREED = 'PUREED',
    THICKENED_FLUIDS = 'THICKENED_FLUIDS',
    DIABETIC = 'DIABETIC',
    GLUTEN_FREE = 'GLUTEN_FREE'
}

export enum SocialPreference {
    VERY_SOCIAL = 'VERY_SOCIAL',
    MODERATELY_SOCIAL = 'MODERATELY_SOCIAL',
    PREFERS_QUIET = 'PREFERS_QUIET',
    NEEDS_ENCOURAGEMENT = 'NEEDS_ENCOURAGEMENT'
}

export interface ResidentContact {
    id: string
    relationship: string
    name: string
    phone: string
    email?: string
    isEmergencyContact: boolean
    hasPoA: boolean
    poAType?: 'HEALTH' | 'FINANCIAL' | 'BOTH'
}

export interface ResidentPreferences {
    wakeTime?: string
    bedTime?: string
    mealTimes?: {
        breakfast?: string
        lunch?: string
        dinner?: string
    }
    socialPreference: SocialPreference
    activityPreferences: string[]
    dietaryNotes?: string
    culturalNeeds?: string[]
    religiousNeeds?: string[]
}

export interface ResidentMedical {
    nhsNumber?: string
    gpName: string
    gpPractice: string
    gpPhone: string
    allergies: string[]
    medications: Array<{
        name: string
        dosage: string
        frequency: string
        instructions?: string
    }>
    conditions: string[]
    dnacpr?: boolean
    advanceDirectives?: string[]
}

export interface ResidentAssessment {
    id: string
    type: string
    date: Date
    assessor: string
    careLevel: CareLevel
    mobilityLevel: MobilityLevel
    nutritionalRisk: 'LOW' | 'MEDIUM' | 'HIGH'
    cognitionScore?: number
    fallsRisk: 'LOW' | 'MEDIUM' | 'HIGH'
    notes?: string
}

export interface Resident {
    id: string
    careHomeId: string
    roomId?: string
    title?: string
    firstName: string
    lastName: string
    preferredName?: string
    dateOfBirth: Date
    gender: 'MALE' | 'FEMALE' | 'OTHER'
    photo?: string
    status: ResidentStatus
    admissionDate: Date
    dischargeDate?: Date
    careLevel: CareLevel
    mobilityLevel: MobilityLevel
    dietaryRequirements: DietaryRequirement[]
    contacts: ResidentContact[]
    preferences: ResidentPreferences
    medical: ResidentMedical
    assessments: ResidentAssessment[]
    fundingType: 'SELF' | 'LOCAL_AUTHORITY' | 'NHS' | 'MIXED'
    fundingNotes?: string
    tags?: string[]
    notes?: string
}

export interface ResidentActivity {
    id: string
    residentId: string
    activityType: string
    date: Date
    duration: number
    participation: 'FULL' | 'PARTIAL' | 'DECLINED'
    notes?: string
    staffMember: string
}

export interface ResidentIncident {
    id: string
    residentId: string
    type: string
    date: Date
    location: string
    description: string
    witnesses?: string[]
    immediateActions: string[]
    followUpActions?: string[]
    reportedBy: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
    status: 'OPEN' | 'INVESTIGATING' | 'CLOSED'
}


