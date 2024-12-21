/**
 * WriteCareNotes.com
 * @fileoverview Compliance Validation Module
 * @version 1.0.0
 */

import { ComplianceError } from './errors';
import { TenantContext, tenantContext } from './tenant';

interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  framework: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  validation: (data: any, context: TenantContext) => boolean;
  errorMessage: string;
}

interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  region: string;
  requirements: ComplianceRequirement[];
  categories: string[];
}

class ComplianceManager {
  private static instance: ComplianceManager;
  private frameworks: Map<string, ComplianceFramework> = new Map();

  private constructor() {
    this.initializeFrameworks();
  }

  public static getInstance(): ComplianceManager {
    if (!ComplianceManager.instance) {
      ComplianceManager.instance = new ComplianceManager();
    }
    return ComplianceManager.instance;
  }

  private initializeFrameworks(): void {
    // CQC Framework (England)
    this.registerFramework({
      id: 'CQC',
      name: 'Care Quality Commission',
      version: '2024.1',
      region: 'GB-ENG',
      categories: [
        'Safe',
        'Effective',
        'Caring',
        'Responsive',
        'Well-led',
      ],
      requirements: [
        {
          id: 'CQC-SAFE-001',
          name: 'Medication Management',
          description: 'Proper medication administration and record keeping',
          framework: 'CQC',
          category: 'Safe',
          severity: 'CRITICAL',
          validation: (data) => {
            // Implement medication validation logic
            return true;
          },
          errorMessage: 'Medication management requirements not met',
        },
        // Add more CQC requirements
      ],
    });

    // CIW Framework (Wales)
    this.registerFramework({
      id: 'CIW',
      name: 'Care Inspectorate Wales',
      version: '2024.1',
      region: 'GB-WLS',
      categories: [
        'Well-being',
        'Care and Support',
        'Environment',
        'Leadership and Management',
      ],
      requirements: [
        // Add CIW requirements
      ],
    });

    // Care Inspectorate Framework (Scotland)
    this.registerFramework({
      id: 'CI-SCT',
      name: 'Care Inspectorate Scotland',
      version: '2024.1',
      region: 'GB-SCT',
      categories: [
        'Quality of Care and Support',
        'Quality of Environment',
        'Quality of Staffing',
        'Quality of Management and Leadership',
      ],
      requirements: [
        // Add Care Inspectorate requirements
      ],
    });

    // RQIA Framework (Northern Ireland)
    this.registerFramework({
      id: 'RQIA',
      name: 'RQIA',
      version: '2024.1',
      region: 'GB-NIR',
      categories: [
        'Is Care Safe?',
        'Is Care Effective?',
        'Is Care Compassionate?',
        'Is the Service Well Led?',
      ],
      requirements: [
        // Add RQIA requirements
      ],
    });

    // HIQA Framework (Ireland)
    this.registerFramework({
      id: 'HIQA',
      name: 'Health Information and Quality Authority',
      version: '2024.1',
      region: 'IRL',
      categories: [
        'Capacity and Capability',
        'Quality and Safety',
      ],
      requirements: [
        // Add HIQA requirements
      ],
    });
  }

  registerFramework(framework: ComplianceFramework): void {
    this.frameworks.set(framework.id, framework);
  }

  getFramework(id: string): ComplianceFramework {
    const framework = this.frameworks.get(id);
    if (!framework) {
      throw new ComplianceError(`Compliance framework not found: ${id}`);
    }
    return framework;
  }

  validateCompliance(data: any, requirements?: string[]): boolean {
    const context = tenantContext.getContext();
    const framework = this.getFramework(context.compliance.framework);

    const requirementsToValidate = requirements || context.compliance.requirements;

    for (const reqId of requirementsToValidate) {
      const requirement = framework.requirements.find(r => r.id === reqId);
      if (!requirement) {
        throw new ComplianceError(`Requirement not found: ${reqId}`);
      }

      if (!requirement.validation(data, context)) {
        throw new ComplianceError(requirement.errorMessage, {
          requirement: requirement.id,
          severity: requirement.severity,
        });
      }
    }

    return true;
  }

  getRequirements(category?: string): ComplianceRequirement[] {
    const context = tenantContext.getContext();
    const framework = this.getFramework(context.compliance.framework);

    if (!category) {
      return framework.requirements;
    }

    return framework.requirements.filter(r => r.category === category);
  }

  getCategories(): string[] {
    const context = tenantContext.getContext();
    const framework = this.getFramework(context.compliance.framework);
    return framework.categories;
  }

  async validateAndReport(data: any): Promise<{
    valid: boolean;
    framework: string;
    timestamp: Date;
    results: Array<{
      requirement: string;
      category: string;
      passed: boolean;
      message?: string;
    }>;
  }> {
    const context = tenantContext.getContext();
    const framework = this.getFramework(context.compliance.framework);
    const results = [];

    for (const requirement of framework.requirements) {
      try {
        const passed = requirement.validation(data, context);
        results.push({
          requirement: requirement.id,
          category: requirement.category,
          passed,
          message: passed ? undefined : requirement.errorMessage,
        });
      } catch (error) {
        results.push({
          requirement: requirement.id,
          category: requirement.category,
          passed: false,
          message: error.message,
        });
      }
    }

    return {
      valid: results.every(r => r.passed),
      framework: framework.id,
      timestamp: new Date(),
      results,
    };
  }
}

export const compliance = ComplianceManager.getInstance(); 