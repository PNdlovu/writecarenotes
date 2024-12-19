import React from 'react';
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Grid,
  Progress,
  RingProgress,
  Timeline,
  ThemeIcon,
} from '@mantine/core';
import {
  IconHeartbeat,
  IconZzz,
  IconWalk,
  IconGlass,
  IconMoodSmile,
  IconScale,
  IconActivity,
  IconChartLine,
} from '@tabler/icons-react';

interface WellnessMetric {
  id: string;
  category: 'SLEEP' | 'ACTIVITY' | 'NUTRITION' | 'MOOD' | 'VITALS';
  value: number;
  unit: string;
  timestamp: Date;
  target?: {
    min?: number;
    max?: number;
    ideal?: number;
  };
}

interface WellnessActivity {
  id: string;
  type: string;
  description: string;
  duration?: number;
  intensity?: 'LOW' | 'MODERATE' | 'HIGH';
  timestamp: Date;
  notes?: string;
}

interface WellnessTrackerProps {
  residentId: string;
  familyMemberId: string;
}

export const WellnessTracker: React.FC<WellnessTrackerProps> = ({
  residentId,
  familyMemberId,
}) => {
  // This would be replaced with actual data fetching
  const metrics: WellnessMetric[] = [];
  const activities: WellnessActivity[] = [];

  const calculateProgress = (metric: WellnessMetric) => {
    if (!metric.target) return 0;
    const { min, max, ideal } = metric.target;
    
    if (ideal !== undefined) {
      const maxDiff = Math.max(Math.abs(max! - ideal), Math.abs(min! - ideal));
      const actualDiff = Math.abs(metric.value - ideal);
      return 100 - (actualDiff / maxDiff) * 100;
    }
    
    return ((metric.value - min!) / (max! - min!)) * 100;
  };

  return (
    <Stack spacing="xl">
      <Group position="apart">
        <div>
          <Title order={2}>Wellness Tracker</Title>
          <Text color="dimmed">Monitor health and wellness indicators</Text>
        </div>
      </Group>

      <Grid>
        {/* Daily Overview */}
        <Grid.Col span={12}>
          <Card shadow="sm" p="md">
            <Title order={3} mb="lg">
              Daily Overview
            </Title>
            <Grid>
              <Grid.Col span={3}>
                <Stack align="center" spacing="xs">
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[{ value: 75, color: 'blue' }]}
                    label={
                      <Group spacing={0} position="center">
                        <IconHeartbeat size={20} />
                        <Text size="xl" weight={500}>
                          75
                        </Text>
                      </Group>
                    }
                  />
                  <Text weight={500}>Heart Rate</Text>
                  <Text size="sm" color="dimmed">
                    BPM
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={3}>
                <Stack align="center" spacing="xs">
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[{ value: 80, color: 'violet' }]}
                    label={
                      <Group spacing={0} position="center">
                        <IconZzz size={20} />
                        <Text size="xl" weight={500}>
                          8
                        </Text>
                      </Group>
                    }
                  />
                  <Text weight={500}>Sleep</Text>
                  <Text size="sm" color="dimmed">
                    Hours
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={3}>
                <Stack align="center" spacing="xs">
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[{ value: 60, color: 'green' }]}
                    label={
                      <Group spacing={0} position="center">
                        <IconWalk size={20} />
                        <Text size="xl" weight={500}>
                          3k
                        </Text>
                      </Group>
                    }
                  />
                  <Text weight={500}>Steps</Text>
                  <Text size="sm" color="dimmed">
                    Daily Goal: 5k
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={3}>
                <Stack align="center" spacing="xs">
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[{ value: 90, color: 'cyan' }]}
                    label={
                      <Group spacing={0} position="center">
                        <IconGlass size={20} />
                        <Text size="xl" weight={500}>
                          90%
                        </Text>
                      </Group>
                    }
                  />
                  <Text weight={500}>Hydration</Text>
                  <Text size="sm" color="dimmed">
                    Target Met
                  </Text>
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>

        {/* Mood and Wellbeing */}
        <Grid.Col span={6}>
          <Card shadow="sm" p="md">
            <Title order={3} mb="md">
              Mood & Wellbeing
            </Title>
            <Timeline active={1} bulletSize={24} lineWidth={2}>
              {activities.map((activity) => (
                <Timeline.Item
                  key={activity.id}
                  bullet={<IconMoodSmile size={12} />}
                  title={activity.type}
                >
                  <Text color="dimmed" size="sm">
                    {activity.description}
                  </Text>
                  <Text size="xs" mt={4}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Grid.Col>

        {/* Activity Log */}
        <Grid.Col span={6}>
          <Card shadow="sm" p="md">
            <Title order={3} mb="md">
              Activity Log
            </Title>
            <Stack spacing="sm">
              {activities.map((activity) => (
                <Card key={activity.id} withBorder p="sm">
                  <Group position="apart">
                    <Group>
                      <ThemeIcon
                        size={36}
                        radius="md"
                        color={
                          activity.intensity === 'HIGH'
                            ? 'red'
                            : activity.intensity === 'MODERATE'
                            ? 'yellow'
                            : 'blue'
                        }
                      >
                        <IconActivity size={20} />
                      </ThemeIcon>
                      <div>
                        <Text weight={500}>{activity.type}</Text>
                        <Text size="xs" color="dimmed">
                          {activity.duration} minutes •{' '}
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </Text>
                      </div>
                    </Group>
                    <Badge color={activity.intensity === 'HIGH' ? 'red' : 'blue'}>
                      {activity.intensity}
                    </Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Trends */}
        <Grid.Col span={12}>
          <Card shadow="sm" p="md">
            <Group position="apart" mb="md">
              <Title order={3}>Weekly Trends</Title>
              <Badge leftSection={<IconChartLine size={12} />}>
                Last 7 Days
              </Badge>
            </Group>
            <Grid>
              {metrics.map((metric) => (
                <Grid.Col key={metric.id} span={6}>
                  <Card withBorder p="sm">
                    <Group position="apart" mb="xs">
                      <Text weight={500}>{metric.category}</Text>
                      <Text size="sm">
                        {metric.value} {metric.unit}
                      </Text>
                    </Group>
                    <Progress
                      value={calculateProgress(metric)}
                      color={
                        calculateProgress(metric) > 80
                          ? 'green'
                          : calculateProgress(metric) > 50
                          ? 'yellow'
                          : 'red'
                      }
                      size="lg"
                      radius="xl"
                    />
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};


