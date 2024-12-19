/**
 * @fileoverview Care Plans Module Public API
 * @version 1.2.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

// Hooks
export { useCarePlan } from './hooks/useCarePlan'
export { useCarePlanTemplate } from './hooks/useCarePlanTemplate'
export { useCarePlanReview } from './hooks/useCarePlanReview'

// Types
export * from './types'

// Templates
export * from './templates/children-needs.template'

// Service
export { default as CarePlanService } from './services/carePlanService'

// Components
export { CarePlanStats } from './components/CarePlanStats';
export { CarePlansManagement } from './components/CarePlansManagement';

// Create singleton instance
export const carePlanService = new CarePlanService();


