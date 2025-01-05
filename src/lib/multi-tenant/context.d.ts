/**
 * @writecarenotes.com
 * @fileoverview Type declarations for multi-tenant context
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

export interface TenantContext {
  organizationId: string;
  tenantId: string;
  region: 'UK_ENGLAND' | 'UK_WALES' | 'UK_SCOTLAND' | 'UK_NORTHERN_IRELAND' | 'IRELAND';
  timezone: string;
  features: string[];
  permissions: string[];
  settings: Record<string, unknown>;
} 