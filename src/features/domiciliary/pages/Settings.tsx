/**
 * @writecarenotes.com
 * @fileoverview Settings page for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Configuration interface for domiciliary care services,
 * extending the core settings module with domiciliary-specific options.
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Form } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { SettingsProvider } from '@/features/settings';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (data: any) => {
    setIsSubmitting(true);
    try {
      await SettingsProvider.saveSettings('domiciliary', data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Domiciliary Settings</h1>
        <p className="text-gray-500">
          Configure your domiciliary care service settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="general">General</Tabs.Trigger>
          <Tabs.Trigger value="territories">Territories</Tabs.Trigger>
          <Tabs.Trigger value="scheduling">Scheduling</Tabs.Trigger>
          <Tabs.Trigger value="compliance">Compliance</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="general">
          <Card>
            <Card.Header>
              <Card.Title>General Settings</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Form.Section title="Organization">
                  <Form.Field>
                    <Form.Label>Service Name</Form.Label>
                    <Form.Input name="serviceName" />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>CQC Provider ID</Form.Label>
                    <Form.Input name="cqcProviderId" />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>Operating Hours</Form.Label>
                    <Form.TimeRangePicker name="operatingHours" />
                  </Form.Field>
                </Form.Section>

                <Form.Section title="Contact">
                  <Form.Field>
                    <Form.Label>Emergency Contact</Form.Label>
                    <Form.Input name="emergencyContact" />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>Out of Hours Contact</Form.Label>
                    <Form.Input name="outOfHoursContact" />
                  </Form.Field>
                </Form.Section>
              </Form>
            </Card.Body>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="territories">
          <Card>
            <Card.Header>
              <Card.Title>Territory Management</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Form.Section title="Service Areas">
                  <Form.Field>
                    <Form.Label>Territory Definitions</Form.Label>
                    <Form.TerritoryEditor name="territories" />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>Travel Time Limits</Form.Label>
                    <Form.Input
                      type="number"
                      name="maxTravelTime"
                      suffix="minutes"
                    />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>Distance Limits</Form.Label>
                    <Form.Input
                      type="number"
                      name="maxDistance"
                      suffix="miles"
                    />
                  </Form.Field>
                </Form.Section>

                <Form.Section title="Mapping">
                  <Form.Field>
                    <Form.Label>Default Map Center</Form.Label>
                    <Form.LocationPicker name="mapCenter" />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>Default Zoom Level</Form.Label>
                    <Form.Select name="defaultZoom">
                      <option value="10">City</option>
                      <option value="12">District</option>
                      <option value="14">Neighborhood</option>
                    </Form.Select>
                  </Form.Field>
                </Form.Section>
              </Form>
            </Card.Body>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="scheduling">
          <Card>
            <Card.Header>
              <Card.Title>Scheduling Settings</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Form.Section title="Visit Durations">
                  <Form.Field>
                    <Form.Label>Default Visit Duration</Form.Label>
                    <Form.Select name="defaultDuration">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour</option>
                    </Form.Select>
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>Minimum Gap Between Visits</Form.Label>
                    <Form.Input
                      type="number"
                      name="minGap"
                      suffix="minutes"
                    />
                  </Form.Field>
                </Form.Section>

                <Form.Section title="Staff Scheduling">
                  <Form.Field>
                    <Form.Label>Maximum Daily Visits</Form.Label>
                    <Form.Input
                      type="number"
                      name="maxDailyVisits"
                    />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>Break Requirements</Form.Label>
                    <Form.Input
                      type="number"
                      name="breakDuration"
                      suffix="minutes"
                    />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>Staff Continuity</Form.Label>
                    <Form.Switch
                      name="enforceStaffContinuity"
                      label="Enforce staff continuity where possible"
                    />
                  </Form.Field>
                </Form.Section>
              </Form>
            </Card.Body>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="compliance">
          <Card>
            <Card.Header>
              <Card.Title>Compliance Settings</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Form.Section title="Visit Verification">
                  <Form.Field>
                    <Form.Label>GPS Verification</Form.Label>
                    <Form.Switch
                      name="requireGpsVerification"
                      label="Require GPS verification for visits"
                    />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>Digital Signatures</Form.Label>
                    <Form.Switch
                      name="requireSignatures"
                      label="Require digital signatures for visit completion"
                    />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>Photo Evidence</Form.Label>
                    <Form.Switch
                      name="requirePhotos"
                      label="Allow photo evidence collection"
                    />
                  </Form.Field>
                </Form.Section>

                <Form.Section title="Alerts">
                  <Form.Field>
                    <Form.Label>Late Visit Threshold</Form.Label>
                    <Form.Input
                      type="number"
                      name="lateThreshold"
                      suffix="minutes"
                    />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>Missed Visit Alerts</Form.Label>
                    <Form.MultiSelect
                      name="missedVisitAlerts"
                      options={[
                        { value: 'manager', label: 'Care Manager' },
                        { value: 'coordinator', label: 'Care Coordinator' },
                        { value: 'family', label: 'Family Members' }
                      ]}
                    />
                  </Form.Field>
                </Form.Section>

                <Form.Section title="Documentation">
                  <Form.Field>
                    <Form.Label>Required Visit Notes</Form.Label>
                    <Form.Switch
                      name="requireVisitNotes"
                      label="Require notes for visit completion"
                    />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>MAR Requirements</Form.Label>
                    <Form.Switch
                      name="requireMarSignoff"
                      label="Require MAR signoff for medication visits"
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
          Save Settings
        </Button>
      </div>
    </div>
  );
}; 