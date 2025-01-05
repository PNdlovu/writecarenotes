import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Modal,
  Alert,
  Loader,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useFamilyPortalConsent } from '../../hooks/useFamilyPortalConsent';
import { ConsentRequestList } from './ConsentRequestList';
import { ConsentRequestDetails } from './ConsentRequestDetails';
import { ParentalConsent } from '../../types/consent';

interface ConsentManagementProps {
  residentId: string;
  familyPortalUserId: string;
}

export const ConsentManagement: React.FC<ConsentManagementProps> = ({
  residentId,
  familyPortalUserId,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<ParentalConsent | null>(
    null
  );
  const [requests, setRequests] = useState<ParentalConsent[]>([]);

  const {
    getPortalRequests,
    loading,
    error,
    canManageConsent,
  } = useFamilyPortalConsent({
    residentId,
    medicationId: selectedRequest?.medicationId || '',
    careHomeType: 'CHILDRENS',
    familyPortalUserId,
  });

  const loadRequests = async () => {
    const result = await getPortalRequests();
    if (result.success) {
      setRequests(result.requests);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRequestView = (request: ParentalConsent) => {
    setSelectedRequest(request);
  };

  const handleRequestClose = () => {
    setSelectedRequest(null);
  };

  const handleConsented = async () => {
    await loadRequests();
    setSelectedRequest(null);
  };

  if (!canManageConsent) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red">
        You do not have permission to manage medication consents.
      </Alert>
    );
  }

  return (
    <Container size="lg">
      <Stack spacing="xl">
        <Group position="apart">
          <div>
            <Title order={2}>Medication Consents</Title>
            <Text color="dimmed" size="sm">
              Review and manage medication consent requests
            </Text>
          </div>
        </Group>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {error}
          </Alert>
        )}

        {loading && !requests.length ? (
          <Group position="center">
            <Loader />
          </Group>
        ) : (
          <ConsentRequestList
            requests={requests}
            onViewRequest={handleRequestView}
          />
        )}

        <Modal
          opened={!!selectedRequest}
          onClose={handleRequestClose}
          size="xl"
          title="Consent Request Details"
        >
          {selectedRequest && (
            <ConsentRequestDetails
              request={selectedRequest}
              onClose={handleRequestClose}
              onConsented={handleConsented}
            />
          )}
        </Modal>
      </Stack>
    </Container>
  );
};


