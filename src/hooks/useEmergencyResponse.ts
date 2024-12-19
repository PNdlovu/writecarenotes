import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyService } from '../services/emergencyService';
import {
  EmergencyIncident,
  EmergencyProtocol,
  EmergencyContact,
  EmergencyResource,
  EmergencyDrillRecord,
  EmergencyStats,
  EmergencyType,
  EmergencyStatus,
  EmergencyPriority,
} from '../types/emergency';
import { toast } from 'react-hot-toast';

export const useEmergencyResponse = () => {
  const queryClient = useQueryClient();

  // Incidents
  const useIncidents = (params?: {
    status?: EmergencyStatus;
    type?: EmergencyType;
    priority?: EmergencyPriority;
    startDate?: string;
    endDate?: string;
  }) => {
    return useQuery(['incidents', params], () => emergencyService.getIncidents(params), {
      onError: () => {
        toast.error('Failed to fetch incidents');
      },
    });
  };

  const useIncidentDetails = (id: string) => {
    return useQuery(['incident', id], () => emergencyService.getIncidentById(id), {
      enabled: !!id,
      onError: () => {
        toast.error('Failed to fetch incident details');
      },
    });
  };

  const useCreateIncident = () => {
    return useMutation(
      (incident: Omit<EmergencyIncident, 'id'>) => emergencyService.createIncident(incident),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['incidents']);
          toast.success('Emergency incident created');
        },
        onError: () => {
          toast.error('Failed to create incident');
        },
      }
    );
  };

  const useUpdateIncident = () => {
    return useMutation(
      ({ id, update }: { id: string; update: Partial<EmergencyIncident> }) =>
        emergencyService.updateIncident(id, update),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['incidents']);
          toast.success('Incident updated');
        },
        onError: () => {
          toast.error('Failed to update incident');
        },
      }
    );
  };

  const useResolveIncident = () => {
    return useMutation(
      ({ id, notes }: { id: string; notes: string }) =>
        emergencyService.resolveIncident(id, notes),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['incidents']);
          toast.success('Incident resolved');
        },
        onError: () => {
          toast.error('Failed to resolve incident');
        },
      }
    );
  };

  // Protocols
  const useProtocols = (type?: EmergencyType) => {
    return useQuery(['protocols', type], () => emergencyService.getProtocols(type), {
      onError: () => {
        toast.error('Failed to fetch protocols');
      },
    });
  };

  const useProtocolDetails = (id: string) => {
    return useQuery(['protocol', id], () => emergencyService.getProtocolById(id), {
      enabled: !!id,
      onError: () => {
        toast.error('Failed to fetch protocol details');
      },
    });
  };

  const useCreateProtocol = () => {
    return useMutation(
      (protocol: Omit<EmergencyProtocol, 'id'>) => emergencyService.createProtocol(protocol),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['protocols']);
          toast.success('Protocol created');
        },
        onError: () => {
          toast.error('Failed to create protocol');
        },
      }
    );
  };

  // Contacts
  const useContacts = (params?: { department?: string; isOnCall?: boolean }) => {
    return useQuery(['contacts', params], () => emergencyService.getContacts(params), {
      onError: () => {
        toast.error('Failed to fetch emergency contacts');
      },
    });
  };

  const useContactDetails = (id: string) => {
    return useQuery(['contact', id], () => emergencyService.getContactById(id), {
      enabled: !!id,
      onError: () => {
        toast.error('Failed to fetch contact details');
      },
    });
  };

  const useUpdateContact = () => {
    return useMutation(
      ({ id, update }: { id: string; update: Partial<EmergencyContact> }) =>
        emergencyService.updateContact(id, update),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['contacts']);
          toast.success('Contact updated');
        },
        onError: () => {
          toast.error('Failed to update contact');
        },
      }
    );
  };

  // Resources
  const useResources = (params?: {
    type?: string;
    status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DEPLETED';
  }) => {
    return useQuery(['resources', params], () => emergencyService.getResources(params), {
      onError: () => {
        toast.error('Failed to fetch emergency resources');
      },
    });
  };

  const useUpdateResourceStatus = () => {
    return useMutation(
      ({
        id,
        status,
        notes,
      }: {
        id: string;
        status: EmergencyResource['status'];
        notes?: string;
      }) => emergencyService.updateResourceStatus(id, status, notes),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['resources']);
          toast.success('Resource status updated');
        },
        onError: () => {
          toast.error('Failed to update resource status');
        },
      }
    );
  };

  // Drills
  const useDrills = (params?: {
    type?: EmergencyType;
    startDate?: string;
    endDate?: string;
  }) => {
    return useQuery(['drills', params], () => emergencyService.getDrills(params), {
      onError: () => {
        toast.error('Failed to fetch emergency drills');
      },
    });
  };

  const useCreateDrill = () => {
    return useMutation(
      (drill: Omit<EmergencyDrillRecord, 'id'>) => emergencyService.createDrill(drill),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['drills']);
          toast.success('Emergency drill created');
        },
        onError: () => {
          toast.error('Failed to create drill');
        },
      }
    );
  };

  // Statistics
  const useEmergencyStats = (params?: { startDate?: string; endDate?: string }) => {
    return useQuery(['emergency-stats', params], () => emergencyService.getEmergencyStats(params), {
      onError: () => {
        toast.error('Failed to fetch emergency statistics');
      },
    });
  };

  // Alert Subscriptions
  const useSubscribeToAlerts = () => {
    return useMutation(
      (userId: string) => emergencyService.subscribeToEmergencyAlerts(userId),
      {
        onSuccess: () => {
          toast.success('Subscribed to emergency alerts');
        },
        onError: () => {
          toast.error('Failed to subscribe to alerts');
        },
      }
    );
  };

  const useUnsubscribeFromAlerts = () => {
    return useMutation(
      (userId: string) => emergencyService.unsubscribeFromEmergencyAlerts(userId),
      {
        onSuccess: () => {
          toast.success('Unsubscribed from emergency alerts');
        },
        onError: () => {
          toast.error('Failed to unsubscribe from alerts');
        },
      }
    );
  };

  return {
    useIncidents,
    useIncidentDetails,
    useCreateIncident,
    useUpdateIncident,
    useResolveIncident,
    useProtocols,
    useProtocolDetails,
    useCreateProtocol,
    useContacts,
    useContactDetails,
    useUpdateContact,
    useResources,
    useUpdateResourceStatus,
    useDrills,
    useCreateDrill,
    useEmergencyStats,
    useSubscribeToAlerts,
    useUnsubscribeFromAlerts,
  };
};


