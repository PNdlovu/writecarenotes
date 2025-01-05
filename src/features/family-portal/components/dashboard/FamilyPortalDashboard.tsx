import React from 'react';
import {
  Container,
  Grid,
  Title,
  Text,
  Card,
  Group,
  Stack,
  Button,
  Badge,
} from '@mantine/core';
import { IconBell, IconCalendar, IconMessage, IconNotes } from '@tabler/icons-react';
import { ResidentUpdate } from '../../types/updates';
import { Visit } from '../../types/visits';
import { Message } from '../../types/communication';
import { UpdatesWidget } from './widgets/UpdatesWidget';
import { VisitsWidget } from './widgets/VisitsWidget';
import { MessagesWidget } from './widgets/MessagesWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';

interface FamilyPortalDashboardProps {
  residentId: string;
  familyMemberId: string;
}

export const FamilyPortalDashboard: React.FC<FamilyPortalDashboardProps> = ({
  residentId,
  familyMemberId,
}) => {
  return (
    <Container size="xl">
      <Stack spacing="xl">
        <Group position="apart">
          <div>
            <Title order={2}>Family Portal Dashboard</Title>
            <Text color="dimmed">Stay connected with your loved one's care</Text>
          </div>
          <Button.Group>
            <Button variant="light" leftIcon={<IconMessage size={20} />}>
              Send Message
            </Button>
            <Button variant="light" leftIcon={<IconCalendar size={20} />}>
              Schedule Visit
            </Button>
          </Button.Group>
        </Group>

        <Grid>
          {/* Quick Actions */}
          <Grid.Col span={12}>
            <QuickActionsWidget
              residentId={residentId}
              familyMemberId={familyMemberId}
            />
          </Grid.Col>

          {/* Updates */}
          <Grid.Col span={8}>
            <UpdatesWidget
              residentId={residentId}
              familyMemberId={familyMemberId}
            />
          </Grid.Col>

          {/* Upcoming Visits */}
          <Grid.Col span={4}>
            <VisitsWidget
              residentId={residentId}
              familyMemberId={familyMemberId}
            />
          </Grid.Col>

          {/* Messages */}
          <Grid.Col span={12}>
            <MessagesWidget
              residentId={residentId}
              familyMemberId={familyMemberId}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};


