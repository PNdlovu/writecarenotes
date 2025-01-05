import React from 'react';
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Accordion,
  Timeline,
  Button,
} from '@mantine/core';
import {
  IconStethoscope,
  IconPill,
  IconActivity,
  IconMoodSmile,
  IconCalendarTime,
  IconNotes,
} from '@tabler/icons-react';

interface CarePlanGoal {
  id: string;
  category: 'HEALTH' | 'MEDICATION' | 'ACTIVITY' | 'WELLBEING';
  title: string;
  description: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'MODIFIED';
  targetDate?: Date;
  progress?: number;
  notes?: string[];
}

interface CarePlanSection {
  id: string;
  title: string;
  description: string;
  goals: CarePlanGoal[];
  lastUpdated: Date;
  nextReview: Date;
}

interface CarePlanViewerProps {
  residentId: string;
  familyMemberId: string;
}

const getGoalIcon = (category: CarePlanGoal['category']) => {
  switch (category) {
    case 'HEALTH':
      return <IconStethoscope size={20} />;
    case 'MEDICATION':
      return <IconPill size={20} />;
    case 'ACTIVITY':
      return <IconActivity size={20} />;
    case 'WELLBEING':
      return <IconMoodSmile size={20} />;
    default:
      return null;
  }
};

export const CarePlanViewer: React.FC<CarePlanViewerProps> = ({
  residentId,
  familyMemberId,
}) => {
  // This would be replaced with actual data fetching
  const carePlan: CarePlanSection[] = [];

  return (
    <Stack spacing="xl">
      <Group position="apart">
        <div>
          <Title order={2}>Care Plan</Title>
          <Text color="dimmed">Comprehensive care plan and progress tracking</Text>
        </div>
        <Group>
          <Button
            variant="light"
            leftIcon={<IconCalendarTime size={20} />}
            color="blue"
          >
            Schedule Review
          </Button>
          <Button
            variant="light"
            leftIcon={<IconNotes size={20} />}
            color="gray"
          >
            Add Note
          </Button>
        </Group>
      </Group>

      <Accordion multiple>
        {carePlan.map((section) => (
          <Accordion.Item key={section.id} value={section.id}>
            <Accordion.Control>
              <Group position="apart">
                <Text weight={500}>{section.title}</Text>
                <Badge>
                  Next Review: {new Date(section.nextReview).toLocaleDateString()}
                </Badge>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="md">
                <Text size="sm" color="dimmed">
                  {section.description}
                </Text>
                
                <Timeline active={1} bulletSize={24} lineWidth={2}>
                  {section.goals.map((goal) => (
                    <Timeline.Item
                      key={goal.id}
                      bullet={getGoalIcon(goal.category)}
                      title={
                        <Group spacing="xs">
                          <Text weight={500}>{goal.title}</Text>
                          <Badge
                            color={
                              goal.status === 'ACHIEVED'
                                ? 'green'
                                : goal.status === 'IN_PROGRESS'
                                ? 'blue'
                                : 'gray'
                            }
                            size="sm"
                          >
                            {goal.status.replace('_', ' ')}
                          </Badge>
                        </Group>
                      }
                    >
                      <Text color="dimmed" size="sm">
                        {goal.description}
                      </Text>
                      {goal.notes && goal.notes.length > 0 && (
                        <Card withBorder mt="xs" p="xs">
                          <Text size="xs" weight={500}>
                            Recent Notes:
                          </Text>
                          {goal.notes.map((note, index) => (
                            <Text key={index} size="xs" color="dimmed">
                              • {note}
                            </Text>
                          ))}
                        </Card>
                      )}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
};


