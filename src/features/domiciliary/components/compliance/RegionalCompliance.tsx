/**
 * @writecarenotes.com
 * @fileoverview Regional compliance management for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for managing regional compliance requirements across different
 * regulatory bodies (CQC, CIW, Care Inspectorate, RQIA, HIQA).
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useCompliance } from '@/features/compliance/hooks/useCompliance';
import type { ComplianceRecord, Organization } from '@/types';

interface RegionalComplianceProps {
  organization: Organization;
  onUpdate?: (record: ComplianceRecord) => void;
}

export const RegionalCompliance = ({
  organization,
  onUpdate
}: RegionalComplianceProps) => {
  const { updateCompliance } = useCompliance();
  const [activeRegion, setActiveRegion] = useState('england');
  const [compliance, setCompliance] = useState({
    england: {
      regulator: 'CQC',
      requirements: {
        fundamentalStandards: {
          personCenteredCare: { met: false, evidence: '', actions: '' },
          dignity: { met: false, evidence: '', actions: '' },
          consent: { met: false, evidence: '', actions: '' },
          safety: { met: false, evidence: '', actions: '' },
          safeguarding: { met: false, evidence: '', actions: '' },
          staffing: { met: false, evidence: '', actions: '' },
          premises: { met: false, evidence: '', actions: '' },
          complaints: { met: false, evidence: '', actions: '' },
          governance: { met: false, evidence: '', actions: '' }
        },
        keyLines: {
          safe: { rating: '', evidence: '', improvements: '' },
          effective: { rating: '', evidence: '', improvements: '' },
          caring: { rating: '', evidence: '', improvements: '' },
          responsive: { rating: '', evidence: '', improvements: '' },
          wellLed: { rating: '', evidence: '', improvements: '' }
        }
      }
    },
    wales: {
      regulator: 'CIW',
      requirements: {
        regulations: {
          serviceProvision: { met: false, evidence: '', actions: '' },
          staffing: { met: false, evidence: '', actions: '' },
          premises: { met: false, evidence: '', actions: '' },
          governance: { met: false, evidence: '', actions: '' }
        }
      }
    },
    scotland: {
      regulator: 'Care Inspectorate',
      requirements: {
        healthAndCare: {
          wellbeing: { grade: '', evidence: '', improvements: '' },
          leadership: { grade: '', evidence: '', improvements: '' },
          staffing: { grade: '', evidence: '', improvements: '' },
          care: { grade: '', evidence: '', improvements: '' },
          environment: { grade: '', evidence: '', improvements: '' }
        }
      }
    },
    northernIreland: {
      regulator: 'RQIA',
      requirements: {
        standards: {
          safety: { met: false, evidence: '', actions: '' },
          effectiveness: { met: false, evidence: '', actions: '' },
          compassion: { met: false, evidence: '', actions: '' },
          leadership: { met: false, evidence: '', actions: '' }
        }
      }
    },
    ireland: {
      regulator: 'HIQA',
      requirements: {
        standards: {
          personCentered: { met: false, evidence: '', actions: '' },
          effectiveServices: { met: false, evidence: '', actions: '' },
          safeServices: { met: false, evidence: '', actions: '' },
          health: { met: false, evidence: '', actions: '' },
          leadership: { met: false, evidence: '', actions: '' }
        }
      }
    }
  });

  const handleSubmit = async () => {
    const record = await updateCompliance({
      organizationId: organization.id,
      region: activeRegion,
      data: compliance[activeRegion as keyof typeof compliance],
      updatedAt: new Date()
    });

    onUpdate?.(record);
  };

  const renderCQCContent = () => (
    <div className="space-y-6">
      <section>
        <h3 className="font-medium mb-4">Fundamental Standards</h3>
        {Object.entries(compliance.england.requirements.fundamentalStandards).map(([standard, data]) => (
          <div key={standard} className="mb-4 p-4 border rounded-lg">
            <h4 className="text-sm font-medium capitalize mb-2">
              {standard.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.met}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    england: {
                      ...prev.england,
                      requirements: {
                        ...prev.england.requirements,
                        fundamentalStandards: {
                          ...prev.england.requirements.fundamentalStandards,
                          [standard]: {
                            ...prev.england.requirements.fundamentalStandards[standard as keyof typeof prev.england.requirements.fundamentalStandards],
                            met: e.target.checked
                          }
                        }
                      }
                    }
                  }))}
                />
                <label>Standard Met</label>
              </div>

              <div>
                <label className="text-sm">Evidence</label>
                <Textarea
                  value={data.evidence}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    england: {
                      ...prev.england,
                      requirements: {
                        ...prev.england.requirements,
                        fundamentalStandards: {
                          ...prev.england.requirements.fundamentalStandards,
                          [standard]: {
                            ...prev.england.requirements.fundamentalStandards[standard as keyof typeof prev.england.requirements.fundamentalStandards],
                            evidence: e.target.value
                          }
                        }
                      }
                    }
                  }))}
                  placeholder="Provide evidence of compliance..."
                />
              </div>

              <div>
                <label className="text-sm">Actions Required</label>
                <Textarea
                  value={data.actions}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    england: {
                      ...prev.england,
                      requirements: {
                        ...prev.england.requirements,
                        fundamentalStandards: {
                          ...prev.england.requirements.fundamentalStandards,
                          [standard]: {
                            ...prev.england.requirements.fundamentalStandards[standard as keyof typeof prev.england.requirements.fundamentalStandards],
                            actions: e.target.value
                          }
                        }
                      }
                    }
                  }))}
                  placeholder="List required actions..."
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h3 className="font-medium mb-4">Key Lines of Enquiry</h3>
        {Object.entries(compliance.england.requirements.keyLines).map(([line, data]) => (
          <div key={line} className="mb-4 p-4 border rounded-lg">
            <h4 className="text-sm font-medium capitalize mb-2">{line}</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm">Rating</label>
                <Select
                  value={data.rating}
                  onChange={(value) => setCompliance(prev => ({
                    ...prev,
                    england: {
                      ...prev.england,
                      requirements: {
                        ...prev.england.requirements,
                        keyLines: {
                          ...prev.england.requirements.keyLines,
                          [line]: {
                            ...prev.england.requirements.keyLines[line as keyof typeof prev.england.requirements.keyLines],
                            rating: value
                          }
                        }
                      }
                    }
                  }))}
                >
                  <Select.Option value="">Select Rating</Select.Option>
                  <Select.Option value="outstanding">Outstanding</Select.Option>
                  <Select.Option value="good">Good</Select.Option>
                  <Select.Option value="requires_improvement">Requires Improvement</Select.Option>
                  <Select.Option value="inadequate">Inadequate</Select.Option>
                </Select>
              </div>

              <div>
                <label className="text-sm">Evidence</label>
                <Textarea
                  value={data.evidence}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    england: {
                      ...prev.england,
                      requirements: {
                        ...prev.england.requirements,
                        keyLines: {
                          ...prev.england.requirements.keyLines,
                          [line]: {
                            ...prev.england.requirements.keyLines[line as keyof typeof prev.england.requirements.keyLines],
                            evidence: e.target.value
                          }
                        }
                      }
                    }
                  }))}
                  placeholder="Provide evidence..."
                />
              </div>

              <div>
                <label className="text-sm">Improvements Needed</label>
                <Textarea
                  value={data.improvements}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    england: {
                      ...prev.england,
                      requirements: {
                        ...prev.england.requirements,
                        keyLines: {
                          ...prev.england.requirements.keyLines,
                          [line]: {
                            ...prev.england.requirements.keyLines[line as keyof typeof prev.england.requirements.keyLines],
                            improvements: e.target.value
                          }
                        }
                      }
                    }
                  }))}
                  placeholder="List required improvements..."
                />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );

  const renderCIWContent = () => (
    <div className="space-y-6">
      <section>
        <h3 className="font-medium mb-4">CIW Regulations</h3>
        {Object.entries(compliance.wales.requirements.regulations).map(([regulation, data]) => (
          <div key={regulation} className="mb-4 p-4 border rounded-lg">
            <h4 className="text-sm font-medium capitalize mb-2">
              {regulation.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.met}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    wales: {
                      ...prev.wales,
                      requirements: {
                        ...prev.wales.requirements,
                        regulations: {
                          ...prev.wales.requirements.regulations,
                          [regulation]: {
                            ...prev.wales.requirements.regulations[regulation as keyof typeof prev.wales.requirements.regulations],
                            met: e.target.checked
                          }
                        }
                      }
                    }
                  }))}
                />
                <label>Regulation Met</label>
              </div>

              <div>
                <label className="text-sm">Evidence</label>
                <Textarea
                  value={data.evidence}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    wales: {
                      ...prev.wales,
                      requirements: {
                        ...prev.wales.requirements,
                        regulations: {
                          ...prev.wales.requirements.regulations,
                          [regulation]: {
                            ...prev.wales.requirements.regulations[regulation as keyof typeof prev.wales.requirements.regulations],
                            evidence: e.target.value
                          }
                        }
                      }
                    }
                  }))}
                  placeholder="Provide evidence of compliance..."
                />
              </div>

              <div>
                <label className="text-sm">Actions Required</label>
                <Textarea
                  value={data.actions}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    wales: {
                      ...prev.wales,
                      requirements: {
                        ...prev.wales.requirements,
                        regulations: {
                          ...prev.wales.requirements.regulations,
                          [regulation]: {
                            ...prev.wales.requirements.regulations[regulation as keyof typeof prev.wales.requirements.regulations],
                            actions: e.target.value
                          }
                        }
                      }
                    }
                  }))}
                  placeholder="List required actions..."
                />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );

  const renderCareInspectorateContent = () => (
    <div className="space-y-6">
      <section>
        <h3 className="font-medium mb-4">Health and Care Standards</h3>
        {Object.entries(compliance.scotland.requirements.healthAndCare).map(([standard, data]) => (
          <div key={standard} className="mb-4 p-4 border rounded-lg">
            <h4 className="text-sm font-medium capitalize mb-2">
              {standard.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm">Grade</label>
                <Select
                  value={data.grade}
                  onChange={(value) => setCompliance(prev => ({
                    ...prev,
                    scotland: {
                      ...prev.scotland,
                      requirements: {
                        ...prev.scotland.requirements,
                        healthAndCare: {
                          ...prev.scotland.requirements.healthAndCare,
                          [standard]: {
                            ...prev.scotland.requirements.healthAndCare[standard as keyof typeof prev.scotland.requirements.healthAndCare],
                            grade: value
                          }
                        }
                      }
                    }
                  }))}
                >
                  <Select.Option value="">Select Grade</Select.Option>
                  <Select.Option value="6">6 - Excellent</Select.Option>
                  <Select.Option value="5">5 - Very Good</Select.Option>
                  <Select.Option value="4">4 - Good</Select.Option>
                  <Select.Option value="3">3 - Adequate</Select.Option>
                  <Select.Option value="2">2 - Weak</Select.Option>
                  <Select.Option value="1">1 - Unsatisfactory</Select.Option>
                </Select>
              </div>

              <div>
                <label className="text-sm">Evidence</label>
                <Textarea
                  value={data.evidence}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    scotland: {
                      ...prev.scotland,
                      requirements: {
                        ...prev.scotland.requirements,
                        healthAndCare: {
                          ...prev.scotland.requirements.healthAndCare,
                          [standard]: {
                            ...prev.scotland.requirements.healthAndCare[standard as keyof typeof prev.scotland.requirements.healthAndCare],
                            evidence: e.target.value
                          }
                        }
                      }
                    }
                  }))}
                  placeholder="Provide evidence..."
                />
              </div>

              <div>
                <label className="text-sm">Improvements Needed</label>
                <Textarea
                  value={data.improvements}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    scotland: {
                      ...prev.scotland,
                      requirements: {
                        ...prev.scotland.requirements,
                        healthAndCare: {
                          ...prev.scotland.requirements.healthAndCare,
                          [standard]: {
                            ...prev.scotland.requirements.healthAndCare[standard as keyof typeof prev.scotland.requirements.healthAndCare],
                            improvements: e.target.value
                          }
                        }
                      }
                    }
                  }))}
                  placeholder="List required improvements..."
                />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );

  const renderRQIAContent = () => (
    <div className="space-y-6">
      <section>
        <h3 className="font-medium mb-4">RQIA Standards</h3>
        {Object.entries(compliance.northernIreland.requirements.standards).map(([standard, data]) => (
          <div key={standard} className="mb-4 p-4 border rounded-lg">
            <h4 className="text-sm font-medium capitalize mb-2">
              {standard.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.met}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    northernIreland: {
                      ...prev.northernIreland,
                      requirements: {
                        ...prev.northernIreland.requirements,
                        standards: {
                          ...prev.northernIreland.requirements.standards,
                          [standard]: {
                            ...prev.northernIreland.requirements.standards[standard as keyof typeof prev.northernIreland.requirements.standards],
                            met: e.target.checked
                          }
                        }
                      }
                    }
                  }))}
                />
                <label>Standard Met</label>
              </div>

              <div>
                <label className="text-sm">Evidence</label>
                <Textarea
                  value={data.evidence}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    northernIreland: {
                      ...prev.northernIreland,
                      requirements: {
                        ...prev.northernIreland.requirements,
                        standards: {
                          ...prev.northernIreland.requirements.standards,
                          [standard]: {
                            ...prev.northernIreland.requirements.standards[standard as keyof typeof prev.northernIreland.requirements.standards],
                            evidence: e.target.value
                          }
                        }
                      }
                    }
                  }))}
                  placeholder="Provide evidence..."
                />
              </div>

              <div>
                <label className="text-sm">Actions Required</label>
                <Textarea
                  value={data.actions}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    northernIreland: {
                      ...prev.northernIreland,
                      requirements: {
                        ...prev.northernIreland.requirements,
                        standards: {
                          ...prev.northernIreland.requirements.standards,
                          [standard]: {
                            ...prev.northernIreland.requirements.standards[standard as keyof typeof prev.northernIreland.requirements.standards],
                            actions: e.target.value
                          }
                        }
                      }
                    }
                  }))}
                  placeholder="List required actions..."
                />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );

  const renderHIQAContent = () => (
    <div className="space-y-6">
      <section>
        <h3 className="font-medium mb-4">HIQA Standards</h3>
        {Object.entries(compliance.ireland.requirements.standards).map(([standard, data]) => (
          <div key={standard} className="mb-4 p-4 border rounded-lg">
            <h4 className="text-sm font-medium capitalize mb-2">
              {standard.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.met}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    ireland: {
                      ...prev.ireland,
                      requirements: {
                        ...prev.ireland.requirements,
                        standards: {
                          ...prev.ireland.requirements.standards,
                          [standard]: {
                            ...prev.ireland.requirements.standards[standard as keyof typeof prev.ireland.requirements.standards],
                            met: e.target.checked
                          }
                        }
                      }
                    }
                  }))}
                />
                <label>Standard Met</label>
              </div>

              <div>
                <label className="text-sm">Evidence</label>
                <Textarea
                  value={data.evidence}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    ireland: {
                      ...prev.ireland,
                      requirements: {
                        ...prev.ireland.requirements,
                        standards: {
                          ...prev.ireland.requirements.standards,
                          [standard]: {
                            ...prev.ireland.requirements.standards[standard as keyof typeof prev.ireland.requirements.standards],
                            evidence: e.target.value
                          }
                        }
                      }
                    }
                  }))}
                  placeholder="Provide evidence..."
                />
              </div>

              <div>
                <label className="text-sm">Actions Required</label>
                <Textarea
                  value={data.actions}
                  onChange={(e) => setCompliance(prev => ({
                    ...prev,
                    ireland: {
                      ...prev.ireland,
                      requirements: {
                        ...prev.ireland.requirements,
                        standards: {
                          ...prev.ireland.requirements.standards,
                          [standard]: {
                            ...prev.ireland.requirements.standards[standard as keyof typeof prev.ireland.requirements.standards],
                            actions: e.target.value
                          }
                        }
                      }
                    }
                  }))}
                  placeholder="List required actions..."
                />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Regional Compliance Management</Card.Title>
          <p className="text-sm text-gray-500">
            {organization.name} • {organization.region}
          </p>
        </Card.Header>
        <Card.Body>
          <Tabs
            value={activeRegion}
            onValueChange={(value) => setActiveRegion(value)}
          >
            <Tabs.List>
              <Tabs.Trigger value="england">England (CQC)</Tabs.Trigger>
              <Tabs.Trigger value="wales">Wales (CIW)</Tabs.Trigger>
              <Tabs.Trigger value="scotland">Scotland (CI)</Tabs.Trigger>
              <Tabs.Trigger value="northernIreland">N. Ireland (RQIA)</Tabs.Trigger>
              <Tabs.Trigger value="ireland">Ireland (HIQA)</Tabs.Trigger>
            </Tabs.List>

            <div className="mt-6">
              <Tabs.Content value="england">
                {renderCQCContent()}
              </Tabs.Content>
              <Tabs.Content value="wales">
                {renderCIWContent()}
              </Tabs.Content>
              <Tabs.Content value="scotland">
                {renderCareInspectorateContent()}
              </Tabs.Content>
              <Tabs.Content value="northernIreland">
                {renderRQIAContent()}
              </Tabs.Content>
              <Tabs.Content value="ireland">
                {renderHIQAContent()}
              </Tabs.Content>
            </div>
          </Tabs>

          <Button
            className="w-full mt-6"
            size="lg"
            onClick={handleSubmit}
          >
            Update Compliance Record
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}; 