import { z } from 'zod';

/**
 * WriteCareNotes.com
 * @fileoverview Care Home validation schemas for ensuring data integrity across the application.
 * These schemas are used to validate all care home-related data before processing.
 * @module validations/carehome
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

/**
 * Base schema for contact information validation
 * @see {@link ContactInfo}
 */
const contactInfoSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address'),
  emergencyContact: z.string().min(1, 'Emergency contact is required'),
  emergencyPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid emergency phone number')
});

/**
 * Schema for operating hours validation
 * @see {@link OperatingHours}
 */
const operatingHoursSchema = z.object({
  monday: z.object({
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    isOpen: z.boolean()
  }),
  tuesday: z.object({
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    isOpen: z.boolean()
  }),
  wednesday: z.object({
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    isOpen: z.boolean()
  }),
  thursday: z.object({
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    isOpen: z.boolean()
  }),
  friday: z.object({
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    isOpen: z.boolean()
  }),
  saturday: z.object({
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    isOpen: z.boolean()
  }),
  sunday: z.object({
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    isOpen: z.boolean()
  })
}).refine(
  (data) => {
    // Ensure at least one day is open
    return Object.values(data).some(day => day.isOpen);
  },
  { message: 'Care home must be open at least one day per week' }
);

/**
 * Comprehensive care home validation schema
 * @see {@link CareHomeSettings}
 */
const careHomeSettingsSchema = z.object({
  id: z.string().uuid('Invalid care home ID'),
  name: z.string().min(1, 'Care home name is required').max(100),
  address: z.string().min(1, 'Address is required'),
  contactInfo: contactInfoSchema,
  operatingHours: operatingHoursSchema,
  departments: z.array(z.string().uuid('Invalid department ID')),
  capacity: z.number().int().positive('Capacity must be positive'),
  features: z.object({
    hasParking: z.boolean(),
    hasWifi: z.boolean(),
    isAccessible: z.boolean(),
    hasEmergencyPower: z.boolean(),
    hasSecurity: z.boolean()
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    language: z.string(),
    notificationsEnabled: z.boolean(),
    autoScheduling: z.boolean(),
    maintenanceAlerts: z.boolean(),
    occupancyAlerts: z.boolean()
  })
});

/**
 * Maintenance request validation schema with priority-based validation
 * @see {@link MaintenanceRequest}
 */
const careHomeMaintenanceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum([
    'PLUMBING',
    'ELECTRICAL',
    'HVAC',
    'SAFETY',
    'STRUCTURAL',
    'EQUIPMENT',
    'OTHER'
  ]),
  estimatedCost: z.number().optional(),
  assignedTo: z.string().uuid('Invalid staff ID').optional(),
  inspectionRequired: z.boolean(),
  recurringSchedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually']),
    nextDueDate: z.string().datetime()
  }).optional()
}).refine(
  (data) => {
    // Critical requests must have assignedTo
    if (data.priority === 'critical' && !data.assignedTo) {
      return false;
    }
    return true;
  },
  { message: 'Critical maintenance requests must be assigned to staff' }
);

/**
 * Incident reporting schema with severity-based validation
 * @see {@link Incident}
 */
const incidentSchema = z.object({
  type: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.string(),
  description: z.string().min(1, 'Description is required'),
  reportedBy: z.string().uuid('Invalid staff ID'),
  category: z.enum([
    'RESIDENT_SAFETY',
    'STAFF_SAFETY',
    'FACILITY_DAMAGE',
    'SECURITY',
    'MEDICAL_EMERGENCY',
    'OTHER'
  ]),
  affectedResidents: z.array(z.string().uuid('Invalid resident ID')).optional(),
  witnesses: z.array(z.string().uuid('Invalid staff ID')).optional(),
  immediateActions: z.array(z.string()),
  riskAssessment: z.object({
    likelihood: z.number().min(1).max(5),
    impact: z.number().min(1).max(5),
    mitigationSteps: z.array(z.string())
  })
}).refine(
  (data) => {
    // High/Critical incidents must have immediate actions
    if (['high', 'critical'].includes(data.severity) && data.immediateActions.length === 0) {
      return false;
    }
    return true;
  },
  { message: 'High/Critical incidents must have immediate actions documented' }
);

/**
 * Resource management schema with inventory tracking
 * @see {@link FacilityResource}
 */
