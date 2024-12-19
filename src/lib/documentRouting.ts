import { prisma } from '@/lib/prisma';

interface DocumentMetadata {
  type: string;
  category: string;
  residentId?: string;
  departmentId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  keywords: string[];
}

interface RoutingRule {
  id: string;
  name: string;
  conditions: {
    documentTypes?: string[];
    categories?: string[];
    departments?: string[];
    priority?: string[];
    keywords?: string[];
  };
  workflowId: string;
  isActive: boolean;
}

export async function determineWorkflow(
  organizationId: string,
  metadata: DocumentMetadata
): Promise<string | null> {
  // Get all active routing rules for the organization
  const rules = await prisma.documentRoutingRule.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    orderBy: {
      priority: 'desc', // Higher priority rules are checked first
    },
  });

  for (const rule of rules) {
    if (matchesRule(metadata, rule)) {
      return rule.workflowId;
    }
  }

  // Get default workflow if no rules match
  const defaultWorkflow = await prisma.documentWorkflow.findFirst({
    where: {
      organizationId,
      isDefault: true,
    },
  });

  return defaultWorkflow?.id || null;
}

function matchesRule(metadata: DocumentMetadata, rule: RoutingRule): boolean {
  const { conditions } = rule;

  // Check document type
  if (
    conditions.documentTypes?.length &&
    !conditions.documentTypes.includes(metadata.type)
  ) {
    return false;
  }

  // Check category
  if (
    conditions.categories?.length &&
    !conditions.categories.includes(metadata.category)
  ) {
    return false;
  }

  // Check department
  if (
    conditions.departments?.length &&
    metadata.departmentId &&
    !conditions.departments.includes(metadata.departmentId)
  ) {
    return false;
  }

  // Check priority
  if (
    conditions.priority?.length &&
    metadata.priority &&
    !conditions.priority.includes(metadata.priority)
  ) {
    return false;
  }

  // Check keywords
  if (conditions.keywords?.length) {
    const hasRequiredKeywords = conditions.keywords.some(keyword =>
      metadata.keywords.includes(keyword)
    );
    if (!hasRequiredKeywords) {
      return false;
    }
  }

  return true;
}

// Special routing for clinical documents
export async function routeClinicalDocument(
  organizationId: string,
  metadata: DocumentMetadata
): Promise<string[]> {
  const approvers: string[] = [];

  // Always include the resident's primary care physician
  if (metadata.residentId) {
    const resident = await prisma.resident.findUnique({
      where: { id: metadata.residentId },
      include: { primaryPhysician: true },
    });
    if (resident?.primaryPhysician) {
      approvers.push(resident.primaryPhysician.id);
    }
  }

  // Include department head for clinical documents
  if (metadata.departmentId) {
    const departmentHead = await prisma.staff.findFirst({
      where: {
        organizationId,
        departmentId: metadata.departmentId,
        roles: {
          hasSome: ['DEPARTMENT_HEAD', 'CLINICAL_DIRECTOR'],
        },
      },
    });
    if (departmentHead) {
      approvers.push(departmentHead.id);
    }
  }

  // Include clinical oversight team for high-priority documents
  if (metadata.priority === 'HIGH' || metadata.priority === 'URGENT') {
    const clinicalTeam = await prisma.staff.findMany({
      where: {
        organizationId,
        roles: {
          hasSome: ['CLINICAL_DIRECTOR', 'HEAD_NURSE', 'QUALITY_MANAGER'],
        },
      },
    });
    approvers.push(...clinicalTeam.map(staff => staff.id));
  }

  return [...new Set(approvers)]; // Remove duplicates
}

// Compliance-related document routing
export async function routeComplianceDocument(
  organizationId: string,
  metadata: DocumentMetadata
): Promise<string[]> {
  const approvers: string[] = [];

  // Always include compliance officer
  const complianceOfficer = await prisma.staff.findFirst({
    where: {
      organizationId,
      roles: {
        hasSome: ['COMPLIANCE_OFFICER'],
      },
    },
  });
  if (complianceOfficer) {
    approvers.push(complianceOfficer.id);
  }

  // Include quality manager for certain categories
  if (['POLICY', 'PROCEDURE', 'AUDIT'].includes(metadata.category)) {
    const qualityManager = await prisma.staff.findFirst({
      where: {
        organizationId,
        roles: {
          hasSome: ['QUALITY_MANAGER'],
        },
      },
    });
    if (qualityManager) {
      approvers.push(qualityManager.id);
    }
  }

  // Include department heads for their respective areas
  if (metadata.departmentId) {
    const departmentHead = await prisma.staff.findFirst({
      where: {
        organizationId,
        departmentId: metadata.departmentId,
        roles: {
          hasSome: ['DEPARTMENT_HEAD'],
        },
      },
    });
    if (departmentHead) {
      approvers.push(departmentHead.id);
    }
  }

  return [...new Set(approvers)]; // Remove duplicates
}


