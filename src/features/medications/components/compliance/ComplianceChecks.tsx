/**
 * @writecarenotes.com
 * @fileoverview Medication compliance monitoring component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive medication compliance monitoring supporting CQC, OFSTED,
 * CIW, CI, and RQIA requirements. Features real-time alerts and
 * offline-capable compliance checks.
 */

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useComplianceRules } from '../../hooks/useComplianceRules';
import { usePermissions } from '@/hooks/usePermissions';
import type { Medication, MedicationAdministrationRecord } from '../../types/medication';
import type { Region } from '@/types/region';

interface ComplianceChecksProps {
  medications: Medication[];
  marRecords: MedicationAdministrationRecord[];
  region: Region;
}

export const ComplianceChecks: React.FC<ComplianceChecksProps> = ({
  medications,
  marRecords,
  region,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { hasPermission } = usePermissions();
  const { rules, checkCompliance, loading, error } = useComplianceRules(region);

  const complianceIssues = useMemo(() => {
    if (!medications || !marRecords || !rules) return [];

    return medications.flatMap(medication => {
      const medicationMARs = marRecords.filter(
        mar => mar.medicationId === medication.id
      );

      return checkCompliance(medication, medicationMARs).map(issue => ({
        ...issue,
        medication,
      }));
    });
  }, [medications, marRecords, rules, checkCompliance]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return <div className="loading-spinner" />;
  }

  if (error) {
    return <div className="error-message">{error.message}</div>;
  }

  return (
    <div className="compliance-checks">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Compliance Checks</h2>
        {hasPermission('medication.compliance.view') && (
          <Badge variant="outline">
            {region.toUpperCase()} Standards
          </Badge>
        )}
      </div>

      {complianceIssues.length === 0 ? (
        <Alert variant="success" className="mb-4">
          All medications are compliant with {region.toUpperCase()} standards
        </Alert>
      ) : (
        <div className="space-y-4">
          {complianceIssues.map((issue, index) => (
            <Card
              key={`${issue.medication.id}-${index}`}
              className={`p-4 ${getSeverityColor(issue.severity)}`}
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h3 className="font-medium">
                    {issue.medication.name}
                    {!isMobile && (
                      <span className="ml-2 text-sm">
                        ({issue.medication.form} - {issue.medication.strength})
                      </span>
                    )}
                  </h3>
                  <p className="text-sm mt-1">{issue.description}</p>
                </div>
                <div className={`mt-2 md:mt-0 ${isMobile ? 'text-sm' : ''}`}>
                  <Badge variant="outline" className="ml-2">
                    {issue.severity.toUpperCase()}
                  </Badge>
                  {issue.dueDate && (
                    <p className="text-sm mt-1">
                      Due: {new Date(issue.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {issue.recommendation && (
                <p className="mt-2 text-sm border-t pt-2">
                  Recommendation: {issue.recommendation}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {isMobile && complianceIssues.length > 0 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Tap issues for more details
        </p>
      )}
    </div>
  );
}; 