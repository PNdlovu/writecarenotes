/**
 * @writecarenotes.com
 * @fileoverview Care homes components exports
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Barrel file exporting all care home badge components.
 * Features include:
 * - Care level badges
 * - Region badges
 * - Status badges
 * - Visual indicators
 *
 * Mobile-First Considerations:
 * - Responsive sizing
 * - Touch targets
 * - Visual clarity
 * - Status updates
 *
 * Enterprise Features:
 * - State management
 * - Real-time updates
 * - Performance optimization
 * - Integration support
 */

// Badge components
export * from './badges/CareLevelBadge';
export * from './badges/RegionBadge';
export * from './badges/StatusBadge';

// Resident management
export * from './residents/admission';
export * from './residents/care-plans';
export * from './residents/profiles';

// Staff management
export * from './staff/rota';
export * from './staff/training';
export * from './staff/profiles';

// Facility management
export * from './facilities/rooms';
export * from './facilities/maintenance';

// Operational components
export * from './operations/incidents';
export * from './operations/medications';
export * from './operations/assessments'; 