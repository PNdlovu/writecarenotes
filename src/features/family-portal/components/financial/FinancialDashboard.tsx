import React from 'react';
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Button,
  Grid,
  RingProgress,
  List,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCreditCard,
  IconReceipt,
  IconReportMoney,
  IconBuildingBank,
  IconArrowUpRight,
  IconArrowDownRight,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

interface Transaction {
  id: string;
  type: 'PAYMENT' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  description: string;
  date: Date;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  category: string;
}

interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  category: string;
}

interface FinancialDashboardProps {
  residentId: string;
  familyMemberId: string;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  residentId,
  familyMemberId,
}) => {
  // This would be replaced with actual data fetching
  const transactions: Transaction[] = [];
  const bills: Bill[] = [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  return (
    <Stack spacing="xl">
      <Group position="apart">
        <div>
          <Title order={2}>Financial Overview</Title>
          <Text color="dimmed">Manage payments, bills, and financial records</Text>
        </div>
        <Button.Group>
          <Button
            variant="light"
            leftIcon={<IconCreditCard size={20} />}
            color="blue"
          >
            Make Payment
          </Button>
          <Button
            variant="light"
            leftIcon={<IconReceipt size={20} />}
            color="gray"
          >
            View Statements
          </Button>
        </Button.Group>
      </Group>

      <Grid>
        {/* Summary Cards */}
        <Grid.Col span={4}>
          <Card shadow="sm" p="md">
            <Group position="apart" mb="xs">
              <Text weight={500}>Current Balance</Text>
              <IconBuildingBank size={20} />
            </Group>
            <Title order={3}>{formatCurrency(5250.00)}</Title>
            <Text size="sm" color="dimmed">
              Last updated: {new Date().toLocaleDateString()}
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={4}>
          <Card shadow="sm" p="md">
            <Group position="apart" mb="xs">
              <Text weight={500}>Pending Payments</Text>
              <IconReportMoney size={20} />
            </Group>
            <Title order={3}>{formatCurrency(750.00)}</Title>
            <Text size="sm" color="green">
              All payments up to date
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={4}>
          <Card shadow="sm" p="md">
            <Group position="apart" mb="xs">
              <Text weight={500}>Monthly Overview</Text>
              <RingProgress
                size={60}
                thickness={4}
                sections={[{ value: 70, color: 'blue' }]}
                label={
                  <Text size="xs" align="center">
                    70%
                  </Text>
                }
              />
            </Group>
            <List spacing="xs" size="sm">
              <List.Item
                icon={
                  <ThemeIcon color="green" size={20} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                Base Care: {formatCurrency(3500.00)}
              </List.Item>
              <List.Item
                icon={
                  <ThemeIcon color="yellow" size={20} radius="xl">
                    <IconX size={12} />
                  </ThemeIcon>
                }
              >
                Additional Services: {formatCurrency(750.00)}
              </List.Item>
            </List>
          </Card>
        </Grid.Col>

        {/* Recent Transactions */}
        <Grid.Col span={6}>
          <Card shadow="sm" p="md">
            <Title order={3} mb="md">
              Recent Transactions
            </Title>
            <Stack spacing="xs">
              {transactions.map((transaction) => (
                <Card key={transaction.id} withBorder p="sm">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>{transaction.description}</Text>
                      <Text size="xs" color="dimmed">
                        {new Date(transaction.date).toLocaleDateString()}
                      </Text>
                    </div>
                    <Group spacing="xs">
                      <Text
                        weight={500}
                        color={transaction.type === 'REFUND' ? 'green' : undefined}
                      >
                        {transaction.type === 'REFUND' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </Text>
                      <Badge
                        color={
                          transaction.status === 'COMPLETED'
                            ? 'green'
                            : transaction.status === 'PENDING'
                            ? 'yellow'
                            : 'red'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Upcoming Bills */}
        <Grid.Col span={6}>
          <Card shadow="sm" p="md">
            <Title order={3} mb="md">
              Upcoming Bills
            </Title>
            <Stack spacing="xs">
              {bills.map((bill) => (
                <Card key={bill.id} withBorder p="sm">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>{bill.title}</Text>
                      <Text size="xs" color="dimmed">
                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </Text>
                    </div>
                    <Group spacing="xs">
                      <Text weight={500}>{formatCurrency(bill.amount)}</Text>
                      <Badge
                        color={
                          bill.status === 'PAID'
                            ? 'green'
                            : bill.status === 'OVERDUE'
                            ? 'red'
                            : 'yellow'
                        }
                      >
                        {bill.status}
                      </Badge>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};


