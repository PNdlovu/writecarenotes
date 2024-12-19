import React from 'react';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';
import { Region, ComplianceStatus } from '../../types/compliance';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';

interface ComplianceStatusProps {
  careHomeId: string;
  region: Region;
}

export function ComplianceStatus({ careHomeId, region }: ComplianceStatusProps) {
  const {
    complianceData,
    isLoading,
    error,
    validateCompliance,
    downloadReport,
    isValidating
  } = useRegionalCompliance(careHomeId, region);

  if (error) {
    return (
      <Card className="p-4 bg-red-50">
        <div className="flex items-center space-x-2 text-red-600">
          <Icon name="alert-circle" />
          <p>Failed to load compliance data</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => validateCompliance()}
        >
          Retry
        </Button>
      </Card>
    );
  }

  if (isLoading || !complianceData) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Icon name="loader" className="animate-spin" />
          <p>Loading compliance data...</p>
        </div>
      </Card>
    );
  }

  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.COMPLIANT:
        return 'bg-green-500';
      case ComplianceStatus.PARTIALLY_COMPLIANT:
        return 'bg-yellow-500';
      case ComplianceStatus.NON_COMPLIANT:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold mb-2">Compliance Status</h3>
          <div className="flex items-center space-x-2 mb-4">
            <Badge
              variant="solid"
              className={getStatusColor(complianceData.status)}
            >
              {complianceData.status}
            </Badge>
            <span className="text-sm text-gray-500">
              Next review: {new Date(complianceData.nextReviewDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => validateCompliance()}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <Icon name="spinner" className="animate-spin mr-2" />
                Validating...
              </>
            ) : (
              'Validate Now'
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadReport(complianceData)}
          >
            <Icon name="download" className="mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-medium mb-2">Category Scores</h4>
        <div className="space-y-4">
          {Object.entries(complianceData.report.categories).map(([category, score]) => (
            <div key={category}>
              <div className="flex justify-between mb-1">
                <span className="text-sm capitalize">{category}</span>
                <span className="text-sm font-medium">{score}%</span>
              </div>
              <Progress value={score} max={100} />
            </div>
          ))}
        </div>
      </div>

      {complianceData.report.findings.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">Critical Findings</h4>
          <div className="space-y-2">
            {complianceData.report.findings
              .filter(finding => finding.severity === 'high')
              .map((finding, index) => (
                <div
                  key={index}
                  className="p-3 bg-red-50 rounded-md text-sm text-red-700"
                >
                  <p className="font-medium">{finding.category}</p>
                  <p>{finding.description}</p>
                  <p className="mt-1 text-xs">
                    Due by: {new Date(finding.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </Card>
  );
}


