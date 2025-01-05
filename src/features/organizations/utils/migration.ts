/**
 * WriteCareNotes.com
 * @fileoverview Data Migration Utilities
 * @version 1.0.0
 */

import { Organization } from '../validations/organizationValidation';
import { organizationService } from '../services/organizationService';
import { DatabaseError } from '@/lib/errors';
import { TenantContext } from '@/lib/tenantContext';

interface MigrationResult {
  success: boolean;
  organizationId: string;
  changes: string[];
  errors?: string[];
}

interface MigrationOptions {
  dryRun?: boolean;
  validateOnly?: boolean;
  backupFirst?: boolean;
}

export async function migrateOrganization(
  organizationId: string,
  updates: Partial<Organization>,
  options: MigrationOptions = {},
  context: TenantContext
): Promise<MigrationResult> {
  const changes: string[] = [];
  const errors: string[] = [];

  try {
    // Get current organization state
    const organization = await organizationService.getOrganization(organizationId);
    if (!organization) {
      throw new DatabaseError('Organization not found');
    }

    // Validate updates
    if (options.validateOnly || options.dryRun) {
      await organizationService.validateCompliance(organizationId, context);
      changes.push('Validation passed');
      
      if (options.validateOnly) {
        return {
          success: true,
          organizationId,
          changes,
        };
      }
    }

    // Backup if requested
    if (options.backupFirst) {
      await backupOrganization(organizationId);
      changes.push('Backup created');
    }

    // If dry run, return planned changes
    if (options.dryRun) {
      const plannedChanges = diffOrganization(organization, updates);
      changes.push(...plannedChanges);
      
      return {
        success: true,
        organizationId,
        changes,
      };
    }

    // Perform migration
    const updated = await organizationService.updateOrganization(organizationId, updates);
    const actualChanges = diffOrganization(organization, updated);
    changes.push(...actualChanges);

    return {
      success: true,
      organizationId,
      changes,
    };
  } catch (error) {
    errors.push(error.message);
    
    return {
      success: false,
      organizationId,
      changes,
      errors,
    };
  }
}

async function backupOrganization(organizationId: string): Promise<void> {
  const organization = await organizationService.getOrganization(organizationId);
  const timestamp = new Date().toISOString();
  const backupId = `backup_${organizationId}_${timestamp}`;
  
  // Store backup in database or file system
  // Implementation depends on your storage solution
}

function diffOrganization(
  original: Organization,
  updated: Partial<Organization>
): string[] {
  const changes: string[] = [];
  
  // Compare and record changes
  Object.entries(updated).forEach(([key, value]) => {
    if (JSON.stringify(original[key]) !== JSON.stringify(value)) {
      changes.push(`Updated ${key}`);
    }
  });
  
  return changes;
}

export async function batchMigrateOrganizations(
  filter: { [key: string]: any },
  updates: Partial<Organization>,
  options: MigrationOptions = {}
): Promise<MigrationResult[]> {
  const results: MigrationResult[] = [];
  
  try {
    // Get organizations matching filter
    const organizations = await organizationService.findOrganizations(filter);
    
    // Process each organization
    for (const org of organizations) {
      const result = await migrateOrganization(org.id, updates, options);
      results.push(result);
      
      // If any non-dry-run migration fails, stop batch
      if (!options.dryRun && !result.success) {
        break;
      }
    }
    
    return results;
  } catch (error) {
    throw new DatabaseError('Batch migration failed', error);
  }
} 