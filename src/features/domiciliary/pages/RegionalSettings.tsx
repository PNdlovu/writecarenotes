/**
 * @writecarenotes.com
 * @fileoverview Regional settings for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Regional configuration interface for domiciliary care services,
 * supporting settings for England (CQC), Wales (CIW),
 * Scotland (Care Inspectorate), Northern Ireland (RQIA),
 * and Ireland (HIQA).
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Form } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { SettingsProvider } from '@/features/settings';
import { useRegionalConfig } from '@/features/regional';

export const RegionalSettings = () => {
  const [activeTab, setActiveTab] = useState('england');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { config, updateConfig } = useRegionalConfig('domiciliary');

  const handleSave = async (data: any) => {
    setIsSubmitting(true);
    try {
      await updateConfig(activeTab, data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Regional Settings</h1>
        <p className="text-gray-500">
          Configure region-specific requirements and standards
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="england">England (CQC)</Tabs.Trigger>
          <Tabs.Trigger value="wales">Wales (CIW)</Tabs.Trigger>
          <Tabs.Trigger value="scotland">Scotland (CI)</Tabs.Trigger>
          <Tabs.Trigger value="northern_ireland">N. Ireland (RQIA)</Tabs.Trigger>
          <Tabs.Trigger value="ireland">Ireland (HIQA)</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="england">
          <Card>
            <Card.Header>
              <Card.Title>CQC Configuration</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Form.Section title="Registration">
                  <Form.Field>
                    <Form.Label>CQC Provider ID</Form.Label>
                    <Form.Input name="cqcProviderId" />
                  </Form.Field>
                  <Form.Field>
                    <Form.Label>Location IDs</Form.Label>
                    <Form.TagInput name="locationIds" />
                  </Form.Field>
                  <Form.Field>
                    <Form.Label>Registered Manager</Form.Label>
                    <Form.Input name="registeredManager" />
                  </Form.Field>
                </Form.Section>

                <Form.Section title="Reporting">
                  <Form.Field>
                    <Form.Label>PIR Schedule</Form.Label>
                    <Form.Select name="pirSchedule">
                      <option value="annual">Annual</option>
                      <option value="biannual">Bi-annual</option>
                    </Form.Select>
                  </Form.Field>
                  <Form.Field>
                    <Form.Label>Notification Requirements</Form.Label>
                    <Form.MultiSelect
                      name="notifications"
                      options={[
                        { value: 'deaths', label: 'Deaths' },
                        { value: 'serious_injuries', label: 'Serious Injuries' },
                        { value: 'abuse', label: 'Abuse or Allegations' },
                        { value: 'deprivation_of_liberty', label: 'DoLS' }
                      ]}
                    />
                  </Form.Field>
                </Form.Section>
              </Form>
            </Card.Body>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="wales">
          <Card>
            <Card.Header>
              <Card.Title>CIW Configuration</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Form.Section title="Registration">
                  <Form.Field>
                    <Form.Label>CIW Registration Number</Form.Label>
                    <Form.Input name="ciwRegistrationNumber" />
                  </Form.Field>
                  <Form.Field>
                    <Form.Label>Responsible Individual</Form.Label>
                    <Form.Input name="responsibleIndividual" />
                  </Form.Field>
                </Form.Section>

                <Form.Section title="Language">
                  <Form.Field>
                    <Form.Label>Welsh Language Standards</Form.Label>
                    <Form.Switch
                      name="welshLanguageCompliance"
                      label="Enable Welsh language support"
                    />
                  </Form.Field>
                  <Form.Field>
                    <Form.Label>Required Documents</Form.Label>
                    <Form.MultiSelect
                      name="welshDocuments"
                      options={[
                        { value: 'care_plans', label: 'Care Plans' },
                        { value: 'assessments', label: 'Assessments' },
                        { value: 'contracts', label: 'Service Contracts' },
                        { value: 'complaints', label: 'Complaints Procedure' }
                      ]}
                    />
                  </Form.Field>
                </Form.Section>
              </Form>
            </Card.Body>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="scotland">
          <Card>
            <Card.Header>
              <Card.Title>Care Inspectorate Configuration</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Form.Section title="Registration">
                  <Form.Field>
                    <Form.Label>CS Number</Form.Label>
                    <Form.Input name="csNumber" />
                  </Form.Field>
                  <Form.Field>
                    <Form.Label>Service Type</Form.Label>
                    <Form.Select name="serviceType">
                      <option value="housing_support">Housing Support Service</option>
                      <option value="care_at_home">Care at Home</option>
                      <option value="combined">Combined Service</option>
                    </Form.Select>
                  </Form.Field>
                </Form.Section>

                <Form.Section title="Health & Social Care Standards">
                  <Form.Field>
                    <Form.Label>Self-Assessment Schedule</Form.Label>
                    <Form.Select name="selfAssessmentSchedule">
                      <option value="annual">Annual</option>
                      <option value="biannual">Bi-annual</option>
                    </Form.Select>
                  </Form.Field>
                </Form.Section>
              </Form>
            </Card.Body>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="northern_ireland">
          <Card>
            <Card.Header>
              <Card.Title>RQIA Configuration</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Form.Section title="Registration">
                  <Form.Field>
                    <Form.Label>RQIA ID</Form.Label>
                    <Form.Input name="rqiaId" />
                  </Form.Field>
                  <Form.Field>
                    <Form.Label>Registered Provider</Form.Label>
                    <Form.Input name="registeredProvider" />
                  </Form.Field>
                </Form.Section>

                <Form.Section title="Minimum Standards">
                  <Form.Field>
                    <Form.Label>Service Categories</Form.Label>
                    <Form.MultiSelect
                      name="serviceCategories"
                      options={[
                        { value: 'older_people', label: 'Older People' },
                        { value: 'physical_disability', label: 'Physical Disability' },
                        { value: 'mental_health', label: 'Mental Health' },
                        { value: 'learning_disability', label: 'Learning Disability' }
                      ]}
                    />
                  </Form.Field>
                </Form.Section>
              </Form>
            </Card.Body>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="ireland">
          <Card>
            <Card.Header>
              <Card.Title>HIQA Configuration</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Form.Section title="Registration">
                  <Form.Field>
                    <Form.Label>HIQA Registration Number</Form.Label>
                    <Form.Input name="hiqaRegistrationNumber" />
                  </Form.Field>
                  <Form.Field>
                    <Form.Label>Person in Charge</Form.Label>
                    <Form.Input name="personInCharge" />
                  </Form.Field>
                </Form.Section>

                <Form.Section title="National Standards">
                  <Form.Field>
                    <Form.Label>Service Type</Form.Label>
                    <Form.Select name="serviceType">
                      <option value="older_people">Older People</option>
                      <option value="disabilities">Disabilities</option>
                      <option value="mixed">Mixed</option>
                    </Form.Select>
                  </Form.Field>
                  <Form.Field>
                    <Form.Label>Monitoring Requirements</Form.Label>
                    <Form.MultiSelect
                      name="monitoringRequirements"
                      options={[
                        { value: 'quarterly_returns', label: 'Quarterly Returns' },
                        { value: 'annual_review', label: 'Annual Review' },
                        { value: 'incident_reports', label: 'Incident Reports' },
                        { value: 'complaints', label: 'Complaints Register' }
                      ]}
                    />
                  </Form.Field>
                </Form.Section>
              </Form>
            </Card.Body>
          </Card>
        </Tabs.Content>
      </Tabs>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Save Regional Settings
        </Button>
      </div>
    </div>
  );
}; 