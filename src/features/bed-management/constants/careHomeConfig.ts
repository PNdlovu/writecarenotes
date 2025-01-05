import { CareLevel, BedType, RoomFeature } from '../types'

export const CARE_LEVEL_REQUIREMENTS = {
    [CareLevel.RESIDENTIAL]: {
        minimumStaffRatio: 1/6,  // 1 staff member per 6 residents
        requiredBedFeatures: ['CALL_BELL'],
        preferredRoomFeatures: ['ENSUITE']
    },
    [CareLevel.NURSING]: {
        minimumStaffRatio: 1/4,  // 1 staff member per 4 residents
        requiredBedFeatures: ['CALL_BELL', 'PRESSURE_RELIEF'],
        preferredRoomFeatures: ['ENSUITE', 'HOIST']
    },
    [CareLevel.DEMENTIA]: {
        minimumStaffRatio: 1/4,
        requiredBedFeatures: ['CALL_BELL', 'SIDE_RAILS'],
        preferredRoomFeatures: ['ENSUITE', 'GARDEN_VIEW'],
        specialConsiderations: ['SECURE_UNIT', 'DEMENTIA_FRIENDLY']
    },
    [CareLevel.PALLIATIVE]: {
        minimumStaffRatio: 1/2,  // 1 staff member per 2 residents
        requiredBedFeatures: ['CALL_BELL', 'PRESSURE_RELIEF', 'ADJUSTABLE'],
        preferredRoomFeatures: ['ENSUITE', 'GARDEN_VIEW', 'PREMIUM']
    }
}

export const BED_TYPE_CONFIGURATIONS = {
    [BedType.STANDARD]: {
        maxWeight: 180,  // kg
        features: ['CALL_BELL']
    },
    [BedType.BARIATRIC]: {
        maxWeight: 350,  // kg
        features: ['CALL_BELL', 'REINFORCED_FRAME']
    },
    [BedType.ADJUSTABLE]: {
        maxWeight: 180,
        features: ['CALL_BELL', 'HEIGHT_ADJUSTABLE', 'TILT']
    },
    [BedType.PROFILING]: {
        maxWeight: 180,
        features: ['CALL_BELL', 'PRESSURE_RELIEF', 'SIDE_RAILS', 'FULL_ADJUSTMENT']
    }
}

export const ROOM_ALLOCATION_PRIORITIES = [
    'MEDICAL_NEEDS',
    'CARE_LEVEL_MATCH',
    'RESIDENT_PREFERENCE',
    'SOCIAL_FACTORS',
    'STAFF_EFFICIENCY'
]

export const CLEANING_PROTOCOLS = {
    STANDARD: {
        frequency: 'DAILY',
        duration: 30,  // minutes
        checklist: [
            'SURFACE_SANITIZATION',
            'LINEN_CHANGE',
            'FLOOR_CLEANING'
        ]
    },
    DEEP: {
        frequency: 'WEEKLY',
        duration: 60,
        checklist: [
            'SURFACE_SANITIZATION',
            'LINEN_CHANGE',
            'FLOOR_CLEANING',
            'MATTRESS_CLEANING',
            'FURNITURE_CLEANING'
        ]
    },
    ISOLATION: {
        frequency: 'TWICE_DAILY',
        duration: 45,
        checklist: [
            'PPE_REQUIRED',
            'SURFACE_SANITIZATION',
            'LINEN_CHANGE',
            'FLOOR_CLEANING',
            'WASTE_MANAGEMENT'
        ]
    }
}

export const MAINTENANCE_SCHEDULES = {
    BED_INSPECTION: 'MONTHLY',
    MATTRESS_INSPECTION: 'QUARTERLY',
    CALL_BELL_TEST: 'WEEKLY',
    SIDE_RAIL_CHECK: 'WEEKLY',
    HOIST_INSPECTION: 'MONTHLY'
}

export const OCCUPANCY_THRESHOLDS = {
    WARNING: 85,  // Percentage
    CRITICAL: 95
}

export const ISOLATION_REQUIREMENTS = {
    MINIMUM_ROOMS_RESERVED: 2,
    PREFERRED_LOCATION: 'END_OF_WING',
    REQUIRED_FEATURES: [
        'ENSUITE',
        'NEGATIVE_PRESSURE',
        'SEPARATE_ENTRANCE'
    ]
}


