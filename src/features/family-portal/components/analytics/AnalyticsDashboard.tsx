import React, { useState } from 'react';
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Grid,
  Select,
  RingProgress,
  Progress,
  ThemeIcon,
  List,
} from '@mantine/core';
import {
  IconHeartbeat,
  IconActivity,
  IconMoodSmile,
  IconPill,
  IconCalendarStats,
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconArrowUpRight,
  IconArrowDownRight,
  IconEqual,
} from '@tabler/icons-react';

interface MetricTrend {
  current: number;
  previous: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  percentageChange: number;
}

interface AnalyticsDashboardProps {
  residentId: string;
  familyMemberId: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [timeRange, setTimeRange] = useState('7d');

  const getTrendIcon = (trend: MetricTrend['trend']) => {
    switch (trend) {
      case 'UP':
        return <IconArrowUpRight size={16} color="green" />;
      case 'DOWN':
        return <IconArrowDownRight size={16} color="red" />;
      case 'STABLE':
        return <IconEqual size={16} color="gray" />;
    }
  };

  const getTrendColor = (trend: MetricTrend['trend'], inverse: boolean = false) => {
    switch (trend) {
      case 'UP':
        return inverse ? 'red' : 'green';
      case 'DOWN':
        return inverse ? 'green' : 'red';
      case 'STABLE':
        return 'gray';
    }
  };

  return (
    <Stack spacing="xl">
      <Group position="apart">
        <div>
          <Title order={2}>Analytics Dashboard</Title>
          <Text color="dimmed">Track and analyze care metrics</Text>
        </div>
        <Select
          value={timeRange}
          onChange={(value) => setTimeRange(value || '7d')}
          data={[
            { value: '7d', label: 'Last 7 Days' },
            { value: '30d', label: 'Last 30 Days' },
            { value: '90d', label: 'Last 90 Days' },
            { value: '1y', label: 'Last Year' },
          ]}
          style={{ width: 200 }}
        />
      </Group>

      <Grid>
        {/* Key Metrics */}
        <Grid.Col span={3}>
          <Card shadow="sm" p="md">
            <Group position="apart" mb="xs">
              <Text size="xs" color="dimmed" weight={500}>
                WELLNESS SCORE
              </Text>
              <IconHeartbeat size={20} />
            </Group>
            <Group align="flex-end" spacing="xs">
              <Text size="xl" weight={700}>
                85%
              </Text>
              <Group spacing={4}>
                <IconArrowUpRight size={16} color="green" />
                <Text size="sm" color="green">
                  +5%
                </Text>
              </Group>
            </Group>
            <Progress
              value={85}
              mt="md"
              size="lg"
              radius="xl"
              color="green"
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={3}>
          <Card shadow="sm" p="md">
            <Group position="apart" mb="xs">
              <Text size="xs" color="dimmed" weight={500}>
                ACTIVITY LEVEL
              </Text>
              <IconActivity size={20} />
            </Group>
            <Group align="flex-end" spacing="xs">
              <Text size="xl" weight={700}>
                72%
              </Text>
              <Group spacing={4}>
                <IconArrowDownRight size={16} color="red" />
                <Text size="sm" color="red">
                  -3%
                </Text>
              </Group>
            </Group>
            <Progress
              value={72}
              mt="md"
              size="lg"
              radius="xl"
              color="blue"
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={3}>
          <Card shadow="sm" p="md">
            <Group position="apart" mb="xs">
              <Text size="xs" color="dimmed" weight={500}>
                MEDICATION ADHERENCE
              </Text>
              <IconPill size={20} />
            </Group>
            <Group align="flex-end" spacing="xs">
              <Text size="xl" weight={700}>
                95%
              </Text>
              <Group spacing={4}>
                <IconEqual size={16} color="gray" />
                <Text size="sm" color="gray">
                  0%
                </Text>
              </Group>
            </Group>
            <Progress
              value={95}
              mt="md"
              size="lg"
              radius="xl"
              color="green"
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={3}>
          <Card shadow="sm" p="md">
            <Group position="apart" mb="xs">
              <Text size="xs" color="dimmed" weight={500}>
                SOCIAL ENGAGEMENT
              </Text>
              <IconMoodSmile size={20} />
            </Group>
            <Group align="flex-end" spacing="xs">
              <Text size="xl" weight={700}>
                78%
              </Text>
              <Group spacing={4}>
                <IconArrowUpRight size={16} color="green" />
                <Text size="sm" color="green">
                  +8%
                </Text>
              </Group>
            </Group>
            <Progress
              value={78}
              mt="md"
              size="lg"
              radius="xl"
              color="violet"
            />
          </Card>
        </Grid.Col>

        {/* Detailed Analytics */}
        <Grid.Col span={8}>
          <Card shadow="sm" p="md">
            <Title order={3} mb="lg">
              Trend Analysis
            </Title>
            <Grid>
              <Grid.Col span={4}>
                <Stack align="center" spacing="xs">
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[
                      { value: 40, color: 'blue' },
                      { value: 30, color: 'green' },
                      { value: 20, color: 'orange' },
                    ]}
                    label={
                      <Group position="center">
                        <IconChartPie size={20} />
                      </Group>
                    }
                  />
                  <Text weight={500}>Activity Distribution</Text>
                  <List size="sm" spacing="xs">
                    <List.Item>Physical: 40%</List.Item>
                    <List.Item>Social: 30%</List.Item>
                    <List.Item>Cognitive: 20%</List.Item>
                  </List>
                </Stack>
              </Grid.Col>

