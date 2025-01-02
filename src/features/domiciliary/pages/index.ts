/**
 * @writecarenotes.com
 * @fileoverview Page exports for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Exports all pages for the domiciliary care module,
 * providing centralized access to dashboard and management interfaces.
 */

export * from './DomiciliaryDashboard';
export * from './ClientManagement';
export * from './Reporting';
export * from './Settings';
export * from './QualityMonitoring';
export * from './RegionalSettings';
export * from './VisitManagement';
export * from './RouteOptimization';
export * from './StaffScheduling';
export { HandoverSystem } from './Handover';
export { HomeEnvironmentAssessment } from '../components/clients/HomeEnvironmentAssessment';
export { CarePackagePlanning } from '../components/clients/CarePackagePlanning';
export { RegionalCompliance } from '../components/compliance/RegionalCompliance'; 