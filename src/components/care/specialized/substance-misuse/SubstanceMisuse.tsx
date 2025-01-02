/**
 * @writecarenotes.com
 * @fileoverview Substance misuse care management component
 * @version 1.0.0
 * @created 2025-01-02
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A comprehensive component for managing substance misuse care services.
 * Features include:
 * - Assessment tools
 * - Treatment planning
 * - Recovery tracking
 * - Risk management
 * - Support services
 * - Care coordination
 * - Progress monitoring
 * - Intervention plans
 *
 * Mobile-First Considerations:
 * - Easy navigation
 * - Quick updates
 * - Progress tracking
 * - Emergency info
 * - Support contacts
 * - Crisis resources
 *
 * Enterprise Features:
 * - Care protocols
 * - Risk assessment
 * - Clinical notes
 * - Analytics
 * - Reporting
 * - Documentation
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BasePerson, SubstanceMisuseAssessment } from '@/types/care';

interface SubstanceMisuseProps {
  person: BasePerson;
  assessment?: SubstanceMisuseAssessment;
}

export const SubstanceMisuse: React.FC<SubstanceMisuseProps> = ({
  person,
  assessment
}) => {
  return (
    <Tabs defaultValue="assessment" className="space-y-6">
      <TabsList>
        <TabsTrigger value="assessment">Assessment</TabsTrigger>
        <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
        <TabsTrigger value="recovery">Recovery</TabsTrigger>
      </TabsList>

      <TabsContent value="assessment">
        <Card>
          <CardHeader>
            <CardTitle>Substance Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assessment?.substances.map((substance, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <h4 className="font-medium mb-2">{substance.type}</h4>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Usage Pattern:</span>
                      <p className="text-sm">{substance.usage}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">History:</span>
                      <p className="text-sm">{substance.history}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Associated Risks:</span>
                      <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                        {substance.risks.map((risk, rIndex) => (
                          <li key={rIndex}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="treatment">
        <Card>
          <CardHeader>
            <CardTitle>Treatment Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {assessment?.treatment && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Treatment Approach</h4>
                  <p className="text-sm">{assessment.treatment.plan}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Medications</h4>
                  <div className="space-y-4">
                    {assessment.treatment.medications.map((medication, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Medication:</span>
                          <p>{medication.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dosage:</span>
                          <p>{medication.dosage}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frequency:</span>
                          <p>{medication.frequency}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Therapies</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {assessment.treatment.therapies.map((therapy, index) => (
                      <li key={index}>{therapy}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="recovery">
        <Card>
          <CardHeader>
            <CardTitle>Recovery Journey</CardTitle>
          </CardHeader>
          <CardContent>
            {assessment?.recovery && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Recovery Goals</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {assessment.recovery.goals.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Support Network</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {assessment.recovery.support.map((support, index) => (
                      <li key={index}>{support}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Known Triggers</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {assessment.recovery.triggers.map((trigger, index) => (
                      <li key={index}>{trigger}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
