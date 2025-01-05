import React, { useState } from 'react';
import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Divider,
  TextInput,
  Textarea,
  Box,
  Alert,
} from '@mantine/core';
import { format } from 'date-fns';
import { IconAlertCircle } from '@tabler/icons-react';
import { ParentalConsent } from '../../types/consent';
import { SignaturePad } from './SignaturePad';
import { useFamilyPortalConsent } from '../../hooks/useFamilyPortalConsent';

interface ConsentRequestDetailsProps {
  request: ParentalConsent;
  onClose: () => void;
  onConsented: () => void;
}

export const ConsentRequestDetails: React.FC<ConsentRequestDetailsProps> = ({
  request,
  onClose,
  onConsented,
}) => {
  const [signature, setSignature] = useState<string>('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');

  const {
    signPortalConsent,
    withdrawPortalConsent,
    loading,
    error,
  } = useFamilyPortalConsent({
    residentId: request.residentId,
    medicationId: request.medicationId,
    careHomeType: 'CHILDRENS',
  });

  const handleSign = async () => {
    if (!signature) {
      return;
    }

    const result = await signPortalConsent(request.id, {
      id: `sig-${Date.now()}`,
      signature,
      timestamp: new Date(),
      ipAddress: '127.0.0.1', // This would be properly implemented
      deviceInfo: navigator.userAgent,
      verificationMethod: 'DIGITAL',
    }, conditions);

    if (result.success) {
      onConsented();
    }
  };

  const handleWithdraw = async () => {
    const result = await withdrawPortalConsent(request.id, notes);
    if (result.success) {
      onConsented();
    }
  };

  return (
    <Stack spacing="lg">
      <Paper p="md" withBorder>
        <Stack spacing="sm">
          <Title order={3}>{request.type} Consent Request</Title>
          <Text size="sm" color="dimmed">
            Requested on {format(request.requestedAt, 'PPP')} by {request.requestedBy}
          </Text>
          <Divider />
          <Box>
            <Text weight={500}>Details:</Text>
            <Text size="sm">{request.details}</Text>
          </Box>
        </Stack>
      </Paper>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          {error}
        </Alert>
      )}

      {request.status === 'PENDING' && (
        <>
          <Paper p="md" withBorder>
            <Stack spacing="md">
              <Title order={4}>Digital Signature</Title>
              <SignaturePad
                value={signature}
                onChange={setSignature}
                height={200}
              />
              <Textarea
                label="Additional Notes"
                value={notes}
                onChange={(e) => setNotes(e.currentTarget.value)}
                minRows={3}
              />
            </Stack>
          </Paper>

          <Group position="apart">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSign}
              loading={loading}
              disabled={!signature}
            >
              Sign and Approve
            </Button>
          </Group>
        </>
      )}

      {request.status === 'APPROVED' && (
        <>
          <Paper p="md" withBorder>
            <Stack spacing="md">
              <Title order={4}>Withdraw Consent</Title>
              <Text size="sm" color="dimmed">
                If you wish to withdraw your consent, please provide a reason below.
              </Text>
              <Textarea
                label="Reason for Withdrawal"
                value={notes}
                onChange={(e) => setNotes(e.currentTarget.value)}
                minRows={3}
                required
              />
            </Stack>
          </Paper>

          <Group position="apart">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleWithdraw}
              loading={loading}
              disabled={!notes}
            >
              Withdraw Consent
            </Button>
          </Group>
        </>
      )}
    </Stack>
  );
};


