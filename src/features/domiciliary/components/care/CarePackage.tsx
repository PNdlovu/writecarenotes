/**
 * @writecarenotes.com
 * @fileoverview Care package component for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Manages care package creation and updates for domiciliary clients,
 * integrating with assessment data and care plan services.
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Form } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { carePlanService } from '@/features/care-plans';
import { assessmentService } from '@/features/assessments';
import type { Assessment, CarePlan } from '@/types';
import type { DomiciliaryCarePlan } from '../../types';

interface CarePackageProps {
  clientId: string;
  assessmentId: string;
  onPackageCreated?: (carePlan: DomiciliaryCarePlan) => void;
}

export const CarePackage = ({
  clientId,
  assessmentId,
  onPackageCreated
}: CarePackageProps) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessment();
  }, [assessmentId]);

  const loadAssessment = async () => {
    try {
      setIsLoading(true);
      const data = await assessmentService.getAssessment(assessmentId);
      setAssessment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const carePackage: DomiciliaryCarePlan = {
        clientId,
        type: 'DOMICILIARY',
        status: 'DRAFT',
        startDate: new Date(),
        visitRequirements: {
          preferredTimes: formData.preferredTimes,
          duration: formData.duration,
          staffingRequirements: {
            gender: formData.staffGender,
            skills: formData.requiredSkills,
            continuityPreference: formData.continuityPreference
          },
          access: {
            keySafe: formData.keySafe,
            keySafeLocation: formData.keySafeLocation,
            accessNotes: formData.accessNotes
          }
        },
        environmentalRisks: {
          location: assessment?.risks.location,
          access: assessment?.risks.access,
          equipment: assessment?.risks.equipment
        }
      };

      const created = await carePlanService.createCarePlan(carePackage);
      onPackageCreated?.(created as DomiciliaryCarePlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create care package');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center">Loading assessment data...</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Care Package Setup</Card.Title>
        <Card.Description>
          Create care package based on assessment findings
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Section title="Visit Requirements">
            <Form.Field>
              <Form.Label>Preferred Visit Times</Form.Label>
              <Form.TimePreferences name="preferredTimes" />
            </Form.Field>

            <Form.Field>
              <Form.Label>Visit Duration (minutes)</Form.Label>
              <Form.Select name="duration">
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </Form.Select>
            </Form.Field>
          </Form.Section>

          <Form.Section title="Staffing Requirements">
            <Form.Field>
              <Form.Label>Staff Gender Preference</Form.Label>
              <Form.Select name="staffGender">
                <option value="">No Preference</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </Form.Select>
            </Form.Field>

            <Form.Field>
              <Form.Label>Required Skills</Form.Label>
              <Form.SkillSelect
                name="requiredSkills"
                multiple
              />
            </Form.Field>

            <Form.Field>
              <Form.Label>Staff Continuity</Form.Label>
              <Form.Switch
                name="continuityPreference"
                label="Prefer consistent staff members"
              />
            </Form.Field>
          </Form.Section>

          <Form.Section title="Access Arrangements">
            <Form.Field>
              <Form.Label>Key Safe</Form.Label>
              <Form.Switch
                name="keySafe"
                label="Property has a key safe"
              />
            </Form.Field>

            <Form.Field>
              <Form.Label>Key Safe Location</Form.Label>
              <Form.Input
                name="keySafeLocation"
                placeholder="Describe the location of the key safe..."
              />
            </Form.Field>

            <Form.Field>
              <Form.Label>Access Notes</Form.Label>
              <Form.Textarea
                name="accessNotes"
                placeholder="Any additional access information..."
              />
            </Form.Field>
          </Form.Section>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Create Care Package
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}; 