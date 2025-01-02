/**
 * @writecarenotes.com
 * @fileoverview Client assessment component for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Manages initial and ongoing client assessments for domiciliary care,
 * including home environment, risk assessments, and care needs evaluation.
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Form } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { assessmentService } from '@/features/assessments';
import type { Assessment } from '@/types';

interface ClientAssessmentProps {
  clientId: string;
  onAssessmentComplete?: (assessment: Assessment) => void;
}

export const ClientAssessment = ({
  clientId,
  onAssessmentComplete
}: ClientAssessmentProps) => {
  const [activeTab, setActiveTab] = useState('environment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const assessment = await assessmentService.createAssessment({
        clientId,
        type: 'DOMICILIARY',
        data
      });

      onAssessmentComplete?.(assessment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Client Assessment</Card.Title>
        <Card.Description>
          Complete client assessment for domiciliary care services
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="environment">Home Environment</Tabs.Trigger>
            <Tabs.Trigger value="risks">Risk Assessment</Tabs.Trigger>
            <Tabs.Trigger value="care">Care Needs</Tabs.Trigger>
            <Tabs.Trigger value="preferences">Preferences</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="environment">
            <Form.Field>
              <Form.Label>Property Type</Form.Label>
              <Form.Select>
                <option value="house">House</option>
                <option value="bungalow">Bungalow</option>
                <option value="flat">Flat/Apartment</option>
                <option value="sheltered">Sheltered Housing</option>
              </Form.Select>
            </Form.Field>

            <Form.Field>
              <Form.Label>Access Details</Form.Label>
              <Form.Textarea placeholder="Describe access arrangements..." />
            </Form.Field>

            <Form.Field>
              <Form.Label>Key Safe</Form.Label>
              <Form.Group>
                <Form.Radio name="keySafe" value="yes">Yes</Form.Radio>
                <Form.Radio name="keySafe" value="no">No</Form.Radio>
              </Form.Group>
            </Form.Field>
          </Tabs.Content>

          <Tabs.Content value="risks">
            <Form.Field>
              <Form.Label>Mobility Risks</Form.Label>
              <Form.RiskAssessment
                categories={['Access', 'Internal Layout', 'Bathroom', 'Kitchen']}
              />
            </Form.Field>

            <Form.Field>
              <Form.Label>Environmental Risks</Form.Label>
              <Form.RiskAssessment
                categories={['Lighting', 'Flooring', 'Heating', 'Security']}
              />
            </Form.Field>
          </Tabs.Content>

          <Tabs.Content value="care">
            <Form.Field>
              <Form.Label>Personal Care Needs</Form.Label>
              <Form.Checklist
                items={[
                  'Washing',
                  'Dressing',
                  'Toileting',
                  'Medication',
                  'Mobility'
                ]}
              />
            </Form.Field>

            <Form.Field>
              <Form.Label>Domestic Support</Form.Label>
              <Form.Checklist
                items={[
                  'Meal Preparation',
                  'Cleaning',
                  'Laundry',
                  'Shopping'
                ]}
              />
            </Form.Field>
          </Tabs.Content>

          <Tabs.Content value="preferences">
            <Form.Field>
              <Form.Label>Preferred Visit Times</Form.Label>
              <Form.TimePreferences />
            </Form.Field>

            <Form.Field>
              <Form.Label>Staff Gender Preference</Form.Label>
              <Form.Select>
                <option value="">No Preference</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </Form.Select>
            </Form.Field>

            <Form.Field>
              <Form.Label>Communication Preferences</Form.Label>
              <Form.Textarea placeholder="Specify any communication preferences..." />
            </Form.Field>
          </Tabs.Content>
        </Tabs>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={() => setActiveTab('environment')}>
            Previous
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            Save Assessment
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}; 