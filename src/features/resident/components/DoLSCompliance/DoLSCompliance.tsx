import React from 'react';
import { Card, Alert, Timeline, Progress, Space, Button, Typography, Tag, List } from 'antd';
import type { DoLS, DoLSAssessment } from '../../types/dols.types';

const { Text, Title } = Typography;

interface ComplianceCheck {
  id: string;
  type: string;
  status: 'COMPLIANT' | 'WARNING' | 'OVERDUE' | 'ATTENTION';
  message: string;
  dueDate?: Date;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface DoLSComplianceProps {
  dols: DoLS;
  onRequestAssessment: (type: DoLSAssessment['type']) => void;
  onScheduleReview: () => void;
}

export const DoLSCompliance: React.FC<DoLSComplianceProps> = ({
  dols,
  onRequestAssessment,
  onScheduleReview,
}) => {
  const getComplianceChecks = (dols: DoLS): ComplianceCheck[] => {
    const checks: ComplianceCheck[] = [];
    const now = new Date();

    // Check DoLS expiry
    const daysUntilExpiry = Math.ceil((dols.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 0) {
      checks.push({
        id: 'dols-expired',
        type: 'EXPIRY',
        status: 'OVERDUE',
        message: 'DoLS has expired',
        priority: 'HIGH',
      });
    } else if (daysUntilExpiry <= 30) {
      checks.push({
        id: 'dols-expiring',
        type: 'EXPIRY',
        status: 'WARNING',
        message: `DoLS expires in ${daysUntilExpiry} days`,
        dueDate: dols.endDate,
        priority: 'HIGH',
      });
    }

    // Check required assessments
    const requiredAssessments: DoLSAssessment['type'][] = [
      'AGE',
      'MENTAL_HEALTH',
      'MENTAL_CAPACITY',
      'NO_REFUSALS',
      'ELIGIBILITY',
      'BEST_INTERESTS'
    ];

    requiredAssessments.forEach(required => {
      const assessment = dols.assessments.find(a => a.type === required);
      if (!assessment) {
        checks.push({
          id: `missing-assessment-${required}`,
          type: 'ASSESSMENT',
          status: 'ATTENTION',
          message: `Missing ${required.replace('_', ' ')} assessment`,
          priority: 'HIGH',
        });
      } else if (assessment.outcome === 'INCOMPLETE') {
        checks.push({
          id: `incomplete-assessment-${required}`,
          type: 'ASSESSMENT',
          status: 'WARNING',
          message: `Incomplete ${required.replace('_', ' ')} assessment`,
          priority: 'MEDIUM',
        });
      }
    });

    // Check reviews
    if (dols.reviews.length > 0) {
      const latestReview = dols.reviews[dols.reviews.length - 1];
      const daysUntilNextReview = Math.ceil(
        (latestReview.nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilNextReview <= 0) {
        checks.push({
          id: 'review-overdue',
          type: 'REVIEW',
          status: 'OVERDUE',
          message: 'Review is overdue',
          dueDate: latestReview.nextReviewDate,
          priority: 'HIGH',
        });
      } else if (daysUntilNextReview <= 14) {
        checks.push({
          id: 'review-due',
          type: 'REVIEW',
          status: 'WARNING',
          message: `Review due in ${daysUntilNextReview} days`,
          dueDate: latestReview.nextReviewDate,
          priority: 'MEDIUM',
        });
      }
    }

    // Check representative visits
    if (dols.representative && dols.representative.nextVisit) {
      const daysUntilNextVisit = Math.ceil(
        (dols.representative.nextVisit.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilNextVisit <= 0) {
        checks.push({
          id: 'rep-visit-overdue',
          type: 'REPRESENTATIVE',
          status: 'OVERDUE',
          message: 'Representative visit is overdue',
          dueDate: dols.representative.nextVisit,
          priority: 'MEDIUM',
        });
      } else if (daysUntilNextVisit <= 7) {
        checks.push({
          id: 'rep-visit-due',
          type: 'REPRESENTATIVE',
          status: 'WARNING',
          message: `Representative visit due in ${daysUntilNextVisit} days`,
          dueDate: dols.representative.nextVisit,
          priority: 'LOW',
        });
      }
    }

    return checks;
  };

  const getComplianceScore = (checks: ComplianceCheck[]): number => {
    if (checks.length === 0) return 100;

    const weights = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };

    const statusScores = {
      COMPLIANT: 1,
      WARNING: 0.5,
      ATTENTION: 0.25,
      OVERDUE: 0
    };

    let totalWeight = 0;
    let totalScore = 0;

    checks.forEach(check => {
      const weight = weights[check.priority];
      totalWeight += weight;
      totalScore += weight * statusScores[check.status];
    });

    return Math.round((totalScore / totalWeight) * 100);
  };

  const getStatusColor = (status: ComplianceCheck['status']) => {
    const colors = {
      COMPLIANT: 'green',
      WARNING: 'orange',
      ATTENTION: 'gold',
      OVERDUE: 'red'
    };
    return colors[status];
  };

  const complianceChecks = getComplianceChecks(dols);
  const complianceScore = getComplianceScore(complianceChecks);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={4}>DoLS Compliance Status</Title>
          <Progress
            type="circle"
            percent={complianceScore}
            size={80}
            status={complianceScore < 60 ? 'exception' : undefined}
          />
        </Space>
      </Card>

      <Card title="Compliance Checks">
        <List
          dataSource={complianceChecks}
          renderItem={check => (
            <List.Item
              extra={
                check.type === 'ASSESSMENT' ? (
                  <Button 
                    type="primary" 
                    onClick={() => onRequestAssessment(check.message.split(' ')[1] as DoLSAssessment['type'])}
                  >
                    Request Assessment
                  </Button>
                ) : check.type === 'REVIEW' ? (
                  <Button 
                    type="primary" 
                    onClick={onScheduleReview}
                  >
                    Schedule Review
                  </Button>
                ) : undefined
              }
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Tag color={getStatusColor(check.status)}>{check.status}</Tag>
                    <Text strong>{check.message}</Text>
                  </Space>
                }
                description={
                  check.dueDate && 
                  <Text type="secondary">Due: {check.dueDate.toLocaleDateString()}</Text>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {complianceScore < 100 && (
        <Alert
          message="Compliance Actions Required"
          description="There are outstanding compliance issues that need attention. Please review the compliance checks above and take necessary actions."
          type="warning"
          showIcon
        />
      )}
    </Space>
  );
};


