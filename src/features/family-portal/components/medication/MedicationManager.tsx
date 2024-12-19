import React, { useState } from 'react';
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Grid,
  Badge,
  Timeline,
  ThemeIcon,
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  ActionIcon,
  List,
  Tabs,
} from '@mantine/core';
import {
  IconPill,
  IconAlertCircle,
  IconClockHour4,
  IconPlus,
  IconNotes,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconAlertTriangle,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'DISCONTINUED' | 'PENDING';
  prescribedBy: string;
  sideEffects?: string[];
  interactions?: string[];
  notes?: string;
}

interface MedicationSchedule {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  status: 'SCHEDULED' | 'ADMINISTERED' | 'MISSED' | 'REFUSED';
  administeredBy?: string;
  notes?: string;
}

interface SideEffect {
  id: string;
  medicationId: string;
  symptom: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  reportedAt: Date;
  notes?: string;
  status: 'ACTIVE' | 'RESOLVED';
}

interface MedicationManagerProps {
  residentId: string;
  familyMemberId: string;
}

export const MedicationManager: React.FC<MedicationManagerProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [activeTab, setActiveTab] = useState<string | null>('current');
  const [isNewMedicationModalOpen, setIsNewMedicationModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [isReportSideEffectModalOpen, setIsReportSideEffectModalOpen] = useState(false);

  // This would be replaced with actual data fetching
  const medications: Medication[] = [];
  const schedules: MedicationSchedule[] = [];
  const sideEffects: SideEffect[] = [];

  const getSeverityColor = (severity: SideEffect['severity']) => {
    switch (severity) {
      case 'MILD':
        return 'blue';
      case 'MODERATE':
        return 'yellow';
      case 'SEVERE':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Stack spacing="xl">
      <Group position="apart">
        <div>
          <Title order={2}>Medication Manager</Title>
          <Text color="dimmed">Track and manage medications</Text>
        </div>
        <Button.Group>
          <Button
            variant="light"
            leftIcon={<IconPlus size={20} />}
            onClick={() => setIsNewMedicationModalOpen(true)}
          >
            Add Medication
          </Button>
          <Button
            variant="light"
            color="red"
            leftIcon={<IconAlertCircle size={20} />}
            onClick={() => setIsReportSideEffectModalOpen(true)}
          >
            Report Side Effect
          </Button>
        </Button.Group>
      </Group>

      <Grid>
        {/* Today's Schedule */}
        <Grid.Col span={12}>
          <Card shadow="sm" p="md">
            <Title order={3} mb="md">
              Today's Schedule
            </Title>
            <Timeline active={1} bulletSize={24} lineWidth={2}>
              {schedules.map((schedule) => {
                const medication = medications.find(
                  (m) => m.id === schedule.medicationId
                );
                return (
                  <Timeline.Item
                    key={schedule.id}
                    bullet={
                      schedule.status === 'ADMINISTERED' ? (
                        <IconCheck size={12} />
                      ) : schedule.status === 'MISSED' ? (
                        <IconX size={12} />
                      ) : (
                        <IconPill size={12} />
                      )
                    }
                    title={
                      <Group spacing="xs">
                        <Text weight={500}>{medication?.name}</Text>
                        <Badge
                          color={
                            schedule.status === 'ADMINISTERED'
                              ? 'green'
                              : schedule.status === 'MISSED'
                              ? 'red'
                              : 'blue'
                          }
                        >
                          {schedule.status}
                        </Badge>
                      </Group>
                    }
                  >
                    <Text size="sm">
                      {medication?.dosage} • {medication?.instructions}
                    </Text>
                    <Text size="xs" color="dimmed">
                      Scheduled for:{' '}
                      {new Date(schedule.scheduledTime).toLocaleTimeString()}
                    </Text>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Card>
        </Grid.Col>

        {/* Medication List */}
        <Grid.Col span={8}>
          <Card shadow="sm" p="md">
            <Tabs value={activeTab} onTabChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab value="current" icon={<IconPill size={14} />}>
                  Current Medications
                </Tabs.Tab>
                <Tabs.Tab value="discontinued" icon={<IconX size={14} />}>
                  Discontinued
                </Tabs.Tab>
                <Tabs.Tab value="pending" icon={<IconClockHour4 size={14} />}>
                  Pending
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="current" pt="md">
                <Stack spacing="md">
                  {medications
                    .filter((med) => med.status === 'ACTIVE')
                    .map((medication) => (
                      <Card
                        key={medication.id}
                        withBorder
                        p="sm"
                        onClick={() => setSelectedMedication(medication)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <Group position="apart">
                          <div>
                            <Group spacing="xs">
                              <Text weight={500}>{medication.name}</Text>
                              <Badge color="green">ACTIVE</Badge>
                            </Group>
                            <Text size="sm" color="dimmed">
                              {medication.dosage} • {medication.frequency}
                            </Text>
                          </div>
                          <Group spacing={8}>
                            <ActionIcon
                              color="blue"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMedication(medication);
                              }}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle discontinue
                              }}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Card>
                    ))}
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Card>
        </Grid.Col>

        {/* Side Effects and Alerts */}
        <Grid.Col span={4}>
          <Stack spacing="md">
            <Card shadow="sm" p="md">
              <Title order={3} mb="md">
                Side Effects
              </Title>
              {sideEffects.map((effect) => (
                <Card key={effect.id} withBorder mb="sm">
                  <Group position="apart">
                    <Badge color={getSeverityColor(effect.severity)}>
                      {effect.severity}
                    </Badge>
                    <Text size="xs" color="dimmed">
                      {new Date(effect.reportedAt).toLocaleDateString()}
                    </Text>
                  </Group>
                  <Text mt="xs" weight={500}>
                    {effect.symptom}
                  </Text>
                  {effect.notes && (
                    <Text size="sm" color="dimmed" mt="xs">
                      {effect.notes}
                    </Text>
                  )}
                </Card>
              ))}
            </Card>

            <Card shadow="sm" p="md">
              <Title order={3} mb="md">
                Alerts
              </Title>
              <List spacing="xs" size="sm" center icon={
                <ThemeIcon color="red" size={24} radius="xl">
                  <IconAlertTriangle size={16} />
                </ThemeIcon>
              }>
                <List.Item>Low supply warning: Medication A</List.Item>
                <List.Item>Renewal needed: Medication B</List.Item>
                <List.Item>Missed dose: Medication C</List.Item>
              </List>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* New Medication Modal */}
      <Modal
        opened={isNewMedicationModalOpen}
        onClose={() => setIsNewMedicationModalOpen(false)}
        title="Add New Medication"
        size="lg"
      >
        <Stack spacing="md">
          <TextInput
            label="Medication Name"
            placeholder="Enter medication name"
            required
          />

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Dosage"
                placeholder="e.g., 50mg"
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Frequency"
                placeholder="Select frequency"
                data={[
                  { value: 'ONCE_DAILY', label: 'Once Daily' },
                  { value: 'TWICE_DAILY', label: 'Twice Daily' },
                  { value: 'THREE_TIMES_DAILY', label: 'Three Times Daily' },
                  { value: 'AS_NEEDED', label: 'As Needed' },
                ]}
                required
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Prescribed By"
            placeholder="Enter prescriber's name"
            required
          />

          <Textarea
            label="Instructions"
            placeholder="Enter administration instructions"
            minRows={3}
            required
          />

          <Textarea
            label="Side Effects"
            placeholder="Enter known side effects"
            minRows={2}
          />

          <Textarea
            label="Notes"
            placeholder="Enter any additional notes"
            minRows={2}
          />

          <Group position="right">
            <Button
              variant="light"
              onClick={() => setIsNewMedicationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle save
                setIsNewMedicationModalOpen(false);
              }}
            >
              Add Medication
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Report Side Effect Modal */}
      <Modal
        opened={isReportSideEffectModalOpen}
        onClose={() => setIsReportSideEffectModalOpen(false)}
        title="Report Side Effect"
        size="lg"
      >
        <Stack spacing="md">
          <Select
            label="Medication"
            placeholder="Select medication"
            data={medications.map((med) => ({
              value: med.id,
              label: med.name,
            }))}
            required
          />

          <TextInput
            label="Symptom"
            placeholder="Describe the side effect"
            required
          />

          <Select
            label="Severity"
            placeholder="Select severity level"
            data={[
              { value: 'MILD', label: 'Mild' },
              { value: 'MODERATE', label: 'Moderate' },
              { value: 'SEVERE', label: 'Severe' },
            ]}
            required
          />

          <Textarea
            label="Notes"
            placeholder="Enter any additional details"
            minRows={3}
          />

          <Group position="right">
            <Button
              variant="light"
              onClick={() => setIsReportSideEffectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                // Handle save
                setIsReportSideEffectModalOpen(false);
              }}
            >
              Report Side Effect
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Medication Details Modal */}
      <Modal
        opened={!!selectedMedication}
        onClose={() => setSelectedMedication(null)}
        title="Medication Details"
        size="lg"
      >
        {selectedMedication && (
          <Stack spacing="md">
            <Group position="apart">
              <div>
                <Text size="xl" weight={500}>
                  {selectedMedication.name}
                </Text>
                <Badge color="green">ACTIVE</Badge>
              </div>
              <Group>
                <Button
                  variant="light"
                  leftIcon={<IconEdit size={16} />}
                  onClick={() => {
                    // Handle edit
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="light"
                  color="red"
                  leftIcon={<IconTrash size={16} />}
                  onClick={() => {
                    // Handle discontinue
                    setSelectedMedication(null);
                  }}
                >
                  Discontinue
                </Button>
              </Group>
            </Group>

            <Grid>
              <Grid.Col span={6}>
                <Card withBorder>
                  <Text size="sm" color="dimmed">
                    Dosage
                  </Text>
                  <Text weight={500}>{selectedMedication.dosage}</Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card withBorder>
                  <Text size="sm" color="dimmed">
                    Frequency
                  </Text>
                  <Text weight={500}>{selectedMedication.frequency}</Text>
                </Card>
              </Grid.Col>
            </Grid>

            <Card withBorder>
              <Text size="sm" color="dimmed">
                Instructions
              </Text>
              <Text>{selectedMedication.instructions}</Text>
            </Card>

            {selectedMedication.sideEffects && (
              <div>
                <Text size="sm" weight={500}>
                  Known Side Effects
                </Text>
                <List>
                  {selectedMedication.sideEffects.map((effect, index) => (
                    <List.Item key={index}>{effect}</List.Item>
                  ))}
                </List>
              </div>
            )}

            {selectedMedication.notes && (
              <div>
                <Text size="sm" weight={500}>
                  Notes
                </Text>
                <Text color="dimmed">{selectedMedication.notes}</Text>
              </div>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
};


