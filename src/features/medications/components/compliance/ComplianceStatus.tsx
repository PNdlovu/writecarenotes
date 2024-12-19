import React from 'react';
import { Badge, Card, Group, List, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconClock } from '@tabler/icons-react';
import { Region } from '@/types/region';
import { CareHomeType, ComplianceRecord } from '../../types/compliance';
import { ParentalConsent } from '../../types/consent';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';

interface ComplianceStatusProps {
  consent: ParentalConsent;
  region: Region;
  careHomeType: CareHomeType;
  complianceRecords: ComplianceRecord[];
}

export function ComplianceStatus({
  consent,
  region,
  careHomeType,
  complianceRecords
}: ComplianceStatusProps) {
  const {
    checkComplianceStatus,
    validationErrors,
    validationWarnings
  } = useRegionalCompliance({ region, careHomeType });

  const { isCompliant, missingActions, expiringActions } = checkComplianceStatus(
    consent,
    complianceRecords
  );

  return (
    <Card withBorder shadow="sm" radius="md" p="md">
      <Stack spacing="md">
        <Group position="apart">
          <Text size="lg" weight={500}>Compliance Status</Text>
          <Badge 
            color={isCompliant ? 'green' : missingActions.length > 0 ? 'red' : 'yellow'}
            size="lg"
          >
            {isCompliant ? 'Compliant' : 'Action Required'}
          </Badge>
        </Group>

        {validationErrors.length > 0 && (
          <Stack spacing="xs">
            <Text color="red" size="sm" weight={500}>Validation Errors:</Text>
            <List
              spacing="xs"
              size="sm"
              icon={
                <ThemeIcon color="red" size={20} radius="xl">
                  <IconAlertCircle size={12} />
                </ThemeIcon>
              }
            >
              {validationErrors.map((error, index) => (
                <List.Item key={index}>{error}</List.Item>
              ))}
            </List>
          </Stack>
        )}

        {validationWarnings.length > 0 && (
          <Stack spacing="xs">
            <Text color="yellow" size="sm" weight={500}>Warnings:</Text>
            <List
              spacing="xs"
              size="sm"
              icon={
                <ThemeIcon color="yellow" size={20} radius="xl">
                  <IconAlertCircle size={12} />
                </ThemeIcon>
              }
            >
              {validationWarnings.map((warning, index) => (
                <List.Item key={index}>{warning}</List.Item>
              ))}
            </List>
          </Stack>
        )}

        {missingActions.length > 0 && (
          <Stack spacing="xs">
            <Text color="red" size="sm" weight={500}>Missing Requirements:</Text>
            <List
              spacing="xs"
              size="sm"
              icon={
                <ThemeIcon color="red" size={20} radius="xl">
                  <IconAlertCircle size={12} />
                </ThemeIcon>
              }
            >
              {missingActions.map((action, index) => (
                <List.Item key={index}>
                  {action.replace(/_/g, ' ')}
                </List.Item>
              ))}
            </List>
          </Stack>
        )}

        {expiringActions.length > 0 && (
          <Stack spacing="xs">
            <Text color="orange" size="sm" weight={500}>Expiring Soon:</Text>
            <List
              spacing="xs"
              size="sm"
              icon={
                <ThemeIcon color="orange" size={20} radius="xl">
                  <IconClock size={12} />
                </ThemeIcon>
              }
            >
              {expiringActions.map((action, index) => (
                <List.Item key={index}>
                  {action.replace(/_/g, ' ')}
                </List.Item>
              ))}
            </List>
          </Stack>
        )}

        {isCompliant && missingActions.length === 0 && expiringActions.length === 0 && (
          <Group spacing="xs">
            <ThemeIcon color="green" size={20} radius="xl">
              <IconCheck size={12} />
            </ThemeIcon>
            <Text color="green" size="sm">All compliance requirements are met</Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
}


