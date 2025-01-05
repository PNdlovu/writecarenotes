/**
 * @fileoverview Resident Management Module with DoLS and Capacity Assessment
 * @version 1.0.0
 * @created 2024-12-11
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive resident management system that handles:
 * - Core resident information management
 * - DoLS (Deprivation of Liberty Safeguards) tracking
 * - Mental capacity assessments
 * - Restrictions management and monitoring
 * - Care plan integration
 * - Compliance notifications
 * 
 * Regional Support:
 * - England (CQC compliant)
 * - Wales (CIW compliant)
 * - Scotland (Care Inspectorate compliant)
 * - Ireland (HIQA compliant)
 * - Northern Ireland (RQIA compliant)
 */

// API Handlers
export { 
    getResidentsHandler,
    getResidentHandler,
    createResidentHandler,
    updateResidentHandler
} from './api/handlers';

// Services
export { ResidentService } from './services/residentService';

// Hooks
export {
    useResidents,
    useResident,
    useCreateResident,
    useUpdateResident
} from './hooks/useResident';

// Components
export { ResidentProfile } from './components/ResidentProfile/ResidentProfile';
export { ResidentForm } from './components/ResidentForm/ResidentForm';
export { DoLSManager } from './components/DoLSManager/DoLSManager';
export { DoLSCompliance } from './components/DoLSCompliance/DoLSCompliance';
export { DoLSNotifications } from './components/DoLSNotifications/DoLSNotifications';
export { CapacityAssessment } from './components/CapacityAssessment/CapacityAssessment';
export { RestrictionsLog } from './components/RestrictionsLog/RestrictionsLog';
export { CarePlanIntegration } from './components/CarePlanIntegration/CarePlanIntegration';

// Types
export type { 
    Resident,
    ResidentCreateDTO,
    ResidentUpdateDTO,
    ResidentFilters
} from './types';

export type { 
    DoLS, 
    DoLSAssessment, 
    DoLSReview, 
    DoLSRepresentative, 
    DoLSDocument 
} from './types/dols.types';


