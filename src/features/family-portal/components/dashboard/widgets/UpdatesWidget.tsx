import React from 'react';
import { Card, Title, Stack, Text, Group, Badge, ActionIcon } from '@mantine/core';
import { IconHeart, IconActivity, IconPill } from '@tabler/icons-react';
import { ResidentUpdate, UpdateType } from '../../../types/updates';

interface UpdatesWidgetProps {
  residentId: string;
  familyMemberId: string;
}

const getUpdateIcon = (type: UpdateType) => {
  switch (type) {
    case 'HEALTH':
      return <IconHeart size={20} />;
    case 'ACTIVITY':
      return <IconActivity size={20} />;
    case 'MEDICATION':
      return <IconPill size={20} />;
    default:
      return null;
  }
};

const getUpdateColor = (type: UpdateType) => {
  switch (type) {
    case 'HEALTH':
      return 'red';
    case 'ACTIVITY':
      return 'blue';
    case 'MEDICATION':
      return 'green';
    case 'INCIDENT':
      return 'orange';
    default:
      return 'gray';
  }
};

export const UpdatesWidget: React.FC<UpdatesWidgetProps> = ({
  residentId,
  familyMemberId,
}) => {
  // This would be replaced with actual data fetching logic
  const updates: ResidentUpdate[] = [];

  return (
    <Card shadow="sm" p="lg">
      <Stack spacing="md">
        <Group position="apart">
          <Title order={3}>Recent Updates</Title>
          <Badge>Last 24 hours</Badge>
        </Group>

        {updates.length === 0 ? (
          <Text color="dimmed">No recent updates</Text>
        ) : (
          updates.map((update) => (
            <Card key={update.id} withBorder p="sm">
              <Group position="apart">
                <Group>
                  <ActionIcon
                    color={getUpdateColor(update.type)}
                    variant="light"
                    size="lg"
                    radius="xl"
                  >
                    {getUpdateIcon(update.type)}
                  </ActionIcon>
                  <div>
                    <Text weight={500}>{update.title}</Text>
                    <Text size="sm" color="dimmed">
                      {update.content}
                    </Text>
                  </div>
                </Group>
                <Text size="xs" color="dimmed">
                  {new Date(update.createdAt).toLocaleTimeString()}
                </Text>
              </Group>
            </Card>
          ))
        )}
      </Stack>
    </Card>
  );
};


