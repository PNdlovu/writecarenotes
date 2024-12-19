import React from 'react';
import { useCarePlan } from '../hooks/useCarePlan';
import { createCarePlanTemplate } from '../templates';
import { CarePlan, CarePlanCategory } from '../types';
import { CareType } from '@/features/carehome/types';
import { Region } from '@/types/region';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast/use-toast';
import { Spinner } from '@/components/ui/loading/spinner';
import { useAccess } from '@/features/access-management/hooks/useAccess';
import { ResourceType, PermissionAction } from '@/features/access-management/types';

interface CarePlanManagerProps {
    residentId: string;
    careHomeId: string;
    careType: CareType;
    region: Region;
    ageGroup: 'CHILD' | 'ADULT' | 'ELDERLY';
}

export const CarePlanManager: React.FC<CarePlanManagerProps> = ({
    residentId,
    careHomeId,
    careType,
    region,
    ageGroup
}) => {
    const { toast } = useToast();
    const {
        isAllowed: canManagePlan,
        isLoading: accessLoading,
        requestEmergencyAccess
    } = useAccess({
        resourceType: ResourceType.CARE_PLAN,
        resourceId: residentId,
        action: PermissionAction.UPDATE
    });

    const {
        carePlan,
        isLoading,
        error,
        createCarePlan,
        updateCarePlan,
        addIntervention,
        updateIntervention,
        addObjective,
        updateObjective
    } = useCarePlan(residentId);

    const handleCreatePlan = async () => {
        try {
            // Create a new care plan using the appropriate template
            const template = createCarePlanTemplate(careType, region, ageGroup);
            const newPlan: Partial<CarePlan> = {
                residentId,
                careHomeId,
                careLevel: template.careLevel,
                categories: template.categories,
                interventions: template.defaultInterventions?.map(intervention => ({
                    ...intervention,
                    id: crypto.randomUUID()
                })) || [],
                objectives: template.defaultObjectives?.map(objective => ({
                    ...objective,
                    id: crypto.randomUUID()
                })) || [],
                risks: template.defaultRisks?.map(risk => ({
                    ...risk,
                    id: crypto.randomUUID()
                })) || [],
                reviewFrequency: template.reviewFrequency,
                version: 1,
                startDate: new Date()
            };

            await createCarePlan(newPlan);
            toast({
                title: 'Success',
                description: 'Care plan created successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create care plan',
                variant: 'destructive',
            });
        }
    };

    if (accessLoading || isLoading) {
        return <Spinner />;
    }

    if (!canManagePlan) {
        return (
            <Card className="p-4">
                <p className="text-red-500">You don't have permission to manage this care plan.</p>
                <Button 
                    onClick={() => requestEmergencyAccess('Urgent care plan update required')}
                    className="mt-4"
                >
                    Request Emergency Access
                </Button>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-4">
                <p className="text-red-500">Error loading care plan: {error.message}</p>
                <Button onClick={handleCreatePlan} className="mt-4">
                    Create New Care Plan
                </Button>
            </Card>
        );
    }

    if (!carePlan) {
        return (
            <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">No Care Plan Found</h2>
                <p className="mb-4">Create a new care plan using the appropriate template</p>
                <Button onClick={handleCreatePlan}>
                    Create Care Plan
                </Button>
            </Card>
        );
    }

    // Determine which tabs to show based on care type and age group
    const getTabs = () => {
        const commonTabs = [
            { value: 'overview', label: 'Overview' },
            { value: 'health', label: 'Health & Wellbeing' },
            { value: 'risks', label: 'Risks & Safety' }
        ];

        const specializedTabs = {
            CHILD: [
                { value: 'education', label: 'Education' },
                { value: 'development', label: 'Development' },
                { value: 'safeguarding', label: 'Safeguarding' },
                { value: 'family', label: 'Family Contact' }
            ],
            ADULT: [
                { value: 'independence', label: 'Independence' },
                { value: 'activities', label: 'Activities' },
                { value: 'community', label: 'Community' }
            ],
            ELDERLY: [
                { value: 'mobility', label: 'Mobility' },
                { value: 'activities', label: 'Activities' },
                { value: 'memory', label: 'Memory Support' }
            ]
        };

        const careTabs = {
            NURSING: [{ value: 'nursing', label: 'Nursing Care' }],
            DEMENTIA: [{ value: 'cognitive', label: 'Cognitive Support' }],
            PALLIATIVE: [{ value: 'palliative', label: 'Palliative Care' }],
            MENTAL_HEALTH: [{ value: 'mental-health', label: 'Mental Health' }, { value: 'behavioral-support', label: 'Behavioral Support' }],
            PHYSICAL_DISABILITY: [{ value: 'physical-support', label: 'Physical Support' }],
            LEARNING_DISABILITY: [{ value: 'learning-support', label: 'Learning Support' }]
        };

        return [
            ...commonTabs,
            ...specializedTabs[ageGroup],
            ...(careTabs[careType] || []),
            { value: 'cultural-care', label: 'Cultural Care' },
            { value: 'transition-plan', label: 'Transition Plan' },
            { value: 'advanced-care', label: 'Advanced Care Planning' },
            { value: 'telehealth', label: 'Telehealth Services' },
            { value: 'visitor-management', label: 'Visitor Management' },
            { value: 'room-preferences', label: 'Room Preferences' },
            { value: 'daily-routines', label: 'Daily Routines' },
            { value: 'social-engagement', label: 'Social Engagement' },
            { value: 'end-of-life', label: 'End of Life Care' },
            { value: 'quality-of-life', label: 'Quality of Life' }
        ];
    };

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <h2 className="text-xl font-semibold mb-2">Care Plan</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Last updated: {new Date(carePlan.updatedAt).toLocaleDateString()}
                </p>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    {getTabs().map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Common Tabs Content */}
                <TabsContent value="overview" className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Active Objectives</h3>
                        <div className="space-y-2">
                            {carePlan.objectives.map(objective => (
                                <div key={objective.id} className="p-2 border rounded">
                                    <p className="font-medium">{objective.description}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Status: {objective.status}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Current Interventions</h3>
                        <div className="space-y-2">
                            {carePlan.interventions.map(intervention => (
                                <div key={intervention.id} className="p-2 border rounded">
                                    <p className="font-medium">{intervention.description}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Frequency: {intervention.frequency}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                {/* Age-specific Tabs Content */}
                {ageGroup === 'CHILD' && (
                    <>
                        <TabsContent value="education" className="space-y-4">
                            <Card className="p-4">
                                <h3 className="text-lg font-semibold mb-2">Educational Support</h3>
                                {carePlan.educationalSupport ? (
                                    <>
                                        <p>Setting: {carePlan.educationalSupport.educationalSetting}</p>
                                        <p>Current Level: {carePlan.educationalSupport.currentLevel}</p>
                                        <div className="mt-2">
                                            <h4 className="font-medium">Goals:</h4>
                                            <ul className="list-disc pl-4">
                                                {carePlan.educationalSupport.educationalGoals?.map((goal, index) => (
                                                    <li key={index}>{goal}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <p>No educational support details available</p>
                                )}
                            </Card>
                        </TabsContent>

                        <TabsContent value="development" className="space-y-4">
                            <Card className="p-4">
                                <h3 className="text-lg font-semibold mb-2">Developmental Progress</h3>
                                {carePlan.interventions
                                    .filter(i => i.category === CarePlanCategory.DEVELOPMENTAL_SUPPORT)
                                    .map(intervention => (
                                        <div key={intervention.id} className="mt-2 p-2 border rounded">
                                            <p className="font-medium">{intervention.description}</p>
                                            <p className="text-sm">Status: {intervention.status}</p>
                                        </div>
                                    ))}
                            </Card>
                        </TabsContent>
                    </>
                )}

                {/* Care Type-specific Tabs Content */}
                {careType === 'NURSING' && (
                    <TabsContent value="nursing" className="space-y-4">
                        <Card className="p-4">
                            <h3 className="text-lg font-semibold mb-2">Nursing Care</h3>
                            {/* Add nursing-specific content */}
                        </Card>
                    </TabsContent>
                )}

                {careType === 'DEMENTIA' && (
                    <TabsContent value="cognitive" className="space-y-4">
                        <Card className="p-4">
                            <h3 className="text-lg font-semibold mb-2">Cognitive Support</h3>
                            {/* Add dementia-specific content */}
                        </Card>
                    </TabsContent>
                )}

                {careType === 'MENTAL_HEALTH' && (
                    <>
                        <TabsContent value="mental-health" className="space-y-4">
                            <Card className="p-4">
                                <h3 className="text-lg font-semibold mb-2">Mental Health Status</h3>
                                <div className="space-y-4">
                                    {carePlan.interventions
                                        .filter(i => i.category === 'MENTAL_HEALTH')
                                        .map(intervention => (
                                            <div key={intervention.id} className="p-2 border rounded">
                                                <p className="font-medium">{intervention.description}</p>
                                                <p className="text-sm">Status: {intervention.status}</p>
                                                <p className="text-sm">Frequency: {intervention.frequency}</p>
                                            </div>
                                        ))}
                                </div>
                            </Card>

                            <Card className="p-4">
                                <h3 className="text-lg font-semibold mb-2">Crisis Management</h3>
                                <div className="space-y-4">
                                    {carePlan.interventions
                                        .filter(i => i.category === 'CRISIS_INTERVENTION')
                                        .map(intervention => (
                                            <div key={intervention.id} className="p-2 border rounded">
                                                <p className="font-medium">{intervention.description}</p>
                                                <p className="text-sm">Status: {intervention.status}</p>
                                                <p className="text-sm">Instructions: {intervention.instructions}</p>
                                            </div>
                                        ))}
                                </div>
                            </Card>

                            <Card className="p-4">
                                <h3 className="text-lg font-semibold mb-2">Therapeutic Support</h3>
                                <div className="space-y-4">
                                    {carePlan.therapeuticInterventions?.map((intervention, index) => (
                                        <div key={index} className="p-2 border rounded">
                                            <p className="font-medium">Type: {intervention.type}</p>
                                            <p>Provider: {intervention.provider}</p>
                                            <p>Frequency: {intervention.frequency}</p>
                                            <div className="mt-2">
                                                <h4 className="font-medium">Goals:</h4>
                                                <ul className="list-disc pl-4">
                                                    {intervention.goals.map((goal, idx) => (
                                                        <li key={idx}>{goal}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-4">
                                <h3 className="text-lg font-semibold mb-2">Medication Management</h3>
                                <div className="space-y-4">
                                    {carePlan.medications?.map((medication, index) => (
                                        <div key={index} className="p-2 border rounded">
                                            <p className="font-medium">{medication.name}</p>
                                            <p>Dosage: {medication.dosage}</p>
                                            <p>Frequency: {medication.frequency}</p>
                                            <p>Route: {medication.route}</p>
                                            {medication.notes && medication.notes.length > 0 && (
                                                <div className="mt-2">
                                                    <h4 className="font-medium">Notes:</h4>
                                                    <ul className="list-disc pl-4">
                                                        {medication.notes.map((note, idx) => (
                                                            <li key={idx}>{note}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-4">
                                <h3 className="text-lg font-semibold mb-2">Mental Capacity</h3>
                                <div className="space-y-4">
                                    {carePlan.mentalCapacity?.assessments.map((assessment, index) => (
                                        <div key={index} className="p-2 border rounded">
                                            <p className="font-medium">Decision: {assessment.decision}</p>
                                            <p>Outcome: {assessment.outcome}</p>
                                            <p>Reviewed by: {assessment.reviewer}</p>
                                            <p>Date: {new Date(assessment.date).toLocaleDateString()}</p>
                                            <p>Next Review: {new Date(assessment.nextReview).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="behavioral-support" className="space-y-4">
                            <Card className="p-4">
                                <h3 className="text-lg font-semibold mb-2">Behavioral Support Plan</h3>
                                {carePlan.behavioralSupport && (
                                    <div className="space-y-4">
                                        <div className="p-2 border rounded">
                                            <h4 className="font-medium">Triggers</h4>
                                            <ul className="list-disc pl-4">
                                                {carePlan.behavioralSupport.triggers?.map((trigger, index) => (
                                                    <li key={index}>{trigger}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-2 border rounded">
                                            <h4 className="font-medium">Preventive Strategies</h4>
                                            <ul className="list-disc pl-4">
                                                {carePlan.behavioralSupport.preventiveStrategies?.map((strategy, index) => (
                                                    <li key={index}>{strategy}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-2 border rounded">
                                            <h4 className="font-medium">De-escalation Techniques</h4>
                                            <ul className="list-disc pl-4">
                                                {carePlan.behavioralSupport.deescalationTechniques?.map((technique, index) => (
                                                    <li key={index}>{technique}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        {carePlan.behavioralSupport.restrictivePractices && (
                                            <div className="p-2 border rounded">
                                                <h4 className="font-medium">Approved Restrictive Practices</h4>
                                                <ul className="list-disc pl-4">
                                                    {carePlan.behavioralSupport.restrictivePractices.approved.map((practice, index) => (
                                                        <li key={index}>{practice}</li>
                                                    ))}
                                                </ul>
                                                <p className="mt-2">
                                                    Last reviewed: {new Date(carePlan.behavioralSupport.restrictivePractices.lastReviewed).toLocaleDateString()}
                                                </p>
                                                <p>
                                                    Authorized by: {carePlan.behavioralSupport.restrictivePractices.authorizedBy}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </TabsContent>
                    </>
                )}

                {/* Cultural Care Section */}
                <TabsContent value="cultural-care" className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Cultural and Language Preferences</h3>
                        <div className="space-y-4">
                            {carePlan.culturalCare && (
                                <>
                                    <div className="p-2 border rounded">
                                        <h4 className="font-medium">Language</h4>
                                        <p>Primary: {carePlan.culturalCare.primaryLanguage}</p>
                                        {carePlan.culturalCare.otherLanguages.length > 0 && (
                                            <p>Other Languages: {carePlan.culturalCare.otherLanguages.join(', ')}</p>
                                        )}
                                        <div className="mt-2">
                                            <h5 className="font-medium">Communication Preferences</h5>
                                            <p>Preferred Method: {carePlan.culturalCare.communicationPreferences.preferredMethod}</p>
                                            {carePlan.culturalCare.communicationPreferences.requiresInterpreter && (
                                                <p>Interpreter Required: {carePlan.culturalCare.communicationPreferences.interpreterDetails}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-2 border rounded">
                                        <h4 className="font-medium">Cultural Considerations</h4>
                                        {carePlan.culturalCare.religionBeliefs && (
                                            <p>Religion/Beliefs: {carePlan.culturalCare.religionBeliefs}</p>
                                        )}
                                        <div className="mt-2">
                                            <h5 className="font-medium">Customs and Traditions</h5>
                                            <ul className="list-disc pl-4">
                                                {carePlan.culturalCare.customsAndTraditions.map((custom, index) => (
                                                    <li key={index}>{custom}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                </TabsContent>

                {/* Transition Planning Section */}
                <TabsContent value="transition-plan" className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Transition Plan</h3>
                        {carePlan.transitionPlan && (
                            <div className="space-y-4">
                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Transition Details</h4>
                                    <p>Type: {carePlan.transitionPlan.type}</p>
                                    <p>From: {carePlan.transitionPlan.currentService}</p>
                                    <p>To: {carePlan.transitionPlan.targetService}</p>
                                    <p>Start Date: {new Date(carePlan.transitionPlan.startDate).toLocaleDateString()}</p>
                                    <p>Target Date: {new Date(carePlan.transitionPlan.targetDate).toLocaleDateString()}</p>
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Transition Steps</h4>
                                    <div className="space-y-2">
                                        {carePlan.transitionPlan.transitionSteps.map((step, index) => (
                                            <div key={index} className="p-2 bg-gray-50 rounded">
                                                <p className="font-medium">{step.step}</p>
                                                <p>Status: {step.status}</p>
                                                <p>Due: {new Date(step.dueDate).toLocaleDateString()}</p>
                                                {step.completedDate && (
                                                    <p>Completed: {new Date(step.completedDate).toLocaleDateString()}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Risk Assessment</h4>
                                    <div className="space-y-2">
                                        {carePlan.transitionPlan.riskAssessment.map((risk, index) => (
                                            <div key={index} className="p-2 bg-gray-50 rounded">
                                                <p className="font-medium">{risk.risk}</p>
                                                <p>Mitigation: {risk.mitigation}</p>
                                                <p>Status: {risk.status}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Advanced Care Planning Section */}
                <TabsContent value="advanced-care" className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Advanced Care Planning</h3>
                        {carePlan.advancedCarePlan && (
                            <div className="space-y-4">
                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Care Decisions</h4>
                                    <div className="space-y-2">
                                        {carePlan.advancedCarePlan.decisions.map((decision, index) => (
                                            <div key={index} className="p-2 bg-gray-50 rounded">
                                                <p className="font-medium">{decision.type}</p>
                                                <p>Decision: {decision.decision}</p>
                                                <p>Details: {decision.details}</p>
                                                <p>Recorded: {new Date(decision.dateRecorded).toLocaleDateString()}</p>
                                                <p>Review Due: {new Date(decision.reviewDate).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {carePlan.advancedCarePlan.powerOfAttorney && (
                                    <div className="p-2 border rounded">
                                        <h4 className="font-medium">Power of Attorney</h4>
                                        <p>Type: {carePlan.advancedCarePlan.powerOfAttorney.type.join(', ')}</p>
                                        <div className="mt-2">
                                            <h5 className="font-medium">Attorney Details</h5>
                                            {carePlan.advancedCarePlan.powerOfAttorney.attorneyDetails.map((attorney, index) => (
                                                <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                                    <p>Name: {attorney.name}</p>
                                                    <p>Relationship: {attorney.relationship}</p>
                                                    <p>Contact: {attorney.contactDetails}</p>
                                                    <p>Scope: {attorney.scope}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Telehealth Services Section */}
                <TabsContent value="telehealth" className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Telehealth Services</h3>
                        <div className="space-y-4">
                            {carePlan.telehealthServices?.map((service, index) => (
                                <div key={index} className="p-2 border rounded">
                                    <h4 className="font-medium">{service.type}</h4>
                                    <p>Provider: {service.provider}</p>
                                    
                                    <div className="mt-2">
                                        <h5 className="font-medium">Schedule</h5>
                                        <p>Frequency: {service.schedule.frequency}</p>
                                        <p>Duration: {service.schedule.duration} minutes</p>
                                        <p>Start Date: {new Date(service.schedule.startDate).toLocaleDateString()}</p>
                                        {service.schedule.endDate && (
                                            <p>End Date: {new Date(service.schedule.endDate).toLocaleDateString()}</p>
                                        )}
                                    </div>

                                    <div className="mt-2">
                                        <h5 className="font-medium">Equipment</h5>
                                        <ul className="list-disc pl-4">
                                            {service.equipment.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-2">
                                        <h5 className="font-medium">Technical Support</h5>
                                        <p>Contact: {service.technicalSupport.contactName}</p>
                                        <p>Number: {service.technicalSupport.contactNumber}</p>
                                        <p>Hours: {service.technicalSupport.availabilityHours}</p>
                                    </div>

                                    <div className="mt-2">
                                        <h5 className="font-medium">Outcomes</h5>
                                        {service.outcomes.map((outcome, idx) => (
                                            <div key={idx} className="p-2 bg-gray-50 rounded mt-1">
                                                <p>Date: {new Date(outcome.date).toLocaleDateString()}</p>
                                                <p>Outcome: {outcome.outcome}</p>
                                                {outcome.followUp && <p>Follow-up: {outcome.followUp}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                {/* Visitor Management Section */}
                <TabsContent value="visitor-management" className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Visitor Management</h3>
                        {carePlan.visitorManagement && (
                            <div className="space-y-4">
                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Allowed Visitors</h4>
                                    {carePlan.visitorManagement.allowedVisitors.map((visitor, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                            <p>Name: {visitor.name}</p>
                                            <p>Type: {visitor.type}</p>
                                            <p>Relationship: {visitor.relationship}</p>
                                            {visitor.restrictions && (
                                                <p>Restrictions: {visitor.restrictions}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Visiting Preferences</h4>
                                    <p>Preferred Times: {carePlan.visitorManagement.visitingPreferences.preferredTimes.join(', ')}</p>
                                    <p>Maximum Visitors: {carePlan.visitorManagement.visitingPreferences.maximumVisitors}</p>
                                    <p>Location: {carePlan.visitorManagement.visitingPreferences.visitLocation}</p>
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Recent Visits</h4>
                                    {carePlan.visitorManagement.visitLog.slice(-5).map((visit, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                            <p>Date: {new Date(visit.date).toLocaleDateString()}</p>
                                            <p>Visitor: {visit.visitorName}</p>
                                            <p>Duration: {visit.duration} minutes</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Room Preferences Section */}
                <TabsContent value="room-preferences" className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Room and Environment</h3>
                        {carePlan.roomPreferences && (
                            <div className="space-y-4">
                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Room Preferences</h4>
                                    <p>Current Room: {carePlan.roomPreferences.currentRoom}</p>
                                    <div className="mt-2">
                                        <h5 className="font-medium">Preferences:</h5>
                                        <ul className="list-disc pl-4">
                                            {carePlan.roomPreferences.preferences.map((pref, index) => (
                                                <li key={index}>{pref}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Environmental Needs</h4>
                                    {carePlan.roomPreferences.environmentalNeeds.temperature && (
                                        <p>Temperature: {carePlan.roomPreferences.environmentalNeeds.temperature}</p>
                                    )}
                                    {carePlan.roomPreferences.environmentalNeeds.lighting && (
                                        <p>Lighting: {carePlan.roomPreferences.environmentalNeeds.lighting}</p>
                                    )}
                                    {carePlan.roomPreferences.environmentalNeeds.noise && (
                                        <p>Noise Level: {carePlan.roomPreferences.environmentalNeeds.noise}</p>
                                    )}
                                    <div className="mt-2">
                                        <h5 className="font-medium">Accessibility Requirements:</h5>
                                        <ul className="list-disc pl-4">
                                            {carePlan.roomPreferences.environmentalNeeds.accessibility.map((req, index) => (
                                                <li key={index}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Personal Items</h4>
                                    <ul className="list-disc pl-4">
                                        {carePlan.roomPreferences.personalItems.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Daily Routines Section */}
                <TabsContent value="daily-routines" className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Daily Routines</h3>
                        {carePlan.dailyRoutines && (
                            <div className="space-y-4">
                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Schedule Type: {carePlan.dailyRoutines.routineType}</h4>
                                    <p>Wake Time: {carePlan.dailyRoutines.preferences.wakeTime}</p>
                                    <p>Bed Time: {carePlan.dailyRoutines.preferences.bedTime}</p>
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Daily Schedule</h4>
                                    {carePlan.dailyRoutines.schedule.map((item, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                            <p>Time: {item.time}</p>
                                            <p>Activity: {item.activity}</p>
                                            <p>Assistance: {item.assistance}</p>
                                            {item.notes && <p>Notes: {item.notes}</p>}
                                        </div>
                                    ))}
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Meal Times</h4>
                                    {carePlan.dailyRoutines.preferences.mealtimes.map((meal, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                            <p>Meal: {meal.meal}</p>
                                            <p>Time: {meal.preferredTime}</p>
                                            <p>Location: {meal.location}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Personal Care Preferences</h4>
                                    <p>Level: {carePlan.dailyRoutines.preferences.personalCare.preference}</p>
                                    {carePlan.dailyRoutines.preferences.personalCare.specificRequirements && (
                                        <p>Requirements: {carePlan.dailyRoutines.preferences.personalCare.specificRequirements}</p>
                                    )}
                                    {carePlan.dailyRoutines.preferences.personalCare.preferredStaff && (
                                        <div className="mt-2">
                                            <h5 className="font-medium">Preferred Staff:</h5>
                                            <ul className="list-disc pl-4">
                                                {carePlan.dailyRoutines.preferences.personalCare.preferredStaff.map((staff, index) => (
                                                    <li key={index}>{staff}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Social Engagement Section */}
                <TabsContent value="social-engagement" className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Social Activities</h3>
                        {carePlan.socialEngagement && (
                            <div className="space-y-4">
                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Preferred Activities</h4>
                                    <p>Group Size Preference: {carePlan.socialEngagement.groupPreference}</p>
                                    <div className="mt-2">
                                        <ul className="list-disc pl-4">
                                            {carePlan.socialEngagement.preferredActivities.map((activity, index) => (
                                                <li key={index}>{activity}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Activity Schedule</h4>
                                    {carePlan.socialEngagement.activitySchedule.map((activity, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                            <p>Activity: {activity.activity}</p>
                                            <p>When: {activity.dayOfWeek} at {activity.time}</p>
                                            <p>Location: {activity.location}</p>
                                            {activity.support && <p>Support: {activity.support}</p>}
                                        </div>
                                    ))}
                                </div>

                                {carePlan.socialEngagement.socialConnections && (
                                    <div className="p-2 border rounded">
                                        <h4 className="font-medium">Social Connections</h4>
                                        {carePlan.socialEngagement.socialConnections.map((connection, index) => (
                                            <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                                <p>Relationship: {connection.relationship}</p>
                                                {connection.notes && <p>Notes: {connection.notes}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* End of Life Care Section */}
                <TabsContent value="end-of-life" className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">End of Life Care</h3>
                        {carePlan.endOfLifeCare && (
                            <div className="space-y-4">
                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Preferences</h4>
                                    <p>Preferred Place: {carePlan.endOfLifeCare.preferences.place}</p>
                                    {carePlan.endOfLifeCare.preferences.religious && (
                                        <p>Religious Requirements: {carePlan.endOfLifeCare.preferences.religious}</p>
                                    )}
                                    {carePlan.endOfLifeCare.preferences.cultural && (
                                        <p>Cultural Requirements: {carePlan.endOfLifeCare.preferences.cultural}</p>
                                    )}
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Key Contacts</h4>
                                    {carePlan.endOfLifeCare.contacts.map((contact, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                            <p>Name: {contact.name}</p>
                                            <p>Relationship: {contact.relationship}</p>
                                            <p>Contact: {contact.contact}</p>
                                            <p>Priority: {contact.priority}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Important Documents</h4>
                                    {carePlan.endOfLifeCare.documents.map((doc, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                            <p>Type: {doc.type}</p>
                                            <p>Location: {doc.location}</p>
                                            <p>Updated: {new Date(doc.dateUpdated).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Quality of Life Section */}
                <TabsContent value="quality-of-life" className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Quality of Life</h3>
                        {carePlan.qualityOfLife && (
                            <div className="space-y-4">
                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Assessments</h4>
                                    {carePlan.qualityOfLife.assessments.map((assessment, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                            <p>Date: {new Date(assessment.date).toLocaleDateString()}</p>
                                            <p>Category: {assessment.category}</p>
                                            <p>Score: {assessment.score}</p>
                                            <p>Notes: {assessment.notes}</p>
                                            {assessment.actionPoints.length > 0 && (
                                                <div className="mt-2">
                                                    <h5 className="font-medium">Action Points:</h5>
                                                    <ul className="list-disc pl-4">
                                                        {assessment.actionPoints.map((point, idx) => (
                                                            <li key={idx}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Goals</h4>
                                    {carePlan.qualityOfLife.goals.map((goal, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                            <p>Goal: {goal.description}</p>
                                            <p>Target Date: {new Date(goal.targetDate).toLocaleDateString()}</p>
                                            <div className="mt-2">
                                                <h5 className="font-medium">Progress:</h5>
                                                {goal.progress.map((p, idx) => (
                                                    <div key={idx} className="mt-1">
                                                        <p>Date: {new Date(p.date).toLocaleDateString()}</p>
                                                        <p>Achievement: {p.achievement}%</p>
                                                        <p>Note: {p.note}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-2 border rounded">
                                    <h4 className="font-medium">Feedback</h4>
                                    {carePlan.qualityOfLife.feedback.map((feedback, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                            <p>Date: {new Date(feedback.date).toLocaleDateString()}</p>
                                            <p>Source: {feedback.source}</p>
                                            <p>Feedback: {feedback.content}</p>
                                            {feedback.actionTaken && <p>Action Taken: {feedback.actionTaken}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Add other care type-specific tabs as needed */}
            </Tabs>
        </div>
    );
};
