/**
 * @writecarenotes.com
 * @fileoverview Quality monitoring page for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Quality monitoring interface for domiciliary care services,
 * integrating with core quality assurance while providing
 * domiciliary-specific metrics and compliance tracking.
 * Supports standards for England (CQC), Wales (CIW),
 * Scotland (Care Inspectorate), Northern Ireland (RQIA),
 * and Ireland (HIQA).
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { QualityMetrics } from '@/features/quality';
import { Button } from '@/components/ui/Button';
import type { DateRange } from '@/types';

export const QualityMonitoring = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quality Monitoring</h1>
          <p className="text-gray-500">
            Monitor and maintain service quality standards
          </p>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="visits">Visit Quality</Tabs.Trigger>
          <Tabs.Trigger value="staff">Staff Performance</Tabs.Trigger>
          <Tabs.Trigger value="compliance">Compliance</Tabs.Trigger>
          <Tabs.Trigger value="regional">Regional Standards</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <Card.Header>
                <Card.Title>Overall Quality Score</Card.Title>
              </Card.Header>
              <Card.Body>
                <QualityMetrics.Score
                  module="domiciliary"
                  dateRange={dateRange}
                  type="overall"
                />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Visit Compliance</Card.Title>
              </Card.Header>
              <Card.Body>
                <QualityMetrics.Score
                  module="domiciliary"
                  dateRange={dateRange}
                  type="visits"
                />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Staff Performance</Card.Title>
              </Card.Header>
              <Card.Body>
                <QualityMetrics.Score
                  module="domiciliary"
                  dateRange={dateRange}
                  type="staff"
                />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Client Satisfaction</Card.Title>
              </Card.Header>
              <Card.Body>
                <QualityMetrics.Score
                  module="domiciliary"
                  dateRange={dateRange}
                  type="satisfaction"
                />
              </Card.Body>
            </Card>
          </div>

          <Card className="mt-6">
            <Card.Header>
              <Card.Title>Quality Trends</Card.Title>
            </Card.Header>
            <Card.Body>
              <QualityMetrics.TrendChart
                module="domiciliary"
                dateRange={dateRange}
                metrics={[
                  'overall',
                  'visits',
                  'staff',
                  'satisfaction'
                ]}
              />
            </Card.Body>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="visits">
          <Card>
            <Card.Header>
              <Card.Title>Visit Quality Metrics</Card.Title>
            </Card.Header>
            <Card.Body>
              <QualityMetrics.VisitQuality
                module="domiciliary"
                dateRange={dateRange}
                metrics={[
                  {
                    id: 'timeliness',
                    label: 'Visit Timeliness',
                    target: 95
                  },
                  {
                    id: 'duration',
                    label: 'Visit Duration Compliance',
                    target: 90
                  },
                  {
                    id: 'tasks',
                    label: 'Task Completion Rate',
                    target: 98
                  },
                  {
                    id: 'documentation',
                    label: 'Documentation Quality',
                    target: 95
                  }
                ]}
              />
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <Card.Title>Visit Issues</Card.Title>
            </Card.Header>
            <Card.Body>
              <QualityMetrics.IssuesList
                module="domiciliary"
                dateRange={dateRange}
                type="visits"
              />
            </Card.Body>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="staff">
          <Card>
            <Card.Header>
              <Card.Title>Staff Performance Metrics</Card.Title>
            </Card.Header>
            <Card.Body>
              <QualityMetrics.StaffPerformance
                module="domiciliary"
                dateRange={dateRange}
                metrics={[
                  {
                    id: 'punctuality',
                    label: 'Staff Punctuality',
                    target: 95
                  },
                  {
                    id: 'continuity',
                    label: 'Care Continuity',
                    target: 85
                  },
                  {
                    id: 'feedback',
                    label: 'Client Feedback',
                    target: 90
                  },
                  {
                    id: 'training',
                    label: 'Training Compliance',
                    target: 100
                  }
                ]}
              />
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <Card.Title>Staff Training & Development</Card.Title>
            </Card.Header>
            <Card.Body>
              <QualityMetrics.TrainingCompliance
                module="domiciliary"
                dateRange={dateRange}
              />
            </Card.Body>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="compliance">
          <Card>
            <Card.Header>
              <Card.Title>Regulatory Compliance</Card.Title>
            </Card.Header>
            <Card.Body>
              <QualityMetrics.ComplianceChecklist
                module="domiciliary"
                dateRange={dateRange}
                standards={[
                  {
                    id: 'cqc',
                    label: 'CQC Standards (England)',
                    items: [
                      'Safe',
                      'Effective',
                      'Caring',
                      'Responsive',
                      'Well-led'
                    ]
                  },
                  {
                    id: 'policies',
                    label: 'Policy Compliance',
                    items: [
                      'Medication Management',
                      'Safeguarding',
                      'Health & Safety',
                      'Data Protection',
                      'Mental Capacity',
                      'Equality & Diversity'
                    ]
                  }
                ]}
              />
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <Card.Title>Quality Improvement Actions</Card.Title>
            </Card.Header>
            <Card.Body>
              <QualityMetrics.ActionPlan
                module="domiciliary"
                dateRange={dateRange}
              />
            </Card.Body>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="regional">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <Card.Header>
                <Card.Title>CQC Standards (England)</Card.Title>
              </Card.Header>
              <Card.Body>
                <QualityMetrics.RegionalCompliance
                  module="domiciliary"
                  dateRange={dateRange}
                  region="england"
                  standards={[
                    {
                      id: 'fundamental',
                      label: 'Fundamental Standards',
                      items: [
                        'Person-centred care',
                        'Dignity and respect',
                        'Consent',
                        'Safety',
                        'Safeguarding from abuse',
                        'Food and drink',
                        'Premises and equipment',
                        'Complaints',
                        'Good governance',
                        'Staffing',
                        'Fit and proper staff',
                        'Duty of candour',
                        'Display of ratings'
                      ]
                    }
                  ]}
                />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>CIW Standards (Wales)</Card.Title>
              </Card.Header>
              <Card.Body>
                <QualityMetrics.RegionalCompliance
                  module="domiciliary"
                  dateRange={dateRange}
                  region="wales"
                  standards={[
                    {
                      id: 'wellbeing',
                      label: 'Well-being',
                      items: [
                        'Personal outcomes',
                        'Physical and mental health',
                        'Safeguarding',
                        'Welsh language'
                      ]
                    },
                    {
                      id: 'care_support',
                      label: 'Care and Support',
                      items: [
                        'Service delivery',
                        'Individual requirements',
                        'Personal plans'
                      ]
                    }
                  ]}
                />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Care Inspectorate Standards (Scotland)</Card.Title>
              </Card.Header>
              <Card.Body>
                <QualityMetrics.RegionalCompliance
                  module="domiciliary"
                  dateRange={dateRange}
                  region="scotland"
                  standards={[
                    {
                      id: 'health_wellbeing',
                      label: 'Health and Wellbeing',
                      items: [
                        'Human rights',
                        'Compassion',
                        'Dignity and respect',
                        'Responsive care'
                      ]
                    },
                    {
                      id: 'care_support',
                      label: 'Care and Support Planning',
                      items: [
                        'Assessment',
                        'Care planning',
                        'Responsive care and support'
                      ]
                    }
                  ]}
                />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>RQIA Standards (Northern Ireland)</Card.Title>
              </Card.Header>
              <Card.Body>
                <QualityMetrics.RegionalCompliance
                  module="domiciliary"
                  dateRange={dateRange}
                  region="northern_ireland"
                  standards={[
                    {
                      id: 'quality_care',
                      label: 'Quality of Care',
                      items: [
                        'Safe and effective care',
                        'Service user involvement',
                        'Care planning and review',
                        'Staff training and supervision'
                      ]
                    }
                  ]}
                />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>HIQA Standards (Ireland)</Card.Title>
              </Card.Header>
              <Card.Body>
                <QualityMetrics.RegionalCompliance
                  module="domiciliary"
                  dateRange={dateRange}
                  region="ireland"
                  standards={[
                    {
                      id: 'person_centered',
                      label: 'Person-Centred Care and Support',
                      items: [
                        'Rights',
                        'Dignity and consultation',
                        'Independence',
                        'Choice and control'
                      ]
                    },
                    {
                      id: 'safe_services',
                      label: 'Safe Services',
                      items: [
                        'Protection',
                        'Health and safety',
                        'Medication management',
                        'Incident management'
                      ]
                    }
                  ]}
                />
              </Card.Body>
            </Card>
          </div>

          <Card className="mt-4">
            <Card.Header>
              <Card.Title>Regional Compliance Summary</Card.Title>
            </Card.Header>
            <Card.Body>
              <QualityMetrics.RegionalSummary
                module="domiciliary"
                dateRange={dateRange}
                regions={['england', 'wales', 'scotland', 'northern_ireland', 'ireland']}
              />
            </Card.Body>
          </Card>
        </Tabs.Content>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => {/* Download report */}}
        >
          Download Report
        </Button>
        <Button
          onClick={() => {/* Schedule review */}}
        >
          Schedule Quality Review
        </Button>
      </div>
    </div>
  );
}; 