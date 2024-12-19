import { RoomTemplate, RoomType, CareLevel } from '@/types/floorPlan';

export const defaultAmenities = {
  medical: [
    { id: 'nurse-call', name: 'Nurse Call System', type: 'MEDICAL' },
    { id: 'oxygen', name: 'Oxygen Supply', type: 'MEDICAL' },
    { id: 'suction', name: 'Suction Equipment', type: 'MEDICAL' }
  ],
  comfort: [
    { id: 'ac', name: 'Climate Control', type: 'COMFORT' },
    { id: 'tv', name: 'Television', type: 'COMFORT' },
    { id: 'phone', name: 'Telephone', type: 'COMFORT' }
  ],
  safety: [
    { id: 'grab-bars', name: 'Grab Bars', type: 'SAFETY' },
    { id: 'emergency-light', name: 'Emergency Lighting', type: 'SAFETY' },
    { id: 'fire-alarm', name: 'Fire Alarm', type: 'SAFETY' }
  ],
  accessibility: [
    { id: 'wheelchair-access', name: 'Wheelchair Accessible', type: 'ACCESSIBILITY' },
    { id: 'adjustable-bed', name: 'Adjustable Bed', type: 'ACCESSIBILITY' },
    { id: 'bathroom-rails', name: 'Bathroom Safety Rails', type: 'ACCESSIBILITY' }
  ]
};

