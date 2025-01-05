/**
 * @writecarenotes.com
 * @fileoverview Care package planning for domiciliary care clients
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for planning and managing care packages for domiciliary care clients.
 * Includes visit scheduling, care requirements, and service planning.
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker';
import { useCarePackage } from '@/features/care-packages/hooks/useCarePackage';
import type { CarePackage, Client } from '@/types';

interface CarePackagePlanningProps {
  client: Client;
  onComplete?: (carePackage: CarePackage) => void;
}

export const CarePackagePlanning = ({
  client,
  onComplete
}: CarePackagePlanningProps) => {
  const { createCarePackage } = useCarePackage();
  const [carePackage, setCarePackage] = useState({
    visits: {
      morning: {
        required: false,
        time: '',
        duration: 30,
        tasks: [] as string[]
      },
      lunch: {
        required: false,
        time: '',
        duration: 30,
        tasks: [] as string[]
      },
      evening: {
        required: false,
        time: '',
        duration: 30,
        tasks: [] as string[]
      },
      bedtime: {
        required: false,
        time: '',
        duration: 30,
        tasks: [] as string[]
      }
    },
    requirements: {
      personal: {
        washing: false,
        dressing: false,
        toileting: false,
        continence: false,
        mobility: false
      },
      nutrition: {
        mealPrep: false,
        feeding: false,
        hydration: false,
        dietaryReqs: ''
      },
      medication: {
        assistance: false,
        administration: false,
        monitoring: false,
        notes: ''
      }
    },
    staffing: {
      carersRequired: 1,
      specialSkills: [] as string[],
      genderPreference: '',
      notes: ''
    },
    equipment: {
      required: [] as string[],
      notes: ''
    },
    funding: {
      source: '',
      weeklyHours: 0,
      ratePerHour: 0,
      notes: ''
    }
  });

  const handleSubmit = async () => {
    const package = await createCarePackage({
      clientId: client.id,
      status: 'DRAFT',
      data: carePackage,
      startDate: new Date(),
      createdAt: new Date()
    });

    onComplete?.(package);
  };

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Care Package Planning</Card.Title>
          <p className="text-sm text-gray-500">
            {client.name} • {client.address}
          </p>
        </Card.Header>
        <Card.Body>
          <div className="space-y-6">
            {/* Visit Schedule */}
            <section>
              <h3 className="font-medium mb-4">Visit Schedule</h3>
              {Object.entries(carePackage.visits).map(([visit, data]) => (
                <div key={visit} className="mb-4 p-4 border rounded-lg">
                  <h4 className="text-sm font-medium capitalize mb-2">{visit} Visit</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-sm">Visit Time</label>
                        <TimePicker
                          value={data.time}
                          onChange={(time) => setCarePackage(prev => ({
                            ...prev,
                            visits: {
                              ...prev.visits,
                              [visit]: {
                                ...prev.visits[visit as keyof typeof prev.visits],
                                time
                              }
                            }
                          }))}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm">Duration (mins)</label>
                        <Select
                          value={data.duration.toString()}
                          onChange={(value) => setCarePackage(prev => ({
                            ...prev,
                            visits: {
                              ...prev.visits,
                              [visit]: {
                                ...prev.visits[visit as keyof typeof prev.visits],
                                duration: parseInt(value)
                              }
                            }
                          }))}
                        >
                          <Select.Option value="15">15</Select.Option>
                          <Select.Option value="30">30</Select.Option>
                          <Select.Option value="45">45</Select.Option>
                          <Select.Option value="60">60</Select.Option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm">Tasks</label>
                      <Select
                        multiple
                        value={data.tasks}
                        onChange={(values) => setCarePackage(prev => ({
                          ...prev,
                          visits: {
                            ...prev.visits,
                            [visit]: {
                              ...prev.visits[visit as keyof typeof prev.visits],
                              tasks: values as string[]
                            }
                          }
                        }))}
                      >
                        <Select.Option value="personal">Personal Care</Select.Option>
                        <Select.Option value="medication">Medication</Select.Option>
                        <Select.Option value="meals">Meals</Select.Option>
                        <Select.Option value="mobility">Mobility</Select.Option>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Care Requirements */}
            <section>
              <h3 className="font-medium mb-4">Care Requirements</h3>
              
              {/* Personal Care */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Personal Care</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(carePackage.requirements.personal).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setCarePackage(prev => ({
                          ...prev,
                          requirements: {
                            ...prev.requirements,
                            personal: {
                              ...prev.requirements.personal,
                              [key]: e.target.checked
                            }
                          }
                        }))}
                      />
                      <label className="capitalize">{key}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Nutrition</h4>
                <div className="space-y-2">
                  {Object.entries(carePackage.requirements.nutrition).map(([key, value]) => (
                    <div key={key}>
                      {typeof value === 'boolean' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setCarePackage(prev => ({
                              ...prev,
                              requirements: {
                                ...prev.requirements,
                                nutrition: {
                                  ...prev.requirements.nutrition,
                                  [key]: e.target.checked
                                }
                              }
                            }))}
                          />
                          <label className="capitalize">{key}</label>
                        </div>
                      ) : (
                        <div>
                          <label className="text-sm">Dietary Requirements</label>
                          <Textarea
                            value={value}
                            onChange={(e) => setCarePackage(prev => ({
                              ...prev,
                              requirements: {
                                ...prev.requirements,
                                nutrition: {
                                  ...prev.requirements.nutrition,
                                  [key]: e.target.value
                                }
                              }
                            }))}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Medication */}
              <div>
                <h4 className="text-sm font-medium mb-2">Medication</h4>
                <div className="space-y-2">
                  {Object.entries(carePackage.requirements.medication).map(([key, value]) => (
                    <div key={key}>
                      {typeof value === 'boolean' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setCarePackage(prev => ({
                              ...prev,
                              requirements: {
                                ...prev.requirements,
                                medication: {
                                  ...prev.requirements.medication,
                                  [key]: e.target.checked
                                }
                              }
                            }))}
                          />
                          <label className="capitalize">{key}</label>
                        </div>
                      ) : (
                        <div>
                          <label className="text-sm">Medication Notes</label>
                          <Textarea
                            value={value}
                            onChange={(e) => setCarePackage(prev => ({
                              ...prev,
                              requirements: {
                                ...prev.requirements,
                                medication: {
                                  ...prev.requirements.medication,
                                  [key]: e.target.value
                                }
                              }
                            }))}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Staffing Requirements */}
            <section>
              <h3 className="font-medium mb-4">Staffing Requirements</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm">Number of Carers Required</label>
                  <Select
                    value={carePackage.staffing.carersRequired.toString()}
                    onChange={(value) => setCarePackage(prev => ({
                      ...prev,
                      staffing: {
                        ...prev.staffing,
                        carersRequired: parseInt(value)
                      }
                    }))}
                  >
                    <Select.Option value="1">1</Select.Option>
                    <Select.Option value="2">2</Select.Option>
                    <Select.Option value="3">3</Select.Option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm">Special Skills Required</label>
                  <Select
                    multiple
                    value={carePackage.staffing.specialSkills}
                    onChange={(values) => setCarePackage(prev => ({
                      ...prev,
                      staffing: {
                        ...prev.staffing,
                        specialSkills: values as string[]
                      }
                    }))}
                  >
                    <Select.Option value="hoisting">Hoisting</Select.Option>
                    <Select.Option value="peg">PEG Feeding</Select.Option>
                    <Select.Option value="catheter">Catheter Care</Select.Option>
                    <Select.Option value="dementia">Dementia Care</Select.Option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm">Gender Preference</label>
                  <Select
                    value={carePackage.staffing.genderPreference}
                    onChange={(value) => setCarePackage(prev => ({
                      ...prev,
                      staffing: {
                        ...prev.staffing,
                        genderPreference: value
                      }
                    }))}
                  >
                    <Select.Option value="">No Preference</Select.Option>
                    <Select.Option value="female">Female</Select.Option>
                    <Select.Option value="male">Male</Select.Option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm">Additional Notes</label>
                  <Textarea
                    value={carePackage.staffing.notes}
                    onChange={(e) => setCarePackage(prev => ({
                      ...prev,
                      staffing: {
                        ...prev.staffing,
                        notes: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>
            </section>

            {/* Funding */}
            <section>
              <h3 className="font-medium mb-4">Funding Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm">Funding Source</label>
                  <Select
                    value={carePackage.funding.source}
                    onChange={(value) => setCarePackage(prev => ({
                      ...prev,
                      funding: {
                        ...prev.funding,
                        source: value
                      }
                    }))}
                  >
                    <Select.Option value="local">Local Authority</Select.Option>
                    <Select.Option value="private">Private</Select.Option>
                    <Select.Option value="chc">CHC Funded</Select.Option>
                    <Select.Option value="mixed">Mixed</Select.Option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm">Weekly Hours</label>
                  <Input
                    type="number"
                    value={carePackage.funding.weeklyHours}
                    onChange={(e) => setCarePackage(prev => ({
                      ...prev,
                      funding: {
                        ...prev.funding,
                        weeklyHours: parseFloat(e.target.value)
                      }
                    }))}
                  />
                </div>

                <div>
                  <label className="text-sm">Rate per Hour (£)</label>
                  <Input
                    type="number"
                    value={carePackage.funding.ratePerHour}
                    onChange={(e) => setCarePackage(prev => ({
                      ...prev,
                      funding: {
                        ...prev.funding,
                        ratePerHour: parseFloat(e.target.value)
                      }
                    }))}
                  />
                </div>

                <div>
                  <label className="text-sm">Funding Notes</label>
                  <Textarea
                    value={carePackage.funding.notes}
                    onChange={(e) => setCarePackage(prev => ({
                      ...prev,
                      funding: {
                        ...prev.funding,
                        notes: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>
            </section>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
            >
              Create Care Package
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}; 