              <Grid.Col span={4}>
                <Stack align="center" spacing="xs">
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[
                      { value: 95, color: 'green' },
                      { value: 5, color: 'red' },
                    ]}
                    label={
                      <Group position="center">
                        <IconChartBar size={20} />
                      </Group>
                    }
                  />
                  <Text weight={500}>Care Plan Adherence</Text>
                  <List size="sm" spacing="xs">
                    <List.Item>Completed: 95%</List.Item>
                    <List.Item>Missed: 5%</List.Item>
                  </List>
                </Stack>
              </Grid.Col>

              <Grid.Col span={4}>
                <Stack align="center" spacing="xs">
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[
                      { value: 60, color: 'blue' },
                      { value: 25, color: 'green' },
                      { value: 15, color: 'orange' },
                    ]}
                    label={
                      <Group position="center">
                        <IconChartLine size={20} />
                      </Group>
                    }
                  />
                  <Text weight={500}>Interaction Types</Text>
                  <List size="sm" spacing="xs">
                    <List.Item>Family: 60%</List.Item>
                    <List.Item>Staff: 25%</List.Item>
                    <List.Item>Other: 15%</List.Item>
                  </List>
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>

        {/* Insights */}
        <Grid.Col span={4}>
          <Card shadow="sm" p="md">
            <Title order={3} mb="lg">
              Key Insights
            </Title>
            <Stack spacing="md">
              <Card withBorder p="sm">
                <Group>
                  <ThemeIcon color="green" size={32} radius="xl">
                    <IconArrowUpRight size={18} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm">Increased Social Activity</Text>
                    <Text size="xs" color="dimmed">
                      8% more social interactions this week
                    </Text>
                  </div>
                </Group>
              </Card>

              <Card withBorder p="sm">
                <Group>
                  <ThemeIcon color="yellow" size={32} radius="xl">
                    <IconCalendarStats size={18} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm">Wellness Check Reminder</Text>
                    <Text size="xs" color="dimmed">
                      Next assessment due in 3 days
                    </Text>
                  </div>
                </Group>
              </Card>

              <Card withBorder p="sm">
                <Group>
                  <ThemeIcon color="blue" size={32} radius="xl">
                    <IconActivity size={18} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm">Activity Goal Progress</Text>
                    <Text size="xs" color="dimmed">
                      72% of weekly goal achieved
                    </Text>
                  </div>
                </Group>
              </Card>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Recommendations */}
        <Grid.Col span={12}>
          <Card shadow="sm" p="md">
            <Title order={3} mb="lg">
              Recommendations
            </Title>
            <Grid>
              <Grid.Col span={4}>
                <Card withBorder p="md">
                  <ThemeIcon size={40} radius="md" color="blue" mb="md">
                    <IconActivity size={24} />
                  </ThemeIcon>
                  <Text weight={500} mb="xs">
                    Increase Physical Activity
                  </Text>
                  <Text size="sm" color="dimmed">
                    Consider adding 15-minute morning walks to improve overall
                    activity levels.
                  </Text>
                  <Button variant="light" fullWidth mt="md">
                    View Suggestions
                  </Button>
                </Card>
              </Grid.Col>

              <Grid.Col span={4}>
                <Card withBorder p="md">
                  <ThemeIcon size={40} radius="md" color="green" mb="md">
                    <IconMoodSmile size={24} />
                  </ThemeIcon>
                  <Text weight={500} mb="xs">
                    Social Engagement
                  </Text>
                  <Text size="sm" color="dimmed">
                    Schedule more group activities to maintain the positive trend
                    in social interactions.
                  </Text>
                  <Button variant="light" fullWidth mt="md">
                    View Activities
                  </Button>
                </Card>
              </Grid.Col>

              <Grid.Col span={4}>
                <Card withBorder p="md">
                  <ThemeIcon size={40} radius="md" color="violet" mb="md">
                    <IconHeartbeat size={24} />
                  </ThemeIcon>
                  <Text weight={500} mb="xs">
                    Wellness Check
                  </Text>
                  <Text size="sm" color="dimmed">
                    Schedule the upcoming wellness assessment to maintain
                    proactive care monitoring.
                  </Text>
                  <Button variant="light" fullWidth mt="md">
                    Schedule Now
                  </Button>
                </Card>
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};


