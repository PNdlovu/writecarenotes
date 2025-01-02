/**
 * @writecarenotes.com
 * @fileoverview Home environment assessment for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for conducting home environment assessments for domiciliary care clients.
 * Includes safety checks, accessibility evaluation, and risk assessments.
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAssessment } from '@/features/assessments/hooks/useAssessment';
import type { Assessment, Client } from '@/types';

interface HomeEnvironmentAssessmentProps {
  client: Client;
  onComplete?: (assessment: Assessment) => void;
}

export const HomeEnvironmentAssessment = ({ 
  client,
  onComplete 
}: HomeEnvironmentAssessmentProps) => {
  const { createAssessment } = useAssessment();
  const [sections, setSections] = useState({
    access: {
      keyLocation: '',
      parkingAvailable: false,
      accessNotes: ''
    },
    safety: {
      hazardsIdentified: [] as string[],
      safetyMeasures: [] as string[],
      safetyNotes: ''
    },
    facilities: {
      bathroom: {
        accessible: false,
        adaptations: [] as string[],
        notes: ''
      },
      kitchen: {
        accessible: false,
        adaptations: [] as string[],
        notes: ''
      },
      bedroom: {
        accessible: false,
        adaptations: [] as string[],
        notes: ''
      }
    },
    equipment: {
      required: [] as string[],
      available: [] as string[],
      notes: ''
    }
  });

  const handleSubmit = async () => {
    const assessment = await createAssessment({
      type: 'HOME_ENVIRONMENT',
      clientId: client.id,
      status: 'COMPLETED',
      data: sections,
      completedAt: new Date()
    });

    onComplete?.(assessment);
  };

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Home Environment Assessment</Card.Title>
          <p className="text-sm text-gray-500">
            {client.name} • {client.address}
          </p>
        </Card.Header>
        <Card.Body>
          <div className="space-y-6">
            {/* Access Section */}
            <section>
              <h3 className="font-medium mb-4">Access & Security</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Key Location</label>
                  <Input
                    value={sections.access.keyLocation}
                    onChange={(e) => setSections(prev => ({
                      ...prev,
                      access: {
                        ...prev.access,
                        keyLocation: e.target.value
                      }
                    }))}
                    placeholder="e.g., Key safe at front door"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={sections.access.parkingAvailable}
                    onCheckedChange={(checked) => setSections(prev => ({
                      ...prev,
                      access: {
                        ...prev.access,
                        parkingAvailable: checked
                      }
                    }))}
                  />
                  <label>Parking Available</label>
                </div>

                <div>
                  <label className="text-sm font-medium">Access Notes</label>
                  <Textarea
                    value={sections.access.accessNotes}
                    onChange={(e) => setSections(prev => ({
                      ...prev,
                      access: {
                        ...prev.access,
                        accessNotes: e.target.value
                      }
                    }))}
                    placeholder="Any additional access information..."
                  />
                </div>
              </div>
            </section>

            {/* Safety Section */}
            <section>
              <h3 className="font-medium mb-4">Safety Assessment</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Hazards Identified</label>
                  <Select
                    multiple
                    value={sections.safety.hazardsIdentified}
                    onChange={(values) => setSections(prev => ({
                      ...prev,
                      safety: {
                        ...prev.safety,
                        hazardsIdentified: values as string[]
                      }
                    }))}
                  >
                    <Select.Option value="trip">Trip Hazards</Select.Option>
                    <Select.Option value="electrical">Electrical Hazards</Select.Option>
                    <Select.Option value="fire">Fire Risks</Select.Option>
                    <Select.Option value="other">Other</Select.Option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Safety Notes</label>
                  <Textarea
                    value={sections.safety.safetyNotes}
                    onChange={(e) => setSections(prev => ({
                      ...prev,
                      safety: {
                        ...prev.safety,
                        safetyNotes: e.target.value
                      }
                    }))}
                    placeholder="Details of safety concerns and recommendations..."
                  />
                </div>
              </div>
            </section>

            {/* Facilities Section */}
            <section>
              <h3 className="font-medium mb-4">Facilities Assessment</h3>
              {Object.entries(sections.facilities).map(([room, data]) => (
                <div key={room} className="mb-4">
                  <h4 className="text-sm font-medium capitalize mb-2">{room}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={data.accessible}
                        onCheckedChange={(checked) => setSections(prev => ({
                          ...prev,
                          facilities: {
                            ...prev.facilities,
                            [room]: {
                              ...prev.facilities[room as keyof typeof prev.facilities],
                              accessible: checked
                            }
                          }
                        }))}
                      />
                      <label>Accessible</label>
                    </div>

                    <div>
                      <label className="text-sm">Notes</label>
                      <Textarea
                        value={data.notes}
                        onChange={(e) => setSections(prev => ({
                          ...prev,
                          facilities: {
                            ...prev.facilities,
                            [room]: {
                              ...prev.facilities[room as keyof typeof prev.facilities],
                              notes: e.target.value
                            }
                          }
                        }))}
                        placeholder={`Notes about ${room} accessibility...`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Equipment Section */}
            <section>
              <h3 className="font-medium mb-4">Equipment Assessment</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Required Equipment</label>
                  <Select
                    multiple
                    value={sections.equipment.required}
                    onChange={(values) => setSections(prev => ({
                      ...prev,
                      equipment: {
                        ...prev.equipment,
                        required: values as string[]
                      }
                    }))}
                  >
                    <Select.Option value="hoist">Hoist</Select.Option>
                    <Select.Option value="bed">Profiling Bed</Select.Option>
                    <Select.Option value="chair">Rise & Recline Chair</Select.Option>
                    <Select.Option value="other">Other</Select.Option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Equipment Notes</label>
                  <Textarea
                    value={sections.equipment.notes}
                    onChange={(e) => setSections(prev => ({
                      ...prev,
                      equipment: {
                        ...prev.equipment,
                        notes: e.target.value
                      }
                    }))}
                    placeholder="Details of equipment requirements..."
                  />
                </div>
              </div>
            </section>

            <Button 
              className="w-full"
              size="lg"
              onClick={handleSubmit}
            >
              Complete Assessment
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}; 