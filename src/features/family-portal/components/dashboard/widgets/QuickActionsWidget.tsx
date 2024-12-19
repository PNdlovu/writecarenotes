import React from 'react';
import { Card, SimpleGrid, UnstyledButton, Group, Text } from '@mantine/core';
import {
  IconCalendarPlus,
  IconMessage,
  IconVideo,
  IconClipboardList,
  IconFileDescription,
  IconBell,
  IconSettings,
  IconHelp,
} from '@tabler/icons-react';

interface QuickActionsWidgetProps {
  residentId: string;
  familyMemberId: string;
}

interface QuickAction {
  icon: React.ReactNode;
  color: string;
  title: string;
  onClick: () => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  residentId,
  familyMemberId,
}) => {
  const quickActions: QuickAction[] = [
    {
      icon: <IconCalendarPlus size={24} />,
      color: 'blue',
      title: 'Schedule Visit',
      onClick: () => {
        // Handle scheduling
      },
    },
    {
      icon: <IconMessage size={24} />,
      color: 'green',
      title: 'Send Message',
      onClick: () => {
        // Handle messaging
      },
    },
    {
      icon: <IconVideo size={24} />,
      color: 'indigo',
      title: 'Start Video Call',
      onClick: () => {
        // Handle video call
      },
    },
    {
      icon: <IconClipboardList size={24} />,
      color: 'orange',
      title: 'View Care Plan',
      onClick: () => {
        // Handle care plan view
      },
    },
    {
      icon: <IconFileDescription size={24} />,
      color: 'grape',
      title: 'Documents',
      onClick: () => {
        // Handle documents
      },
    },
    {
      icon: <IconBell size={24} />,
      color: 'red',
      title: 'Notifications',
      onClick: () => {
        // Handle notifications
      },
    },
    {
      icon: <IconSettings size={24} />,
      color: 'gray',
      title: 'Settings',
      onClick: () => {
        // Handle settings
      },
    },
    {
      icon: <IconHelp size={24} />,
      color: 'cyan',
      title: 'Help & Support',
      onClick: () => {
        // Handle help
      },
    },
  ];

  return (
    <Card shadow="sm" p="lg">
      <SimpleGrid
        cols={4}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 3 },
          { maxWidth: 'sm', cols: 2 },
          { maxWidth: 'xs', cols: 1 },
        ]}
      >
        {quickActions.map((action, index) => (
          <UnstyledButton
            key={index}
            sx={(theme) => ({
              display: 'block',
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
              '&:hover': {
                backgroundColor:
                  theme.colorScheme === 'dark'
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
              },
            })}
            onClick={action.onClick}
          >
            <Group>
              <Text color={action.color}>{action.icon}</Text>
              <Text size="sm" weight={500}>
                {action.title}
              </Text>
            </Group>
          </UnstyledButton>
        ))}
      </SimpleGrid>
    </Card>
  );
};


