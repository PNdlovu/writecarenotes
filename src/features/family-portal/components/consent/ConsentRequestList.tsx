import React from 'react';
import { format } from 'date-fns';
import { Badge, Card, Stack, Text, Button, Group } from '@mantine/core';
import { IconClock, IconCheck, IconX } from '@tabler/icons-react';
import { ParentalConsent, ConsentStatus } from '../../types/consent';

interface ConsentRequestListProps {
  requests: ParentalConsent[];
  onViewRequest: (request: ParentalConsent) => void;
}

const getStatusColor = (status: ConsentStatus) => {
  switch (status) {
    case 'APPROVED':
      return 'green';
    case 'REJECTED':
      return 'red';
    case 'WITHDRAWN':
      return 'orange';
    default:
      return 'blue';
  }
};

const getStatusIcon = (status: ConsentStatus) => {
  switch (status) {
    case 'APPROVED':
      return <IconCheck size={16} />;
    case 'REJECTED':
      return <IconX size={16} />;
    case 'WITHDRAWN':
      return <IconX size={16} />;
    default:
      return <IconClock size={16} />;
  }
};

export const ConsentRequestList: React.FC<ConsentRequestListProps> = ({
  requests,
  onViewRequest,
}) => {
  if (!requests.length) {
    return (
      <Card withBorder>
        <Text align="center" color="dimmed">
          No consent requests found
        </Text>
      </Card>
    );
  }

  return (
    <Stack spacing="md">
      {requests.map((request) => (
        <Card key={request.id} withBorder>
          <Stack spacing="xs">
            <Group position="apart">
              <Group spacing="xs">
                <Badge
                  leftSection={getStatusIcon(request.status)}
                  color={getStatusColor(request.status)}
                >
                  {request.status}
                </Badge>
                <Badge>{request.type}</Badge>
              </Group>
              <Text size="sm" color="dimmed">
                {format(request.requestedAt, 'PP')}
              </Text>
            </Group>

            <Text size="sm">{request.details}</Text>

            <Group position="apart" mt="xs">
              <Text size="sm" color="dimmed">
                Requested by {request.requestedBy}
              </Text>
              <Button
                variant="light"
                size="xs"
                onClick={() => onViewRequest(request)}
              >
                View Details
              </Button>
            </Group>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
};


