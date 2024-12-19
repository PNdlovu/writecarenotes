import React from 'react';
import { Card, Title, Stack, Text, Group, Badge, Button } from '@mantine/core';
import { IconCalendarEvent, IconVideo } from '@tabler/icons-react';
import { Visit, VisitType } from '../../../types/visits';

interface VisitsWidgetProps {
  residentId: string;
  familyMemberId: string;
}

const getVisitIcon = (type: VisitType) => {
  switch (type) {
    case 'VIDEO_CALL':
      return <IconVideo size={20} />;
    default:
      return <IconCalendarEvent size={20} />;
  }
};

const getVisitColor = (type: VisitType) => {
  switch (type) {
    case 'VIDEO_CALL':
      return 'blue';
    case 'IN_PERSON':
      return 'green';
    case 'EXTERNAL_ACTIVITY':
      return 'orange';
    case 'SPECIAL_EVENT':
      return 'purple';
    default:
      return 'gray';
  }
};

export const VisitsWidget: React.FC<VisitsWidgetProps> = ({
  residentId,
  familyMemberId,
}) => {
  // This would be replaced with actual data fetching logic
  const visits: Visit[] = [];

  return (
    <Card shadow="sm" p="lg">
      <Stack spacing="md">
        <Group position="apart">
          <Title order={3}>Upcoming Visits</Title>
          <Button variant="light" size="xs">
            Schedule New
          </Button>
        </Group>

        {visits.length === 0 ? (
          <Text color="dimmed">No upcoming visits scheduled</Text>
        ) : (
          visits.map((visit) => (
            <Card key={visit.id} withBorder p="sm">
              <Group position="apart">
                <Group>
                  {getVisitIcon(visit.type)}
                  <div>
                    <Group spacing="xs">
                      <Text weight={500}>
                        {visit.type === 'VIDEO_CALL' ? 'Video Call' : 'Visit'}
                      </Text>
                      <Badge color={getVisitColor(visit.type)} size="sm">
                        {visit.type.replace('_', ' ')}
                      </Badge>
                    </Group>
                    <Text size="sm" color="dimmed">
                      {new Date(visit.scheduledStart).toLocaleString()}
                    </Text>
                  </div>
                </Group>
                {visit.type === 'VIDEO_CALL' && (
                  <Button
                    variant="light"
                    color="blue"
                    size="xs"
                    leftIcon={<IconVideo size={16} />}
                  >
                    Join
                  </Button>
                )}
              </Group>
            </Card>
          ))
        )}
      </Stack>
    </Card>
  );
};


