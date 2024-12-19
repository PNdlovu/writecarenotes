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
  Modal,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  ActionIcon,
} from '@mantine/core';
import { DatePicker, TimeInput } from '@mantine/dates';
import {
  IconCalendarEvent,
  IconPlus,
  IconFilter,
  IconUsers,
  IconClock,
  IconNotes,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  startTime: Date;
  endTime: Date;
  description?: string;
  location?: string;
  participants: string[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;
    endDate?: Date;
  };
}

type EventType =
  | 'APPOINTMENT'
  | 'ACTIVITY'
  | 'MEDICATION'
  | 'VISITOR'
  | 'SPECIAL_OCCASION'
  | 'STAFF_VISIT';

interface EventCalendarProps {
  residentId: string;
  familyMemberId: string;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // This would be replaced with actual data fetching
  const events: CalendarEvent[] = [];

  const getEventColor = (type: EventType) => {
    switch (type) {
      case 'APPOINTMENT':
        return 'blue';
      case 'ACTIVITY':
        return 'green';
      case 'MEDICATION':
        return 'red';
      case 'VISITOR':
        return 'purple';
      case 'SPECIAL_OCCASION':
        return 'yellow';
      case 'STAFF_VISIT':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  const eventTypes = [
    { value: 'APPOINTMENT', label: 'Medical Appointment' },
    { value: 'ACTIVITY', label: 'Activity' },
    { value: 'MEDICATION', label: 'Medication Schedule' },
    { value: 'VISITOR', label: 'Visitor' },
    { value: 'SPECIAL_OCCASION', label: 'Special Occasion' },
    { value: 'STAFF_VISIT', label: 'Staff Visit' },
  ];

  return (
    <Stack spacing="xl">
      <Group position="apart">
        <div>
          <Title order={2}>Event Calendar</Title>
          <Text color="dimmed">Schedule and manage appointments and activities</Text>
        </div>
        <Button.Group>
          <Button
            variant="light"
            leftIcon={<IconPlus size={20} />}
            onClick={() => setIsNewEventModalOpen(true)}
          >
            New Event
          </Button>
          <Button variant="light" leftIcon={<IconFilter size={20} />}>
            Filter
          </Button>
        </Button.Group>
      </Group>

      <Grid>
        <Grid.Col span={4}>
          <Card shadow="sm" p="md">
            <Stack spacing="md">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                size="xl"
                styles={(theme) => ({
                  day: {
                    '&[data-has-events]': {
                      backgroundColor: theme.colors.blue[1],
                      color: theme.colors.blue[9],
                    },
                  },
                })}
              />
              <MultiSelect
                label="Event Types"
                placeholder="Filter by type"
                data={eventTypes}
                clearable
              />
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={8}>
          <Card shadow="sm" p="md">
            <Stack spacing="md">
              <Group position="apart">
                <Text weight={500}>
                  Events for {selectedDate?.toLocaleDateString()}
                </Text>
                <Badge>{events.length} events</Badge>
              </Group>

              {events.length === 0 ? (
                <Text color="dimmed" align="center">
                  No events scheduled for this day
                </Text>
              ) : (
                events.map((event) => (
                  <Card
                    key={event.id}
                    withBorder
                    p="sm"
                    onClick={() => setSelectedEvent(event)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Group position="apart">
                      <Group>
                        <Badge color={getEventColor(event.type)}>
                          {event.type.replace('_', ' ')}
                        </Badge>
                        <div>
                          <Text weight={500}>{event.title}</Text>
                          <Group spacing="xs">
                            <IconClock size={14} />
                            <Text size="sm" color="dimmed">
                              {new Date(event.startTime).toLocaleTimeString()} -{' '}
                              {new Date(event.endTime).toLocaleTimeString()}
                            </Text>
                          </Group>
                        </div>
                      </Group>
                      <Group spacing={8}>
                        <ActionIcon
                          color="blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle delete
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                ))
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* New Event Modal */}
      <Modal
        opened={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        title="Schedule New Event"
        size="lg"
      >
        <Stack spacing="md">
          <TextInput
            label="Event Title"
            placeholder="Enter event title"
            required
          />

          <Select
            label="Event Type"
            placeholder="Select event type"
            data={eventTypes}
            required
          />

          <Grid>
            <Grid.Col span={6}>
              <DatePicker
                label="Date"
                placeholder="Pick date"
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TimeInput
                label="Time"
                placeholder="Pick time"
                required
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Location"
            placeholder="Enter location (optional)"
          />

          <MultiSelect
            label="Participants"
            placeholder="Select participants"
            data={[
              { value: 'staff', label: 'Care Staff' },
              { value: 'family', label: 'Family Members' },
              { value: 'doctor', label: 'Doctor' },
            ]}
            icon={<IconUsers size={14} />}
          />

          <Textarea
            label="Description"
            placeholder="Enter event description"
            minRows={3}
          />

          <Group position="right">
            <Button variant="light" onClick={() => setIsNewEventModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle save
              setIsNewEventModalOpen(false);
            }}>
              Save Event
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        opened={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
        size="lg"
      >
        {selectedEvent && (
          <Stack spacing="md">
            <Group position="apart">
              <div>
                <Text size="xl" weight={500}>
                  {selectedEvent.title}
                </Text>
                <Badge color={getEventColor(selectedEvent.type)}>
                  {selectedEvent.type.replace('_', ' ')}
                </Badge>
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
                    // Handle delete
                    setSelectedEvent(null);
                  }}
                >
                  Delete
                </Button>
              </Group>
            </Group>

            <Card withBorder>
              <Group spacing="xl">
                <div>
                  <Text size="sm" color="dimmed">
                    Date
                  </Text>
                  <Text>
                    {new Date(selectedEvent.startTime).toLocaleDateString()}
                  </Text>
                </div>
                <div>
                  <Text size="sm" color="dimmed">
                    Time
                  </Text>
                  <Text>
                    {new Date(selectedEvent.startTime).toLocaleTimeString()} -{' '}
                    {new Date(selectedEvent.endTime).toLocaleTimeString()}
                  </Text>
                </div>
                {selectedEvent.location && (
                  <div>
                    <Text size="sm" color="dimmed">
                      Location
                    </Text>
                    <Text>{selectedEvent.location}</Text>
                  </div>
                )}
              </Group>
            </Card>

            {selectedEvent.description && (
              <div>
                <Text size="sm" weight={500}>
                  Description
                </Text>
                <Text color="dimmed">{selectedEvent.description}</Text>
              </div>
            )}

            <div>
              <Text size="sm" weight={500}>
                Participants
              </Text>
              <Group spacing="xs">
                {selectedEvent.participants.map((participant, index) => (
                  <Badge key={index}>{participant}</Badge>
                ))}
              </Group>
            </div>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
};