export const roomTemplates: Record<RoomType, RoomTemplate> = {
  [RoomType.RESIDENT_SINGLE]: {
    type: RoomType.RESIDENT_SINGLE,
    defaultCapacity: 1,
    minimumArea: 250,
    careLevel: [CareLevel.INDEPENDENT, CareLevel.ASSISTED, CareLevel.MEMORY_CARE],
    requiredAmenities: [
      defaultAmenities.medical[0],  // Nurse Call
      defaultAmenities.safety[0],   // Grab Bars
      defaultAmenities.safety[1],   // Emergency Light
      defaultAmenities.safety[2],   // Fire Alarm
    ],
    recommendedAmenities: [
      ...defaultAmenities.comfort,
      ...defaultAmenities.accessibility
    ]
  },

  [RoomType.RESIDENT_SHARED]: {
    type: RoomType.RESIDENT_SHARED,
    defaultCapacity: 2,
    minimumArea: 400,
    careLevel: [CareLevel.ASSISTED, CareLevel.SKILLED_NURSING],
    requiredAmenities: [
      defaultAmenities.medical[0],  // Nurse Call
      defaultAmenities.safety[0],   // Grab Bars
      defaultAmenities.safety[1],   // Emergency Light
      defaultAmenities.safety[2],   // Fire Alarm
      defaultAmenities.accessibility[0], // Wheelchair Access
    ],
    recommendedAmenities: [
      ...defaultAmenities.comfort,
      ...defaultAmenities.accessibility
    ]
  },

  [RoomType.NURSING_STATION]: {
    type: RoomType.NURSING_STATION,
    defaultCapacity: 4,
    minimumArea: 200,
    careLevel: [],
    requiredAmenities: [
      defaultAmenities.medical[0],  // Nurse Call
      defaultAmenities.safety[1],   // Emergency Light
      defaultAmenities.safety[2],   // Fire Alarm
    ],
    recommendedAmenities: [],
    staffingRequirements: {
      nurses: 2,
      caregivers: 2
    }
  },

  [RoomType.MEDICATION_ROOM]: {
    type: RoomType.MEDICATION_ROOM,
    defaultCapacity: 2,
    minimumArea: 120,
    careLevel: [],
    requiredAmenities: [
      defaultAmenities.medical[0],  // Nurse Call
      defaultAmenities.safety[1],   // Emergency Light
      defaultAmenities.safety[2],   // Fire Alarm
    ],
    recommendedAmenities: [],
    staffingRequirements: {
      nurses: 1
    }
  },

  [RoomType.TREATMENT_ROOM]: {
    type: RoomType.TREATMENT_ROOM,
    defaultCapacity: 2,
    minimumArea: 180,
    careLevel: [CareLevel.SKILLED_NURSING, CareLevel.PALLIATIVE],
    requiredAmenities: [
      ...defaultAmenities.medical,
      defaultAmenities.safety[1],   // Emergency Light
      defaultAmenities.safety[2],   // Fire Alarm
    ],
    recommendedAmenities: [
      defaultAmenities.accessibility[0]  // Wheelchair Access
    ]
  },

  [RoomType.ISOLATION_ROOM]: {
    type: RoomType.ISOLATION_ROOM,
    defaultCapacity: 1,
    minimumArea: 300,
    careLevel: [CareLevel.SKILLED_NURSING],
    requiredAmenities: [
      ...defaultAmenities.medical,
      ...defaultAmenities.safety,
      defaultAmenities.accessibility[0]  // Wheelchair Access
    ],
    recommendedAmenities: [],
    staffingRequirements: {
      nurses: 1
    }
  },

  [RoomType.DINING_AREA]: {
    type: RoomType.DINING_AREA,
    defaultCapacity: 30,
    minimumArea: 600,
    careLevel: [],
    requiredAmenities: [
      defaultAmenities.safety[1],   // Emergency Light
      defaultAmenities.safety[2],   // Fire Alarm
      defaultAmenities.accessibility[0]  // Wheelchair Access
    ],
    recommendedAmenities: [
      defaultAmenities.comfort[0]   // Climate Control
    ]
  },

  [RoomType.ACTIVITY_ROOM]: {
    type: RoomType.ACTIVITY_ROOM,
    defaultCapacity: 20,
    minimumArea: 500,
    careLevel: [],
    requiredAmenities: [
      defaultAmenities.safety[1],   // Emergency Light
      defaultAmenities.safety[2],   // Fire Alarm
      defaultAmenities.accessibility[0]  // Wheelchair Access
    ],
    recommendedAmenities: [
      ...defaultAmenities.comfort
    ]
  },

  [RoomType.STAFF_ROOM]: {
    type: RoomType.STAFF_ROOM,
    defaultCapacity: 10,
    minimumArea: 200,
    careLevel: [],
    requiredAmenities: [
      defaultAmenities.safety[1],   // Emergency Light
      defaultAmenities.safety[2]    // Fire Alarm
    ],
    recommendedAmenities: [
      ...defaultAmenities.comfort
    ]
  },

  [RoomType.STORAGE]: {
    type: RoomType.STORAGE,
    defaultCapacity: 0,
    minimumArea: 100,
    careLevel: [],
    requiredAmenities: [
      defaultAmenities.safety[1],   // Emergency Light
      defaultAmenities.safety[2]    // Fire Alarm
    ],
    recommendedAmenities: []
  },

  [RoomType.BATHROOM]: {
    type: RoomType.BATHROOM,
    defaultCapacity: 1,
    minimumArea: 80,
    careLevel: [],
    requiredAmenities: [
      defaultAmenities.safety[0],   // Grab Bars
      defaultAmenities.safety[1],   // Emergency Light
      defaultAmenities.safety[2],   // Fire Alarm
      defaultAmenities.medical[0],  // Nurse Call
      defaultAmenities.accessibility[0]  // Wheelchair Access
    ],
    recommendedAmenities: [
      defaultAmenities.accessibility[2]  // Bathroom Safety Rails
    ]
  },

  [RoomType.SHOWER_ROOM]: {
    type: RoomType.SHOWER_ROOM,
    defaultCapacity: 1,
    minimumArea: 100,
    careLevel: [],
    requiredAmenities: [
      defaultAmenities.safety[0],   // Grab Bars
      defaultAmenities.safety[1],   // Emergency Light
      defaultAmenities.safety[2],   // Fire Alarm
      defaultAmenities.medical[0],  // Nurse Call
      defaultAmenities.accessibility[0],  // Wheelchair Access
      defaultAmenities.accessibility[2]   // Bathroom Safety Rails
    ],
    recommendedAmenities: []
  }
};


