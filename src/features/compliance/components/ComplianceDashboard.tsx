import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { useComplianceManagement } from '../hooks/useComplianceManagement';
import { Region } from '../types/compliance.types';

interface ComplianceDashboardProps {
  organizationId: string;
  careHomeId: string;
  region: Region;
}

export function ComplianceDashboard({
  organizationId,
  careHomeId,
  region
}: ComplianceDashboardProps) {
  const {
    frameworks,
    audits,
    schedule,
    isLoading,
    error,
    validateCompliance,
    addEvidence,
    updateSchedule
  } = useComplianceManagement({
    organizationId,
    careHomeId,
    region
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Icon name="alert-triangle" className="h-4 w-4" />
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>
          {error instanceof Error ? error.message : 'Failed to load compliance data'}
        </Alert.Description>
      </Alert>
    );
  }

  const overallScore = audits?.[0]?.score ?? 0;
  const nextAuditDue = schedule?.[0]?.nextAuditDue;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Overall Compliance</h3>
          <div className="flex items-center space-x-4">
            <Progress value={overallScore} className="flex-1" />
            <span className="text-lg font-bold">{Math.round(overallScore)}%</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Next Audit</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {nextAuditDue
                ? new Date(nextAuditDue).toLocaleDateString()
                : 'No audit scheduled'}
            </span>
            <Badge variant={getDueBadgeVariant(nextAuditDue)}>
              {getAuditStatus(nextAuditDue)}
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Active Frameworks</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{frameworks?.length ?? 0}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => validateCompliance(frameworks?.[0]?.id ?? '')}
              disabled={!frameworks?.length}
            >
              Start Audit
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recent Audits</h3>
        {audits && audits.length > 0 ? (
          <div className="space-y-4">
            {audits.map((audit) => (
              <div
                key={audit.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{audit.frameworkId}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(audit.auditDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={getScoreBadgeVariant(audit.score)}>
                    {Math.round(audit.score)}%
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(audit.status)}>
                    {audit.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No audit history available
          </div>
        )}
      </Card>
    </div>
  );
}

function getDueBadgeVariant(date?: Date): 'default' | 'warning' | 'destructive' {
  if (!date) return 'default';
  const now = new Date();
  const dueDate = new Date(date);
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return 'destructive';
  if (daysUntilDue < 7) return 'warning';
  return 'default';
}

function getAuditStatus(date?: Date): string {
  if (!date) return 'Not Scheduled';
  const now = new Date();
  const dueDate = new Date(date);
  if (dueDate < now) return 'Overdue';
  return 'Scheduled';
}

function getScoreBadgeVariant(score: number): 'success' | 'warning' | 'destructive' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'destructive';
}

function getStatusBadgeVariant(status: string): 'default' | 'primary' | 'success' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REVIEWED':
      return 'primary';
    default:
      return 'default';
  }
}


