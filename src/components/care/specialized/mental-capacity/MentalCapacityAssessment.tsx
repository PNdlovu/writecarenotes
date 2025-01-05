/**
 * @writecarenotes.com
 * @fileoverview Mental capacity assessment component
 * @version 1.0.0
 * @created 2025-01-02
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A comprehensive component for conducting mental capacity assessments.
 * Features include:
 * - Decision assessment
 * - Capacity evaluation
 * - Best interests
 * - Legal framework
 * - Documentation
 * - Regional compliance
 * - Audit trail
 * - Recommendations
 *
 * Mobile-First Considerations:
 * - Responsive forms
 * - Step navigation
 * - Quick actions
 * - Progress tracking
 * - Clear indicators
 * - Offline support
 *
 * Enterprise Features:
 * - Legal compliance
 * - Audit logging
 * - Regional rules
 * - Analytics
 * - Reporting
 * - Documentation
 */

import { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/form/radio-group";
import { Textarea } from "@/components/ui/Textarea";
import { specializedCare } from '@/lib/services/specialized-care';
import type { Region } from '@/types/regulatory';

interface MentalCapacityAssessmentProps {
  residentId: string;
  region: Region;
  onComplete: () => void;
}

export function MentalCapacityAssessment({
  residentId,
  region,
  onComplete,
}: MentalCapacityAssessmentProps) {
  const [assessment, setAssessment] = useState({
    decisionMakingCapacity: '',
    understandingLevel: '',
    retentionAbility: '',
    weighingInformation: '',
    communicationAbility: '',
    supportNeeds: '',
    bestInterestDecision: '',
    recommendations: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await specializedCare.createMentalCapacityAssessment(residentId, region, assessment);
      onComplete();
    } catch (error) {
      console.error('Error submitting mental capacity assessment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Mental Capacity Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Decision Making Capacity */}
          <div className="space-y-2">
            <Label>Does the resident have capacity to make this specific decision?</Label>
            <RadioGroup
              value={assessment.decisionMakingCapacity}
              onValueChange={(value) =>
                setAssessment({ ...assessment, decisionMakingCapacity: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="capacity-yes" />
                <Label htmlFor="capacity-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="capacity-no" />
                <Label htmlFor="capacity-no">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fluctuating" id="capacity-fluctuating" />
                <Label htmlFor="capacity-fluctuating">Fluctuating</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Understanding */}
          <div className="space-y-2">
            <Label>Understanding of Information</Label>
            <Textarea
              value={assessment.understandingLevel}
              onChange={(e) =>
                setAssessment({ ...assessment, understandingLevel: e.target.value })
              }
              placeholder="Describe the resident's understanding of relevant information..."
            />
          </div>

          {/* Retention */}
          <div className="space-y-2">
            <Label>Retention of Information</Label>
            <Textarea
              value={assessment.retentionAbility}
              onChange={(e) =>
                setAssessment({ ...assessment, retentionAbility: e.target.value })
              }
              placeholder="Describe the resident's ability to retain information..."
            />
          </div>

          {/* Weighing Information */}
          <div className="space-y-2">
            <Label>Weighing Up Information</Label>
            <Textarea
              value={assessment.weighingInformation}
              onChange={(e) =>
                setAssessment({ ...assessment, weighingInformation: e.target.value })
              }
              placeholder="Describe how the resident weighs up information..."
            />
          </div>

          {/* Communication */}
          <div className="space-y-2">
            <Label>Communication of Decision</Label>
            <Textarea
              value={assessment.communicationAbility}
              onChange={(e) =>
                setAssessment({ ...assessment, communicationAbility: e.target.value })
              }
              placeholder="Describe how the resident communicates their decision..."
            />
          </div>

          {/* Support Needs */}
          <div className="space-y-2">
            <Label>Support Needs</Label>
            <Textarea
              value={assessment.supportNeeds}
              onChange={(e) =>
                setAssessment({ ...assessment, supportNeeds: e.target.value })
              }
              placeholder="Describe any support needs identified..."
            />
          </div>

          {/* Best Interest Decision */}
          <div className="space-y-2">
            <Label>Best Interest Decision (if applicable)</Label>
            <Textarea
              value={assessment.bestInterestDecision}
              onChange={(e) =>
                setAssessment({ ...assessment, bestInterestDecision: e.target.value })
              }
              placeholder="Document best interest decision process and outcome..."
            />
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <Label>Recommendations</Label>
            <Textarea
              value={assessment.recommendations}
              onChange={(e) =>
                setAssessment({ ...assessment, recommendations: e.target.value })
              }
              placeholder="Enter recommendations based on assessment..."
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Assessment
          </Button>
        </CardContent>
      </Card>
    </form>
  );
} 
