import React from 'react';
import { Card, Title, Stack, Text, Group, Badge, ActionIcon, Button } from '@mantine/core';
import { IconMessage, IconReply } from '@tabler/icons-react';
import { Message, MessageCategory } from '../../../types/communication';

interface MessagesWidgetProps {
  residentId: string;
  familyMemberId: string;
}

const getMessageColor = (category: MessageCategory) => {
  switch (category) {
    case 'CARE_UPDATE':
      return 'blue';
    case 'MEDICAL':
      return 'red';
    case 'APPOINTMENT':
      return 'green';
    case 'CONSENT_REQUEST':
      return 'orange';
    default:
      return 'gray';
  }
};

export const MessagesWidget: React.FC<MessagesWidgetProps> = ({
  residentId,
  familyMemberId,
}) => {
  // This would be replaced with actual data fetching logic
  const messages: Message[] = [];

  return (
    <Card shadow="sm" p="lg">
      <Stack spacing="md">
        <Group position="apart">
          <Title order={3}>Recent Messages</Title>
          <Button
            variant="light"
            size="xs"
            leftIcon={<IconMessage size={16} />}
          >
            New Message
          </Button>
        </Group>

        {messages.length === 0 ? (
          <Text color="dimmed">No recent messages</Text>
        ) : (
          messages.map((message) => (
            <Card key={message.id} withBorder p="sm">
              <Group position="apart">
                <Group>
                  <Badge color={getMessageColor(message.category)}>
                    {message.category.replace('_', ' ')}
                  </Badge>
                  <div>
                    <Text weight={500}>{message.subject}</Text>
                    <Text size="sm" color="dimmed" lineClamp={2}>
                      {message.content}
                    </Text>
                  </div>
                </Group>
                <Group spacing="xs">
                  <Text size="xs" color="dimmed">
                    {new Date(message.createdAt).toLocaleString()}
                  </Text>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => {
                      // Handle reply
                    }}
                  >
                    <IconReply size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ))
        )}
      </Stack>
    </Card>
  );
};


