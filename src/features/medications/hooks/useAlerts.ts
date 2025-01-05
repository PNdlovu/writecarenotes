import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationService } from '../services/medicationService';
import type { MedicationAlert, AlertType, AlertSeverity } from '../types';
import { useToast } from '@/components/ui/UseToast';
import { useOrganization } from '@/hooks/useOrganization';

export function useAlerts() {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch alerts
  const { 
    data: alerts,
    isLoading,
    error
  } = useQuery({
    queryKey: ['medicationAlerts', organization?.id],
    queryFn: async () => {
      const response = await fetch(`/api/medications/alerts?organizationId=${organization?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    },
    enabled: !!organization?.id
  });

  // Create alert
  const createMutation = useMutation({
    mutationFn: (data: {
      type: AlertType;
      severity: AlertSeverity;
      medicationId?: string;
      residentId?: string;
      message: string;
    }) => medicationService.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['medicationAlerts']);
      toast({
        title: 'Alert Created',
        description: 'New medication alert has been created',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update alert status
  const updateMutation = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string; status: string }) => {
      const response = await fetch(`/api/medications/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medicationAlerts']);
      toast({
        title: 'Alert Updated',
        description: 'Alert status has been updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Filter alerts by type
  const filterAlerts = (type?: AlertType) => {
    if (!alerts) return [];
    if (!type) return alerts;
    return alerts.filter((alert: MedicationAlert) => alert.type === type);
  };

  // Get high priority alerts
  const getHighPriorityAlerts = () => {
    if (!alerts) return [];
    return alerts.filter(
      (alert: MedicationAlert) => 
        alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
    );
  };

  return {
    // Data
    alerts,
    highPriorityAlerts: getHighPriorityAlerts(),
    
    // Loading states
    isLoading,
    
    // Error states
    error,
    
    // Mutations
    createAlert: createMutation.mutate,
    updateAlertStatus: updateMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    
    // Utility functions
    filterAlerts,
  };
} 