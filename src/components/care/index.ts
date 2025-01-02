/**
 * @writecarenotes.com
 * @fileoverview Core care components exports
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Barrel file exporting all care components and types.
 * Features include:
 * - Base component exports
 * - Specialized care exports
 * - Compliance tracking exports
 * - Person profile exports
 *
 * Mobile-First Considerations:
 * - Optimized imports
 * - Tree-shakeable exports
 * - Dynamic loading support
 *
 * Enterprise Features:
 * - Type safety
 * - Code splitting
 * - Bundle optimization
 */

// Base components
export * from './base/BaseCareComponent';

// Specialized care components
export * from './specialized/childrens/EducationTracker';
export * from './specialized/domiciliary/DomiciliaryCare';
export * from './specialized/elderly/ElderlyCare';
export * from './specialized/learning-disabilities/LearningDisabilitiesCare';
export * from './specialized/mental-health/MentalHealthCare';
export * from './specialized/physical-disabilities/PhysicalDisabilitiesCare';

// Compliance components
export * from './compliance/ComplianceTracker';

// Core components
export * from './PersonProfile';