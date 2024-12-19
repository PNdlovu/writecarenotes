export enum BedStatus {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    MAINTENANCE = 'MAINTENANCE',
    RESERVED = 'RESERVED',
    CLEANING = 'CLEANING',
    ISOLATION = 'ISOLATION'  // For infection control
}

export enum BedType {
    STANDARD = 'STANDARD',
    BARIATRIC = 'BARIATRIC',
    ADJUSTABLE = 'ADJUSTABLE',
    PROFILING = 'PROFILING'
}

export interface Wing {
    id: string
    name: string
    floor: number
    capacity: number
    rooms: Room[]
    specialization?: string  // e.g., "Dementia Care", "Nursing Care"
}

export interface Room {
    id: string
    number: string
    wingId: string
    wing: Wing
    beds: Bed[]
    type: RoomType
    hasEnsuite: boolean
    features: RoomFeature[]
}

export enum RoomType {
    SINGLE = 'SINGLE',
    SHARED = 'SHARED',
    PREMIUM = 'PREMIUM'
}

export enum RoomFeature {
    ENSUITE = 'ENSUITE',
    GARDEN_VIEW = 'GARDEN_VIEW',
    WHEELCHAIR_ACCESSIBLE = 'WHEELCHAIR_ACCESSIBLE',
    HOIST = 'HOIST',
    SMART_TV = 'SMART_TV'
}

export interface Bed {
    id: string
    number: string
    roomId: string
    room: Room
    status: BedStatus
    type: BedType
    currentResidentId?: string
    currentResident?: Resident
    maintenanceNote?: string
    lastCleaned?: Date
    features: BedFeature[]
}

export enum BedFeature {
    PRESSURE_RELIEF = 'PRESSURE_RELIEF',
    SIDE_RAILS = 'SIDE_RAILS',
    CALL_BELL = 'CALL_BELL',
    HOIST_COMPATIBLE = 'HOIST_COMPATIBLE'
}

export interface BedAssignment {
    id: string
    bedId: string
    bed: Bed
    residentId: string
    resident: Resident
    assignedById: string
    assignedBy: User
    assignedAt: Date
    endedAt?: Date
    reason: AssignmentReason
    notes?: string
}

export enum AssignmentReason {
    NEW_ADMISSION = 'NEW_ADMISSION',
    TRANSFER = 'TRANSFER',
    RETURN_FROM_HOSPITAL = 'RETURN_FROM_HOSPITAL',
    ROOM_PREFERENCE = 'ROOM_PREFERENCE',
    MEDICAL_NEED = 'MEDICAL_NEED'
}

export interface Resident {
    id: string
    fullName: string
    dateOfBirth: Date
    careLevel: CareLevel
    mobilityNeeds: MobilityNeed[]
    dietaryRequirements?: string[]
    currentBedAssignment?: BedAssignment
}

export enum CareLevel {
    RESIDENTIAL = 'RESIDENTIAL',
    NURSING = 'NURSING',
    DEMENTIA = 'DEMENTIA',
    PALLIATIVE = 'PALLIATIVE'
}

export enum MobilityNeed {
    INDEPENDENT = 'INDEPENDENT',
    WALKING_AID = 'WALKING_AID',
    WHEELCHAIR = 'WHEELCHAIR',
    HOIST = 'HOIST',
    BED_BOUND = 'BED_BOUND'
}

export interface User {
    id: string
    fullName: string
    role: UserRole
}


