import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface ComplianceMetrics {
  documentCount: number;
  retentionCompliance: number;
  gdprRequests: {
    total: number;
    completed: number;
    pending: number;
    byType: Record<string, number>;
  };
  legalHolds: {
    active: number;
    released: number;
    documentsHeld: number;
  };
  dataBreaches: {
    total: number;
    resolved: number;
    meanTimeToResolve: number;
  };
  regulatoryFindings: {
    total: number;
    open: number;
    closed: number;
    byCategory: Record<string, number>;
  };
}

interface ComplianceReport {
  metrics: ComplianceMetrics;
  trends: {
    retentionCompliance: number[];
    gdprRequests: number[];
    dataBreaches: number[];
  };
  risks: {
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    recommendations: string[];
  }[];
}

export async function generateComplianceReport(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<ComplianceReport> {
  const [
    documentMetrics,
    gdprMetrics,
    legalHoldMetrics,
    dataBreachMetrics,
    regulatoryMetrics,
    trends,
    risks,
  ] = await Promise.all([
    getDocumentMetrics(organizationId, startDate, endDate),
    getGDPRMetrics(organizationId, startDate, endDate),
    getLegalHoldMetrics(organizationId),
    getDataBreachMetrics(organizationId, startDate, endDate),
    getRegulatoryMetrics(organizationId, startDate, endDate),
    getComplianceTrends(organizationId, startDate, endDate),
    assessComplianceRisks(organizationId),
  ]);

  return {
    metrics: {
      ...documentMetrics,
      gdprRequests: gdprMetrics,
      legalHolds: legalHoldMetrics,
      dataBreaches: dataBreachMetrics,
      regulatoryFindings: regulatoryMetrics,
    },
    trends,
    risks,
  };
}

async function getDocumentMetrics(
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  const documents = await prisma.document.findMany({
    where: {
      organizationId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const retentionPolicies = await prisma.retentionRule.findMany({
    where: { organizationId },
  });

  let compliantDocs = 0;
  for (const doc of documents) {
    const policy = retentionPolicies.find(p => p.documentType === doc.type);
    if (!policy || doc.status === 'ARCHIVED' || doc.status === 'DELETED') {
      compliantDocs++;
    }
  }

  return {
    documentCount: documents.length,
    retentionCompliance: documents.length
      ? (compliantDocs / documents.length) * 100
      : 100,
  };
}

async function getGDPRMetrics(
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  const requests = await prisma.dataSubjectRequest.findMany({
    where: {
      organizationId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const byType = requests.reduce((acc, req) => {
    acc[req.type] = (acc[req.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: requests.length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    byType,
  };
}

async function getLegalHoldMetrics(organizationId: string) {
  const holds = await prisma.legalHold.findMany({
    where: { organizationId },
    include: { documents: true },
  });

  return {
    active: holds.filter(h => h.status === 'ACTIVE').length,
    released: holds.filter(h => h.status === 'RELEASED').length,
    documentsHeld: holds
      .filter(h => h.status === 'ACTIVE')
      .reduce((sum, h) => sum + h.documents.length, 0),
  };
}

async function getDataBreachMetrics(
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  const breaches = await prisma.dataBreach.findMany({
    where: {
      organizationId,
      discoveredAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const resolvedBreaches = breaches.filter(b => b.resolvedAt);
  const totalResolutionTime = resolvedBreaches.reduce(
    (sum, b) =>
      sum +
      (b.resolvedAt!.getTime() - b.discoveredAt.getTime()) /
        (1000 * 60 * 60), // hours
    0
  );

  return {
    total: breaches.length,
    resolved: resolvedBreaches.length,
    meanTimeToResolve: resolvedBreaches.length
      ? totalResolutionTime / resolvedBreaches.length
      : 0,
  };
}

async function getRegulatoryMetrics(
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  const findings = await prisma.regulatoryFinding.findMany({
    where: {
      organizationId,
      identifiedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const byCategory = findings.reduce((acc, finding) => {
    acc[finding.category] = (acc[finding.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: findings.length,
    open: findings.filter(f => f.status === 'OPEN').length,
    closed: findings.filter(f => f.status === 'CLOSED').length,
    byCategory,
  };
}

async function getComplianceTrends(
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  const months = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    months.push({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });
    currentDate = subMonths(currentDate, -1);
  }

  const trends = await Promise.all(
    months.map(async ({ start, end }) => {
      const [retention, gdpr, breaches] = await Promise.all([
        getDocumentMetrics(organizationId, start, end),
        getGDPRMetrics(organizationId, start, end),
        getDataBreachMetrics(organizationId, start, end),
      ]);

      return {
        retentionCompliance: retention.retentionCompliance,
        gdprRequests: gdpr.total,
        dataBreaches: breaches.total,
      };
    })
  );

  return {
    retentionCompliance: trends.map(t => t.retentionCompliance),
    gdprRequests: trends.map(t => t.gdprRequests),
    dataBreaches: trends.map(t => t.dataBreaches),
  };
}

async function assessComplianceRisks(organizationId: string) {
  const risks: ComplianceReport['risks'] = [];

  // Check retention policy compliance
  const retentionMetrics = await getDocumentMetrics(
    organizationId,
    subMonths(new Date(), 1),
    new Date()
  );
  if (retentionMetrics.retentionCompliance < 90) {
    risks.push({
      level: 'HIGH',
      description: 'Low retention policy compliance',
      recommendations: [
        'Review and update retention policies',
        'Implement automated retention enforcement',
        'Conduct staff training on retention requirements',
      ],
    });
  }

  // Check GDPR request response time
  const gdprMetrics = await getGDPRMetrics(
    organizationId,
    subMonths(new Date(), 1),
    new Date()
  );
  if (gdprMetrics.pending > gdprMetrics.total * 0.2) {
    risks.push({
      level: 'MEDIUM',
      description: 'High number of pending GDPR requests',
      recommendations: [
        'Allocate additional resources to GDPR request processing',
        'Review and optimize GDPR request workflow',
        'Consider automated solutions for common request types',
      ],
    });
  }

  // Check data breach metrics
  const breachMetrics = await getDataBreachMetrics(
    organizationId,
    subMonths(new Date(), 1),
    new Date()
  );
  if (breachMetrics.meanTimeToResolve > 72) { // 72 hours threshold
    risks.push({
      level: 'HIGH',
      description: 'Slow data breach resolution time',
      recommendations: [
        'Review and update incident response procedures',
        'Conduct regular incident response drills',
        'Implement automated breach detection and response',
      ],
    });
  }

  return risks;
}