const careHomeResourceSchema = z.object({
  type: z.enum(['EQUIPMENT', 'SUPPLIES', 'MEDICATION', 'STAFF', 'SPACE']),
  name: z.string().min(1, 'Resource name is required'),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DEPLETED']),
  quantity: z.number().nonnegative(),
  unit: z.string(),
  location: z.string(),
  minimumRequired: z.number().nonnegative(),
  reorderPoint: z.number().nonnegative(),
  supplier: z.object({
    id: z.string().uuid('Invalid supplier ID'),
    name: z.string(),
    contact: z.string(),
    leadTime: z.number().positive()
  }).optional(),
  maintenanceSchedule: z.object({
    frequency: z.string(),
    lastMaintenance: z.date(),
    nextMaintenance: z.date(),
    provider: z.string()
  }).optional()
}).refine(
  (data) => {
    // Ensure reorder point is less than minimum required
    return data.reorderPoint <= data.minimumRequired;
  },
  { message: 'Reorder point must not exceed minimum required quantity' }
);

/**
 * Compliance tracking schema with regulatory requirements
 * @see {@link FacilityCompliance}
 */
const careHomeComplianceSchema = z.object({
  regulatoryBody: z.string(),
  lastInspection: z.date(),
  nextInspection: z.date().optional(),
  rating: z.enum(['A', 'B', 'C', 'D', 'F']),
  score: z.number().min(0).max(100),
  requirements: z.array(z.object({
    id: z.string().uuid(),
    category: z.string(),
    description: z.string(),
    status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'IN_PROGRESS', 'NOT_APPLICABLE']),
    dueDate: z.date(),
    priority: z.enum(['low', 'medium', 'high', 'critical'])
  })),
  improvementPlan: z.object({
    areas: z.array(z.string()),
    actions: z.array(z.string()),
    timeline: z.string(),
    responsibleParties: z.array(z.string().uuid('Invalid staff ID')),
    progress: z.number().min(0).max(100)
  }).optional()
}).refine(
  (data) => {
    // Ensure next inspection is after last inspection
    if (data.nextInspection) {
      return data.nextInspection > data.lastInspection;
    }
    return true;
  },
  { message: 'Next inspection date must be after last inspection' }
);

/**
 * Base schemas for reusability
 */
const addressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  county: z.string().min(1, 'County is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  country: z.string().min(1, 'Country is required')
});

const contactSchema = z.object({
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address'),
  website: z.string().url().optional(),
  emergencyContact: z.string().min(1, 'Emergency contact is required'),
  emergencyPhone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid emergency phone number format')
});

/**
 * Main care home validation schema
 */
export const careHomeSchema = z.object({
  name: z.string().min(2, 'Care home name must be at least 2 characters'),
  type: z.enum(['CARE_HOME', 'NURSING_HOME', 'RESIDENTIAL_HOME', 'SUPPORTED_LIVING'] as const),
  regulatoryBody: z.enum(['CQC', 'CIW', 'RQIA', 'CARE_INSPECTORATE', 'HIQA'] as const),
  address: addressSchema,
  contact: contactSchema,
  capacity: z.object({
    total: z.number().min(1, 'Total capacity must be at least 1'),
    current: z.number().min(0),
    available: z.number().min(0)
  }),
  specializedCare: z.array(z.string()).optional(),
  operatingHours: operatingHoursSchema,
  features: z.object({
    hasParking: z.boolean(),
    isAccessible: z.boolean(),
    hasWifi: z.boolean(),
    hasCatering: z.boolean(),
    hasGarden: z.boolean(),
    hasPharmacy: z.boolean()
  })
});

/**
 * Maintenance request validation
 */
export const maintenanceRequestValidation = careHomeMaintenanceSchema;

/**
 * Incident validation
 */
export const incidentValidation = incidentSchema;

/**
 * Resource validation
 */
export const resourceValidation = careHomeResourceSchema;

/**
 * Compliance validation
 */
export const complianceValidation = careHomeComplianceSchema;

/**
 * Document validation
 */
export const documentSchema = z.object({
  type: z.enum([
    'INSPECTION_REPORT',
    'EVIDENCE',
    'POLICY',
    'CERTIFICATE',
    'TRAINING_RECORD',
    'AUDIT_REPORT'
  ] as const),
  title: z.string().min(1, 'Document title is required'),
  url: z.string().url('Invalid document URL'),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'PENDING_REVIEW']),
  accessLevel: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']),
  metadata: z.object({
    author: z.string(),
    version: z.string(),
    keywords: z.array(z.string()),
    relatedDocuments: z.array(z.string()).optional()
  }).optional(),
  reviewStatus: z.object({
    lastReviewed: z.string(),
    reviewedBy: z.string(),
    nextReviewDate: z.string(),
    comments: z.array(z.string()).optional()
  }).optional()
});

export type CareHomeSettings = z.infer<typeof careHomeSettingsSchema>;
export type CareHomeMaintenance = z.infer<typeof careHomeMaintenanceSchema>;
export type CareHomeResource = z.infer<typeof careHomeResourceSchema>;
export type CareHomeCompliance = z.infer<typeof careHomeComplianceSchema>;


