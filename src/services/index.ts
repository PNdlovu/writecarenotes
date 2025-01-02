/**
 * @fileoverview Central service exports
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

// Core services
export { validateRequest } from '@/lib/api';

// Feature services
export { activitiesService } from '@/lib/services/activities';
export { CareHomeService as careHomeService } from '@/lib/services/carehome';
export { handoverService } from '@/features/schedule/services/handover-service';

// Analytics services
export { analyticsService } from './analyticsService';
export { medicationAnalytics } from './medicationAnalytics';

// Care services
export { careHomeValidation } from './careHomeValidation';
export { careLevelTransition } from './careLevelTransition';
export { dietaryService } from './dietaryService';

// Compliance services
export { complianceService } from './complianceService';

// Emergency services
export { emergencyService } from './emergencyService';
export { emergencyResponse } from './emergencyResponse';

// Facility services
export { floorPlanService } from './floorPlanService';
export { roomAssignment } from './roomAssignment';

// Medication services
export { medicationService } from './medicationService';
export { roomMedicationService } from './roomMedicationService';

// Staff services
export { staffService } from './staffService';
export { staffingRequirements } from './staffingRequirements';

// Tenant services
export { tenantService } from './tenantService';

// Monitoring services
export { nearMissService } from './nearMissService';
export { verificationService } from './verificationService';
export { visitorManagement } from './visitorManagement'; 